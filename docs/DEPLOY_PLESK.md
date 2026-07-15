# Deploy Plesk — tránh mất CSS / 404 chunks

## Nguyên nhân

1. HTML và file trong `/_next/static/chunks/*` phải **cùng một build**.
2. Git pull Plesk thường **xóa** `.next` / `_next` / tar (untracked).
3. Gọi API Next `apply-deploy-artifact` sẽ **404** nếu `.next` đang chạy chưa build route đó.

## Luồng đúng

```text
CI pack tar
  → webhook Git → deploy-plesk-fast.bat ĐỢI tar (tối đa 5 phút)
  → CI upload tar (trong lúc bat đang đợi)
  → bat extract + sync CSS + restart
  → CI poll CSS đến HTTP 200
```

## Plesk

- Deployment mode: **Manual**
- Additional actions: `call scripts\deploy-plesk-fast.bat`

## Secrets CI

`PLESK_SFTP_*`, `PLESK_GIT_WEBHOOK_URL`

## Sửa tay khi CSS 404

Upload/`deploy-build.tar.gz` vào `httpdocs` rồi:

```bat
cd C:\Inetpub\vhosts\giahomnay.site\httpdocs
tar -xzf deploy-build.tar.gz
node scripts\copy-next-static.js
```

Restart Node.js app → Ctrl+F5.
