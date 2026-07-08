# Security Checklist

## Authentication & Authorization

- [x] Cron endpoints protected by `CRON_SECRET` bearer token
- [ ] Admin routes behind session auth (NextAuth / custom JWT)
- [ ] Role-based access: USER, EDITOR, ADMIN
- [ ] Password hashing with bcrypt (cost factor 12)
- [ ] Session expiry + secure httpOnly cookies

## API Security

- [x] Input validation with Zod on all API endpoints
- [ ] CORS whitelist for public API
- [ ] API key authentication for external consumers (future)
- [x] No sensitive data in API responses (password hashes, secrets)

## Infrastructure

- [x] `poweredByHeader: false` in Next.js
- [ ] HTTPS/TLS (production reverse proxy / hosting)
- [ ] Database connection over SSL
- [ ] Redis password authentication (production)
- [ ] Secrets in environment variables, never in code
- [ ] `.env` in `.gitignore`

## Application

- [x] Prisma parameterized queries (SQL injection prevention)
- [x] React auto-escaping (XSS prevention)
- [ ] CSP headers (Content-Security-Policy)
- [ ] CSRF protection on mutation endpoints
- [ ] File upload validation (admin module)
- [x] `robots.txt` blocks `/admin` and `/api/`

## Data Protection

- [ ] PII encryption at rest (user emails)
- [ ] GDPR-style data export/deletion endpoints
- [ ] Audit log for admin actions
- [ ] Database backups (daily, encrypted)

## Dependency Security

- [ ] `npm audit` in CI pipeline
- [ ] Dependabot / Renovate for auto-updates
- [ ] Lock file committed (`package-lock.json`)

## Monitoring & Incident Response

- [ ] Sentry error tracking
- [ ] Failed login attempt monitoring
- [ ] Anomaly detection on API usage
- [ ] Incident response playbook documented

## Pre-Launch Checklist

1. Rotate all default secrets (`CRON_SECRET`, `ADMIN_SESSION_SECRET`)
2. Enable HTTPS
3. Configure firewall (only 80, 443 open)
4. Set up database backups
5. Run `npm audit fix`
6. Penetration test on admin endpoints
7. Review all environment variables

