import {
  useVouchers,
  useVoucherDetail,
  useCategories,
} from "../../features/vouchers/hooks/index";

export default function VoucherHooksTest() {
  const {
    vouchers,
    pagination,
    isLoading: vouchersLoading,
    error: vouchersError,
  } = useVouchers({
    page: 1,
    limit: 10,
  });

  const {
    data: voucherDetail,
    isLoading: detailLoading,
    error: detailError,
  } = useVoucherDetail("a063a800-c9f3-48d3-b00c-6b2de79a5951"); // thay 1 bằng id voucher tồn tại

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  return (
    <div style={{ padding: "20px" }}>
      <h1>React Query Test</h1>

      <hr />

      <h2>Categories</h2>
      <p>Loading: {String(categoriesLoading)}</p>
      <p>Error: {String(!!categoriesError)}</p>

      <pre>
        {JSON.stringify(categories, null, 2)}
      </pre>

      <hr />

      <h2>Voucher List</h2>
      <p>Loading: {String(vouchersLoading)}</p>
      <p>Error: {String(!!vouchersError)}</p>

      <p>
        Count: {vouchers?.length ?? 0}
      </p>

      <ul>
      {vouchers.map((voucher) => (
        <li key={voucher.id}>
          {voucher.title}
        </li>
      ))}
      </ul>

      <hr />

      <h2>Voucher Detail</h2>
      <p>Loading: {String(detailLoading)}</p>
      <p>Error: {String(!!detailError)}</p>

      <pre>
        {JSON.stringify(voucherDetail, null, 2)}
      </pre>
    </div>
  );
}