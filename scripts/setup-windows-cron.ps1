# Register ALL giahomnay-* cron tasks from scripts\cron-tasks.manifest
# Run as Administrator:
#   cd C:\Inetpub\vhosts\giahomnay.site\httpdocs
#   powershell -ExecutionPolicy Bypass -File scripts\setup-windows-cron.ps1

param(
  [string]$Httpdocs = (Split-Path $PSScriptRoot -Parent),
  [string]$BaseUrl = "https://giahomnay.site"
)

$ErrorActionPreference = "Stop"
$bat = Join-Path $PSScriptRoot "cron-call.bat"
$manifest = Join-Path $PSScriptRoot "cron-tasks.manifest"
if (-not (Test-Path $bat)) { throw "Missing $bat" }
if (-not (Test-Path $manifest)) { throw "Missing $manifest" }

$vhostRoot = Split-Path $Httpdocs -Parent
$secretCandidates = @(
  (Join-Path $Httpdocs "cron.secret"),
  (Join-Path $vhostRoot "cron.secret")
)

$secretFile = $null
foreach ($p in $secretCandidates) {
  if (Test-Path -LiteralPath $p) {
    $raw = Get-Content -LiteralPath $p -Raw -ErrorAction SilentlyContinue
    if ($null -ne $raw -and $raw.Trim().Length -gt 0) {
      $secretFile = $p
      break
    }
    Write-Host "WARN: $p exists but EMPTY - skip"
  }
}

if (-not $env:CRON_SECRET -and -not $secretFile) {
  Write-Host "ERROR: Missing non-empty cron.secret"
  foreach ($p in $secretCandidates) { Write-Host "   - $p" }
  exit 1
}

if ($secretFile) { Write-Host "Using secret file: $secretFile" }
else { Write-Host "Using env CRON_SECRET" }

$count = 0
Get-Content -LiteralPath $manifest | ForEach-Object {
  $line = $_.Trim()
  if (-not $line) { return }
  if ($line.StartsWith("#")) { return }
  if ($line.StartsWith("REM")) { return }

  $parts = $line -split "\|", 3
  if ($parts.Count -lt 3) { return }

  $name = $parts[0].Trim()
  $job = $parts[1].Trim()
  $args = $parts[2].Trim() -split "\s+"
  $taskName = "giahomnay-$name"

  & schtasks.exe /Delete /TN $taskName /F 2>$null | Out-Null
  $tr = 'cmd /c set BASE_URL=' + $BaseUrl + '& "' + $bat + '" ' + $job
  Write-Host ("Creating " + $taskName + " ...")
  & schtasks.exe /Create /TN $taskName /TR $tr @args /RU SYSTEM /F
  if ($LASTEXITCODE -ne 0) {
    throw ("Failed " + $taskName + " (rc=" + $LASTEXITCODE + "). Run as Administrator.")
  }
  Write-Host ("OK " + $taskName)
  $count++
}

Write-Host ""
Write-Host ("Registered " + $count + " tasks.")
Write-Host "  schtasks /Query /FO TABLE | findstr giahomnay"
Write-Host "  schtasks /Run /TN giahomnay-sync-gold"
