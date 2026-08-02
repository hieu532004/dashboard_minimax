# Key Manager (Next.js + MongoDB)

Dashboard quản lý CPU KEY và endpoint xác thực license cho Auto Scene Alternator.

## API

- `POST /api/license/validate`: endpoint công khai cho desktop app; nhận
  `{ "key": "ASE-..." }` và chỉ trả trạng thái của đúng key đó.
- `GET|POST|PUT|DELETE /api/keys`: API quản trị, bắt buộc có phiên đăng nhập
  HttpOnly hợp lệ.
- `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`: phiên quản trị
  được ký HMAC phía server.

CPU KEY không chứa serial phần cứng thô. Desktop app băm định danh máy một
chiều trước khi gửi tới endpoint xác thực.

## Biến môi trường

```text
MONGODB_URI=...
MONGODB_DB=minimax
MONGODB_COLLECTION=keys
DASHBOARD_ADMIN_USERNAME=admin
DASHBOARD_ADMIN_PASSWORD=mat-khau-rieng-du-dai
DASHBOARD_AUTH_SECRET=chuoi-ngau-nhien-it-nhat-32-byte
```

`DASHBOARD_ADMIN_USERNAME` và `DASHBOARD_ADMIN_PASSWORD` có giá trị tương thích
cũ khi chưa cấu hình, nhưng bản deploy chính thức nên luôn đặt riêng trên
Vercel. `DASHBOARD_AUTH_SECRET` phải ổn định giữa các lần deploy để phiên đăng
nhập không bị mất bất ngờ.

## Chạy local

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

## Deploy Vercel

1. Cấu hình đầy đủ biến môi trường ở trên.
2. Push nhánh `main`; Vercel sẽ build và phát hành route
   `/api/license/validate`.
3. Mở dashboard, đăng nhập, dán CPU KEY do desktop app hiển thị, nhập ngày hết
   hạn theo `dd/mm/yyyy`, rồi lưu.
