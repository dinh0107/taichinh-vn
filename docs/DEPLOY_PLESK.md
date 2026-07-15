# Deploy Plesk (build trên GitHub, không build trên server)

## Luồng

1. Push `main` → GitHub Actions: lint → typecheck → `npm run build`
2. Job **Deploy** đóng gói `deploy-build.tar.gz` (`.next` + `_next`) và SFTP **một file** lên app root
3. Plesk chạy `deploy-plesk-fast.bat` → giải nén tar → prisma → restart (**không** `npm run build`)

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

**Không** dùng `/httpdocs/.next`. Job chỉ upload `deploy-build.tar.gz` vào REMOTE.

Nếu Deploy fail ở bước `cd`: sửa REMOTE_PATH (thử `.` rồi `httpdocs`). Xem log có dòng `pwd` / `cls`.

## Plesk — Additional deployment actions

```bat
call scripts\deploy-plesk-fast.bat
```

Thứ tự: chờ Actions **Deploy** xanh (có `deploy-build.tar.gz` trên server) → rồi Redeploy Git / chạy fast một lần để giải nén.

`deploy-plesk-git.bat` chỉ dùng khi cần build tay khẩn cấp trên server.

## Kiểm tra

- Actions: Check → Production build → Deploy = xanh
- Server: có `deploy-build.tar.gz` rồi sau fast có `.next\prerender-manifest.json` và `_next\static`
- App restart (script fast touch `web.config`)

## Fallback build trên server

```bat
call scripts\deploy-plesk-git.bat
```
