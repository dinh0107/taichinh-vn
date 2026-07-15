# Deploy Plesk (build trên GitHub, không build trên server)

## Luồng

1. Push `main` → GitHub Actions: lint → typecheck → `npm run build`
2. Job **Deploy to Plesk (SFTP)** dùng `lftp mirror` upload `.next/` và `_next/` (tự `mkdir` remote).
3. Plesk Git pull chạy **chỉ** `deploy-plesk-fast.bat` (npm + prisma, **không** `npm run build`)

## Secrets GitHub (Settings → Secrets and variables → Actions)

| Secret | Ví dụ | Mô tả |
|--------|--------|--------|
| `PLESK_SFTP_HOST` | `giahomnay.site` | Host SFTP/SSH |
| `PLESK_SFTP_USER` | user FTP/SFTP Plesk | Username |
| `PLESK_SFTP_PASSWORD` | *** | Password |
| `PLESK_SFTP_PORT` | `22` | Port (mặc định 22 nếu bỏ trống) |
| `PLESK_SFTP_REMOTE_PATH` | `httpdocs` hoặc `.` | Thư mục app **sau khi đăng nhập SFTP** |

### `PLESK_SFTP_REMOTE_PATH` — hay sai chỗ này

Path phải là thư mục chứa `package.json` / `app.js` **nhìn từ phiên SFTP**, không phải đường dẫn Windows (`C:\…`).

| Tình huống | Giá trị secret |
|------------|----------------|
| Login SFTP vào home domain, app nằm trong `httpdocs` | `httpdocs` |
| Login SFTP đã chroot thẳng vào `httpdocs` | `.` |
| Subfolder app | `httpdocs/subdir` |

**Không** dùng `/httpdocs/.next`. Job sẽ tự `cd` vào path rồi upload `.next` + `_next`.

Nếu deploy log báo `cd` / `No such file`: sửa secret REMOTE_PATH theo bảng trên (thử `.` hoặc `httpdocs`).
## Plesk — Additional deployment actions

Đổi từ:

```bat
call scripts\deploy-plesk-git.bat
```

sang:

```bat
call scripts\deploy-plesk-fast.bat
```

`deploy-plesk-git.bat` vẫn giữ để build tay khẩn cấp trên server — **không** dùng cho auto production.

## Thứ tự / race

Plesk Git và GitHub Actions cùng chạy khi push. Nếu `fast` chạy **trước** khi SFTP xong, có thể báo thiếu `.next` — Redeploy Git một lần sau khi Actions **Deploy** xanh, hoặc tắt Additional actions đến khi upload xong lần đầu.

Khuyến nghị: đợi workflow Deploy thành công lần đầu, rồi mới bật `deploy-plesk-fast.bat`.

## Kiểm tra

- Actions: Check → Production build → Deploy to Plesk (SFTP) = xanh
- Server: tồn tại `.next\prerender-manifest.json` và `_next\static`
- Restart / touch `web.config` (script fast đã touch)

## Fallback build trên server

```bat
call scripts\deploy-plesk-git.bat
```
