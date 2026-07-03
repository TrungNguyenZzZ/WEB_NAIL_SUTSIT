# Blush Bloom Platform

Blush Bloom la mot du an full-stack cho salon lam dep chuyen ve nail, mi va ban san pham cham soc sac dep.

Project gom:

- `frontend/`: React + Vite + Tailwind CSS + Framer Motion
- `backend/`: Node.js + Express + Prisma + JWT

Ung dung ho tro:

- Xem danh sach va chi tiet dich vu nail, mi, cham soc mong, combo
- Dat lich hen theo ngay, gio, ky thuat vien
- Xem san pham va mua hang qua gio hang + checkout
- Dang ky, dang nhap, luu JWT va theo doi lich hen/don hang
- Trang quan tri voi dashboard, CRUD dich vu, san pham, nhan vien, danh muc, don hang, lich hen, khach hang va ma giam gia

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, Framer Motion, Axios, React Hook Form, Zod, Zustand, Lucide React
- Backend: Express, Prisma ORM, bcryptjs, JWT, Multer, Cloudinary (tuy chon), Zod
- Database local dev mac dinh: SQLite

## Cau truc thu muc

```text
.
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- layouts/
|  |  |- pages/
|  |  |- routes/
|  |  |- services/
|  |  |- hooks/
|  |  |- store/
|  |  \- utils/
|  |- index.html
|  \- package.json
|- backend/
|  |- prisma/
|  |  |- schema.prisma
|  |  \- seed.js
|  |- src/
|  |  |- config/
|  |  |- controllers/
|  |  |- middlewares/
|  |  |- routes/
|  |  |- services/
|  |  \- utils/
|  |- uploads/
|  |- .env
|  |- .env.example
|  \- package.json
|- package.json
\- README.md
```

## Yeu cau moi truong

- Node.js 18+

Mac dinh project da duoc cau hinh de chay local nhanh voi SQLite, nen ban khong can cai PostgreSQL de demo web.

## Cai dat va chay

1. Cai dependencies o thu muc goc:

```bash
npm install
```

2. Backend `.env` da duoc tao san cho local dev. Gia tri chinh:

```env
DATABASE_URL="file:../dev.db"
JWT_SECRET="blush-bloom-local-dev-secret"
CORS_ORIGIN="http://localhost:5173"
```

3. Chay migrate trong thu muc `backend/`:

```bash
npx prisma migrate dev --name init
```

4. Seed du lieu mau trong thu muc `backend/`:

```bash
npx prisma db seed
```

5. Chay ung dung o thu muc goc:

```bash
npm run dev
```

Frontend mac dinh chay o `http://localhost:5173`, backend o `http://localhost:5000`.

## Tai khoan seed mau

- Admin:
  - `admin@blushbloom.vn`
  - `Admin@123`
- User mau:
  - `an@example.com`
  - `User@123`

## Script chinh

Chay o thu muc goc:

```bash
npm run dev
npm run migrate
npm run seed
npm run build:pages
npm run build
```

Chay o thu muc `backend/`:

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Tinh nang chinh

### Khach hang

- Trang chu hien dai, co section dich vu, san pham, combo, testimonial
- Danh sach dich vu co tim kiem, loc danh muc, sap xep
- Trang chi tiet dich vu voi quy trinh, luu y va nhan vien phu hop
- Dat lich hen, luu du lieu vao database
- Danh sach san pham, gio hang, checkout, ap ma giam gia
- Trang tai khoan xem lich su lich hen va don hang

### Admin

- Dashboard thong ke doanh thu, lich hen, top dich vu, top san pham
- Quan ly danh muc dich vu va danh muc san pham
- CRUD dich vu va san pham
- Quan ly ky thuat vien va dich vu phu trach
- Quan ly trang thai lich hen
- Quan ly trang thai don hang va thanh toan
- Quan ly khach hang va phan quyen
- Quan ly ma giam gia

## API tieu bieu

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/services`
- `GET /api/products`
- `POST /api/appointments`
- `GET /api/cart`
- `POST /api/orders`
- `GET /api/admin/dashboard/statistics`

## Ghi chu trien khai

- Backend ho tro upload anh local va co the chuyen sang Cloudinary neu cau hinh bien moi truong.
- Frontend da duoc chuyen sang `HashRouter` de deploy len GitHub Pages an toan, nen URL production se co dang `/#/services`, `/#/products`, ...
- Frontend co the nhan `VITE_API_BASE_URL` de goi mot backend rieng khi build production.
- Neu backend va frontend nam o 2 domain khac nhau, `CORS_ORIGIN` da ho tro nhieu origin phan tach boi dau phay.
- Prisma schema da bao gom users, services, appointments, products, carts, orders, discounts, reviews va cac bang lien ket lien quan.
- Seed tao san du lieu demo cho admin, khach hang, dich vu, san pham, nhan vien, lich hen, don hang va khuyen mai.
- De local dev chay nhanh, database mac dinh dung SQLite. Neu muon quay lai PostgreSQL cho production, ban co the doi lai `provider` trong `schema.prisma` va `DATABASE_URL`.

## Deploy frontend len GitHub Pages

GitHub Pages chi host duoc phan frontend tinh, vi vay backend can duoc deploy o mot noi khac (vi du Render, Railway, Fly.io, VPS, ...).

1. Deploy backend truoc va dam bao API production truy cap duoc qua mot URL nhu `https://your-backend-domain.com/api`.

2. Cau hinh backend:

```env
CORS_ORIGIN="http://localhost:5173,https://yourusername.github.io"
```

Neu ban dung custom domain cho GitHub Pages, hay thay `https://yourusername.github.io` bang origin that su cua frontend.

3. Trong GitHub repository, tao repository variable ten `VITE_API_BASE_URL` voi gia tri:

```text
https://your-backend-domain.com/api
```

4. Vao `Settings -> Pages`, chon `Source: GitHub Actions`.

5. Push code len branch `main` hoac `master`. Workflow tai `.github/workflows/deploy-gh-pages.yml` se tu dong build `frontend/dist` va deploy len GitHub Pages.

Neu branch chinh cua ban khong phai `main` hoac `master`, hay sua lai workflow cho dung ten branch.

## Han che hien tai

- Chua tich hop cong thanh toan that nhu VNPay/MoMo, nhung da chuan bi san enum va flow de mo rong.
- Chua co test runner hoac pipeline test tu dong.
- Minh khong the tu verify bang `npm install`, `npm run build:pages` hay `npm run dev` trong moi truong hien tai vi may hien tai khong co `node`/`npm`, nen buoc runtime can duoc ban chay tren may sau khi da cai Node.js.
