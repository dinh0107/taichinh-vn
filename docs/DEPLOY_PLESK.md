# Deploy Plesk — tránh mất CSS / 404 chunks

## Nguyên nhân

1. HTML và file trong `/_next/static/chunks/*` phải **cùng một build**.
2. Git pull Plesk thường **xóa** `.next` / `_next` / tar (untracked).
3. `rmdir .next` khi **iisnode đang mở file** → xóa/extract dở (JS còn, CSS mất).
4. Sync `_next` khi `.next` không có CSS sẽ **xoá CSS cũ** trên disk.

## Luồng đúng

```text
CI pack tar
  → webhook Git (git clean) → deploy-plesk-fast.bat ĐỢI tar (deploy-waiting.flag)
  → CI upload tar + **re-put mỗi ~30s** trong lúc poll CSS
       (tránh race: upload lúc git clean còn chạy → tar bị xóa)
  → bat: extract → _deploy_staging (verify CSS)
       swap/robocopy → .next + copy-next-static + restart
  → CI poll đúng hash CSS của build mới đến HTTP 200 (~8 phút)
```

Không upload tar một lần rồi chỉ chờ: nếu git pull chậm hơn sleep của CI, `git clean` sẽ xóa tar trước khi bat kịp nhận → CSS hash mới 404 mãi.

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
