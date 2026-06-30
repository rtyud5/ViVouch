import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Check,
  ChevronDown,
  CirclePlus,
  MapPin,
  Phone,
  Store,
  ToggleLeft,
  ToggleRight,
  UserRound
} from "lucide-react";
import { usePartnerProfile, useUpdatePartnerProfile } from "../../features/partner/hooks/usePartnerProfile";

const profileSchema = z.object({
  businessName: z.string().min(2, "Tên doanh nghiệp là bắt buộc"),
  taxCode: z.string().min(8, "Mã số thuế không hợp lệ"),
  description: z.string().optional()
});

const branchSchema = z.object({
  name: z.string().min(2, "Tên chi nhánh là bắt buộc"),
  address: z.string().min(5, "Địa chỉ chi nhánh là bắt buộc"),
  phone: z.string().min(8, "Số điện thoại chi nhánh không hợp lệ")
});

const initialBranches = [
  { id: 1, name: "Chi nhánh Quận 1", address: "12 Nguyễn Huệ, Quận 1, TP.HCM", phone: "0281234567", active: true },
  { id: 2, name: "Chi nhánh Thủ Đức", address: "88 Võ Văn Ngân, TP. Thủ Đức", phone: "0287654321", active: true },
  { id: 3, name: "Chi nhánh Bình Thạnh", address: "21 Điện Biên Phủ, Bình Thạnh", phone: "0289999888", active: false }
];

function Toast({ message, tone = "success" }) {
  if (!message) return null;

  return (
    <div className="toast toast-top toast-center z-50">
      <div className={`alert ${tone === "success" ? "alert-success" : "alert-error"} shadow-lg rounded-2xl`}>
        <span>{message}</span>
      </div>
    </div>
  );
}

function BranchCard({ branch, onToggle }) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold">{branch.name}</h3>
            <span className={`badge ${branch.active ? "badge-success" : "badge-ghost"}`}>
              {branch.active ? "Đang hoạt động" : "Tạm dừng"}
            </span>
          </div>
          <p className="flex items-start gap-2 text-sm text-base-content/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{branch.address}</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-base-content/70">
            <Phone className="h-4 w-4" />
            <span>{branch.phone}</span>
          </p>
        </div>

        <button
          type="button"
          className={`btn btn-sm ${branch.active ? "btn-outline btn-success" : "btn-primary"}`}
          onClick={() => onToggle(branch.id)}
        >
          {branch.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {branch.active ? "Tắt hoạt động" : "Kích hoạt"}
        </button>
      </div>
    </div>
  );
}

export function PartnerProfilePage() {
  const { data: partnerProfile, isLoading: isProfileLoading } = usePartnerProfile();
  const updateProfileMutation = useUpdatePartnerProfile();

  const [branches, setBranches] = useState(initialBranches);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [showBranchForm, setShowBranchForm] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: "",
      taxCode: "",
      description: ""
    }
  });
  const { reset: resetProfile, formState: { isDirty: isProfileDirty } } = profileForm;

  const branchForm = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: "", address: "", phone: "" }
  });

  const activeCount = useMemo(() => branches.filter((branch) => branch.active).length, [branches]);

  const showToast = (message, tone = "success") => {
    setToast({ message, tone });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 2500);
  };

  useEffect(() => () => window.clearTimeout(showToast.timer), []);

  useEffect(() => {
    if (partnerProfile?.data && !isProfileDirty) {
      resetProfile({
        businessName: partnerProfile.data.businessName || "",
        taxCode: partnerProfile.data.taxCode || "",
        description: partnerProfile.data.description || ""
      });
    }
  }, [partnerProfile, resetProfile, isProfileDirty]);

  const handleProfileSubmit = profileForm.handleSubmit((values) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        showToast("Đã lưu thông tin doanh nghiệp thành công.");
        resetProfile(values);
      },
      onError: (error) => {
        showToast(error?.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin.", "error");
      }
    });
  });

  const handleBranchSubmit = branchForm.handleSubmit((values) => {
    setBranches((current) => [
      {
        id: Date.now(),
        name: values.name,
        address: values.address,
        phone: values.phone,
        active: true
      },
      ...current
    ]);
    branchForm.reset();
    setShowBranchForm(false);
    showToast("Đã thêm chi nhánh mới thành công.");
  });

  const handleToggleBranch = (branchId) => {
    const target = branches.find((branch) => branch.id === branchId);
    setBranches((current) =>
      current.map((branch) =>
        branch.id === branchId ? { ...branch, active: !branch.active } : branch
      )
    );
    showToast(
      target?.active ? "Đã tạm dừng chi nhánh ngay trên giao diện." : "Đã kích hoạt chi nhánh ngay trên giao diện."
    );
  };

  if (isProfileLoading) {
    return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div className="space-y-6">
      <Toast message={toast.message} tone={toast.tone} />

      <div className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Building2 className="h-4 w-4" />
              Hồ sơ doanh nghiệp
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight">Profile & Branch</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60">
              Cập nhật thông tin doanh nghiệp và quản lý chi nhánh ngay tại một nơi. Thao tác toggle sẽ phản
              hồi tức thì trên UI để người dùng thấy trạng thái mới ngay lập tức.
            </p>
          </div>

          <div className="rounded-2xl bg-base-200 px-4 py-3 text-sm text-base-content/70">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {partnerProfile?.data?.businessName || profileForm.watch("businessName") || "Doanh nghiệp"}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Store className="h-4 w-4" />
              {activeCount}/{branches.length} chi nhánh đang hoạt động
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Thông tin doanh nghiệp</h2>
          </div>

          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <label className="form-control">
              <div className="label"><span className="label-text">Tên doanh nghiệp</span></div>
              <input className="input input-bordered" {...profileForm.register("businessName")} />
              {profileForm.formState.errors.businessName && (
                <div className="mt-1 text-sm text-error">{profileForm.formState.errors.businessName.message}</div>
              )}
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text">Mã số thuế</span></div>
              <input className="input input-bordered" readOnly {...profileForm.register("taxCode")} />
              {profileForm.formState.errors.taxCode && (
                <div className="mt-1 text-sm text-error">{profileForm.formState.errors.taxCode.message}</div>
              )}
            </label>

            <label className="form-control">
              <div className="label"><span className="label-text">Mô tả doanh nghiệp</span></div>
              <textarea className="textarea textarea-bordered min-h-28" {...profileForm.register("description")} />
              {profileForm.formState.errors.description && (
                <div className="mt-1 text-sm text-error">{profileForm.formState.errors.description.message}</div>
              )}
            </label>

            <button type="submit" className="btn btn-primary w-full" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : <Check className="h-4 w-4" />}
              {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thông tin doanh nghiệp"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-3 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Danh sách chi nhánh</h2>
              </div>
              <p className="mt-1 text-sm text-base-content/60">
                Toggle thay đổi trạng thái ngay trên UI, không cần chờ reload.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowBranchForm((value) => !value)}
            >
              <CirclePlus className="h-4 w-4" />
              Thêm chi nhánh
              <ChevronDown className={`h-4 w-4 transition-transform ${showBranchForm ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div
            className={`mt-4 overflow-hidden rounded-2xl border border-dashed border-base-300 bg-base-200/50 transition-all duration-300 ${showBranchForm ? "max-h-[420px] p-4 opacity-100" : "max-h-0 p-0 opacity-0"
              }`}
          >
            <form className="grid grid-cols-1 gap-4 md:grid-cols-3" onSubmit={handleBranchSubmit}>
              <label className="form-control">
                <div className="label"><span className="label-text">Tên chi nhánh</span></div>
                <input className="input input-bordered" {...branchForm.register("name")} />
                {branchForm.formState.errors.name && (
                  <div className="mt-1 text-sm text-error">{branchForm.formState.errors.name.message}</div>
                )}
              </label>

              <label className="form-control md:col-span-2">
                <div className="label"><span className="label-text">Địa chỉ</span></div>
                <input className="input input-bordered" {...branchForm.register("address")} />
                {branchForm.formState.errors.address && (
                  <div className="mt-1 text-sm text-error">{branchForm.formState.errors.address.message}</div>
                )}
              </label>

              <label className="form-control">
                <div className="label"><span className="label-text">Số điện thoại</span></div>
                <input className="input input-bordered" {...branchForm.register("phone")} />
                {branchForm.formState.errors.phone && (
                  <div className="mt-1 text-sm text-error">{branchForm.formState.errors.phone.message}</div>
                )}
              </label>

              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="btn btn-primary">
                  Thêm chi nhánh
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 space-y-4">
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} onToggle={handleToggleBranch} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
