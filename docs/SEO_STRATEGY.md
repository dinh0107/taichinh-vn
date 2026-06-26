# SEO Strategy

## Programmatic Landing Pages

Auto-generate thousands of SEO-optimized pages from data + templates.

### Page Categories

| Pattern | Example | Count Est. |
|---------|---------|------------|
| `/gia-vang-hom-nay` | Giá vàng hôm nay | 1 |
| `/gia-vang-{brand}-hom-nay` | SJC, DOJI, PNJ | 5 |
| `/gia-vang-{purity}-hom-nay` | 9999, 24K, 18K | 3 |
| `/ty-gia-{currency}-hom-nay` | USD, EUR, JPY... | 6 |
| `/ty-gia-{bank}-{currency}` | Vietcombank USD | 24 |
| `/lai-suat-{bank}` | Vietcombank | 7 |
| `/lai-suat-{bank}-{term}` | Vietcombank 12 tháng | 49 |
| `/gia-xang-{type}-hom-nay` | RON95, E5, Diesel | 3 |
| `/chung-khoan-{index}` | VNINDEX | 3 |
| **Total launch** | | **~100** |
| **Scale target** | + city variants, date archives | **10,000+** |

## On-Page SEO (every page)

### Dynamic Meta

```typescript
title: "Giá vàng SJC hôm nay 25/06/2026 — Mua 143.2tr, Bán 146.2tr | TaiChinh.vn"
description: "Cập nhật giá vàng SJC 9999 mới nhất. So sánh DOJI, PNJ. Biểu đồ 30 ngày."
```

### Structured Data (JSON-LD)

1. **BreadcrumbList** — navigation hierarchy
2. **FAQPage** — auto-generated FAQs with real prices
3. **FinancialService** — site-level schema
4. **Product/Offer** — gold price schema

### Content Blocks

- H1 with target keyword
- Price table (unique data = unique content)
- Chart (engagement signal)
- FAQ section (featured snippet target)
- Internal links to related pages
- "Last updated" timestamp (freshness)

## Technical SEO

| Item | Implementation |
|------|----------------|
| Sitemap | `src/app/sitemap.ts` — dynamic, all SEO pages |
| Robots | `src/app/robots.ts` — allow all, block /admin /api |
| Canonical | `alternates.canonical` on every page |
| OpenGraph | Dynamic OG title/description per page |
| ISR | `revalidate: 300` (5 min) for price pages |
| Core Web Vitals | Standalone build, image optimization, font subset |
| Mobile-first | Tailwind responsive, no horizontal scroll |
| hreflang | `vi` primary (future: `en` for expat audience) |

## Content Strategy (EEAT)

### Experience
- Real-time data from verified sources
- Interactive tools (compare, calculator, alerts)

### Expertise
- AI-generated daily analysis articles
- Price movement explanations
- Market context (world gold correlation)

### Authoritativeness
- Consistent daily publishing
- Comprehensive bank/gold brand coverage
- Structured data markup

### Trustworthiness
- Source attribution (giavang.now, bank websites)
- Disclaimer on every page
- HTTPS, security headers
- Transparent update timestamps

## AI Content Pipeline

```
Cron (07:00) → Fetch latest prices → AI prompt with data → Generate article
  → SEO review (title, meta, FAQ) → Publish → Sitemap update
```

Daily articles target long-tail keywords:
- "Vàng SJC tăng hay giảm hôm nay"
- "Nên mua vàng tháng 6/2026 không"
- "So sánh lãi suất gửi tiết kiệm tháng 6"

## Link Building (internal)

Hub-and-spoke model:
```
/gia-vang (hub)
  ├── /gia-vang-sjc-hom-nay
  ├── /gia-vang-doji-hom-nay
  ├── /gia-vang-pnj-hom-nay
  └── /gia-vang-9999-hom-nay
```

Cross-module links:
- Gold page → "Tỷ giá USD ảnh hưởng giá vàng"
- Interest page → "Gửi tiền hay mua vàng?"

## Competitor Gap Analysis

| Feature | CafeF | Vietstock | FireAnt | TaiChinh.vn |
|---------|-------|-----------|---------|-------------|
| Gold compare | ❌ | ❌ | ❌ | ✅ |
| Price alerts | ❌ | ❌ | ✅ | ✅ |
| Gold portfolio | ❌ | ❌ | ❌ | ✅ |
| SEO landing pages | Limited | Limited | ❌ | ✅ 1000+ |
| FAQ Schema | ❌ | ❌ | ❌ | ✅ |
| Free API | ❌ | ❌ | Paid | ✅ |

## KPIs

- Organic traffic: target 50K/month by month 6
- Indexed pages: 500+ within 3 months
- Average position: top 10 for "giá vàng hôm nay" variants
- Core Web Vitals: all green
