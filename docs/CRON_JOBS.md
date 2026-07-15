# Cron Job Design

## Architecture

```
┌──────────────────┐     POST /api/cron/*     ┌──────────────┐
│ Cron scheduler   │ ────────────────────────▶│  Next.js App │
│ (cron / GH Act.) │   Bearer CRON_SECRET     │              │
└──────────────────┘                          └──────┬───────┘
                                               │
                    ┌──────────────────────────┼──────────────────┐
                    ▼                          ▼                  ▼
              ┌──────────┐            ┌────────────┐      ┌──────────┐
              │ External │            │   MySQL    │      │  Redis   │
              │   APIs   │            │            │      │  Cache   │
              └──────────┘            └────────────┘      └──────────┘
```

## Job Schedule

| Job | Cron | Endpoint | Priority |
|-----|------|----------|----------|
| Sync Gold | `*/5 * * * *` | `/api/cron/sync-gold` | P0 ✅ |
| Sync Forex | `*/10 * * * *` | `/api/cron/sync-forex` | P1 |
| Sync Stocks | `* 9-15 * * 1-5` | `/api/cron/sync-stocks` | P1 |
| Sync Interest | `0 8 * * *` | `/api/cron/sync-interest` | P2 |
| Sync Fuel | `0 15 * * *` | `/api/cron/sync-fuel` | P2 |
| Ingest 24h giá vàng | `0 8 * * *` (07+7) | `/api/cron/ingest-24h-gold` | P1 ✅ |
| Generate SEO Pages | `0 6 * * *` | `/api/cron/generate-seo` | P1 |
| AI Daily Article | `0 7 * * *` | `/api/cron/ai-daily-article` | P2 |
| Cleanup Old Prices | `0 3 * * 0` | `/api/cron/cleanup` | P3 |
| Aggregate Traffic | `0 1 * * *` | `/api/cron/aggregate-traffic` | P3 |

## Ingest tin giá vàng 24h

- Nguồn: [24h — Giá vàng](https://www.24h.com.vn/gia-vang-c161e3047.html)
- Endpoint: `POST /api/cron/ingest-24h-gold` + `Authorization: Bearer {CRON_SECRET}`
- Lịch khuyến nghị: **08:00 Asia/Ho_Chi_Minh** (`0 8 * * *` trên server, hoặc GitHub Actions `0 1 * * *` UTC)
- Workflow: [`.github/workflows/ingest-24h-gold.yml`](../.github/workflows/ingest-24h-gold.yml)
- Dedup theo `sourceUrl`; đăng `PUBLISHED` + category `GOLD`; ghi nguồn 24h.com.vn

**Bản quyền:** chỉ dùng khi đã có thỏa thuận / chấp nhận rủi ro tái bản. Bài có dòng nguồn + link gốc.

### Cấu hình

1. Admin → Cài đặt → `cron_secret` (hoặc `.env` `CRON_SECRET`)
2. GitHub Actions secret `CRON_SECRET` = cùng giá trị
3. (Tuỳ chọn) Plesk cron:
   ```bat
   curl -X POST -H "Authorization: Bearer %CRON_SECRET%" -H "Content-Type: application/json" -d "{}" https://giahomnay.site/api/cron/ingest-24h-gold
   ```
   lịch `0 8 * * *`

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
