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
| `PLESK_SFTP_PORT` | `21` | Port FileZilla (FTP/FTPS = 21; SFTP = 22) |
| `PLESK_SFTP_REMOTE_PATH` | `httpdocs` | Đúng như ảnh FileZilla |

CI lần lượt thử **FTPS → FTP → SFTP**. User/pass phải là FTP Access nhìn thấy `httpdocs` (không phải Windows RDP).
### Đúng user SFTP

Phải dùng **FTP/SFTP của domain trên Plesk** (FTP Access), **không** dùng tài khoản Windows RDP/`C:\Users\...`.

| Đúng | Sai |
|------|-----|
| Login thấy `httpdocs`, `web.config`, `package.json` | Login thấy `AppData`, `Documents`, `NTUSER.DAT` |
| `PLESK_SFTP_REMOTE_PATH` = `httpdocs` hoặc `.` | `C:/Users/...` hoặc path Windows |

Cách lấy user đúng: **Plesk → Websites & Domains → FTP Access** (user home = domain / httpdocs).

### `PLESK_SFTP_REMOTE_PATH`

| Tình huống | Giá trị secret |
|------------|----------------|
| Login FTP thấy thư mục `httpdocs` | `httpdocs` |
| Login FTP đã vào sẵn trong `httpdocs` | `.` |
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
