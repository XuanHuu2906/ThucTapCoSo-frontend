import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BriefcaseBusiness, LockKeyhole, Mail, ArrowLeft, Send, Home } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"login" | "forgot">("login");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (view === "login") {
      navigate("/recruiter/dashboard");
    } else {
      setIsSent(true);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-50">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Trang chủ
        </Link>
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none sm:p-10 border border-slate-100 dark:border-slate-800 relative">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              {view === "login" ? "Chào mừng trở lại!" : "Khôi phục mật khẩu"}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {view === "login"
                ? "Vui lòng đăng nhập vào tài khoản của bạn."
                : "Nhập email của bạn để nhận liên kết đặt lại mật khẩu."}
            </p>
          </div>

          {isSent && view === "forgot" ? (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                <Send size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Đã gửi yêu cầu!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến <b>{email}</b>. Vui lòng kiểm tra hộp thư.</p>
              </div>
              <button
                onClick={() => { setView("login"); setIsSent(false); }}
                className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-blue-600 hover:text-blue-700 transition"
              >
                <ArrowLeft size={16} /> Quay lại đăng nhập
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              {view === "login" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-50 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 focus:outline-none active:scale-[0.98]"
              >
                {view === "login" ? "Đăng nhập ngay" : "Gửi yêu cầu khôi phục"}
              </button>

              {view === "forgot" && (
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="flex items-center justify-center gap-2 w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                >
                  <ArrowLeft size={14} /> Quay lại trang đăng nhập
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
