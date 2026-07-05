export function errorMiddleware(err, req, res, next) {
  console.error(err);

  // Prisma known errors có field `code` riêng (ví dụ 'P2002', 'P2025'),
  // không có `statusCode` như AppError tự định nghĩa, nên cần check trước
  // để tránh rơi xuống nhánh 500 chung và lộ message kỹ thuật của DB ra client.
  if (err.code === 'P2002') {
    const fields = err.meta?.target?.join(', ') || 'dữ liệu';
    return res.status(409).json({
      success: false,
      message: `${fields} đã tồn tại, vui lòng chọn giá trị khác`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy dữ liệu cần thao tác',
    });
  }

  if (err.code === 'P2003') {
    return res.status(409).json({
      success: false,
      message: 'Không thể xóa dữ liệu vì đang được tham chiếu bởi dữ liệu khác',
    });
  }

  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (err.code && statusCode < 500) {
    payload.code = err.code;
  }

  res.status(statusCode).json(payload);
}