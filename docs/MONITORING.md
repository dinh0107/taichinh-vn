# Monitoring & Logging

## Logging Stack

```
Application (Pino) → stdout → process manager / hosting logs → (future: Loki/Grafana)
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | API failures, cron failures, DB connection errors |
| `warn` | Cache misses, fallback to mock data, slow queries |
| `info` | Cron job completion, API sync success, page views |
| `debug` | Cache hits, query details (dev only) |

### Structured Log Format

```json
{
  "level": "info",
  "time": "2026-06-25T07:30:00.000Z",
  "msg": "Gold prices synced",
  "synced": 12,
  "latencyMs": 450
}
```

## Health Check

`GET /api/health`

```json
{
  "status": "healthy",
  "timestamp": "2026-06-25T07:30:00.000Z",
  "services": {
    "database": "up",
    "redis": "up",
    "goldApi": "up"
  },
  "version": "0.1.0"
}
```

## Metrics to Track

### Application

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| API response time p95 | Nginx/App | > 2s |
| Error rate | Pino/Sentry | > 1% |
| Cron job success rate | CronJobLog table | < 95% |
| Cache hit rate | Custom counter | < 80% |

### Business

| Metric | Source |
|--------|--------|
| Daily pageviews | TrafficStat table |
| Top SEO pages | TrafficStat by pagePath |
| Ad revenue | RevenueStat table |
| Gold price sync latency | ApiSyncLog table |

### Infrastructure

| Metric | Tool |
|--------|------|
| CPU/Memory | Host metrics / Prometheus |
| MySQL connections | `SHOW STATUS LIKE 'Threads_connected'` |
| Redis memory | INFO memory |
| Disk usage | df / volume monitor |

## Recommended Production Stack

```
┌──────────┐    ┌───────────┐    ┌─────────┐
│  Pino    │───▶│   Loki    │───▶│ Grafana │
│  Logs    │    │           │    │         │
└──────────┘    └───────────┘    └─────────┘
                                       ▲
┌──────────┐    ┌───────────┐         │
│Prometheus│───▶│  Alertmanager│──────┘
│ Metrics  │    │  → Slack    │
└──────────┘    └───────────┘

┌──────────┐
│  Sentry  │  ← Error tracking
└──────────┘
```

## Cron Job Monitoring

Query failed jobs:

```sql
SELECT job_name, COUNT(*) as failures
FROM cron_job_logs
WHERE status = 'FAILED'
  AND started_at > NOW() - INTERVAL '24 hours'
GROUP BY job_name;
```

## Uptime Monitoring

External services (recommended):
- UptimeRobot / Better Uptime — ping `/api/health` every 5 min
- Alert via Telegram/Slack on downtime

## Application Logs

```bash
# Development
npm run dev

# Production (PM2 example)
pm2 logs taichinh-vn

# Export recent logs (PM2)
pm2 logs taichinh-vn --lines 1000 --nostream > app.log
```
