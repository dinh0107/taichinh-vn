# Register Windows Task Scheduler jobs that POST /api/cron/*.
# Run ONCE on the Plesk Windows server (as Administrator):
#   powershell -ExecutionPolicy Bypass -File scripts\setup-windows-cron.ps1
#
# Prerequisites:
#   1. File cron.secret in site root (same folder as httpdocs) OR env CRON_SECRET
#      content = same value as Admin → Cài đặt → cron_secret
#   2. curl in PATH (Windows 10+ usually has it)

param(
  [string]$SiteRoot = (Split-Path $PSScriptRoot -Parent),
  [string]$BaseUrl = "https://giahomnay.site"
)

$ErrorActionPreference = "Stop"
$bat = Join-Path $PSScriptRoot "cron-call.bat"
if (-not (Test-Path $bat)) { throw "Missing $bat" }

$secretFile = Join-Path $SiteRoot "cron.secret"
if (-not $env:CRON_SECRET -and -not (Test-Path $secretFile)) {
  Write-Host "Create $secretFile with one line = cron_secret, then re-run."
  exit 1
}

function Register-CronTask {
  param(
    [string]$Name,
    [string]$Job,
    [string]$TriggerArgs  # schtasks /SC ...
  )
  $taskName = "giahomnay-$Name"
  schtasks /Delete /TN $taskName /F 2>$null | Out-Null
  $tr = "cmd /c `"set BASE_URL=$BaseUrl&& `"$bat`" $Job`""
  $cmd = "schtasks /Create /TN `"$taskName`" /TR `"$tr`" $TriggerArgs /RU SYSTEM /F"
  Write-Host $cmd
  cmd /c $cmd
  if ($LASTEXITCODE -ne 0) { throw "Failed to create $taskName" }
  Write-Host "OK $taskName"
}

# Gold prices every 5 minutes
Register-CronTask -Name "sync-gold" -Job "sync-gold" -TriggerArgs "/SC MINUTE /MO 5"

# 24h gold news daily 08:00 local (server timezone — set VN on Plesk)
Register-CronTask -Name "ingest-24h-gold" -Job "ingest-24h-gold" -TriggerArgs "/SC DAILY /ST 08:00"

# AI daily article 07:00 (khớp mặc định ai_cron_hour; đổi giờ trong Admin thì sửa task)
Register-CronTask -Name "ai-daily-article" -Job "ai-daily-article" -TriggerArgs "/SC DAILY /ST 07:00"

Write-Host ""
Write-Host "Done. Verify:"
Write-Host "  schtasks /Query /TN giahomnay-sync-gold /V /FO LIST"
Write-Host "  schtasks /Run /TN giahomnay-ingest-24h-gold"
Write-Host "  schtasks /Run /TN giahomnay-ai-daily-article"
Write-Host "Then check Admin → Cron & Logs"
