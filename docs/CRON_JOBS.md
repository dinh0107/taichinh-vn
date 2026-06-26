# Cron Job Design

## Architecture

```
┌─────────────┐     POST /api/cron/*     ┌──────────────┐
│ Alpine Cron │ ────────────────────────▶│  Next.js App │
│  Container  │   Bearer CRON_SECRET     │              │
└─────────────┘                          └──────┬───────┘
                                               │
                    ┌──────────────────────────┼──────────────────┐
                    ▼                          ▼                  ▼
              ┌──────────┐            ┌────────────┐      ┌──────────┐
              │ External │            │ PostgreSQL │      │  Redis   │
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
| Generate SEO Pages | `0 6 * * *` | `/api/cron/generate-seo` | P1 |
| AI Daily Article | `0 7 * * *` | `/api/cron/ai-daily-article` | P2 |
| Cleanup Old Prices | `0 3 * * 0` | `/api/cron/cleanup` | P3 |
| Aggregate Traffic | `0 1 * * *` | `/api/cron/aggregate-traffic` | P3 |

## Job Lifecycle

1. Cron container fires HTTP POST with `Authorization: Bearer {CRON_SECRET}`
2. Endpoint creates `CronJobLog` with status `RUNNING`
3. Fetches external data via adapter
4. Upserts to PostgreSQL
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
