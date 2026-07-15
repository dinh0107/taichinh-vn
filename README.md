# TaiChinh.vn — Nền tảng Tài chính Cá nhân Việt Nam

Next.js 15 · TypeScript · MySQL · Prisma · Redis

## Yêu cầu

- Node.js 20+
- MySQL 8.0+ (cài local hoặc dùng instance cloud)
- Redis 7+ (tùy chọn — app vẫn chạy được nếu không có Redis)

## Quick Start

```bash
cp .env.example .env
# Tạo database MySQL trước, ví dụ:
#   CREATE DATABASE taichinh_vn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# Chỉnh DATABASE_URL trong .env cho đúng MySQL của bạn
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Mở http://localhost:3000

## Production

```bash
npm run build
npm run start
```

Chạy `npx prisma migrate deploy` trước khi start trên server. Cron jobs gọi các endpoint `/api/cron/*` (xem [Cron Jobs](docs/CRON_JOBS.md)) — cấu hình qua system cron, Task Scheduler, hoặc Vercel Cron.

### CI/CD Plesk (khuyến nghị)

Build trên **GitHub Actions**, server **không** `npm run build`. Chi tiết: [Deploy Plesk](docs/DEPLOY_PLESK.md).

- Secrets: `PLESK_SFTP_HOST`, `PLESK_SFTP_USER`, `PLESK_SFTP_PASSWORD`, `PLESK_SFTP_PORT`, `PLESK_SFTP_REMOTE_PATH`
- Plesk Additional actions: `call scripts\deploy-plesk-fast.bat`

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

- [Deploy Plesk](docs/DEPLOY_PLESK.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [API Design](docs/API_DESIGN.md)
- [ERD Diagram](docs/ERD.md)
- [Cron Jobs](docs/CRON_JOBS.md)
- [Redis Caching](docs/REDIS_CACHING.md)
- [SEO Strategy](docs/SEO_STRATEGY.md)
- [Security Checklist](docs/SECURITY.md)
- [Monitoring](docs/MONITORING.md)

## License

Private — All rights reserved.
