# Deploy Plesk — Cách B (khuyến nghị): build trên GitHub, không race

## Luồng

```text
push main
  → GitHub Actions: lint → build → upload deploy-build.tar.gz (FTP)
  → CI gọi Plesk Webhook URL
  → Plesk pull + call scripts\deploy-plesk-fast.bat
  → giải nén .next/_next → prisma → restart
```

## 1) Plesk Git settings (bắt buộc)

| Mục | Giá trị |
|-----|---------|
| **Deployment mode** | **Manual** (không Automatic) |
| Server path | `\httpdocs` |
| Enable additional deployment actions | ✓ |
| Deploy actions | `call scripts\deploy-plesk-fast.bat` |

Automatic sẽ pull ngay khi push — thường **trước** khi CI upload tar xong. Manual + webhook từ CI = đúng thứ tự.

## 2) GitHub Secrets

| Secret | Giá trị |
|--------|---------|
| `PLESK_SFTP_HOST` | host FTP |
| `PLESK_SFTP_USER` | user FTP Plesk (thấy `httpdocs`) |
| `PLESK_SFTP_PASSWORD` | password |
| `PLESK_SFTP_PORT` | `21` |
| `PLESK_SFTP_REMOTE_PATH` | `httpdocs` |
| `PLESK_GIT_WEBHOOK_URL` | Copy từ Plesk → Git → **Webhook URL** (ô read-only) |

## 3) Kiểm tra

1. Push `main` hoặc Re-run workflow
2. Actions: Build → Upload → **Trigger Plesk Git deploy** = xanh
3. Plesk Git log / site cập nhật; có `.next\prerender-manifest.json`

## Fallback

```bat
call scripts\deploy-plesk-git.bat
```

(build tay trên server — chỉ khi khẩn cấp)
