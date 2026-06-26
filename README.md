# TaiChinh.vn — Nền tảng Tài chính Cá nhân Việt Nam

Next.js 15 · TypeScript · PostgreSQL · Prisma · Redis · Docker

## Quick Start

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Mở http://localhost:3000

## Modules

| Module | Status | Route |
|--------|--------|-------|
| Giá vàng | **Production-ready** | `/gia-vang`, `/gia-vang-*-hom-nay` |
| Tỷ giá | Scaffold | `/ty-gia` |
| Lãi suất | Scaffold | `/lai-suat` |
| Chứng khoán | Scaffold | `/chung-khoan` |
| Giá xăng | Scaffold | `/gia-xang` |
| Tin tức | Scaffold | `/tin-tuc` |
| Admin | Scaffold | `/admin` |

## Data Source

- **Gold**: [giavang.now API](https://giavang.now/en/api) — free, no API key, 5-min updates
- Other modules: adapter pattern ready for real data sources

## Architecture Docs

- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [API Design](docs/API_DESIGN.md)
- [ERD Diagram](docs/ERD.md)
- [Cron Jobs](docs/CRON_JOBS.md)
- [Redis Caching](docs/REDIS_CACHING.md)
- [SEO Strategy](docs/SEO_STRATEGY.md)
- [Security Checklist](docs/SECURITY.md)
- [Monitoring](docs/MONITORING.md)

## Docker Production

```bash
docker compose up -d --build
```

## License

Private — All rights reserved.
