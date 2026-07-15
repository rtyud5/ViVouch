import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Send } from "lucide-react";
import { VoucherCard } from "../../components/voucher/VoucherCard";
import { createVoucherDraft, submitVoucherForApproval, updateVoucher, getPartnerVouchers } from "../../features/partner/api/vouchers.api";
import { getCategories } from "../../features/vouchers/api/vouchers.api";
import { voucherFormSchema } from "./schemas/voucherFormSchema";
import { apiClient } from "../../services/apiClient";

const defaultValues = {
  name: "",
  category: "",
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
  const queryClient = useQueryClient();
  // NEW-B113: detect edit mode from route param
  const { id: voucherId } = useParams();
  const isEditMode = Boolean(voucherId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(voucherFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const formValues = useWatch({ control, defaultValue: defaultValues });

  // Fetch danh sách danh mục từ API để lấy id (UUID)
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // Cache 5 phút vì categories ít thay đổi
  });

  const categories = categoriesData?.data ?? categoriesData ?? [];

  // NEW-B113: Fetch voucher data when in edit mode to pre-fill the form
  const { isLoading: isVoucherLoading } = useQuery({
    queryKey: ["partnerVoucherDetail", voucherId],
    queryFn: async () => {
      const response = await apiClient.get(`/partner/vouchers/${voucherId}`);
      return response.data?.data ?? response.data;
    },
    enabled: isEditMode,
    // Pre-fill form when data loads
    onSuccess: (voucher) => {
      if (!voucher) return;
      // Convert ISO dates to datetime-local format (YYYY-MM-DDTHH:mm)
      const toLocalInput = (iso) => {
        if (!iso) return "";
        return new Date(iso).toISOString().slice(0, 16);
      };
      reset({
        name: voucher.title ?? "",
        category: voucher.categoryId ?? "",
        imageUrl: voucher.imageUrl ?? "",
        location: voucher.location ?? "",
        originalPrice: voucher.originalPrice ?? 0,
        salePrice: voucher.salePrice ?? 0,
        totalQuantity: voucher.totalQty ?? 1,
        startDate: toLocalInput(voucher.saleStart),
        endDate: toLocalInput(voucher.saleEnd),
      });
    },
  });

  // Khi categories load xong lần đầu, tự động chọn category đầu tiên
  useEffect(() => {
    if (categories.length > 0 && !formValues.category) {
      setValue("category", categories[0].id, { shouldValidate: false });
    }
  }, [categories, formValues.category, setValue]);

  const previewVoucher = {
    id: "preview-id",
    name: formValues.name || "Tên Voucher",
    partnerName: "Cửa hàng của bạn",
    category: categories.find((c) => c.id === formValues.category)?.slug || formValues.category,
    location: formValues.location,
    imageUrl: formValues.imageUrl,
    originalPrice: formValues.originalPrice || 0,
    salePrice: formValues.salePrice || 0,
    rating: 0,
    reviewCount: 0,
    totalQuantity: formValues.totalQuantity || 1,
    soldQuantity: 0,
  };

  const invalidateCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["partnerVouchers"] });
    queryClient.invalidateQueries({ queryKey: ["partnerReports"] });
    queryClient.invalidateQueries({ queryKey: ["partnerProfile"] });
    if (voucherId) {
      queryClient.invalidateQueries({ queryKey: ["partnerVoucherDetail", voucherId] });
    }
  };

  // NEW-B113: update mutation for edit mode
  const updateMutation = useMutation({
    mutationFn: (formData) => updateVoucher(voucherId, formData),
    onSuccess: () => {
      invalidateCaches();
      alert("Cập nhật voucher thành công!");
      navigate("/partner/vouchers");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  // NEW-B113: update + submit mutation for edit mode
  const updateAndSubmitMutation = useMutation({
    mutationFn: async (formData) => {
      await updateVoucher(voucherId, formData);
      return submitVoucherForApproval(voucherId);
    },
    onSuccess: () => {
      invalidateCaches();
      alert("Cập nhật và gửi kiểm duyệt thành công!");
      navigate("/partner/vouchers");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const draftMutation = useMutation({
    mutationFn: createVoucherDraft,
    onSuccess: () => {
      // Invalidate all affected caches so Voucher List, Dashboard KPI, and Reports refresh
      queryClient.invalidateQueries({ queryKey: ["partnerVouchers"] });
      queryClient.invalidateQueries({ queryKey: ["partnerReports"] });
      queryClient.invalidateQueries({ queryKey: ["partnerProfile"] });
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
      // Backend trả về { data: { id, ... } } sau khi tạo
      const createdId = created?.data?.id || created?.id;

      if (!createdId) {
        throw new Error("Không thể xác định voucher vừa tạo để gửi kiểm duyệt");
      }

      return submitVoucherForApproval(createdId);
    },
    onSuccess: () => {
      // Invalidate all affected caches so Voucher List, Dashboard KPI, and Reports refresh
      queryClient.invalidateQueries({ queryKey: ["partnerVouchers"] });
      queryClient.invalidateQueries({ queryKey: ["partnerReports"] });
      queryClient.invalidateQueries({ queryKey: ["partnerProfile"] });
      alert("Gửi kiểm duyệt thành công!");
      navigate("/partner/vouchers");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const onSubmitDraft = (data) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      draftMutation.mutate(data);
    }
  };

  const onSubmitApproval = (data) => {
    if (isEditMode) {
      updateAndSubmitMutation.mutate(data);
    } else {
      submitMutation.mutate(data);
    }
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

  const isSubmitting = draftMutation.isPending || submitMutation.isPending || updateMutation.isPending || updateAndSubmitMutation.isPending;

  if (isEditMode && isVoucherLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/70">Đang tải thông tin voucher...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            {isEditMode ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            {isEditMode ? "Cập nhật thông tin voucher của bạn." : "Điền thông tin chi tiết để tạo voucher và xem trước giao diện."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSubmit(onSubmitDraft)}
            disabled={isSubmitting || isCategoriesLoading}
          >
            {draftMutation.isPending || updateMutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditMode ? "Lưu thay đổi" : "Lưu nháp"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit(onSubmitApproval)}
            disabled={isSubmitting || isCategoriesLoading}
          >
            {submitMutation.isPending || updateAndSubmitMutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isEditMode ? "Lưu & Gửi kiểm duyệt" : "Gửi kiểm duyệt"}
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
                  {isCategoriesLoading ? (
                    <div className="select select-bordered w-full flex items-center text-base-content/40">
                      <span className="loading loading-spinner loading-xs mr-2" />
                      Đang tải danh mục...
                    </div>
                  ) : (
                    <select
                      className={`select select-bordered w-full ${errors.category ? "select-error" : ""}`}
                      {...categoryField}
                    >
                      {categories.map((cat) => (
                        // value = cat.id (UUID) — đúng với foreign key của DB
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
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
