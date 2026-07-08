# Redis Caching Strategy

## Cache Layers

```
Request → Next.js ISR (revalidate) → Redis Cache → MySQL → External API
```

## Key Naming Convention

```
{module}:{entity}:{identifier}:{params}
```

Examples:
- `gold:current`
- `gold:history:SJL1L10:30`
- `gold:compare:DOHNL,PQHNVM,SJL1L10`
- `forex:current`
- `forex:VIETCOMBANK:USD`
- `interest:all`
- `stocks:indices`
- `seo:page:gia-vang-hom-nay`

## TTL Strategy

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Gold current | 5 min | Matches giavang.now update frequency |
| Gold history | 1 hour | Historical data changes slowly |
| Forex current | 10 min | Bank rates update 2-4x/day |
| Interest rates | 1 hour | Changes weekly at most |
| Stocks indices | 1 min | Real-time during market hours |
| Stocks top movers | 5 min | Balance freshness vs load |
| Fuel prices | 1 hour | Updates bi-weekly |
| SEO pages | 30 min | Content + dynamic prices |
| News list | 15 min | Frequent updates |

## Invalidation

### Event-driven (on cron sync)

```typescript
// After gold sync
await cacheDel("gold:*");

// After forex sync
await cacheDel("forex:*");
```

### Pattern-based purge

```typescript
await redis.keys("gold:history:*").then(keys => redis.del(...keys));
```

## Cache-Aside Pattern

```typescript
async function getData(key: string, fetcher: () => Promise<T>, ttl: number) {
  const cached = await cacheGet<T>(key);
  if (cached) return cached;

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttl);
  return fresh;
}
```

## Stale-While-Revalidate

For gold prices, if Redis is down:
1. Try MySQL (last synced data)
2. Fall back to mock data (development)
3. Never block the page — always serve something

## Memory Estimation

| Key Pattern | Avg Size | Count | Total |
|-------------|----------|-------|-------|
| gold:current | 5 KB | 1 | 5 KB |
| gold:history:* | 50 KB | 12 types × 6 ranges | 3.6 MB |
| forex:current | 10 KB | 1 | 10 KB |
| seo:page:* | 20 KB | 1000 pages | 20 MB |
| **Total estimate** | | | **~25 MB** |

Redis 256MB instance is sufficient for launch.

## Production Config

```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
```

## Monitoring

- Track hit/miss ratio via custom metrics
- Alert if cache hit rate drops below 80%
- Monitor Redis memory usage
