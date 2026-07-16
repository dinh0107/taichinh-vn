# Register Windows Task Scheduler jobs that POST /api/cron/*.
# Run ONCE on the Plesk Windows server (as Administrator):
#   cd C:\Inetpub\vhosts\giahomnay.site\httpdocs
#   powershell -ExecutionPolicy Bypass -File scripts\setup-windows-cron.ps1
#
# Prerequisites:
#   1. cron.secret — one line = Admin cron_secret — in EITHER:
#        httpdocs\cron.secret
#        OR parent of httpdocs (vhost home, cạnh thư mục httpdocs)
#      OR env CRON_SECRET
#   2. curl in PATH
#   3. PowerShell / CMD chạy với quyền Administrator (schtasks cần quyền cao)

param(
  [string]$Httpdocs = (Split-Path $PSScriptRoot -Parent),
  [string]$BaseUrl = "https://giahomnay.site"
)

$ErrorActionPreference = "Stop"
$bat = Join-Path $PSScriptRoot "cron-call.bat"
if (-not (Test-Path $bat)) { throw "Missing $bat" }

$vhostRoot = Split-Path $Httpdocs -Parent
$secretCandidates = @(
  (Join-Path $Httpdocs "cron.secret"),
  (Join-Path $vhostRoot "cron.secret")
)

$secretFile = $null
foreach ($p in $secretCandidates) {
  if (Test-Path -LiteralPath $p) {
    $raw = (Get-Content -LiteralPath $p -Raw -ErrorAction SilentlyContinue)
    if ($raw -and $raw.Trim().Length -gt 0) {
      $secretFile = $p
      break
    }
    Write-Host "WARN: $p exists but EMPTY — skip"
  }
}

if (-not $env:CRON_SECRET -and -not $secretFile) {
  Write-Host "ERROR: Missing non-empty cron.secret"
  Write-Host "  Put one line (cron_secret) in one of:"
  foreach ($p in $secretCandidates) { Write-Host "   - $p" }
  exit 1
}

if ($secretFile) {
  Write-Host "Using secret file: $secretFile"
} else {
  Write-Host "Using env CRON_SECRET"
}

function Register-CronTask {
  param(
    [string]$Name,
    [string]$Job,
    [string]$TriggerArgs
  )
  $taskName = "giahomnay-$Name"
  schtasks /Delete /TN $taskName /F 2>$null | Out-Null
  # Escape for schtasks /TR: wrap cmd carefully
  $tr = "cmd /c `"set BASE_URL=$BaseUrl&& `"$bat`" $Job`""
  $cmd = "schtasks /Create /TN `"$taskName`" /TR `"$tr`" $TriggerArgs /RU SYSTEM /F"
  Write-Host $cmd
  cmd /c $cmd
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create $taskName (rc=$LASTEXITCODE). Chay CMD/PowerShell as Administrator."
  }
  Write-Host "OK $taskName"
}

Register-CronTask -Name "sync-gold" -Job "sync-gold" -TriggerArgs "/SC MINUTE /MO 5"
Register-CronTask -Name "ingest-24h-gold" -Job "ingest-24h-gold" -TriggerArgs "/SC DAILY /ST 08:00"
Register-CronTask -Name "ai-daily-article" -Job "ai-daily-article" -TriggerArgs "/SC DAILY /ST 07:00"
Register-CronTask -Name "generate-sitemap" -Job "generate-sitemap" -TriggerArgs "/SC DAILY /ST 02:00"

Write-Host ""
Write-Host "Done. Verify:"
Write-Host "  schtasks /Query /TN giahomnay-sync-gold"
Write-Host "  schtasks /Run /TN giahomnay-generate-sitemap"
Write-Host "Then check Admin → Cron & Logs"
