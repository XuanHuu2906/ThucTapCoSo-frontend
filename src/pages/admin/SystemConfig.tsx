import { useEffect, useState } from "react";
import { Settings, Save, AlertCircle } from "lucide-react";
import api, { unwrapResponse } from "@/services/api";
import toast from "react-hot-toast";

type ConfigItem = {
  key: string;
  value: any;
  description: string;
};

export default function SystemConfig() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Define keys that should be parsed as arrays
  const ARRAY_KEYS = ["HIGH_LEVEL_POSITIONS", "DEPARTMENTS", "JOB_TITLES"];

  const fetchConfigs = () => {
    setIsLoading(true);
    api.get("/config")
      .then((res) => {
        const data = unwrapResponse(res);
        setConfigs(data.map((c: any) => {
          let parsedValue = c.value;
          if (ARRAY_KEYS.includes(c.key)) {
            try {
              parsedValue = JSON.parse(c.value).join(", ");
            } catch {
              parsedValue = c.value;
            }
          }
          return {
            key: c.key,
            value: parsedValue,
            description: c.description || "",
          };
        }));
      })
      .catch(() => toast.error("Không thể tải cấu hình hệ thống"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleConfigChange = (key: string, newValue: string) => {
    setConfigs(configs.map(c => c.key === key ? { ...c, value: newValue } : c));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = configs.map(c => {
        let valueToSave: any = c.value;
        if (ARRAY_KEYS.includes(c.key)) {
          // Split by comma and trim to make array
          valueToSave = c.value.split(",").map((s: string) => s.trim()).filter((s: string) => s);
        }
        return {
          key: c.key,
          value: valueToSave,
          description: c.description
        };
      });

      await api.put("/config", { configs: payload });
      toast.success("Lưu cấu hình thành công!");
      fetchConfigs(); // reload
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Cấu hình hệ thống</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 disabled:opacity-50"
        >
          <Save size={16} /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-6 text-slate-600 dark:text-slate-400">
          <Settings size={20} />
          <p className="text-sm">Thay đổi các tham số hệ thống. Với danh sách, vui lòng ngăn cách bằng dấu phẩy (,).</p>
        </div>

        <div className="space-y-6 max-w-3xl">
          {configs.map((config) => (
            <div key={config.key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-50 mb-1">
                {config.key}
              </label>
              <p className="text-xs text-slate-500 mb-3">{config.description}</p>
              
              {ARRAY_KEYS.includes(config.key) ? (
                <textarea
                  value={config.value}
                  onChange={(e) => handleConfigChange(config.key, e.target.value)}
                  className="w-full h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Vị trí 1, Vị trí 2, Vị trí 3..."
                />
              ) : (
                <input
                  type="text"
                  value={config.value}
                  onChange={(e) => handleConfigChange(config.key, e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              )}
            </div>
          ))}

          {configs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-slate-500">
              <AlertCircle size={32} className="mb-2" />
              <p>Không tìm thấy cấu hình nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
