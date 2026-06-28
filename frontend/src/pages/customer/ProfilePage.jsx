import { useState, useEffect } from "react";
import { useMe, useUpdateProfile, useChangePassword } from "../../features/users/hooks/useUsers";

export function ProfilePage() {
  const { data: user, isLoading, isError } = useMe();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");
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

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    updateProfileMutation.mutate({ fullName, phone }, {
      onSuccess: () => {
        setSuccessMessage("Cập nhật thông tin thành công!");
      },
      onError: (err) => {
        setErrorMessage(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin.");
      }
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwdSuccess("");
    setPwdError("");
    changePasswordMutation.mutate({ currentPassword, newPassword }, {
      onSuccess: () => {
        setPwdSuccess("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
      },
      onError: (err) => {
        setPwdError(err?.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.");
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (isError) {
    return <div className="p-8 text-error">Có lỗi xảy ra khi tải thông tin cá nhân.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

      <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Cập nhật thông tin</h2>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="form-control">
              <label htmlFor="profile-email" className="label"><span className="label-text">Email</span></label>
              <input id="profile-email" type="text" className="input input-bordered" value={user?.email || ""} disabled />
            </div>

            <div className="form-control">
              <label htmlFor="profile-fullname" className="label"><span className="label-text">Họ và tên</span></label>
              <input
                id="profile-fullname"
                type="text"
                className="input input-bordered"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="profile-phone" className="label"><span className="label-text">Số điện thoại</span></label>
              <input
                id="profile-phone"
                type="text"
                className="input input-bordered"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Đổi mật khẩu</h2>
          {pwdSuccess && <div className="alert alert-success">{pwdSuccess}</div>}
          {pwdError && <div className="alert alert-error">{pwdError}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="form-control">
              <label htmlFor="current-password" className="label"><span className="label-text">Mật khẩu hiện tại</span></label>
              <input
                id="current-password"
                type="password"
                className="input input-bordered"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="new-password" className="label"><span className="label-text">Mật khẩu mới</span></label>
              <input
                id="new-password"
                type="password"
                className="input input-bordered"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
