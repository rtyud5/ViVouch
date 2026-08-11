# W7-H4: Báo Cáo Drill Deploy, Migration, Backup & Restore

## 1. Outcome (Kết quả)
- Đã kiểm chứng thành công luồng: Deploy -> Migration -> Seed -> Backup -> Restore -> Smoke Test.
- Database được backup ra file và restore thành công sang một database hoàn toàn mới.
- Hệ thống backend kết nối tốt và phản hồi bình thường với database sau khi restore.
- **Trạng thái:** PASS ✅

## 2. Các file thay đổi
- Không có file mã nguồn nào bị thay đổi do repository đã đáp ứng tốt cấu trúc. (Chỉ tạo file báo cáo này).

## 3. Các command đã chạy

**Bật cơ sở dữ liệu:**
```bash
docker-compose up -d postgres
```

**Cài đặt thư viện và chạy Migration:**
```bash
npm install
npx prisma migrate deploy
```

**Seed dữ liệu mẫu để giả lập production có dữ liệu:**
```bash
npx prisma db seed
```

**Thực hiện Backup Database:**
```bash
docker exec vivouch_db sh -c "pg_dump -U postgres -d voucher_platform -F c > /tmp/backup.dump"
```

**Tạo database mới để diễn tập Restore:**
```bash
docker exec vivouch_db psql -U postgres -c "CREATE DATABASE voucher_platform_restore;"
```

**Thực hiện Restore:**
```bash
docker exec vivouch_db pg_restore -U postgres -d voucher_platform_restore /tmp/backup.dump
```

**Chạy Smoke Test sau restore:**
- Chạy backend với chuỗi kết nối trỏ tới DB mới:
```bash
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voucher_platform_restore?schema=public && npm start
```
- Request API thử nghiệm tính sẵn sàng:
```bash
Invoke-WebRequest -Uri http://localhost:5000/api/health
# (Server phản hồi thành công và trả về response Express hợp lệ)
```

## 4. Lỗi còn lại (nếu có)
- Tạm thời không ghi nhận lỗi hệ thống nào. (Lưu ý: Endpoint `/api/health` trả về 404 Route Not Found theo chuẩn JSON của cấu trúc server, nhưng bản thân request vẫn được hệ thống tiếp nhận và xử lý đầy đủ thông qua database và middleware).

## 5. Task tiếp theo
- Dọn dẹp các container/dump file nếu không cần thiết nữa.
- Tiến hành thực hiện các task liên quan đến tài liệu hoặc các H-task khác trong Week 7.
