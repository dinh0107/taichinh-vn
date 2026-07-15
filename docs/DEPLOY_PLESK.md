# Deploy Plesk — tránh mất CSS

## Vì sao 404 `/_next/static/chunks/...`?

HTML và file JS/CSS phải **cùng một bản build**.  
Plesk Git pull thường **xóa** thư mục untracked (`.next`, `_next`, `deploy-build.tar.gz`) → upload tar trước webhook sẽ bị mất.

## Luồng CI đúng

1. Build + pack `deploy-build.tar.gz`
2. **Webhook Git** (pull code) → chờ ~45s
3. **Upload tar** (sau khi Git xóa xong)
4. `POST /api/cron/apply-deploy-artifact` → giải nén + sync CSS + touch `web.config`

## Secrets

| Secret | Dùng cho |
|--------|----------|
| `PLESK_SFTP_*` | Upload tar |
| `PLESK_GIT_WEBHOOK_URL` | Pull code |
| `CRON_SECRET` | Gọi `apply-deploy-artifact` + ingest tin |

Plesk: Deployment = **Manual**; actions: `call scripts\deploy-plesk-fast.bat` (prisma/npm; extract chính do API).

## Sửa tay khi đang 404 CSS

Trong `httpdocs` (nếu còn tar và `.next` lệch):

```bat
node scripts\copy-next-static.js
```

Hoặc upload lại `deploy-build.tar.gz` rồi:

```bat
curl -X POST -H "Authorization: Bearer CRON_SECRET" -H "Content-Type: application/json" -d "{}" https://giahomnay.site/api/cron/apply-deploy-artifact
```

Restart Node.js app.
