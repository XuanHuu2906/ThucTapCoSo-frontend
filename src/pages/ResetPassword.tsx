import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LockKeyhole, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";

type PageState = "form" | "loading" | "success" | "error";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pageState, setPageState] = useState<PageState>("form");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!token) {
      setErrorMessage("Link không hợp lệ.");
      return;
    }

    setPageState("loading");
    setErrorMessage("");

    try {
      await authService.resetPassword(token, password);
      setPageState("success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
      setErrorMessage(msg);
      setPageState("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 min-h-[70vh]">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Quay lại đăng nhập
        </Link>
        <div className="mt-4 w-full rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none sm:p-10 border border-slate-100 dark:border-slate-800">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              {pageState === "success" ? "Đặt lại mật khẩu thành công!" : "Đặt lại mật khẩu"}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {pageState === "success"
                ? "Mật khẩu của bạn đã được cập nhật."
                : "Nhập mật khẩu mới cho tài khoản của bạn."}
            </p>
          </div>

          {pageState === "success" ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pageState === "loading"}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 focus:outline-none active:scale-[0.98] disabled:opacity-60"
              >
                {pageState === "loading" ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
