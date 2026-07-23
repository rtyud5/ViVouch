import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../features/cart/hooks/useCart';
import { useCheckout } from '../../features/orders/hooks';
import { useAuthStore } from '../../stores/authStore';
import { ApiErrorToast } from '../../components/common/ApiErrorToast';
import { CustomerEmptyState } from '../../components/common/CustomerEmptyState';
import { ErrorRetryPanel } from '../../components/common';
import { formatCurrency } from '../../utils/formatCurrency';
import { createCheckoutIdempotencyKey } from '../../utils/idempotencyKey';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, isLoading: isCartLoading, error: cartError } = useCart();
  const checkoutMutation = useCheckout();
  const idempotencyKeyRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const [paymentMethod, setPaymentMethod] = useState('VIVOUCH_WALLET');
  const [localError, setLocalError] = useState(null);
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [note, setNote] = useState('');

  const cartItems = cart?.items || [];
  const items = useMemo(() => cartItems.map((item) => ({ id: item.voucherId ?? item.id, qty: item.qty })), [cartItems]);
  const totalQty = cartTotal?.totalQty ?? items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cartTotal?.totalAmount ?? cartItems.reduce((sum, item) => sum + Number(item.voucher?.salePrice || 0) * item.qty, 0);
  const walletBalance = Number(user?.wallet?.balance || 0);
  const walletInsufficient = paymentMethod === 'VIVOUCH_WALLET' && walletBalance < Number(totalAmount);

  async function handleCheckout() {
    setLocalError(null);
    if (isGift && !recipientName.trim()) return setLocalError(new Error('Vui lòng nhập tên người nhận quà.'));
    if (isGift && !/^[0-9+]{9,15}$/.test(recipientPhone.trim())) return setLocalError(new Error('Số điện thoại người nhận không hợp lệ.'));
    if (walletInsufficient) return setLocalError(new Error('Số dư Ví ViVouch không đủ. Hãy chọn payOS hoặc nhờ Admin cộng số dư demo.'));

    try {
      if (!idempotencyKeyRef.current) idempotencyKeyRef.current = createCheckoutIdempotencyKey();
      const result = await checkoutMutation.mutateAsync({
        items,
        paymentMethod,
        recipientName: isGift ? recipientName.trim() : null,
        recipientPhone: isGift ? recipientPhone.trim() : null,
        note: note.trim() || null,
        idempotencyKey: idempotencyKeyRef.current,
      });
      if (!result?.orderId) throw new Error('Thiếu mã đơn hàng trong phản hồi thanh toán.');
      if (result.paymentMethod === 'PAYOS') {
        idempotencyKeyRef.current = null;
        if (result.checkoutUrl) {
          window.location.assign(result.checkoutUrl);
          return;
        }
        navigate(`/customer/payment-result?orderId=${encodeURIComponent(result.orderId)}&resume=true`, { replace: true });
        return;
      }
      idempotencyKeyRef.current = null;
      navigate('/customer/order-success', {
        replace: true,
        state: { orderId: result.orderId, voucherCodes: result.voucherCodes || [] },
      });
    } catch (error) {
      setLocalError(error);
    }
  }

  if (isCartLoading && !cart) return <div className="min-h-[60vh] grid place-items-center"><span className="loading loading-spinner loading-lg" /></div>;
  if (cartError) return <div className="max-w-4xl mx-auto px-4 py-16"><ErrorRetryPanel title="Không thể tải thông tin thanh toán" description="Dữ liệu giỏ hàng tạm thời không truy cập được." onRetry={() => window.location.reload()} /></div>;
  if (!isCartLoading && totalQty === 0) return <div className="max-w-4xl mx-auto px-4 py-8"><CustomerEmptyState type="cart" title="Chưa có gì để thanh toán" description="Hãy chọn voucher trước khi quay lại bước thanh toán." action={<Link to="/vouchers" className="btn btn-primary">Khám phá voucher</Link>} /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ApiErrorToast error={checkoutMutation.error || localError} message={localError?.message || 'Thanh toán thất bại. Vui lòng thử lại.'} />
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <section className="card bg-base-100 border border-base-300"><div className="card-body">
            <h2 className="card-title">Thông tin người mua</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm"><div><span className="text-base-content/60">Họ tên</span><div className="font-semibold">{user?.fullName}</div></div><div><span className="text-base-content/60">Email</span><div className="font-semibold">{user?.email}</div></div></div>
            <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox checkbox-primary" checked={isGift} onChange={(event) => setIsGift(event.target.checked)} /><span className="label-text">Mua làm quà tặng</span></label>
            {isGift && <div className="grid sm:grid-cols-2 gap-4"><label className="form-control"><span className="label-text mb-1">Tên người nhận</span><input className="input input-bordered" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} /></label><label className="form-control"><span className="label-text mb-1">Số điện thoại</span><input className="input input-bordered" value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} /></label></div>}
            <label className="form-control"><span className="label-text mb-1">Ghi chú</span><textarea className="textarea textarea-bordered" maxLength="500" value={note} onChange={(event) => setNote(event.target.value)} /></label>
          </div></section>

          <section className="card bg-base-100 border border-base-300"><div className="card-body"><h2 className="card-title">Voucher ({totalQty})</h2><div className="divide-y divide-base-300">{cartItems.map((item) => <article key={item.id} className="py-4 flex gap-4"><img className="w-20 h-20 object-cover rounded-xl bg-base-200" src={item.voucher?.imageUrl || 'https://placehold.co/100x100?text=Voucher'} alt={item.voucher?.title || 'Voucher'} /><div className="flex-1"><h3 className="font-bold">{item.voucher?.title}</h3><p className="text-sm text-base-content/60">{item.qty} × {formatCurrency(item.voucher?.salePrice || 0)}</p></div><b>{formatCurrency(Number(item.voucher?.salePrice || 0) * item.qty)}</b></article>)}</div></div></section>

          <section className="card bg-base-100 border border-base-300"><div className="card-body"><h2 className="card-title">Phương thức thanh toán</h2>
            <label className={`border rounded-xl p-4 flex gap-3 cursor-pointer ${paymentMethod === 'VIVOUCH_WALLET' ? 'border-primary bg-primary/5' : 'border-base-300'}`}><input type="radio" className="radio radio-primary" checked={paymentMethod === 'VIVOUCH_WALLET'} onChange={() => setPaymentMethod('VIVOUCH_WALLET')} /><div className="flex-1"><div className="flex flex-wrap gap-2 items-center"><b>Ví ViVouch</b><span className="badge badge-warning badge-sm">MOCK</span></div><p className={`text-sm ${walletInsufficient ? 'text-error' : 'text-base-content/60'}`}>Số dư: {currencyFormatter.format(walletBalance)}</p></div></label>
            <label className={`border rounded-xl p-4 flex gap-3 cursor-pointer ${paymentMethod === 'PAYOS' ? 'border-primary bg-primary/5' : 'border-base-300'}`}><input type="radio" className="radio radio-primary" checked={paymentMethod === 'PAYOS'} onChange={() => setPaymentMethod('PAYOS')} /><div className="flex-1"><div className="flex flex-wrap gap-2 items-center"><b>payOS VietQR</b><span className="badge badge-success badge-sm">REAL</span></div><p className="text-sm text-base-content/60">Chuyển sang trang thanh toán payOS; voucher chỉ phát hành sau webhook hợp lệ.</p></div></label>
          </div></section>
        </div>

        <aside><div className="card bg-base-100 border border-base-300 lg:sticky lg:top-24"><div className="card-body"><h2 className="card-title">Tóm tắt đơn hàng</h2><div className="flex justify-between"><span>{totalQty} voucher</span><span>{currencyFormatter.format(Number(totalAmount))}</span></div><div className="divider my-1" /><div className="flex justify-between text-lg font-bold"><span>Tổng thanh toán</span><span className="text-primary">{currencyFormatter.format(Number(totalAmount))}</span></div><button className="btn btn-primary mt-4" onClick={handleCheckout} disabled={checkoutMutation.isPending || walletInsufficient}>{checkoutMutation.isPending ? <><span className="loading loading-spinner" />Đang xử lý</> : paymentMethod === 'PAYOS' ? 'Đến payOS VietQR' : 'Thanh toán bằng Ví'}</button></div></div></aside>
      </div>
    </div>
  );
}
