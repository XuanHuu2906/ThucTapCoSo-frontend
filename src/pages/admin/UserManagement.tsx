import { useEffect, useState } from "react";
import { Plus, Users, Mail, Shield, AlertCircle } from "lucide-react";
import api, { unwrapResponse } from "@/services/api";
import { userService } from "@/services";
import toast from "react-hot-toast";

type SystemUser = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  status: string;
};

const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin",
  Recruiter: "Chuyên viên TD",
  HiringManager: "Trưởng bộ phận",
  Director: "Giám đốc",
  Probationer: "Thử việc",
};

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Recruiter: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  HiringManager: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Director: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Probationer: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", role: "Recruiter", department: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ fullName: "", role: "Recruiter", department: "" });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [res, deptList] = await Promise.all([
        api.get("/users"),
        userService.getDepartments()
      ]);
      setUsers(unwrapResponse(res));
      setDepartments(deptList);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/users", formData);
      toast.success("Tạo người dùng thành công! Email thiết lập mật khẩu đã được gửi.");
      setShowCreateModal(false);
      setFormData({ fullName: "", email: "", role: "Recruiter", department: "" });
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await api.put(`/users/${userId}`, { status: newStatus });
      toast.success(`Đã ${newStatus === "Active" ? "mở khóa" : "khóa"} tài khoản`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setIsSubmitting(true);
    setError("");

    try {
      await api.put(`/users/${editingUserId}`, editFormData);
      toast.success("Cập nhật thông tin thành công!");
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = (userId: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          Bạn có chắc chắn muốn gửi email đặt lại mật khẩu cho người dùng này?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.post(`/users/${userId}/reset-password`);
                toast.success("Email thiết lập lại mật khẩu đã được gửi!");
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Lỗi khi gửi email đặt lại mật khẩu");
              }
            }}
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition shadow-sm"
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), { duration: 8000, position: "top-center" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Quản lý người dùng</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
        >
          <Plus size={16} /> Tạo người dùng
        </button>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <Users size={32} className="mb-2" />
            <p>Chưa có người dùng nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Phòng ban</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900 dark:text-slate-50">{user.fullName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] || ROLE_COLORS.Probationer}`}>
                      <Shield size={12} />
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {user.department || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {user.status === "Active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUserId(user.userId);
                          setEditFormData({
                            fullName: user.fullName,
                            role: user.role,
                            department: user.department || ""
                          });
                          setShowEditModal(true);
                        }}
                        className="text-xs font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.userId)}
                        disabled={user.status !== "Active"}
                        className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        Reset Pass
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.userId, user.status)}
                        disabled={currentUser?.userId === user.userId}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          user.status === "Active" 
                            ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20" 
                            : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {user.status === "Active" ? "Khóa" : "Mở khóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">Tạo người dùng mới</h2>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 mb-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Họ tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="email@congty.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="Recruiter">Chuyên viên Tuyển dụng</option>
                  <option value="HiringManager">Trưởng bộ phận</option>
                  <option value="Director">Giám đốc</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phòng ban</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">-- Chọn phòng ban (Nếu có) --</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition disabled:opacity-60"
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">Chỉnh sửa người dùng</h2>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 mb-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Họ tên</label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Vai trò</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="Recruiter">Chuyên viên Tuyển dụng</option>
                  <option value="HiringManager">Trưởng bộ phận</option>
                  <option value="Director">Giám đốc</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phòng ban</label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">-- Không phân phòng ban --</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition disabled:opacity-60"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
