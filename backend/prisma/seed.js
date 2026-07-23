import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding process started...')

  // 1. Guard safety check
  if (process.env.NODE_ENV === 'production') {
    console.error('Safety guard: Cannot run seed script in production environment.')
    process.exit(1)
  }

  // 2. Wipe database tables in order
  console.log('Wiping existing data...')

  await prisma.paymentWebhook.deleteMany()
  await prisma.emailDelivery.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.refundRequest.deleteMany()
  await prisma.walletTransaction.deleteMany()
  await prisma.emailOtp.deleteMany()

  console.log('Clearing VoucherUsageLog...')
  await prisma.voucherUsageLog.deleteMany()

  console.log('Clearing Review...')
  await prisma.review.deleteMany()

  console.log('Clearing VoucherCode...')
  await prisma.voucherCode.deleteMany()

  console.log('Clearing Payment...')
  await prisma.payment.deleteMany()

  console.log('Clearing OrderItem...')
  await prisma.orderItem.deleteMany()

  console.log('Clearing Order...')
  await prisma.order.deleteMany()

  console.log('Clearing CartItem...')
  await prisma.cartItem.deleteMany()

  console.log('Clearing Cart...')
  await prisma.cart.deleteMany()

  console.log('Clearing VoucherBranch...')
  await prisma.voucherBranch.deleteMany()

  console.log('Clearing Voucher...')
  await prisma.voucher.deleteMany()

  console.log('Clearing PartnerMember...')
  await prisma.partnerMember.deleteMany()

  console.log('Clearing Branch...')
  await prisma.branch.deleteMany()

  console.log('Clearing Partner...')
  await prisma.partner.deleteMany()

  console.log('Clearing RefreshToken...')
  await prisma.refreshToken.deleteMany()

  console.log('Clearing AuditLog...')
  await prisma.auditLog.deleteMany()

  console.log('Clearing Wallet...')
  await prisma.wallet.deleteMany()

  console.log('Clearing User...')
  await prisma.user.deleteMany()

  console.log('Clearing Category...')
  await prisma.category.deleteMany()

  console.log('Database wiped successfully.')

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'am-thuc' },    update: {}, create: { name: 'Ẩm thực',   slug: 'am-thuc',   icon: '🍜' } }),
    prisma.category.upsert({ where: { slug: 'lam-dep' },    update: {}, create: { name: 'Làm đẹp',   slug: 'lam-dep',   icon: '💆' } }),
    prisma.category.upsert({ where: { slug: 'du-lich' },    update: {}, create: { name: 'Du lịch',   slug: 'du-lich',   icon: '✈️' } }),
    prisma.category.upsert({ where: { slug: 'mua-sam' },    update: {}, create: { name: 'Mua sắm',   slug: 'mua-sam',   icon: '🛍️' } }),
    prisma.category.upsert({ where: { slug: 'giai-tri' },   update: {}, create: { name: 'Giải trí',  slug: 'giai-tri',  icon: '🎮' } }),
  ])
  console.log('Categories seeded:', categories.length)

  // ── Users ────────────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hash(pw, 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vivouch.com' }, update: {},
    create: { email: 'admin@vivouch.com', fullName: 'Admin ViVouch', passwordHash: await hash('Admin@123'), role: 'ADMIN' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })

  const haiDiLaoUser = await prisma.user.upsert({
    where: { email: 'haidilao@vivouch.com' }, update: {},
    create: { email: 'haidilao@vivouch.com', fullName: 'Haidilao Vietnam', passwordHash: await hash('Partner@123'), role: 'PARTNER' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })
  const zenSpaUser = await prisma.user.upsert({
    where: { email: 'zenspa@vivouch.com' }, update: {},
    create: { email: 'zenspa@vivouch.com', fullName: 'Zen Spa & Wellness', passwordHash: await hash('Partner@123'), role: 'PARTNER' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })
  const goTravelUser = await prisma.user.upsert({
    where: { email: 'gotravel@vivouch.com' }, update: {},
    create: { email: 'gotravel@vivouch.com', fullName: 'GoTravel', passwordHash: await hash('Partner@123'), role: 'PARTNER' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })
  const pendingUser = await prisma.user.upsert({
    where: { email: 'biendong@vivouch.com' }, update: {},
    create: { email: 'biendong@vivouch.com', fullName: 'Nhà hàng Biển Đông', passwordHash: await hash('Partner@123'), role: 'PARTNER' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@test.com' }, update: {},
    create: { email: 'customer1@test.com', fullName: 'Nguyễn Văn A', phone: '0901000001', passwordHash: await hash('Test@123'), role: 'CUSTOMER' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })
  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@test.com' }, update: {},
    create: { email: 'customer2@test.com', fullName: 'Trần Thị B', phone: '0901000002', passwordHash: await hash('Test@123'), role: 'CUSTOMER' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })
  const customer3 = await prisma.user.upsert({
    where: { email: 'customer3@test.com' }, update: {},
    create: { email: 'customer3@test.com', fullName: 'Lê Văn C', phone: '0901000003', passwordHash: await hash('Test@123'), role: 'CUSTOMER' , status: 'ACTIVE', emailVerifiedAt: new Date() }
  })
  console.log('Users seeded: 8')

  // ── Partners ─────────────────────────────────────────────────────────────
  const haiDiLao = await prisma.partner.upsert({
    where: { taxCode: '0123456789' }, update: {},
    create: { userId: haiDiLaoUser.id, businessName: 'Haidilao Vietnam', taxCode: '0123456789', representativeName: 'Nguyễn Minh Tuấn', status: 'APPROVED' }
  })
  const zenSpa = await prisma.partner.upsert({
    where: { taxCode: '0234567890' }, update: {},
    create: { userId: zenSpaUser.id, businessName: 'Zen Spa & Wellness', taxCode: '0234567890', representativeName: 'Trần Thị Lan', status: 'APPROVED' }
  })
  const goTravel = await prisma.partner.upsert({
    where: { taxCode: '0345678901' }, update: {},
    create: { userId: goTravelUser.id, businessName: 'GoTravel', taxCode: '0345678901', representativeName: 'Phạm Quốc Hùng', status: 'APPROVED' }
  })
  await prisma.partner.upsert({
    where: { taxCode: '0456789012' }, update: {},
    create: { userId: pendingUser.id, businessName: 'Nhà hàng Biển Đông', taxCode: '0456789012', representativeName: 'Lê Thị Mai', status: 'PENDING' }
  })
  console.log('Partners seeded: 4')

  for (const [partner, owner] of [[haiDiLao, haiDiLaoUser], [zenSpa, zenSpaUser], [goTravel, goTravelUser]]) {
    await prisma.partnerMember.create({
      data: { partnerId: partner.id, userId: owner.id, role: 'OWNER', status: 'ACTIVE' }
    })
  }
  const pendingPartner = await prisma.partner.findUnique({ where: { taxCode: '0456789012' } })
  await prisma.partnerMember.create({
    data: { partnerId: pendingPartner.id, userId: pendingUser.id, role: 'OWNER', status: 'ACTIVE' }
  })

  for (const customer of [customer1, customer2, customer3]) {
    await prisma.wallet.create({ data: { userId: customer.id, balance: 1000000 } })
  }
  console.log('Partner memberships and demo wallets seeded')

  // ── Branches ──────────────────────────────────────────────────────────────
  const hdl_q1 = await prisma.branch.upsert({
    where: { partnerId_name: { partnerId: haiDiLao.id, name: 'Haidilao Quận 1' } }, update: {},
    create: { partnerId: haiDiLao.id, name: 'Haidilao Quận 1', address: '11 Tôn Đức Thắng, Q.1' }
  })
  const hdl_q7 = await prisma.branch.upsert({
    where: { partnerId_name: { partnerId: haiDiLao.id, name: 'Haidilao Quận 7' } }, update: {},
    create: { partnerId: haiDiLao.id, name: 'Haidilao Quận 7', address: 'Crescent Mall, Q.7' }
  })
  const zen_q3 = await prisma.branch.upsert({
    where: { partnerId_name: { partnerId: zenSpa.id, name: 'Zen Spa Quận 3' } }, update: {},
    create: { partnerId: zenSpa.id, name: 'Zen Spa Quận 3', address: '28 Võ Văn Tần, Q.3' }
  })
  const zen_q10 = await prisma.branch.upsert({
    where: { partnerId_name: { partnerId: zenSpa.id, name: 'Zen Spa Quận 10' } }, update: {},
    create: { partnerId: zenSpa.id, name: 'Zen Spa Quận 10', address: '152 Lý Thường Kiệt, Q.10' }
  })
  const gt_hcm = await prisma.branch.upsert({
    where: { partnerId_name: { partnerId: goTravel.id, name: 'GoTravel HCMC' } }, update: {},
    create: { partnerId: goTravel.id, name: 'GoTravel HCMC', address: '45 Lê Lợi, Q.1' }
  })
  console.log('Branches seeded: 5')

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff.haidilao@vivouch.com',
      fullName: 'Nhân viên Haidilao Q1',
      passwordHash: await hash('Staff@123'),
      role: 'PARTNER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    }
  })
  await prisma.partnerMember.create({
    data: { partnerId: haiDiLao.id, userId: staffUser.id, branchId: hdl_q1.id, role: 'STAFF', status: 'ACTIVE' }
  })
  console.log('Branch staff seeded')

  // ── Vouchers ──────────────────────────────────────────────────────────────
  const now = new Date()
  const future = (days) => new Date(now.getTime() + days * 86400000)
  const past = (days) => new Date(now.getTime() - days * 86400000)

  const vDataRaw = [
    // Haidilao
    { partnerId: haiDiLao.id, categoryId: categories[0].id, key: 'hdl_1',
      title: 'Buffet Lẩu 2 người — Haidilao', originalPrice: 325000, salePrice: 179000,
      totalQty: 200, soldQty: 142, status: 'ON_SALE',
      description: 'Trải nghiệm buffet lẩu cao cấp cho 2 người tại Haidilao.',
      conditions: 'Áp dụng cho menu buffet 325k. Đặt bàn trước qua hotline.', allowRefund: true, refundWindowHours: 24,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
    { partnerId: haiDiLao.id, categoryId: categories[0].id, key: 'hdl_2',
      title: 'Set lẩu 1 người — Haidilao', originalPrice: 180000, salePrice: 120000,
      totalQty: 150, soldQty: 89, status: 'ON_SALE',
      description: 'Set lẩu cá nhân đầy đủ topping cho 1 người.',
      conditions: 'Áp dụng các ngày trong tuần. Không áp dụng cuối tuần.', allowRefund: true, refundWindowHours: 24,
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400' },
    // Expired Haidilao Voucher
    { partnerId: haiDiLao.id, categoryId: categories[0].id, key: 'hdl_expired',
      title: 'Buffet Lẩu cuối tuần — Haidilao (Hết hạn)', originalPrice: 350000, salePrice: 220000,
      totalQty: 100, soldQty: 25, status: 'EXPIRED',
      description: 'Gói buffet lẩu cuối tuần đã hết hạn.',
      conditions: 'Không còn thời hạn sử dụng.',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
    // Zen Spa
    { partnerId: zenSpa.id, categoryId: categories[1].id, key: 'zen_1',
      title: 'Massage thư giãn 90 phút — Zen Spa', originalPrice: 450000, salePrice: 249000,
      totalQty: 100, soldQty: 67, status: 'ON_SALE',
      description: 'Gói massage body toàn thân với tinh dầu thảo mộc 90 phút.',
      conditions: 'Đặt lịch trước 24h. Không hoàn tiền sau khi đặt.',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
    { partnerId: zenSpa.id, categoryId: categories[1].id, key: 'zen_2',
      title: 'Gói chăm sóc da mặt — Zen Spa', originalPrice: 350000, salePrice: 199000,
      totalQty: 80, soldQty: 34, status: 'ON_SALE',
      description: 'Chăm sóc da mặt chuyên sâu với công nghệ Hàn Quốc 60 phút.',
      conditions: 'Áp dụng cho khách hàng mới. Mỗi khách tối đa 2 voucher.',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
    // GoTravel
    { partnerId: goTravel.id, categoryId: categories[2].id, key: 'gt_1',
      title: 'Tour Đà Lạt 3N2Đ — GoTravel', originalPrice: 1700000, salePrice: 1190000,
      totalQty: 50, soldQty: 12, status: 'ON_SALE',
      description: 'Tour Đà Lạt trọn gói 3 ngày 2 đêm, bao gồm xe + khách sạn + ăn sáng.',
      conditions: 'Khởi hành thứ 6 hàng tuần. Đặt trước 7 ngày.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { partnerId: goTravel.id, categoryId: categories[2].id, key: 'gt_2',
      title: 'Tour Phú Quốc 4N3Đ — GoTravel', originalPrice: 3200000, salePrice: 2490000,
      totalQty: 30, soldQty: 8, status: 'ON_SALE',
      description: 'Tour Phú Quốc 4 ngày 3 đêm, resort 4 sao, bao gồm vé máy bay.',
      conditions: 'Áp dụng cho đoàn tối thiểu 2 người. Không áp dụng lễ Tết.',
      imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400' },
    // Pending approval
    { partnerId: haiDiLao.id, categoryId: categories[0].id, key: 'hdl_pending',
      title: 'Combo BBQ 3 người — Haidilao', originalPrice: 480000, salePrice: 320000,
      totalQty: 100, soldQty: 0, status: 'PENDING_APPROVAL',
      description: 'Combo BBQ đặc biệt cho 3 người.',
      conditions: 'Áp dụng tất cả chi nhánh.',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76538775a8e?w=400' },
  ]

  const v = {}
  for (const raw of vDataRaw) {
    const { key, ...data } = raw
    v[key] = await prisma.voucher.upsert({
      where: { partnerId_title: { partnerId: data.partnerId, title: data.title } },
      update: {},
      create: {
        ...data,
        saleStart: data.status === 'EXPIRED' ? past(40) : now,
        saleEnd: data.status === 'EXPIRED' ? past(10) : future(60),
        useStart: data.status === 'EXPIRED' ? past(40) : now,
        useEnd: data.status === 'EXPIRED' ? past(1) : future(90),
      }
    })
  }
  console.log('Vouchers seeded:', Object.keys(v).length)

  // ── VoucherBranches ───────────────────────────────────────────────────────
  const vbData = [
    { voucherId: v.hdl_1.id, branchId: hdl_q1.id },
    { voucherId: v.hdl_1.id, branchId: hdl_q7.id },
    { voucherId: v.hdl_2.id, branchId: hdl_q1.id },
    { voucherId: v.hdl_2.id, branchId: hdl_q7.id },
    { voucherId: v.hdl_expired.id, branchId: hdl_q1.id },
    { voucherId: v.hdl_pending.id, branchId: hdl_q1.id },
    { voucherId: v.zen_1.id, branchId: zen_q3.id },
    { voucherId: v.zen_1.id, branchId: zen_q10.id },
    { voucherId: v.zen_2.id, branchId: zen_q3.id },
    { voucherId: v.gt_1.id,  branchId: gt_hcm.id },
    { voucherId: v.gt_2.id,  branchId: gt_hcm.id },
  ]
  for (const vb of vbData) {
    await prisma.voucherBranch.upsert({
      where: { voucherId_branchId: vb }, update: {}, create: vb
    })
  }
  console.log('VoucherBranches seeded:', vbData.length)

  // ── Carts ────────────────────────────────────────────────────────────────
  const cart1 = await prisma.cart.upsert({
    where: { userId: customer1.id }, update: {}, create: { userId: customer1.id }
  })
  const cart2 = await prisma.cart.upsert({
    where: { userId: customer2.id }, update: {}, create: { userId: customer2.id }
  })

  const cartItemsData = [
    { cartId: cart1.id, voucherId: v.hdl_1.id, qty: 2 },
    { cartId: cart1.id, voucherId: v.zen_1.id, qty: 1 },
    { cartId: cart2.id, voucherId: v.gt_1.id, qty: 1 },
  ]
  for (const item of cartItemsData) {
    await prisma.cartItem.upsert({
      where: { cartId_voucherId: { cartId: item.cartId, voucherId: item.voucherId } },
      update: { qty: item.qty }, create: item
    })
  }
  console.log('Carts seeded')

  // ── Orders + VoucherCodes + Reviews ───────────────────────────────────────
  const { nanoid } = await import('nanoid')
  const customers = [customer1, customer2, customer3]
  const onSaleVouchers = [v.hdl_1, v.hdl_2, v.zen_1, v.zen_2, v.gt_1]

  for (let i = 0; i < 15; i++) {
    const customer = customers[i % 3]
    const voucher = onSaleVouchers[i % onSaleVouchers.length]

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        status: 'COMPLETED',
        totalAmount: voucher.salePrice,
        items: { create: { voucherId: voucher.id, qty: 1, unitPrice: voucher.salePrice } },
        payment: { create: { method: 'VIVOUCH_WALLET', status: 'PAID', amount: voucher.salePrice } },
      }
    })

    const codeStatus = i < 8 ? 'USED' : 'ISSUED'
    const vc = await prisma.voucherCode.create({
      data: {
        code: `VC-2026-${nanoid(10).toUpperCase()}`,
        orderId: order.id,
        voucherId: voucher.id,
        ownerId: customer.id,
        status: codeStatus,
        expiresAt: future(90),
        usedAt: codeStatus === 'USED' ? new Date() : null,
      }
    })

    if (codeStatus === 'USED') {
      const branchMap = {
        [v.hdl_1.id]: hdl_q1.id, [v.hdl_2.id]: hdl_q1.id,
        [v.zen_1.id]: zen_q3.id, [v.zen_2.id]: zen_q3.id,
        [v.gt_1.id]:  gt_hcm.id,
      }
      await prisma.voucherUsageLog.create({
        data: { voucherCodeId: vc.id, redeemedBy: customer.id, branchId: branchMap[voucher.id] }
      })
    }
  }

  // Edge cases for testing Redeem API
  const edgeOrder = await prisma.order.create({
    data: {
      userId: customer1.id,
      status: 'COMPLETED',
      totalAmount: 0,
      items: { create: { voucherId: v.zen_1.id, qty: 2, unitPrice: 0 } },
      payment: { create: { method: 'VIVOUCH_WALLET', status: 'PAID', amount: 0 } },
    }
  })
  await prisma.voucherCode.create({
    data: {
      code: 'VC-EXPIRED-TEST',
      orderId: edgeOrder.id,
      voucherId: v.zen_1.id,
      ownerId: customer1.id,
      status: 'EXPIRED',
      expiresAt: future(-10),
    }
  })
  await prisma.voucherCode.create({
    data: {
      code: 'VC-WRONG-PARTNER',
      orderId: edgeOrder.id,
      voucherId: v.zen_1.id,
      ownerId: customer1.id,
      status: 'ISSUED',
      expiresAt: future(90),
    }
  })

  const reviewReadyOrder = await prisma.order.create({
    data: {
      userId: customer3.id,
      status: 'COMPLETED',
      totalAmount: v.hdl_2.salePrice,
      items: { create: { voucherId: v.hdl_2.id, qty: 1, unitPrice: v.hdl_2.salePrice } },
      payment: { create: { method: 'VIVOUCH_WALLET', status: 'PAID', amount: v.hdl_2.salePrice } },
    }
  })
  await prisma.voucherCode.create({
    data: {
      code: 'VC-REVIEW-READY',
      orderId: reviewReadyOrder.id,
      voucherId: v.hdl_2.id,
      ownerId: customer3.id,
      status: 'USED',
      usedAt: new Date(),
      expiresAt: future(90),
    }
  })

  console.log('Orders + VoucherCodes: 18 (Including Edge Cases)')

  // Reviews
  const reviewData = [
    { userId: customer1.id, voucherId: v.hdl_1.id, rating: 5, comment: 'Lẩu ngon, nhân viên nhiệt tình. Sẽ mua lại!' },
    { userId: customer2.id, voucherId: v.hdl_1.id, rating: 4, comment: 'Buffet đa dạng, giá hợp lý với voucher.' },
    { userId: customer3.id, voucherId: v.zen_1.id, rating: 5, comment: 'Massage rất thư giãn, không gian yên tĩnh.' },
    { userId: customer1.id, voucherId: v.zen_2.id, rating: 4, comment: 'Da mặt mịn hơn sau khi dùng dịch vụ.' },
    { userId: customer2.id, voucherId: v.gt_1.id,  rating: 5, comment: 'Tour Đà Lạt rất đáng tiền, hướng dẫn viên vui tính.' },
  ]
  for (const r of reviewData) {
    await prisma.review.upsert({
      where: { userId_voucherId: { userId: r.userId, voucherId: r.voucherId } },
      update: {}, create: r
    })
  }
  console.log('Reviews seeded:', reviewData.length)

  console.log('Seeding process completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Tài khoản test:')
  console.log('  Admin:     admin@vivouch.com     / Admin@123')
  console.log('  Partner:   haidilao@vivouch.com  / Partner@123')
  console.log('  Partner:   zenspa@vivouch.com    / Partner@123')
  console.log('  Partner:   gotravel@vivouch.com  / Partner@123')
  console.log('  Staff:     staff.haidilao@vivouch.com / Staff@123')
  console.log('  Customer:  customer1@test.com    / Test@123')
  console.log('  Customer:  customer2@test.com    / Test@123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())