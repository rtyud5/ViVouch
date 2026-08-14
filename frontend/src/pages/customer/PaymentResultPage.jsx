import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentStatus, cancelOrder, syncPayosOrder } from '../../features/orders/api/orders.api';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateCheckoutQueries } from '../../features/orders/hooks/useCheckout';
import { getCustomerFacingError } from '../../utils/errorReference';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('orderId') || params.get('orderCode') || '';
  const resumeCheckout = params.get('resume') === 'true';
  const isPaidParams = params.get('status') === 'PAID';
  const [state, setState] = useState({ loading: true, error: '', reference: '', isCancelled: false });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) {
      setState({ loading: false, error: 'Thiếu mã đơn hàng.', reference: '', isCancelled: false });
      return undefined;
    }

    let stopped = false;
    let attempt = 0;
    let timeoutId;

    if (params.get('cancel') === 'true') {
      sessionStorage.removeItem('checkoutIdempotencyKey');

      // Auto cancel order in background
      cancelOrder(orderId).then(() => {
        invalidateCheckoutQueries(queryClient);
      }).catch(err => {
        console.error('Failed to auto-cancel order', err);
      });

      setState({
        loading: false,
        error: 'Giao dịch thanh toán đã bị hủy. Đơn hàng của bạn cũng đã được tự động hủy.',
        reference: '',
        isCancelled: true
      });
      return;
    }

    const poll = async () => {
      try {
        if (isPaidParams && attempt === 0) {
          await syncPayosOrder(orderId);
        }

        const data = await getPaymentStatus(orderId);
        if (stopped) return;
        const paymentStatus = data.payment?.status;
        if (paymentStatus === 'PAID') {
          sessionStorage.removeItem('checkoutIdempotencyKey');
          await invalidateCheckoutQueries(queryClient);
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
        if (paymentStatus === 'CANCELLED') {
          sessionStorage.removeItem('checkoutIdempotencyKey');
          setState({ loading: false, error: 'Đơn hàng này đã bị huỷ do quá hạn thanh toán hoặc do bạn huỷ.', reference: data.payment?.providerReference || '', isCancelled: true });
          return;
        }
        if (['FAILED', 'REFUNDED'].includes(paymentStatus)) {
          sessionStorage.removeItem('checkoutIdempotencyKey');
          setState({
            loading: false,
            error: `Giao dịch hiện ở trạng thái ${paymentStatus === 'FAILED' ? 'Thất bại' : 'Đã hoàn tiền'}.`,
            reference: '',
            isCancelled: true
          });
          return;
        }
        if (attempt >= MAX_POLL_ATTEMPTS) {
          sessionStorage.removeItem('checkoutIdempotencyKey');
          setState({ loading: false, error: 'Quá thời gian chờ. Đơn hàng của bạn có thể vẫn đang được xử lý, vui lòng kiểm tra lại trong phần Đơn hàng của tôi.', reference: '', isCancelled: false });
          return;
        }
        attempt += 1;
        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        if (!stopped) {
          sessionStorage.removeItem('checkoutIdempotencyKey');
          const next = getCustomerFacingError(error, 'Không thể kiểm tra trạng thái thanh toán.');
          setState({ loading: false, error: next.message, reference: next.reference, isCancelled: false });
        }
      }
    };
    poll();
    return () => {
      stopped = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [navigate, orderId, resumeCheckout, queryClient, params]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4 bg-base-200/30">
      <div className="card bg-base-100 shadow-xl max-w-md w-full border border-base-200">
        <div className="card-body items-center text-center p-8">

          {state.loading ? (
            <div className="flex flex-col items-center gap-6 py-8">
              <span className="loading loading-spinner w-16 text-primary" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-base-content">Đang xác nhận thanh toán</h2>
                <p className="text-base-content/70 text-sm">Hệ thống đang đồng bộ với payOS, vui lòng chờ trong giây lát...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                <XCircle size={40} strokeWidth={1.5} />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-base-content">
                  {state.isCancelled ? 'Thanh toán đã hủy' : 'Thanh toán thất bại'}
                </h2>
                <p className="text-base-content/70 leading-relaxed">
                  {state.error}
                </p>
                {state.reference && (
                  <div className="bg-base-200 px-4 py-2 rounded-lg inline-block mt-2">
                    <p className="text-xs text-base-content/60">Mã tham chiếu: <span className="font-mono text-base-content font-medium">{state.reference}</span></p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                <Link to="/customer/orders" className="btn btn-primary flex-1">
                  <ArrowLeft size={18} /> Quản lý đơn hàng
                </Link>
                <Link to="/vouchers" className="btn btn-outline flex-1">
                  <RotateCcw size={18} /> Trang sản phẩm
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
