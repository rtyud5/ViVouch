import { useState, useEffect } from "react";
import { useMe, useUpdateProfile, useChangePassword } from "../../features/users/hooks/useUsers";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { ApiSuccessToast } from "../../components/common/ApiSuccessToast";
import { ErrorRetryPanel, LoadingSpinner } from "../../components/common";

function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export function ProfilePage() {
  const { data: user, isLoading, isError, refetch } = useMe();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState(null);
  const [hydratedUserId, setHydratedUserId] = useState(null);

  useEffect(() => {
    if (!user) {
      setFullName("");
      setPhone("");
      setHydratedUserId(null);
    } else if (user.id !== hydratedUserId) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setHydratedUserId(user.id);
    }
  }, [user, hydratedUserId]);

  const avatarInitial = user?.fullName?.[0]?.toUpperCase() ?? "U";
  const wrongCurrentPassword =
    pwdError && getApiErrorMessage(pwdError, "").includes("Mật khẩu hiện tại không đúng");

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError(null);

    updateProfileMutation.mutate(
      { fullName: fullName.trim(), phone: phone.trim() || null },
      {
        onSuccess: (updatedUser) => {
          setProfileSuccess("Cập nhật thông tin thành công!");
          if (updatedUser) {
            setFullName(updatedUser.fullName || "");
            setPhone(updatedUser.phone || "");
          }
        },
        onError: (err) => {
          setProfileError(err);
        },
      }
    );
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwdSuccess("");
    setPwdError(null);

    if (!newPassword || newPassword.length < 6) {
      setPwdError(new Error("Mật khẩu mới phải có ít nhất 6 ký tự."));
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPwdSuccess("Đổi mật khẩu thành công!");
          setCurrentPassword("");
          setNewPassword("");
        },
        onError: (err) => {
          setPwdError(err);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <LoadingSpinner />
        <p className="text-center text-sm text-base-content/60 mt-2">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <ErrorRetryPanel
          title="Không thể tải thông tin cá nhân"
          description="Dữ liệu hồ sơ tạm thời không truy cập được. Vui lòng thử lại."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 animate-fade-in">
      <ApiSuccessToast message={profileSuccess} />
      <ApiSuccessToast message={pwdSuccess} />
      <ApiErrorToast
        error={profileError}
        message="Có lỗi xảy ra khi cập nhật thông tin."
      />
      <ApiErrorToast
        error={pwdError}
        message="Có lỗi xảy ra khi đổi mật khẩu."
      />

      <h1 className="font-headline-md text-headline-md font-bold text-primary mb-6 md:mb-8">
        Thông tin cá nhân
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body items-center text-center gap-3">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary text-primary-content
                           flex items-center justify-center text-2xl md:text-3xl font-bold ring-4 ring-primary/10"
                aria-hidden="true"
              >
                {avatarInitial}
              </div>
              <div className="min-w-0 w-full">
                <h2 className="font-headline-md text-lg md:text-xl font-bold truncate">
                  {user?.fullName || "—"}
                </h2>
                <p className="text-sm text-base-content/60 break-all">{user?.email || "—"}</p>
              </div>
              <p className="text-xs text-base-content/50">
                Email chỉ dùng để đăng nhập, không thể thay đổi tại đây.
              </p>
            </div>
          </div>
        </section>

        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body gap-4">
              <h2 className="card-title text-lg">Cập nhật thông tin</h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="form-control w-full min-w-0">
                  <label htmlFor="profile-email" className="label py-1">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className="input input-bordered w-full"
                    value={user?.email || ""}
                    disabled
                    readOnly
                    aria-readonly="true"
                  />
                </div>

                <div className="form-control w-full min-w-0">
                  <label htmlFor="profile-fullname" className="label py-1">
                    <span className="label-text font-semibold">Họ và tên</span>
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    className="input input-bordered w-full"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-control w-full min-w-0">
                  <label htmlFor="profile-phone" className="label py-1">
                    <span className="label-text font-semibold">Số điện thoại</span>
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    className="input input-bordered w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="0912 345 678"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      {" "}Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body gap-4">
              <h2 className="card-title text-lg">Đổi mật khẩu</h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="form-control w-full min-w-0">
                  <label htmlFor="current-password" className="label py-1">
                    <span className="label-text font-semibold">Mật khẩu hiện tại</span>
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    className={`input input-bordered w-full ${wrongCurrentPassword ? "input-error" : ""}`}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    aria-invalid={wrongCurrentPassword ? "true" : undefined}
                  />
                  {wrongCurrentPassword && (
                    <p className="mt-1 text-sm text-error" role="alert">
                      Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại.
                    </p>
                  )}
                </div>

                <div className="form-control w-full min-w-0">
                  <label htmlFor="new-password" className="label py-1">
                    <span className="label-text font-semibold">Mật khẩu mới</span>
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className="input input-bordered w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <p className="mt-1 text-xs text-base-content/50">Tối thiểu 6 ký tự.</p>
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary w-full sm:w-auto"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      {" "}Đang đổi...
                    </>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
