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
  → CI sleep ~45s rồi upload tar vào httpdocs **và** parent (tránh git clean)
  → CI POST /api/cron/apply-deploy-artifact (detached apply-deploy-tar.bat)
       kill node → extract staging → swap .next → sync CSS
  → (song song) bat Plesk cũng có thể nhận tar nếu còn đang chờ
  → CI poll hash CSS build mới đến HTTP 200
```

Nếu chỉ thấy `upload OK` + `try N → HTTP 404`: tar lên rồi nhưng **chưa extract**. Kiểm tra secret `CRON_SECRET` trên GitHub (= Admin cron_secret) và log Plesk / `deploy-ok.flag`.

## Plesk

- Deployment mode: **Manual**
- Additional actions: `call scripts\deploy-plesk-fast.bat`

## Secrets CI

`PLESK_SFTP_*`, `PLESK_GIT_WEBHOOK_URL`

## Sửa tay khi CSS 404 / AI vẫn gọi OpenAI (code mới không lên)

**Triệu chứng AI:** response lỗi vẫn là `OpenAI HTTP…` trong khi repo đã là `AI HTTP…` / `aiClient: "or-v1"` → **iisnode đang giữ `.next` cũ** (CI xanh nhưng file server route không bị ghi đè).

**Cách A — Plesk:** Node.js → **Restart** app, rồi re-run CI hoặc trên RDP:

```bat
cd C:\Inetpub\vhosts\giahomnay.site\httpdocs
call scripts\deploy-plesk-fast.bat
```

(Bat mới: kill `node.exe` của site → **swap** thư mục `.next` → tránh lock.)

**Cách B — redeploy CI** sau khi đã pull script deploy mới.
