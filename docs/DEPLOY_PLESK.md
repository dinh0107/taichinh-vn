# Deploy Plesk — tránh mất CSS / 404 chunks

## Nguyên nhân

1. HTML và file trong `/_next/static/chunks/*` phải **cùng một build**.
2. Git pull Plesk thường **xóa** `.next` / `_next` / tar (untracked).
3. `rmdir .next` khi **iisnode đang mở file** → xóa/extract dở (JS còn, CSS mất).
4. Sync `_next` khi `.next` không có CSS sẽ **xoá CSS cũ** trên disk.

## Luồng đúng

```text
CI pack tar
  → webhook Git (git clean) → deploy-plesk-fast.bat ĐỢI tar
  → CI upload tar (sau git clean)
  → bat: extract → _deploy_staging (verify CSS)
       robocopy staging → .next (KHÔNG rmdir khi iisnode lock)
       copy-next-static + restart
  → CI poll CSS đến HTTP 200
```

Không upload tar trước webhook: git clean sẽ xóa `deploy-build.tar.gz`.

## Plesk

- Deployment mode: **Manual**
- Additional actions: `call scripts\deploy-plesk-fast.bat`

## Secrets CI

`PLESK_SFTP_*`, `PLESK_GIT_WEBHOOK_URL`

## Sửa tay khi CSS 404

**Cách A — redeploy CI** (khuyến nghị): push `main` hoặc re-run workflow CI/CD.

**Cách B — RDP server:**

```bat
cd C:\Inetpub\vhosts\giahomnay.site\httpdocs
REM Stop Node app trong Plesk trước nếu robocopy báo lock
REM Upload deploy-build.tar.gz vào httpdocs rồi:
call scripts\deploy-plesk-fast.bat
```

Hoặc thủ công:

```bat
tar -xzf deploy-build.tar.gz -C _deploy_staging
robocopy _deploy_staging\.next .next /E
node scripts\copy-next-static.js
```

Restart Node.js app → Ctrl+F5.
