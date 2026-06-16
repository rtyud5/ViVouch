import { PrismaClient } from '@prisma/client';
import { buyNow } from './src/modules/orders/orders.service.js';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const generateVoucherCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

async function runTests() {
  console.log("Bắt đầu chạy test...");

  // Test 1: Kiểm tra unique code 100 lần
  console.log("\n--- Test 1: Generate 100000 unique codes ---");
  const codes = new Set();
  let hasDuplicate = false;
  for (let i = 0; i < 100000; i++) {
    const code = `VC-2026-${generateVoucherCode()}`;
    if (codes.has(code)) {
      hasDuplicate = true;
      console.error(`Phát hiện trùng lặp: ${code}`);
      break;
    }
    codes.add(code);
  }
  if (!hasDuplicate) {
    console.log("Thành công: 100000 codes đều unique.");
  } else {
    console.error("Thất bại: Có code bị trùng.");
  }

  // Test 2: 2 request đồng thời cùng mua 1 voucher còn 1
  console.log("\n--- Test 2: Concurrent requests (Race condition) ---");

  // Tạo data giả
  const user = await prisma.user.create({
    data: {
      email: `test_customer_${Date.now()}@test.com`,
      passwordHash: 'hashedpassword',
      fullName: 'Test Customer',
      role: 'CUSTOMER'
    }
  });

  const partnerUser = await prisma.user.create({
    data: {
      email: `test_partner_${Date.now()}@test.com`,
      passwordHash: 'hashedpassword',
      fullName: 'Test Partner',
      role: 'PARTNER'
    }
  });

  const partner = await prisma.partner.create({
    data: {
      userId: partnerUser.id,
      businessName: 'Test Business',
      taxCode: `TAX-${Date.now()}`,
      representativeName: 'Rep',
      status: 'APPROVED'
    }
  });

  const category = await prisma.category.create({
    data: {
      name: `Category-${Date.now()}`,
      slug: `slug-${Date.now()}`
    }
  });

  const voucher = await prisma.voucher.create({
    data: {
      partnerId: partner.id,
      categoryId: category.id,
      title: `Voucher Test Giga ${Date.now()}`,
      originalPrice: 100000,
      salePrice: 50000,
      totalQty: 1, // CHỈ CÒN 1 VOUCHER
      soldQty: 0,
      status: 'ON_SALE',
      useEnd: new Date(Date.now() + 86400000)
    }
  });

  console.log(`Đã tạo voucher ID: ${voucher.id} với totalQty=1, soldQty=0`);

  // Thực hiện 2 request đồng thời
  const items = [{ id: voucher.id, qty: 1 }];
  console.log("Đang gọi 2 request buyNow đồng thời...");

  const results = await Promise.allSettled([
    buyNow(user.id, items),
    buyNow(user.id, items)
  ]);

  let successCount = 0;
  let failCount = 0;
  let failReason = null;

  results.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      console.log(`Request ${index + 1}: THÀNH CÔNG (Order ID: ${res.value.orderId})`);
      successCount++;
    } else {
      console.log(`Request ${index + 1}: THẤT BẠI (Lý do: ${res.reason.message})`);
      failCount++;
      failReason = res.reason.message;
    }
  });

  if (successCount === 1 && failCount === 1 && failReason.includes('INSUFFICIENT_STOCK')) {
    console.log("Thành công: Row-level lock hoạt động chính xác. Chỉ 1 request mua được.");
  } else {
    console.error("Thất bại: Kết quả concurrent request không như mong đợi.");
  }

  // Lấy dữ liệu DB check lại
  const checkVoucher = await prisma.voucher.findUnique({ where: { id: voucher.id } });
  console.log(`Kiểm tra DB -> Voucher soldQty: ${checkVoucher.soldQty} (Kỳ vọng: 1)`);

  await prisma.$disconnect();
}

runTests().catch(e => {
  console.error("Lỗi:", e);
  prisma.$disconnect();
});
