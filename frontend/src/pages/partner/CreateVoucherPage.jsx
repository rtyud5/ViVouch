import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Save, Send } from "lucide-react";
import { VoucherCard } from "../../components/voucher/VoucherCard";
import { createVoucherDraft, mapVoucherFormToPayload, submitVoucherForApproval } from "../../features/vouchers/api/vouchers.api";
import { voucherFormSchema } from "./schemas/voucherFormSchema";

const defaultValues = {
  name: "",
  category: "am-thuc",
  location: "",
  imageUrl: "",
  originalPrice: 0,
  salePrice: 0,
  totalQuantity: 1,
  startDate: "",
  endDate: "",
};

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Thao tác thất bại";
}

export function CreateVoucherPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(voucherFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const formValues = useWatch({ control, defaultValue: defaultValues });

  const previewVoucher = {
    id: "preview-id",
    name: formValues.name || "Tên Voucher",
    partnerName: "Cửa hàng của bạn",
    category: formValues.category,
    location: formValues.location,
    imageUrl: formValues.imageUrl,
    originalPrice: formValues.originalPrice || 0,
    salePrice: formValues.salePrice || 0,
    rating: 0,
    reviewCount: 0,
    totalQuantity: formValues.totalQuantity || 1,
    soldQuantity: 0,
  };

  const draftMutation = useMutation({
    mutationFn: createVoucherDraft,
    onSuccess: () => {
      alert("Lưu nháp thành công!");
      navigate("/partner/vouchers");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (formData) => {
      const created = await createVoucherDraft(formData);
      const voucherId = created?.data?.id || created?.id;

      if (!voucherId) {
        throw new Error("Không thể xác định voucher vừa tạo để gửi kiểm duyệt");
      }

      return submitVoucherForApproval(voucherId);
    },
    onSuccess: () => {
      alert("Gửi kiểm duyệt thành công!");
      navigate("/partner/vouchers");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const onSubmitDraft = (data) => {
    draftMutation.mutate(mapVoucherFormToPayload(data));
  };

  const onSubmitApproval = (data) => {
    submitMutation.mutate(mapVoucherFormToPayload(data));
  };

  const nameField = register("name");
  const categoryField = register("category");
  const imageUrlField = register("imageUrl");
  const originalPriceField = register("originalPrice");
  const salePriceField = register("salePrice");
  const totalQuantityField = register("totalQuantity");
  const startDateField = register("startDate");
  const endDateField = register("endDate");
  const locationField = register("location");

  const isSubmitting = draftMutation.isPending || submitMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Tạo Voucher Mới</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Điền thông tin chi tiết để tạo voucher và xem trước giao diện.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSubmit(onSubmitDraft)}
            disabled={isSubmitting}
          >
            {draftMutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu nháp
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit(onSubmitApproval)}
            disabled={isSubmitting}
          >
            {submitMutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Gửi kiểm duyệt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">1. Thông tin cơ bản</h2>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Tên Voucher <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Giảm 50% Buffet Trưa"
                  className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                  {...nameField}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name.message}</span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Danh mục <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    className={`select select-bordered w-full ${errors.category ? "select-error" : ""}`}
                    {...categoryField}
                  >
                    <option value="am-thuc">Ẩm thực</option>
                    <option value="lam-dep">Làm đẹp</option>
                    <option value="du-lich">Du lịch</option>
                    <option value="mua-sam">Mua sắm</option>
                    <option value="giai-tri">Giải trí</option>
                  </select>
                  {errors.category && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.category.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">URL Hình ảnh</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className={`input input-bordered w-full ${errors.imageUrl ? "input-error" : ""}`}
                    {...imageUrlField}
                  />
                  {errors.imageUrl && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.imageUrl.message}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">2. Giá & Số lượng</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Giá gốc (VNĐ)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`input input-bordered w-full ${errors.originalPrice ? "input-error" : ""}`}
                    {...originalPriceField}
                    onBlur={async (event) => {
                      originalPriceField.onBlur(event);
                      await trigger("salePrice");
                    }}
                  />
                  {errors.originalPrice && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.originalPrice.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Giá bán (VNĐ) <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`input input-bordered w-full ${errors.salePrice ? "input-error" : ""}`}
                    {...salePriceField}
                  />
                  {errors.salePrice && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.salePrice.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Tổng số lượng <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={`input input-bordered w-full ${errors.totalQuantity ? "input-error" : ""}`}
                    {...totalQuantityField}
                  />
                  {errors.totalQuantity && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.totalQuantity.message}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">3. Thời gian</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Thời gian bắt đầu <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    className={`input input-bordered w-full ${errors.startDate ? "input-error" : ""}`}
                    {...startDateField}
                    onBlur={async (event) => {
                      startDateField.onBlur(event);
                      await trigger("endDate");
                    }}
                  />
                  {errors.startDate && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.startDate.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Thời gian kết thúc <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    className={`input input-bordered w-full ${errors.endDate ? "input-error" : ""}`}
                    {...endDateField}
                  />
                  {errors.endDate && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.endDate.message}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">4. Chi nhánh áp dụng</h2>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Chi nhánh</span>
                </label>
                <input
                  type="text"
                  placeholder="Mặc định: Nhiều chi nhánh"
                  className={`input input-bordered w-full ${errors.location ? "input-error" : ""}`}
                  {...locationField}
                />
                {errors.location && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.location.message}</span>
                  </label>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4 text-base-content/80">Live Preview</h3>
            <div className="bg-base-200/50 p-4 rounded-2xl flex justify-center">
              <div className="w-full max-w-[320px]">
                <VoucherCard voucher={previewVoucher} variant="search" disableClick={true} />
              </div>
            </div>

            <div className="mt-4 p-4 bg-info/10 rounded-xl text-sm text-info-content">
              <p className="font-semibold mb-1">Mẹo tối ưu voucher:</p>
              <ul className="list-disc pl-5 space-y-1 opacity-80">
                <li>Tên voucher nên ngắn gọn, chứa mức giảm.</li>
                <li>Ảnh rõ nét, tỷ lệ 4:3 giúp thu hút hơn.</li>
                <li>Giá bán thấp hơn giá gốc sẽ hiển thị huy hiệu giảm % nổi bật.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
