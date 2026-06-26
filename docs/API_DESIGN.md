# API Design

Base URL: `https://taichinh.vn/api/v1`

## Gold Module ✅

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gold/prices` | Current prices all types |
| GET | `/gold/prices?code=SJL1L10` | Single type price |
| GET | `/gold/history?code=SJL1L10&range=30d` | Price history |
| GET | `/gold/compare?codes=SJL1L10,DOHNL` | Compare brands |

**Range values**: `1d`, `7d`, `30d`, `90d`, `1y`, `all`

### Response — GET /gold/prices

```json
{
  "success": true,
  "timestamp": 1732456789000,
  "count": 12,
  "data": [{
    "code": "SJL1L10",
    "nameVi": "Vàng SJC 9999",
    "brand": "SJC",
    "buy": 143200000,
    "sell": 146200000,
    "changeBuy": -800000,
    "currency": "VND"
  }]
}
```

## Forex Module (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/forex/rates` | All bank rates |
| GET | `/forex/rates?bank=VIETCOMBANK&currency=USD` | Single rate |
| GET | `/forex/history?currency=USD&bank=VIETCOMBANK&days=30` | History |
| GET | `/forex/convert?from=USD&to=VND&amount=100` | Currency converter |
| GET | `/forex/compare?currency=USD` | Compare banks |

## Interest Rate Module (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/interest/rates` | All banks all terms |
| GET | `/interest/rates?bank=VIETCOMBANK` | Single bank |
| GET | `/interest/compare?term=M12` | Compare by term |
| POST | `/interest/calculate` | Savings calculator |

## Stocks Module (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stocks/indices` | VNINDEX, HNX, UPCOM |
| GET | `/stocks/top?type=gainers&limit=10` | Top movers |
| GET | `/stocks/quote?symbol=VNM` | Single stock |

## Fuel Module (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fuel/prices` | RON95, E5, Diesel |
| GET | `/fuel/history?type=RON95&days=90` | History |

## News Module (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news?category=GOLD&page=1` | Paginated news |
| GET | `/news/:slug` | Single article |

## Cron Endpoints (protected)

| Method | Endpoint | Schedule |
|--------|----------|----------|
| POST | `/cron/sync-gold` | Every 5 min |
| POST | `/cron/sync-forex` | Every 10 min |
| POST | `/cron/sync-stocks` | Every 1 min (market hours) |
| POST | `/cron/sync-interest` | Daily 08:00 |
| POST | `/cron/sync-fuel` | Daily 15:00 |
| POST | `/cron/generate-seo` | Daily 06:00 |
| POST | `/cron/ai-daily-article` | Daily 07:00 |

**Auth**: `Authorization: Bearer {CRON_SECRET}`

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | DB + Redis status |

## Error Format

```json
{
  "success": false,
  "error": "Human readable message",
  "code": "VALIDATION_ERROR"
}
```

## Rate Limits (Nginx)

- API: 30 req/s per IP
- Pages: 100 req/s per IP
