# Folder Structure — Production

```
taichinh-vn/
├── .github/workflows/          # CI/CD pipelines
│   └── ci-cd.yml
├── docker/
│   ├── nginx/nginx.conf        # Reverse proxy, rate limit, gzip
│   └── cron/crontab            # Scheduled sync jobs
├── docs/                       # Architecture documentation
├── prisma/
│   ├── schema.prisma           # Full database schema (all modules)
│   ├── migrations/             # Prisma migrations
│   └── seed.ts                 # Initial data seed
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (seo)/[slug]/       # Dynamic SEO landing pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/
│   │   │   ├── v1/             # Public REST API
│   │   │   │   ├── gold/
│   │   │   │   ├── forex/
│   │   │   │   ├── interest/
│   │   │   │   ├── stocks/
│   │   │   │   └── fuel/
│   │   │   ├── cron/           # Protected cron endpoints
│   │   │   └── health/         # Health check
│   │   ├── gia-vang/           # Gold module pages
│   │   ├── ty-gia/
│   │   ├── lai-suat/
│   │   ├── chung-khoan/
│   │   ├── gia-xang/
│   │   ├── tin-tuc/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Homepage
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                 # Shadcn UI primitives
│   │   ├── layout/             # Header, Footer
│   │   └── seo/                # JSON-LD, meta helpers
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── redis.ts            # Redis + cache helpers
│   │   ├── logger.ts           # Pino structured logging
│   │   ├── utils.ts
│   │   └── seo/
│   │       └── schema.ts       # Structured data builders
│   ├── modules/                # Domain-driven modules
│   │   ├── gold/               # ★ Complete reference module
│   │   │   ├── adapter.ts      # External API adapter
│   │   │   ├── service.ts      # Business logic
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   ├── forex/
│   │   ├── interest/
│   │   ├── stocks/
│   │   ├── fuel/
│   │   └── news/
│   └── types/                  # Shared TypeScript types
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
└── package.json
```

## Module Pattern (copy from `gold/`)

Each module follows:

1. **types.ts** — Zod schemas, constants, enums
2. **adapter.ts** — External data source integration
3. **service.ts** — Business logic, cache, DB fallback
4. **components/** — React UI components
5. **API routes** — `/api/v1/{module}/*`
6. **Pages** — App Router pages + SEO landing pages
7. **Cron** — `/api/cron/sync-{module}`
