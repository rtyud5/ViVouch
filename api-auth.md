# API Documentation — Authentication

Base URL: `/api/auth`

---

## Mục lục

- [POST /register](#post-register)
- [POST /login](#post-login)
- [GET /me](#get-me)
- [POST /logout](#post-logout)
- [GET /admin-only](#get-admin-only)

---

## POST /register

Đăng ký tài khoản mới với vai trò mặc định là `CUSTOMER`.

**Authentication:** Không yêu cầu

### Request Body

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `email` | string | ✅ | Email hợp lệ, không được trùng |
| `password` | string | ✅ | Mật khẩu |
| `fullName` | string | ✅ | Họ và tên |
| `phone` | string | ❌ | Số điện thoại, không được trùng nếu cung cấp |

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "fullName": "Nguyen Van A",
  "phone": "0901234567"
}
```

### Response

**201 Created**

```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "id": "clx...",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Errors

| Status | Mô tả |
|--------|-------|
| `400` | Dữ liệu đầu vào không hợp lệ (ZodError) |
| `409` | Email hoặc số điện thoại đã tồn tại |

**400 Bad Request**
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

**409 Conflict**
```json
{
  "success": false,
  "message": "Email đã tồn tại trong hệ thống"
}
```

---

## POST /login

Đăng nhập và nhận JWT token.

**Authentication:** Không yêu cầu

### Request Body

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `email` | string | ✅ | Email đã đăng ký |
| `password` | string | ✅ | Mật khẩu |

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    }
  }
}
```

### Errors

| Status | Mô tả |
|--------|-------|
| `400` | Dữ liệu đầu vào không hợp lệ |
| `401` | Sai email hoặc mật khẩu |
| `403` | Tài khoản bị khóa |

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Sai email hoặc mật khẩu"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Tài khoản của bạn đã bị khóa"
}
```

---

## GET /me

Lấy thông tin tài khoản đang đăng nhập.

**Authentication:** ✅ Yêu cầu Bearer Token

### Headers

```
Authorization: Bearer <accessToken>
```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": "clx...",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Errors

| Status | Mô tả |
|--------|-------|
| `401` | Token không hợp lệ hoặc hết hạn |
| `404` | Không tìm thấy người dùng |

---

## POST /logout

Đăng xuất. Vì sử dụng JWT stateless, server chỉ xác nhận đăng xuất — client có trách nhiệm xóa token khỏi bộ nhớ.

**Authentication:** Không yêu cầu

### Response

**200 OK**

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## GET /admin-only

Route kiểm tra Role Guard — chỉ dành cho `ADMIN`.

**Authentication:** ✅ Yêu cầu Bearer Token

**Authorization:** ✅ Yêu cầu role `ADMIN`

### Headers

```
Authorization: Bearer <accessToken>
```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "Welcome Admin"
}
```

### Errors

| Status | Mô tả |
|--------|-------|
| `401` | Chưa xác thực |
| `403` | Không có quyền truy cập (không phải ADMIN) |

**403 Forbidden**
```json
{
  "success": false,
  "message": "Không có quyền truy cập"
}
```

---

## Ghi chú chung

### Roles trong hệ thống

| Role | Mô tả |
|------|-------|
| `CUSTOMER` | Khách hàng — role mặc định khi đăng ký |
| `PARTNER` | Đối tác |
| `ADMIN` | Quản trị viên |

### Cấu trúc lỗi chuẩn

```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

### Sử dụng Access Token

Đính kèm `accessToken` vào header của mọi request cần xác thực:

```
Authorization: Bearer <accessToken>
```
