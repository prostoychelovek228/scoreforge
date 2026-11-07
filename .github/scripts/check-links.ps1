# Weekly link check. Opens every link in the catalog and calendar, writes data/link-status.json,
# and writes a Markdown report when something looks broken. Only sends plain GET requests.
param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
  [string]$ReportPath = '',
  [string]$StatusPath = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Net.Http
# Windows PowerShell 5.1 needs this to reach modern sites; PowerShell 7 on the robot already can.
if ($PSVersionTable.PSEdition -eq 'Desktop') {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
}

$statusFile = if ($StatusPath) { $StatusPath } else { Join-Path $Root 'data/link-status.json' }

# Every cell that looks like a web link counts, so column order does not matter here.
$urls = foreach ($name in 'resources.csv', 'calendar.csv') {
  foreach ($row in (Import-Csv -Path (Join-Path $Root "data/$name") -Encoding UTF8)) {
    foreach ($prop in $row.PSObject.Properties) {
      if ($prop.Value -match '^https?://') { $prop.Value.Trim() }
    }
  }
}
$urls = @($urls | Select-Object -Unique)

$handler = New-Object System.Net.Http.HttpClientHandler
$handler.AllowAutoRedirect = $true
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(30)
[void]$client.DefaultRequestHeaders.TryAddWithoutValidation('User-Agent', 'Mozilla/5.0 (compatible; scoreforge-link-check/1.0)')

function Start-Requests([string[]]$list) {
  $tasks = @{}
  foreach ($u in $list) { $tasks[$u] = $client.GetAsync($u, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead) }
  $out = @{}
  foreach ($u in $list) {
    try { $out[$u] = [int]$tasks[$u].GetAwaiter().GetResult().StatusCode }
    catch { $out[$u] = 0 }
  }
  return $out
}

$codes = Start-Requests $urls
# Failures to connect are often a hiccup, so they get one more try.
$retry = @($urls | Where-Object { $codes[$_] -eq 0 })
if ($retry.Count) {
  Start-Sleep -Seconds 10
  $again = Start-Requests $retry
  foreach ($u in $retry) { $codes[$u] = $again[$u] }
}

# Many sites refuse robots while working fine for people: those codes are not "broken".
$blockedCodes = 401, 402, 403, 405, 406, 429, 451, 503

$previous = @{}
if (Test-Path -LiteralPath $statusFile) {
  $old = [System.IO.File]::ReadAllText($statusFile) | ConvertFrom-Json
  foreach ($item in @($old.broken)) { if ($item) { $previous[$item.url] = [int]$item.weeks } }
}

$broken = @()
$blocked = @()
foreach ($u in $urls) {
  $code = $codes[$u]
  if ($code -ge 200 -and $code -lt 400) { continue }
  if ($blockedCodes -contains $code) {
    $blocked += [ordered]@{ url = $u; status = $code }
  } else {
    $weeks = 1
    if ($previous.ContainsKey($u)) { $weeks = $previous[$u] + 1 }
    $broken += [ordered]@{ url = $u; status = $code; weeks = $weeks }
  }
}

$status = [ordered]@{
  checked = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')
  total   = $urls.Count
  broken  = @($broken)
  blocked = @($blocked)
}
$json = ConvertTo-Json -InputObject $status -Depth 4
[System.IO.File]::WriteAllText($statusFile, $json + "`n", (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Checked $($urls.Count) links: $($broken.Count) broken, $($blocked.Count) refused the robot."

if ($ReportPath) {
  $lines = @()
  if ($broken.Count) {
    $lines += 'The weekly robot could not open these links:'
    $lines += ''
    foreach ($b in $broken) {
      $reason = if ($b.status -eq 0) { 'no response' } else { "code $($b.status)" }
      $lines += "- $($b.url) ($reason, weeks in a row: $($b.weeks))"
    }
    $lines += ''
    $lines += 'Open each one by hand: it may be a temporary failure. If a link is really dead, fix or remove it in data/resources.csv or data/calendar.csv.'
    [System.IO.File]::WriteAllText($ReportPath, ($lines -join "`n") + "`n", (New-Object System.Text.UTF8Encoding($false)))
  } elseif (Test-Path -LiteralPath $ReportPath) {
    Remove-Item -LiteralPath $ReportPath
  }
}
