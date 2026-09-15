# Key Manager (Next.js + MongoDB)

Dashboard quản lý CPU KEY và endpoint xác thực license cho Auto Scene Alternator
(`ASE-...`), AutoVideo AI (`AVY-...`), Beautiful Reup (`BRP-...`) và
TH Elevenlab studio (`ELB-...`).

## API

- `POST /api/license/validate`: endpoint công khai cho desktop app; nhận
  `{ "key": "ASE-..." }`, `{ "key": "AVY-..." }` hoặc `{ "key": "BRP-..." }` và chỉ trả trạng thái
  của đúng key đó.
- `POST /api/license/elevenlab`: nhận `{ "key": "ELB-...", "nonce": "..." }`;
  chỉ trả token `application/jose` ký Ed25519 khi key đã được thêm trên dashboard
  và còn hạn. Token gắn mã máy, nonce và chỉ sống tối đa 5 phút.
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
TH_ELEVENLAB_LICENSE_PRIVATE_KEY_DER_B64=private-key-pkcs8-der-base64
```

`DASHBOARD_ADMIN_USERNAME` và `DASHBOARD_ADMIN_PASSWORD` có giá trị tương thích
cũ khi chưa cấu hình, nhưng bản deploy chính thức nên luôn đặt riêng trên
Vercel. `DASHBOARD_AUTH_SECRET` phải ổn định giữa các lần deploy để phiên đăng
nhập không bị mất bất ngờ.

Tạo cặp Ed25519 **một lần** bằng `npm.cmd run license:keypair` trên máy quản trị
(đã tạo trên workspace hiện tại). Lệnh lưu private key trong `.env.local` được
gitignore và chỉ in public key. Chỉ đặt `TH_ELEVENLAB_LICENSE_PRIVATE_KEY_DER_B64`
trong biến môi trường server/Vercel, không commit vào Git. Public key đã cố định
trong mã máy khách; máy khách cần URL HTTPS
`TH_ELEVENLAB_LICENSE_URL=https://<dashboard-domain>/api/license/elevenlab`.
Giữ nguyên private key qua các lần deploy; đổi key sẽ làm các bản máy khách cũ
không xác thực được.

## Chạy local

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

## Deploy Vercel

1. Cấu hình đầy đủ biến môi trường ở trên.
2. Push nhánh `main`; Vercel sẽ build và phát hành hai route
   `/api/license/validate` và `/api/license/elevenlab`.
3. Mở dashboard, đăng nhập, dán CPU KEY do desktop app hiển thị, nhập ngày hết
   hạn theo `dd/mm/yyyy`, rồi lưu.
