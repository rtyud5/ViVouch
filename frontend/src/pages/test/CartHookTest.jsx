import { useState } from "react";
import { useCart } from "../../features/cart/hooks/useCart";
import { apiClient } from "../../services/apiClient";
import { useAuthStore } from "../../stores/authStore";

// ─── Login Panel (chỉ dùng cho trang test) ────────────────────────────────────
function LoginPanel({ onLoggedIn }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState("idle");
  const [errMsg, setErrMsg]     = useState("");

  async function handleLogin() {
    if (!email || !password) return;
    setStatus("pending");
    setErrMsg("");
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      useAuthStore.getState().setAuth({
        accessToken: data.data.accessToken,
        user: data.data.user,
      });
      setStatus("idle");
      onLoggedIn();
    } catch (err) {
      setStatus("error");
      setErrMsg(err.response?.data?.message ?? err.message);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
        padding: "32px 28px", width: 340, display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>🔐 Đăng nhập để test</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Dùng tài khoản CUSTOMER</p>
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="customer@example.com"
            style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 10px", fontSize: 14, outline: "none" }} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          <span style={{ color: "#6b7280", fontWeight: 500 }}>Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 10px", fontSize: 14, outline: "none" }} />
        </label>
        {errMsg && (
          <p style={{ margin: 0, fontSize: 13, color: "#ef4444", background: "#fee2e2", padding: "8px 10px", borderRadius: 6 }}>
            ✗ {errMsg}
          </p>
        )}
        <button onClick={handleLogin} disabled={status === "pending"}
          style={{ background: status === "pending" ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: 7, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {status === "pending" ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </div>
    </div>
  );
}

// ─── Wrapper: kiểm tra auth trước khi render CartHooksTest ───────────────────
export function CartHooksTestWrapper() {
  const accessToken = useAuthStore(s => s.accessToken);
  const [ready, setReady] = useState(!!accessToken);

  if (!ready) return <LoginPanel onLoggedIn={() => setReady(true)} />;
  return <CartHooksTest />;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────
function Badge({ count }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 24, height: 24, borderRadius: 12,
      background: count > 0 ? "#ef4444" : "#d1d5db",
      color: "#fff", fontSize: 12, fontWeight: 700, padding: "0 6px",
      transition: "background 0.2s",
    }}>
      {count}
    </span>
  );
}

function StatusTag({ status }) {
  const map = {
    idle:    { bg: "#f3f4f6", color: "#6b7280", label: "Chờ" },
    pending: { bg: "#fef9c3", color: "#854d0e", label: "Đang gọi…" },
    success: { bg: "#dcfce7", color: "#166534", label: "✓ Thành công" },
    error:   { bg: "#fee2e2", color: "#991b1b", label: "✗ Lỗi" },
  };
  const s = map[status] ?? map.idle;
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

function LogEntry({ entry }) {
  const color = entry.type === "error" ? "#fee2e2"
    : entry.type === "success" ? "#dcfce7"
    : "#f0f9ff";
  return (
    <div style={{
      padding: "6px 10px", borderRadius: 6, background: color,
      fontFamily: "monospace", fontSize: 12, lineHeight: 1.5,
      borderLeft: `3px solid ${entry.type === "error" ? "#ef4444" : entry.type === "success" ? "#22c55e" : "#3b82f6"}`,
    }}>
      <span style={{ opacity: 0.5, marginRight: 8 }}>{entry.time}</span>
      <strong>[{entry.action}]</strong>{" "}{entry.message}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
      padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#9ca3af", textTransform: "uppercase" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
      <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        style={{
          border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 10px",
          fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function Btn({ onClick, disabled, color = "#3b82f6", children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#e5e7eb" : color, color: disabled ? "#9ca3af" : "#fff",
        border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13,
        fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CartHooksTest() {
  const { cart, cartCount, cartTotal, isLoading, error, addToCart, updateQty, removeItem } = useCart();

  // inputs
  const [addVoucherId, setAddVoucherId]   = useState("");
  const [addQty, setAddQty]               = useState(1);
  const [updateItemId, setUpdateItemId]   = useState("");
  const [updateNewQty, setUpdateNewQty]   = useState(1);
  const [removeItemId, setRemoveItemId]   = useState("");

  // per-action status
  const [addStatus, setAddStatus]         = useState("idle");
  const [updateStatus, setUpdateStatus]   = useState("idle");
  const [removeStatus, setRemoveStatus]   = useState("idle");

  // activity log
  const [logs, setLogs] = useState([]);

  function pushLog(action, message, type = "info") {
    const time = new Date().toLocaleTimeString("vi-VN");
    setLogs(prev => [{ action, message, type, time }, ...prev].slice(0, 50));
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!addVoucherId) return;
    setAddStatus("pending");
    pushLog("ADD", `voucherId=${addVoucherId} qty=${addQty}`);
    try {
      await addToCart({ voucherId: addVoucherId, qty: addQty });
      setAddStatus("success");
      pushLog("ADD", `✓ Thêm thành công. cartCount mới sẽ cập nhật.`, "success");
    } catch (err) {
      setAddStatus("error");
      pushLog("ADD", `✗ ${err.message}`, "error");
    }
  }

  async function handleUpdate() {
    if (!updateItemId) return;
    setUpdateStatus("pending");
    pushLog("UPDATE", `itemId=${updateItemId} qty=${updateNewQty}`);
    try {
      await updateQty({ itemId: updateItemId, qty: updateNewQty });
      setUpdateStatus("success");
      pushLog("UPDATE", `✓ Cập nhật qty thành công.`, "success");
    } catch (err) {
      setUpdateStatus("error");
      pushLog("UPDATE", `✗ ${err.message}`, "error");
    }
  }

  async function handleRemove() {
    if (!removeItemId) return;
    setRemoveStatus("pending");
    pushLog("REMOVE", `itemId=${removeItemId}`);
    try {
      await removeItem(removeItemId);
      setRemoveStatus("success");
      pushLog("REMOVE", `✓ Đã xóa item.`, "success");
    } catch (err) {
      setRemoveStatus("error");
      pushLog("REMOVE", `✗ ${err.message}`, "error");
    }
  }

  // autofill helpers — click item row để điền id vào ô update/remove
  function fillUpdate(id, qty) {
    setUpdateItemId(id);
    setUpdateNewQty(qty);
  }
  function fillRemove(id) {
    setRemoveItemId(id);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc", padding: "32px 16px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>
              🛒 Cart Hooks — Test Page
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
              Gọi API thật · Xem kết quả trực tiếp · Click hàng để autofill
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>cartCount</span>
            <Badge count={cartCount} />
          </div>
        </div>

        {/* ── Trạng thái fetch ── */}
        <Section title="GET /cart — Trạng thái hiện tại">
          {isLoading && <p style={{ color: "#6b7280", margin: 0 }}>Đang tải…</p>}
          {error && (
            <p style={{ color: "#ef4444", margin: 0, fontFamily: "monospace", fontSize: 13 }}>
              ✗ {error.message}
            </p>
          )}
          {!isLoading && !error && (
            <>
              {/* cartTotal summary */}
              {cartTotal && (
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[
                    ["Unique items", cartTotal.totalUniqueItems],
                    ["Gốc",          `${(cartTotal.totalOriginalAmount ?? 0).toLocaleString()}đ`],
                    ["Tổng",         `${(cartTotal.totalAmount ?? 0).toLocaleString()}đ`],
                    ["Tiết kiệm",    `${(cartTotal.totalSavings ?? 0).toLocaleString()}đ`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Items table */}
              {cart?.items?.length === 0 ? (
                <p style={{ color: "#9ca3af", margin: 0, fontSize: 13 }}>Giỏ hàng trống.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6", color: "#9ca3af", fontSize: 11, textTransform: "uppercase" }}>
                      {["itemId", "voucherId", "qty", "autofill update", "autofill remove"].map(h => (
                        <th key={h} style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cart?.items?.map((item, i) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 ? "#fafafa" : "#fff" }}>
                        <td style={{ padding: "8px 8px", fontFamily: "monospace", fontWeight: 700 }}>{item.id}</td>
                        <td style={{ padding: "8px 8px", fontFamily: "monospace" }}>{item.voucherId}</td>
                        <td style={{ padding: "8px 8px", fontWeight: 700 }}>{item.qty}</td>
                        <td style={{ padding: "8px 8px" }}>
                          <button
                            onClick={() => fillUpdate(item.id, item.qty)}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer" }}
                          >
                            Điền vào Update
                          </button>
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          <button
                            onClick={() => fillRemove(item.id)}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: "1px solid #fca5a5", background: "#fff1f2", cursor: "pointer", color: "#ef4444" }}
                          >
                            Điền vào Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </Section>

        {/* ── 3 mutation panels ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>

          {/* ADD */}
          <Section title="POST /cart/items — Thêm sản phẩm">
            <Input label="voucherId" value={addVoucherId} onChange={setAddVoucherId} placeholder="Nhập voucherId" />
            <Input label="qty" type="number" value={addQty} onChange={v => setAddQty(Math.max(1, v))} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Btn onClick={handleAdd} disabled={!addVoucherId || addStatus === "pending"} color="#3b82f6">
                {addStatus === "pending" ? "Đang thêm…" : "Thêm vào giỏ"}
              </Btn>
              <StatusTag status={addStatus} />
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              Tip: thêm cùng voucherId 2 lần → qty cộng dồn, không tạo row mới.
            </p>
          </Section>

          {/* UPDATE */}
          <Section title="PATCH /cart/items/:id — Cập nhật qty">
            <Input label="itemId" value={updateItemId} onChange={setUpdateItemId} placeholder="Click 'Điền vào Update' ở bảng" />
            <Input label="qty mới" type="number" value={updateNewQty} onChange={v => setUpdateNewQty(Math.max(1, v))} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Btn onClick={handleUpdate} disabled={!updateItemId || updateStatus === "pending"} color="#8b5cf6">
                {updateStatus === "pending" ? "Đang cập nhật…" : "Cập nhật qty"}
              </Btn>
              <StatusTag status={updateStatus} />
            </div>
          </Section>

          {/* REMOVE */}
          <Section title="DELETE /cart/items/:id — Xóa sản phẩm">
            <Input label="itemId" value={removeItemId} onChange={setRemoveItemId} placeholder="Click 'Điền vào Remove' ở bảng" />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Btn onClick={handleRemove} disabled={!removeItemId || removeStatus === "pending"} color="#ef4444">
                {removeStatus === "pending" ? "Đang xóa…" : "Xóa item"}
              </Btn>
              <StatusTag status={removeStatus} />
            </div>
          </Section>

        </div>

        {/* ── Error test panel ── */}
        <Section title="Test lỗi — Voucher không hợp lệ">
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Nhập voucherId không tồn tại hoặc ở trạng thái DRAFT rồi bấm Thêm vào giỏ — kỳ vọng: status ✗ Lỗi, log hiển thị message từ backend.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn onClick={() => { setAddVoucherId("999999"); setAddQty(1); }} color="#f59e0b">
              Điền voucherId không tồn tại (999999)
            </Btn>
          </div>
        </Section>

        {/* ── Activity Log ── */}
        <Section title={`Activity Log (${logs.length})`}>
          {logs.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Chưa có hành động nào.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              {logs.map((l, i) => <LogEntry key={i} entry={l} />)}
            </div>
          )}
          {logs.length > 0 && (
            <button onClick={() => setLogs([])} style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", alignSelf: "flex-start" }}>
              Xóa log
            </button>
          )}
        </Section>

      </div>
    </div>
  );
}