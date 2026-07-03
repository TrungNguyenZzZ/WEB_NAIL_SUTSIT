# API Mau Cho SUT SIT NAIL

Tai lieu nay dua tren cac route backend hien co trong du an.

## Base URL

```text
http://localhost:5000/api
```

Production:

```text
https://your-backend-domain.com/api
```

## Auth Header

Voi cac API can dang nhap, gui kem:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 1. Dich vu nail, mi

### GET `/services`

Lay danh sach dich vu.

Query mau:

```http
GET /api/services?page=1&limit=6&search=nail&category=nail-gel&sort=price-asc&featured=true
```

Response mau:

```json
{
  "items": [
    {
      "id": "svc_001",
      "name": "Nail gel co ban",
      "slug": "nail-gel-co-ban",
      "description": "Lam sach mong, cat da, son gel va tao do bong.",
      "shortDescription": "Nail gel nhanh gon cho di lam.",
      "price": 180000,
      "duration": 60,
      "imageUrl": "https://example.com/services/nail-gel.jpg",
      "status": "ACTIVE",
      "featured": true,
      "category": {
        "id": "cat_001",
        "name": "Nail"
      },
      "averageRating": 4.8,
      "reviewCount": 24
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/services/:id`

Lay chi tiet dich vu theo `id` hoac `slug`.

```http
GET /api/services/nail-gel-co-ban
```

### GET `/service-categories`

Lay danh muc dich vu.

```http
GET /api/service-categories
```

### POST `/admin/services`

Tao dich vu moi, can quyen admin.

```json
{
  "name": "Uon mi collagen",
  "description": "Uon mi tu nhien, giu nep va bo sung duong chat.",
  "shortDescription": "Mi cong tu nhien 4-6 tuan.",
  "procedure": "Tu van\nVe sinh mi\nUon mi\nDuong mi",
  "beforeCare": "Khong makeup mat qua dam",
  "afterCare": "Khong cham nuoc 6 tieng dau",
  "price": 250000,
  "duration": 75,
  "imageUrl": "https://example.com/services/uon-mi.jpg",
  "status": "ACTIVE",
  "featured": true,
  "categoryId": "cat_002"
}
```

## 2. San pham

### GET `/products`

```http
GET /api/products?page=1&limit=8&search=serum&category=duong-mi&sort=best-selling
```

Response mau:

```json
{
  "items": [
    {
      "id": "prd_001",
      "name": "Serum duong mi",
      "slug": "serum-duong-mi",
      "description": "Duong mi khoe, giam gay rung.",
      "benefits": "Duong am\nGiup mi chac hon",
      "usageInstructions": "Dung buoi toi sau khi lam sach",
      "price": 220000,
      "discountPrice": 189000,
      "stock": 15,
      "imageUrl": "https://example.com/products/serum-mi.jpg",
      "status": "ACTIVE",
      "featured": true,
      "category": {
        "id": "pcat_001",
        "name": "Cham soc mi"
      },
      "averageRating": 4.6,
      "reviewCount": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/products/:id`

```http
GET /api/products/serum-duong-mi
```

### GET `/product-categories`

```http
GET /api/product-categories
```

### POST `/admin/products`

```json
{
  "name": "Top coat bong guong",
  "description": "Lop phu giup mong ben mau va bong lau.",
  "benefits": "Ben mau\nTang do bong",
  "usageInstructions": "Son 1 lop mong sau cung",
  "price": 120000,
  "discountPrice": 99000,
  "stock": 30,
  "imageUrl": "https://example.com/products/top-coat.jpg",
  "status": "ACTIVE",
  "featured": false,
  "categoryId": "pcat_002"
}
```

## 3. Nhan vien

### GET `/staff`

```http
GET /api/staff?search=mi&serviceId=svc_002
```

Response mau:

```json
{
  "items": [
    {
      "id": "staff_001",
      "name": "Tran Ngoc Anh",
      "phone": "0909000111",
      "email": "anh@sutsitnail.vn",
      "avatarUrl": "https://example.com/staff/ngoc-anh.jpg",
      "specialties": "Noi mi, uon mi, cham soc mi",
      "workingDays": "Mon,Tue,Wed,Fri,Sat",
      "workingHours": "09:00-18:00",
      "status": "ACTIVE",
      "services": [
        {
          "service": {
            "id": "svc_002",
            "name": "Uon mi collagen"
          }
        }
      ]
    }
  ]
}
```

### GET `/staff/:id`

```http
GET /api/staff/staff_001
```

### POST `/admin/staff`

```json
{
  "name": "Le Bao Tram",
  "phone": "0909888777",
  "email": "tram@sutsitnail.vn",
  "description": "Ky thuat vien chuyen ve nail art va mi.",
  "specialties": "Nail art, uon mi",
  "workingDays": "Mon,Tue,Thu,Fri,Sat",
  "workingHours": "09:00-19:00",
  "avatarUrl": "https://example.com/staff/bao-tram.jpg",
  "status": "ACTIVE",
  "serviceIds": ["svc_001", "svc_002"]
}
```

## 4. Lich hen

### POST `/appointments`

Dat lich, can dang nhap.

```json
{
  "serviceIds": ["svc_001", "svc_002"],
  "staffId": "staff_001",
  "appointmentDate": "2026-07-10",
  "appointmentTime": "10:30",
  "customerName": "Nguyen Tai Trung",
  "customerPhone": "0909123456",
  "customerEmail": "nguyentaitrung26704@gmail.com",
  "note": "Muon lam tone hong sua",
  "paymentMethod": "SALON"
}
```

Response mau:

```json
{
  "message": "Appointment booked successfully.",
  "item": {
    "id": "apt_001",
    "code": "APT-20260710-001",
    "appointmentDate": "2026-07-10T00:00:00.000Z",
    "appointmentTime": "10:30",
    "totalPrice": 430000,
    "status": "PENDING",
    "paymentMethod": "SALON",
    "paymentStatus": "PENDING",
    "customerName": "Nguyen Tai Trung",
    "staff": {
      "id": "staff_001",
      "name": "Tran Ngoc Anh"
    },
    "items": [
      {
        "serviceId": "svc_001",
        "serviceName": "Nail gel co ban",
        "price": 180000,
        "duration": 60
      },
      {
        "serviceId": "svc_002",
        "serviceName": "Uon mi collagen",
        "price": 250000,
        "duration": 75
      }
    ]
  }
}
```

### GET `/appointments/my-appointments`

```http
GET /api/appointments/my-appointments
```

### GET `/appointments/:id`

```http
GET /api/appointments/apt_001
```

### PUT `/appointments/:id/cancel`

```http
PUT /api/appointments/apt_001/cancel
```

### GET `/admin/appointments`

```http
GET /api/admin/appointments?status=PENDING&date=2026-07-10&staffId=staff_001
```

### PUT `/admin/appointments/:id/status`

```json
{
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "staffId": "staff_001",
  "internalNote": "Khach hen den som 15 phut"
}
```

## 5. Don hang

### POST `/orders`

Tao don hang tu gio hang, can dang nhap.

```json
{
  "receiverName": "Nguyen Tai Trung",
  "receiverPhone": "0909123456",
  "receiverEmail": "nguyentaitrung26704@gmail.com",
  "receiverAddress": "123 Nguyen Trai, Quan 1, TP.HCM",
  "note": "Giao gio hanh chinh",
  "paymentMethod": "CASH_ON_DELIVERY",
  "discountCode": "SUMMER10"
}
```

Response mau:

```json
{
  "message": "Order placed successfully.",
  "item": {
    "id": "ord_001",
    "code": "ORD-20260710-001",
    "totalPrice": 308000,
    "discountAmount": 30000,
    "finalPrice": 278000,
    "paymentMethod": "CASH_ON_DELIVERY",
    "paymentStatus": "PENDING",
    "orderStatus": "PENDING",
    "receiverName": "Nguyen Tai Trung",
    "receiverPhone": "0909123456",
    "receiverEmail": "nguyentaitrung26704@gmail.com",
    "receiverAddress": "123 Nguyen Trai, Quan 1, TP.HCM",
    "items": [
      {
        "productId": "prd_001",
        "productName": "Serum duong mi",
        "quantity": 1,
        "price": 189000
      },
      {
        "productId": "prd_002",
        "productName": "Top coat bong guong",
        "quantity": 1,
        "price": 99000
      }
    ]
  }
}
```

### GET `/orders/my-orders`

```http
GET /api/orders/my-orders
```

### GET `/orders/:id`

```http
GET /api/orders/ord_001
```

### GET `/admin/orders`

```http
GET /api/admin/orders?orderStatus=PENDING&paymentStatus=PENDING&search=Nguyen
```

### PUT `/admin/orders/:id/status`

```json
{
  "orderStatus": "SHIPPING",
  "paymentStatus": "PAID"
}
```

## 6. Bo sung huu ich

### Gio hang

```http
GET /api/cart
POST /api/cart/add
PUT /api/cart/update/:itemId
DELETE /api/cart/remove/:itemId
DELETE /api/cart/clear
```

### Ma giam gia

```http
POST /api/discounts/apply
GET /api/admin/discounts
POST /api/admin/discounts
PUT /api/admin/discounts/:id
DELETE /api/admin/discounts/:id
```

## 7. Ghi chu

- API dang dung chung prefix `/api`.
- Cac API `/admin/*` can token cua tai khoan `ADMIN`.
- Cac API dat lich, gio hang, don hang can nguoi dung dang nhap.
- `:id` trong mot so route co the la `id` hoac `slug`, vi du `/services/:id`, `/products/:id`.
- Upload anh admin hien dang ho tro qua field `imageFile`.
