import { useEffect, useState } from "react";

  const productName = (key) => key?.startsWith("AVY-")
    ? "AutoVideo AI"
    : key?.startsWith("BRP-") ? "Beautiful Reup" : "Auto Scene";

export default function Home() {
  const [keys, setKeys] = useState([]);
  const [form, setForm] = useState({ key: "", time: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadKeys = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error("Không tải được dữ liệu");
      const data = await res.json();
      setKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi tải danh sách key");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ key: "", time: "", name: "" });
    setEditingKey(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.key || !form.time) {
      setError("Vui lòng nhập đầy đủ Key và Ngày hết hạn (time).");
      return;
    }
    try {
      setLoading(true);
      const method = editingKey ? "PUT" : "POST";
      const res = await fetch("/api/keys", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi lưu dữ liệu");
      }
      setSuccess(editingKey ? "Đã cập nhật key" : "Đã thêm key mới");
      await loadKeys();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (k) => {
    setForm(k);
    setEditingKey(k.key);
    setSuccess("");
    setError("");
  };

  const handleDelete = async (key) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá key này?")) return;
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const res = await fetch(`/api/keys?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi xoá key");
      }
      setSuccess("Đã xoá key");
      await loadKeys();
    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Minimax Key Manager
            </h1>
            <p className="text-slate-400 text-sm">
              Web quản lý key online cho tool Minimax Premium. API JSON:{" "}
              <code className="bg-slate-900 px-2 py-1 rounded text-xs">
                /api/keys
              </code>
            </p>
            <p className="text-slate-400 text-sm mt-1">
              API xác thực Auto Scene Alternator:{" "}
              <code className="bg-slate-900 px-2 py-1 rounded text-xs">
                /api/license/validate
              </code>
            </p>
          </div>
          <button
            onClick={loadKeys}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition"
          >
            🔄 Reload
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600 transition"
          >
            Đăng xuất
          </button>
        </header>

        <main className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          {/* Form */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-5">
            <h2 className="text-lg font-semibold mb-3">
              {editingKey ? "Cập nhật key" : "Thêm key mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Key (CPU KEY)
                </label>
                <input
                  name="key"
                  value={form.key}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                    placeholder="ASE-..., AVY-... hoặc BRP-..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Ngày hết hạn (dd/mm/yyyy)
                </label>
                <input
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  placeholder="VD: 31/12/2025"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Tên khách (tuỳ chọn)
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  placeholder="Tên khách hàng"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {editingKey ? "💾 Lưu thay đổi" : "➕ Thêm key"}
                </button>
                {editingKey && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Huỷ chỉnh sửa
                  </button>
                )}
                {loading && (
                  <span className="text-xs text-slate-400">
                    Đang xử lý...
                  </span>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400 mt-1">⚠ {error}</p>
              )}
              {success && (
                <p className="text-xs text-emerald-400 mt-1">✅ {success}</p>
              )}
            </form>

            <div className="mt-5 border-t border-slate-800 pt-4 text-xs text-slate-500 space-y-1">
              <p>
                • Tool desktop chỉ gửi một CPU KEY đã băm tới{" "}
                <code>/api/license/validate</code> bằng POST; không tải danh sách key.
              </p>
              <p>
                • Ngày hết hạn dùng định dạng <code>dd/mm/yyyy</code> và còn hiệu lực
                đến hết ngày theo múi giờ Việt Nam.
              </p>
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Danh sách key</h2>
              <span className="text-xs text-slate-400">
                Tổng: {keys.length}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Key
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Sản phẩm
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Hết hạn
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Tên
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {keys.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-center text-xs text-slate-500"
                      >
                        Chưa có key nào.
                      </td>
                    </tr>
                  )}
                  {keys.map((k, idx) => (
                    <tr key={k.key ?? idx}>
                      <td className="px-3 py-2 align-top text-xs text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-top font-mono text-xs break-all">
                        {k.key}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        {productName(k.key)}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        {k.time}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        {k.name}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-xs">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(k)}
                            className="rounded-full bg-sky-500/90 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-sky-400"
                          >
                            ✏ Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(k.key)}
                            className="rounded-full bg-rose-500/90 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-rose-400"
                          >
                            🗑 Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
