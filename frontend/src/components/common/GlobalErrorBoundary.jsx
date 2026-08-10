import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createSupportReference } from "../../utils/errorReference";

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, supportReference: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      supportReference: createSupportReference("UI"),
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-base-100 border border-base-200 rounded-3xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>

            <h1 className="text-2xl font-bold text-base-content mb-3">Đã xảy ra sự cố</h1>

            <p className="text-base-content/60 mb-4">
              Rất xin lỗi, ứng dụng vừa gặp lỗi không mong muốn. Đội ngũ kỹ thuật đã được thông báo. Bạn có thể thử tải lại trang hoặc quay về trang chủ.
            </p>

            {this.state.supportReference && (
              <div className="mb-8 rounded-2xl border border-base-200 bg-base-200/60 px-4 py-3 text-sm text-base-content/70">
                <p className="font-semibold text-base-content">Mã tham chiếu an toàn</p>
                <p className="font-mono text-xs mt-1 break-all">{this.state.supportReference}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn btn-primary rounded-full px-6 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Tải lại trang
              </button>
              <Link
                to="/"
                className="btn btn-outline rounded-full px-6 flex items-center gap-2"
              >
                <Home size={18} />
                Về trang chủ
              </Link>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 text-left bg-base-200 p-4 rounded-xl overflow-x-auto text-xs text-base-content/70">
                <p className="font-bold mb-1 text-error">{this.state.error.toString()}</p>
                <pre>{this.state.error.stack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
