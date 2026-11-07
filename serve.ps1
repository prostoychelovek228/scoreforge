# Minimal static file server for previewing the site locally. No install needed.
# Usage: double-click start.bat, or run: powershell -ExecutionPolicy Bypass -File serve.ps1
param(
  [int]$Port = 8080,
  [switch]$Open
)

$root = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\')
$mime = @{
  '.html'  = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'text/javascript; charset=utf-8'
  '.csv'   = 'text/csv; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.md'    = 'text/markdown; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.woff2' = 'font/woff2'
  '.xlsx'  = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  '.png'   = 'image/png'
  '.txt'   = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Site is running: http://localhost:$Port/  (close this window to stop)"
if ($Open) { Start-Process "http://localhost:$Port/" }

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '') { $rel = 'index.html' }
      $path = [System.IO.Path]::GetFullPath((Join-Path $root $rel))

      # Never serve anything outside the project folder.
      $inside = $path.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)
      if ($inside -and (Test-Path -LiteralPath $path -PathType Leaf)) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $type = $mime[[System.IO.Path]::GetExtension($path).ToLower()]
        if (-not $type) { $type = 'application/octet-stream' }
        $res.ContentType = $type
        $res.Headers.Add('Cache-Control', 'no-store')
      } else {
        $res.StatusCode = 404
        $notFound = Join-Path $root '404.html'
        if (Test-Path -LiteralPath $notFound) { $bytes = [System.IO.File]::ReadAllBytes($notFound) }
        else { $bytes = [System.Text.Encoding]::UTF8.GetBytes('404') }
        $res.ContentType = 'text/html; charset=utf-8'
      }
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      $res.StatusCode = 500
    } finally {
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
}
