import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentStatus } from '../../features/orders/api/orders.api';

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('orderId') || params.get('orderCode') || '';
  const cancelledByReturnUrl = params.get('cancel') === 'true' || params.get('status') === 'CANCELLED';
  const resumeCheckout = params.get('resume') === 'true';
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    if (!orderId) {
      setState({ loading: false, error: 'Thiếu mã đơn hàng.' });
      return undefined;
    }
    if (cancelledByReturnUrl) {
      setState({ loading: false, error: 'Bạn đã hủy thanh toán payOS. Đơn sẽ được giải phóng tồn kho sau khi hết thời gian chờ.' });
      return undefined;
    }

    let stopped = false;
    let attempt = 0;
    let timeoutId;
    const poll = async () => {
      try {
        const data = await getPaymentStatus(orderId);
        if (stopped) return;
        const paymentStatus = data.payment?.status;
        if (paymentStatus === 'PAID') {
          navigate('/customer/order-success', {
            replace: true,
            state: { orderId: data.id, voucherCodes: data.voucherCodes },
          });
          return;
        }
        if (resumeCheckout && paymentStatus === 'PENDING' && data.payment?.checkoutUrl) {
          window.location.assign(data.payment.checkoutUrl);
          return;
        }
        if (['CANCELLED', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
          setState({ loading: false, error: `Giao dịch hiện ở trạng thái ${paymentStatus}.` });
          return;
        }
        attempt += 1;
        if (attempt >= MAX_POLL_ATTEMPTS) {
          setState({ loading: false, error: 'Thanh toán chưa được xác nhận. Bạn có thể kiểm tra lại trong Đơn hàng của tôi.' });
          return;
        }
        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        if (!stopped) {
          setState({ loading: false, error: error?.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán.' });
        }
      }
    };
    poll();
    return () => {
      stopped = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [cancelledByReturnUrl, navigate, orderId, resumeCheckout]);

  return (
    <main className="min-h-[70vh] grid place-items-center p-4">
      <div className="card bg-base-100 shadow-xl max-w-lg w-full">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-2xl">Kết quả thanh toán payOS</h1>
          {state.loading ? (
            <><span className="loading loading-spinner loading-lg text-primary" /><p>Đang chờ webhook xác nhận giao dịch...</p></>
          ) : (
            <><div className="alert alert-warning">{state.error}</div><Link className="btn btn-primary" to="/customer/orders">Xem đơn hàng</Link></>
          )}
        </div>
      </div>
    </main>
  );
}
