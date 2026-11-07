@echo off
rem Double-click to preview the site at http://localhost:8080/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Open
