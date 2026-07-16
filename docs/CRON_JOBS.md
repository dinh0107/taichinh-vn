# Cron Job Design

## Architecture

```
┌──────────────────┐     POST /api/cron/*     ┌──────────────┐
│ Cron scheduler   │ ────────────────────────▶│  Next.js App │
│ (Windows Task /  │   Bearer CRON_SECRET     │              │
│  Plesk / GH Act) │                          │              │
└──────────────────┘                          └──────┬───────┘
                                               │
                    ┌──────────────────────────┼──────────────────┐
                    ▼                          ▼                  ▼
              ┌──────────┐            ┌────────────┐      ┌──────────┐
              │ External │            │   MySQL    │      │  Redis   │
              │   APIs   │            │            │      │  Cache   │
              └──────────┘            └────────────┘      └──────────┘
```

> **Quan trọng:** App **không** tự chạy cron. Phải có scheduler bên ngoài gọi HTTP.
> Sau khi bỏ Docker, crontab trong container không còn — nếu chưa cấu hình Task Scheduler / Plesk thì Admin → Cron sẽ trống.

## Bật lịch trên Windows Plesk (khuyến nghị)

1. Tạo file `cron.secret` **ngay cạnh** `httpdocs` (một dòng = `cron_secret` trong Admin → Cài đặt). File này đã có trong `.gitignore`.
2. Trên server (RDP / PowerShell **Admin**), trong thư mục site:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-windows-cron.ps1
```

Script đăng ký task:

| Task | Lịch | Endpoint |
|------|------|----------|
| `giahomnay-sync-gold` | mỗi 5 phút | `/api/cron/sync-gold` |
| `giahomnay-ingest-24h-gold` | 08:00 hàng ngày | `/api/cron/ingest-24h-gold` |
| `giahomnay-ai-daily-article` | 07:00 hàng ngày | `/api/cron/ai-daily-article` |

3. Chạy thử ngay:

```bat
schtasks /Run /TN giahomnay-ai-daily-article
scripts\cron-call.bat ai-daily-article
```

4. Vào **Admin → Cron & Logs** — phải thấy log `SUCCESS` trong vài giây.

Hoặc Plesk → **Scheduled Tasks** → thêm lệnh:

```bat
call C:\path\to\httpdocs\scripts\cron-call.bat ai-daily-article
```

## Job Schedule

| Job | Cron | Endpoint | Priority |
|-----|------|----------|----------|
| Sync Gold | `*/5 * * * *` | `/api/cron/sync-gold` | P0 ✅ |
| Sync Forex | `*/10 * * * *` | `/api/cron/sync-forex` | P1 |
| Sync Stocks | `* 9-15 * * 1-5` | `/api/cron/sync-stocks` | P1 |
| Sync Interest | `0 8 * * *` | `/api/cron/sync-interest` | P2 |
| Sync Fuel | `0 15 * * *` | `/api/cron/sync-fuel` | P2 |
| Ingest 24h giá vàng | `0 8 * * *` | `/api/cron/ingest-24h-gold` | P1 ✅ |
| AI Daily Article | `0 7 * * *` | `/api/cron/ai-daily-article` | P1 ✅ |
| Generate SEO Pages | `0 6 * * *` | `/api/cron/generate-seo` | P1 |
| Cleanup Old Prices | `0 3 * * 0` | `/api/cron/cleanup` | P3 |
| Aggregate Traffic | `0 1 * * *` | `/api/cron/aggregate-traffic` | P3 |

## Ingest tin giá vàng 24h

- Nguồn: [24h — Giá vàng](https://www.24h.com.vn/gia-vang-c161e3047.html)
- Endpoint: `POST /api/cron/ingest-24h-gold` + `Authorization: Bearer {CRON_SECRET}`
- Lịch khuyến nghị: **08:00 Asia/Ho_Chi_Minh** trên **Windows Task Scheduler** (xem mục trên)
- Backup: GitHub Actions [`.github/workflows/ingest-24h-gold.yml`](../.github/workflows/ingest-24h-gold.yml) (`0 1 * * *` UTC) — GitHub có thể trễ hoặc tạm dừng schedule nếu repo ít activity; **không** dựa vào đây làm nguồn chính
- Dedup theo `sourceUrl`; đăng `PUBLISHED` + category `GOLD`; ghi nguồn 24h.com.vn

**Bản quyền:** chỉ dùng khi đã có thỏa thuận / chấp nhận rủi ro tái bản. Bài có dòng nguồn + link gốc.

### Cấu hình

1. Admin → Cài đặt → `cron_secret` (hoặc `.env` `CRON_SECRET`)
2. File `cron.secret` trên server + chạy `scripts\setup-windows-cron.ps1` (bắt buộc để tự chạy)
3. (Tuỳ chọn) GitHub secret `CRON_SECRET` = cùng giá trị để workflow backup chạy được
4. Kiểm tra: `schtasks /Run /TN giahomnay-ingest-24h-gold` rồi xem Admin → Cron

## AI Daily Article

- Endpoint: `POST /api/cron/ai-daily-article` + `Authorization: Bearer {CRON_SECRET}`
- Body tuỳ chọn: `{ "force": true, "category": "GOLD" }` — `force` bỏ qua cờ auto + dedupe trong ngày
- Đọc Admin → Cài đặt → **Nội dung AI** (`getAiConfig`)
- Bỏ qua nếu `ai_auto_write` tắt hoặc thiếu API key (vẫn log SUCCESS + reason)
- Mỗi chuyên mục tối đa **1 bài AI / ngày** (Asia/Ho_Chi_Minh)
- Số liệu: giá vàng / lãi suất / tỷ giá tùy category
- Lưu `NewsArticle` (`isAiGenerated`, `source: AI`); FAQ nếu bật `ai_auto_faq`
- Chế độ đăng: `ai_publish_mode` = `DRAFT` | `PUBLISHED`
- Task: `giahomnay-ai-daily-article` lúc **07:00** (đổi giờ task nếu đổi `ai_cron_hour`)

### Bật nhanh

1. Admin → Cài đặt → dán OpenAI key, bật **Tự động viết bài SEO hằng ngày**, Lưu
2. `schtasks /Run /TN giahomnay-ai-daily-article` hoặc:

```bat
curl -X POST -H "Authorization: Bearer %CRON_SECRET%" -H "Content-Type: application/json" -d "{\"force\":true}" https://giahomnay.site/api/cron/ai-daily-article
```

3. Admin → Bài viết / Cron & Logs

## Job Lifecycle

1. Cron scheduler fires HTTP POST with `Authorization: Bearer {CRON_SECRET}`
2. Endpoint creates `CronJobLog` with status `RUNNING`
3. Fetches external data via adapter
4. Upserts to MySQL
5. Invalidates Redis cache (`gold:*`, etc.)
6. Updates `CronJobLog` to `SUCCESS` or `FAILED`
7. On failure: log error, alert (future: Slack/Telegram)

## Idempotency

- Gold history: upsert on `(goldTypeId, recordedAt, interval)` unique constraint
- Exchange rates: append-only snapshots with `recordedAt`
- Interest rates: daily snapshot per `(bankId, term, recordedAt)`

## Retry Policy

- Max 3 retries with exponential backoff (1s, 4s, 16s)
- Dead letter: log to `CronJobLog` with `FAILED` status
- Alert if 3 consecutive failures

## Alternative: Vercel Cron / GitHub Actions

For serverless deployment, use `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/sync-gold", "schedule": "*/5 * * * *" }
  ]
}
```

Or GitHub Actions scheduled workflow for VPS-less setups.
