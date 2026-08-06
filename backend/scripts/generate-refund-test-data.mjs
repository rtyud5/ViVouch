import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { buyNow } from '../src/modules/orders/orders.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang tạo dữ liệu test...');
  
  // Lấy customer1
  const user = await prisma.user.findUnique({ where: { email: 'customer1@test.com' } });
  if (!user) {
    console.log('Không tìm thấy customer1@test.com, hãy chạy lệnh seed trước.');
    return;
  }

  // Lấy một voucher có cho phép hoàn tiền (hdl_1 hoặc hdl_2)
  const voucher = await prisma.voucher.findFirst({
    where: { status: 'ON_SALE', allowRefund: true }
  });

  if (!voucher) {
    console.log('Không tìm thấy voucher nào được phép hoàn tiền.');
    return;
  }

  // Nạp ví nếu cần
  let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < voucher.salePrice) {
    await prisma.wallet.update({
      where: { userId: user.id },
      data: { balance: 10000000 }
    });
  }

  // Mua một đơn hàng mới
  const orderData = await buyNow(user.id, [{ id: voucher.id, qty: 1 }], { paymentMethod: 'VIVOUCH_WALLET' });
  
  // Tạo token
  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: '1d' });

  console.log('\n======================================================');
  console.log('DỮ LIỆU ĐỂ BẠN TEST THỦ CÔNG API HOÀN TIỀN');
  console.log('======================================================\n');
  console.log('URL: POST http://localhost:3000/api/customer/refunds');
  console.log('\nHeaders:');
  console.log(`Authorization: Bearer ${token}`);
  console.log('Content-Type: application/json');
  console.log('\nBody (JSON):');
  console.log(JSON.stringify({
    orderId: orderData.orderId,
    reason: "Tôi muốn test thử chức năng concurrency"
  }, null, 2));
  console.log('\n======================================================');
  console.log('HƯỚNG DẪN TEST ĐỒNG THỜI (CONCURRENCY):');
  console.log('1. Bật server bằng lệnh: npm run dev');
  console.log('2. Mở 2 terminal khác nhau và chuẩn bị sẵn 2 lệnh cURL dưới đây (chưa bấm Enter).');
  console.log('3. Bấm Enter gần như cùng lúc trên cả 2 terminal.');
  console.log('\nLệnh cURL:');
  console.log(`curl -X POST http://localhost:3000/api/customer/refunds \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d "{\\"orderId\\": \\"${orderData.orderId}\\", \\"reason\\": \\"Test concurrency\\"}"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
