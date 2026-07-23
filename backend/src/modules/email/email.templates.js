import { env } from '../../config/env.js';

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const money = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

function layout(title, content) {
  return `<!doctype html><html lang="vi"><body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#172033"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #dbe4f0"><tr><td style="padding:22px 26px;background:linear-gradient(135deg,#047857,#2563eb);color:white"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase">ViVouch</div><h1 style="margin:8px 0 0;font-size:24px">${escapeHtml(title)}</h1></td></tr><tr><td style="padding:26px;line-height:1.6">${content}<p style="margin:28px 0 0;color:#64748b;font-size:13px">Email tự động từ ViVouch. Vui lòng không trả lời email này.</p></td></tr></table></td></tr></table></body></html>`;
}

export function renderOtpEmail({ fullName, otp, purpose, expiresMinutes }) {
  const isReset = purpose === 'RESET_PASSWORD';
  const title = isReset ? 'Mã đặt lại mật khẩu' : purpose === 'STAFF_SETUP' ? 'Thiết lập tài khoản nhân viên' : 'Xác thực tài khoản';
  const subject = `[ViVouch] ${title}`;
  const text = `Xin chào ${fullName || 'bạn'},\n\nMã OTP của bạn là: ${otp}\nMã có hiệu lực trong ${expiresMinutes} phút và chỉ dùng một lần.\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`;
  const html = layout(title, `<p>Xin chào <strong>${escapeHtml(fullName || 'bạn')}</strong>,</p><p>Mã xác thực của bạn là:</p><div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;padding:18px;background:#eff6ff;border-radius:12px;color:#1d4ed8">${escapeHtml(otp)}</div><p>Mã có hiệu lực trong <strong>${expiresMinutes} phút</strong> và chỉ được sử dụng một lần.</p><p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>`);
  return { subject, text, html };
}

export function renderTransactionalEmail(template, payload) {
  const appUrl = env.CLIENT_URL;
  switch (template) {
    case 'PAYMENT_SUCCESS': {
      const subject = `[ViVouch] Thanh toán đơn ${payload.orderId} thành công`;
      return {
        subject,
        text: `Thanh toán ${money(payload.amount)} qua ${payload.method} đã thành công. Xem đơn hàng: ${appUrl}/customer/orders`,
        html: layout('Thanh toán thành công', `<p>Đơn hàng <strong>${escapeHtml(payload.orderId)}</strong> đã thanh toán thành công.</p><p><strong>Số tiền:</strong> ${money(payload.amount)}<br><strong>Phương thức:</strong> ${escapeHtml(payload.method)}</p><p><a href="${appUrl}/customer/orders" style="display:inline-block;padding:11px 18px;background:#2563eb;color:white;text-decoration:none;border-radius:9px">Xem đơn hàng</a></p>`),
      };
    }
    case 'VOUCHER_ISSUED': {
      const subject = '[ViVouch] Voucher của bạn đã sẵn sàng';
      return {
        subject,
        text: `ViVouch đã phát hành ${payload.quantity || 1} voucher cho đơn ${payload.orderId}. Xem tại ${appUrl}/customer/my-vouchers`,
        html: layout('Voucher đã được phát hành', `<p>Đơn hàng <strong>${escapeHtml(payload.orderId)}</strong> đã được phát hành <strong>${escapeHtml(payload.quantity || 1)}</strong> voucher.</p><p>Để bảo mật, mã voucher chỉ hiển thị sau khi bạn đăng nhập ViVouch.</p><p><a href="${appUrl}/customer/my-vouchers" style="display:inline-block;padding:11px 18px;background:#059669;color:white;text-decoration:none;border-radius:9px">Xem voucher</a></p>`),
      };
    }
    case 'PARTNER_RESULT': {
      const approved = payload.status === 'APPROVED';
      const subject = `[ViVouch] Hồ sơ đối tác ${approved ? 'đã được duyệt' : 'chưa được duyệt'}`;
      return {
        subject,
        text: approved ? 'Hồ sơ đối tác của bạn đã được duyệt.' : `Hồ sơ đối tác bị từ chối: ${payload.reason || 'Vui lòng kiểm tra lại thông tin.'}`,
        html: layout('Kết quả duyệt đối tác', approved ? '<p>Hồ sơ đối tác của bạn đã được duyệt. Bạn có thể truy cập đầy đủ Partner Portal.</p>' : `<p>Hồ sơ đối tác chưa được duyệt.</p><p><strong>Lý do:</strong> ${escapeHtml(payload.reason || 'Vui lòng kiểm tra lại thông tin.')}</p>`),
      };
    }
    case 'VOUCHER_RESULT': {
      const approved = payload.status === 'APPROVED';
      const subject = `[ViVouch] Voucher ${payload.title} ${approved ? 'đã được duyệt' : 'bị từ chối'}`;
      return {
        subject,
        text: approved ? `Voucher ${payload.title} đã được duyệt.` : `Voucher ${payload.title} bị từ chối: ${payload.reason || ''}`,
        html: layout('Kết quả duyệt voucher', `<p>Voucher <strong>${escapeHtml(payload.title)}</strong> ${approved ? 'đã được duyệt.' : 'bị từ chối.'}</p>${approved ? '' : `<p><strong>Lý do:</strong> ${escapeHtml(payload.reason || '')}</p>`}`),
      };
    }
    case 'REFUND_RESOLVED': {
      const subject = `[ViVouch] Kết quả yêu cầu hoàn tiền đơn ${payload.orderId}`;
      return {
        subject,
        text: `Yêu cầu hoàn tiền có trạng thái ${payload.status}. ${payload.adminNote || ''}`,
        html: layout('Kết quả hoàn tiền', `<p>Yêu cầu hoàn tiền cho đơn <strong>${escapeHtml(payload.orderId)}</strong> có trạng thái <strong>${escapeHtml(payload.status)}</strong>.</p><p>${escapeHtml(payload.adminNote || '')}</p>`),
      };
    }
    case 'TICKET_RESPONDED': {
      const subject = `[ViVouch] Phản hồi hỗ trợ: ${payload.subject}`;
      return {
        subject,
        text: payload.response || 'Yêu cầu hỗ trợ của bạn đã được cập nhật.',
        html: layout('Yêu cầu hỗ trợ đã được phản hồi', `<p><strong>${escapeHtml(payload.subject)}</strong></p><p>${escapeHtml(payload.response || 'Yêu cầu hỗ trợ của bạn đã được cập nhật.')}</p>`),
      };
    }
    case 'STAFF_ACCOUNT_CREATED': {
      const subject = '[ViVouch] Bạn được thêm làm nhân viên đối tác';
      return {
        subject,
        text: `Bạn đã được thêm vào ${payload.businessName}, chi nhánh ${payload.branchName}. Hãy dùng OTP trong email thiết lập tài khoản để đặt mật khẩu.`,
        html: layout('Tài khoản nhân viên đã được tạo', `<p>Bạn đã được thêm vào đối tác <strong>${escapeHtml(payload.businessName)}</strong>.</p><p><strong>Chi nhánh:</strong> ${escapeHtml(payload.branchName)}</p><p>Hãy sử dụng mã OTP thiết lập tài khoản được gửi riêng để đặt mật khẩu.</p>`),
      };
    }
    default:
      throw new Error(`Unsupported email template: ${template}`);
  }
}
