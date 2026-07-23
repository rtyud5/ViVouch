import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerPartner } from '../../features/auth/api/auth.api';

export function PartnerRegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    if (password !== form.get('confirmPassword')) return setError('Mật khẩu xác nhận không khớp.');
    const branchName = String(form.get('branchName') || '').trim();
    const branchAddress = String(form.get('branchAddress') || '').trim();
    if ((branchName && !branchAddress) || (!branchName && branchAddress)) {
      return setError('Tên và địa chỉ chi nhánh đầu tiên phải được nhập cùng nhau.');
    }
    setLoading(true);
    try {
      const result = await registerPartner({
        fullName: form.get('fullName'), email: form.get('email'), phone: form.get('phone') || null, password,
        businessName: form.get('businessName'), taxCode: form.get('taxCode'), representativeName: form.get('representativeName'),
        contactEmail: form.get('contactEmail') || form.get('email'), contactPhone: form.get('contactPhone') || form.get('phone') || null,
        address: form.get('address'),
        firstBranch: branchName ? { name: branchName, address: branchAddress, city: form.get('branchCity') || 'Hồ Chí Minh' } : undefined,
      });
      if (result.verificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(result.user.email)}`);
      } else {
        navigate('/login', { state: { message: 'Đã tạo hồ sơ đối tác. Hãy đăng nhập để theo dõi phê duyệt.' } });
      }
    } catch (requestError) { setError(requestError?.response?.data?.message || 'Không thể tạo hồ sơ đối tác.'); }
    finally { setLoading(false); }
  }
  return <main className="min-h-screen bg-base-200 p-4 py-10"><div className="card bg-base-100 shadow-xl max-w-3xl mx-auto"><div className="card-body">
    <h1 className="card-title text-2xl">Đăng ký đối tác ViVouch</h1><p className="text-sm text-base-content/60">Người đăng ký sẽ trở thành Partner Owner sau khi Admin duyệt hồ sơ.</p>
    {error && <div className="alert alert-error text-sm">{error}</div>}
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
      {[['fullName','Họ tên Owner'],['email','Email đăng nhập','email'],['phone','Số điện thoại'],['businessName','Tên doanh nghiệp'],['taxCode','Mã số thuế'],['representativeName','Người đại diện'],['contactEmail','Email liên hệ','email'],['contactPhone','Điện thoại liên hệ'],['address','Địa chỉ doanh nghiệp'],['branchName','Tên chi nhánh đầu tiên'],['branchAddress','Địa chỉ chi nhánh'],['branchCity','Thành phố']].map(([name,label,type='text']) => <label className={`form-control ${name==='address' ? 'md:col-span-2' : ''}`} key={name}><span className="label-text mb-1">{label}</span><input name={name} type={type} className="input input-bordered" required={!['contactEmail','contactPhone','branchName','branchAddress','branchCity'].includes(name)} /></label>)}
      <label className="form-control"><span className="label-text mb-1">Mật khẩu</span><input name="password" type="password" className="input input-bordered" minLength="8" required /></label>
      <label className="form-control"><span className="label-text mb-1">Xác nhận mật khẩu</span><input name="confirmPassword" type="password" className="input input-bordered" minLength="8" required /></label>
      <button className="btn btn-primary md:col-span-2" disabled={loading}>{loading ? <span className="loading loading-spinner" /> : 'Gửi hồ sơ đăng ký'}</button>
    </form><Link to="/login" className="btn btn-ghost btn-sm">Quay lại đăng nhập</Link>
  </div></div></main>;
}
