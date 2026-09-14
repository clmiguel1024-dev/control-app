import React, { useState, useEffect, useMemo, useRef } from "react";
import { Package, Send, ShoppingCart, Clock, BarChart3, Plus, X, ChevronRight, Download, Upload } from "lucide-react";

const COLORS = {
  bg: "#12141a",
  surface: "#1b1e27",
  card: "#20242e",
  border: "#2b3040",
  text: "#eef0f4",
  textMuted: "#8b909c",
  textFaint: "#5f6470",
  accent: "#c98a3e",
  paid: "#4f9d8a",
  paidSoft: "#1c2b28",
  pending: "#c1573f",
  pendingSoft: "#2c1e1c",
  partial: "#c9a23e",
  partialSoft: "#2b2418",
};

const PRODUCTOS = {
  B: { label: "Producto B", color: "#c98a3e" },
  G: { label: "Producto G", color: "#4f9d8a" },
  W: { label: "Producto W", color: "#7b83c4" },
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
function todayISO() { return new Date().toISOString().slice(0, 10); }
function fmtMoney(n) { return (Number(n) || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }); }
function fmtDate(iso) { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y.slice(2)}`; }

async function loadKey(key, fallback) {
  try {
    const res = localStorage.getItem(key);
    return res !== null ? JSON.parse(res) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error guardando", key, e);
  }
}

function Dot({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

function StatusChip({ status }) {
  const map = {
    pagado: { label: "Pagado", color: COLORS.paid, bg: COLORS.paidSoft },
    parcial: { label: "Parcial", color: COLORS.partial, bg: COLORS.partialSoft },
    pendiente: { label: "Pendiente", color: COLORS.pending, bg: COLORS.pendingSoft },
    "sin definir": { label: "Sin definir", color: COLORS.textFaint, bg: "#1e212a" },
  };
  const s = map[status] || map.pendiente;
  return <span style={{ color: s.color, background: s.bg, fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>{s.label}</span>;
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 6, display: "block" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = { width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 12px", color: COLORS.text, fontSize: 15, outline: "none" };
function TextInput(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function Select(props) { return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }

function EntitySelect({ value, onChange, options, onAdd, placeholder }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  if (adding) {
    return (
      <div className="flex gap-2">
        <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
        <button type="button" onClick={() => { if (name.trim()) { onAdd(name.trim()); setName(""); setAdding(false); } }} style={{ background: COLORS.accent, color: "#1a1408", borderRadius: 10, padding: "0 14px", fontWeight: 600 }}>Guardar</button>
        <button type="button" onClick={() => setAdding(false)} style={{ color: COLORS.textMuted, padding: "0 8px" }}><X size={18} /></button>
      </div>
    );
  }
  return (
    <Select value={value || ""} onChange={(e) => { if (e.target.value === "__new__") setAdding(true); else onChange(e.target.value); }}>
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (<option key={o.id} value={o.id}>{o.nombre}</option>))}
      <option value="__new__">+ Agregar nuevo</option>
    </Select>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", background: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, border: `1px solid ${COLORS.border}`, padding: "18px 18px 28px" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ color: COLORS.text, fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ color: COLORS.textMuted, background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ width: "100%", background: disabled ? COLORS.border : COLORS.accent, color: disabled ? COLORS.textFaint : "#1a1408", fontWeight: 700, fontSize: 15, padding: "13px", borderRadius: 12, marginTop: 6, border: "none", cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function CaptureCard({ icon: Icon, label, sub, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "16px",
        marginBottom: 12,
        textAlign: "left",
        cursor: "pointer",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: color + "22",
          display: "flex",
          alignItems: "center",
          justify: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={21} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: COLORS.text, fontWeight: 600, fontSize: 15 }}>{label}</div>
        <div style={{ color: COLORS.textFaint, fontSize: 12.5, marginTop: 1 }}>{sub}</div>
      </div>
      <ChevronRight size={18} color={COLORS.textFaint} style={{ flexShrink: 0 }} />
    </button>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("capturar");
  const [compras, setCompras] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [empacadores, setEmpacadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formOpen, setFormOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [historialFilter, setHistorialFilter] = useState("todos");

  const fileInputRef = useRef(null);

  const loadAllData = async () => {
    const [c, e, v, em, cl] = await Promise.all([
      loadKey("compras", []),
      loadKey("entregas", []),
      loadKey("ventas", []),
      loadKey("empacadores", []),
      loadKey("clientes", []),
    ]);
    setCompras(c);
    setEntregas(e);
    setVentas(v);
    setEmpacadores(em);
    setClientes(cl);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const addEmpacador = async (nombre) => {
    const item = { id: uid(), nombre };
    const next = [...empacadores, item];
    setEmpacadores(next);
    await saveKey("empacadores", next);
    return item;
  };

  const addCliente = async (nombre) => {
    const item = { id: uid(), nombre };
    const next = [...clientes, item];
    setClientes(next);
    await saveKey("clientes", next);
    return item;
  };

  const upsert = async (kind, entry) => {
    const map = { compra: [compras, setCompras, "compras"], entrega: [entregas, setEntregas, "entregas"], venta: [ventas, setVentas, "ventas"] };
    const [list, setList, key] = map[kind];
    const exists = list.some((x) => x.id === entry.id);
    const next = exists ? list.map((x) => (x.id === entry.id ? entry : x)) : [entry, ...list];
    setList(next);
    await saveKey(key, next);
  };

  // Exportar datos a JSON
  const exportBackup = () => {
    const backupData = { compras, entregas, ventas, empacadores, clientes, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respaldo_control_${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar datos desde JSON
  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.compras && data.entregas && data.ventas) {
          await saveKey("compras", data.compras || []);
          await saveKey("entregas", data.entregas || []);
          await saveKey("ventas", data.ventas || []);
          await saveKey("empacadores", data.empacadores || []);
          await saveKey("clientes", data.clientes || []);
          await loadAllData();
          alert("Respaldo restaurado correctamente.");
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const empName = (id) => empacadores.find((e) => e.id === id)?.nombre || "—";
  const cliName = (id) => clientes.find((c) => c.id === id)?.nombre || "—";

  const historialItems = useMemo(() => {
    const items = [
      ...compras.map((x) => ({ ...x, tipo: "compra" })),
      ...entregas.map((x) => ({ ...x, tipo: "entrega" })),
      ...ventas.map((x) => ({ ...x, tipo: "venta" })),
    ];
    items.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
    return historialFilter === "todos" ? items : items.filter((x) => x.tipo === historialFilter);
  }, [compras, entregas, ventas, historialFilter]);

  const resumen = useMemo(() => {
    const porProducto = {};
    Object.keys(PRODUCTOS).forEach((p) => {
      porProducto[p] = { kgComprado: 0, montoComprado: 0, kgEntregado: 0, piezasObtenidas: 0, piezasVendidas: 0, ingresoVentas: 0 };
    });
    compras.forEach((c) => {
      if (porProducto[c.producto]) {
        porProducto[c.producto].kgComprado += Number(c.kilos) || 0;
        porProducto[c.producto].montoComprado += Number(c.precioTotal) || 0;
      }
    });
    let porPagarEmpacadores = 0;
    const porEmpacador = {};
    entregas.forEach((e) => {
      if (porProducto[e.producto]) {
        porProducto[e.producto].kgEntregado += Number(e.kilosEntregados) || 0;
        porProducto[e.producto].piezasObtenidas += Number(e.piezasObtenidas) || 0;
      }
      const aPagar = Number(e.montoAPagar) || 0;
      const pagado = Number(e.montoPagado) || 0;
      porPagarEmpacadores += Math.max(aPagar - pagado, 0);
      if (!porEmpacador[e.empacadorId]) porEmpacador[e.empacadorId] = { kg: 0, piezas: 0, aPagar: 0, pagado: 0 };
      porEmpacador[e.empacadorId].kg += Number(e.kilosEntregados) || 0;
      porEmpacador[e.empacadorId].piezas += Number(e.piezasObtenidas) || 0;
      porEmpacador[e.empacadorId].aPagar += aPagar;
      porEmpacador[e.empacadorId].pagado += pagado;
    });
    let porCobrarClientes = 0;
    const porCliente = {};
    ventas.forEach((v) => {
      const total = (Number(v.piezas) || 0) * (Number(v.precioUnitario) || 0);
      const cobrado = Number(v.montoCobrado) || 0;
      if (porProducto[v.producto]) {
        porProducto[v.producto].piezasVendidas += Number(v.piezas) || 0;
        porProducto[v.producto].ingresoVentas += total;
      }
      porCobrarClientes += Math.max(total - cobrado, 0);
      if (!porCliente[v.clienteId]) porCliente[v.clienteId] = { piezas: 0, total: 0, cobrado: 0 };
      porCliente[v.clienteId].piezas += Number(v.piezas) || 0;
      porCliente[v.clienteId].total += total;
      porCliente[v.clienteId].cobrado += cobrado;
    });
    return { porProducto, porEmpacador, porCliente, porPagarEmpacadores, porCobrarClientes };
  }, [compras, entregas, ventas]);

  const closeForm = () => { setFormOpen(null); setEditing(null); };

  if (loading) return <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: COLORS.textMuted }}>Cargando…</span></div>;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 84 }}>
        <div style={{ padding: "22px 18px 6px" }}>
          <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700 }}>Control</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {Object.entries(PRODUCTOS).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "3px 9px 3px 7px" }}>
                <Dot color={v.color} />
                <span style={{ color: COLORS.textMuted, fontSize: 11.5 }}>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {tab === "capturar" && (
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ color: COLORS.textFaint, fontSize: 11 }}>Por cobrar</div>
                <div style={{ color: COLORS.text, fontSize: 17, fontWeight: 700, marginTop: 2 }}>{fmtMoney(resumen.porCobrarClientes)}</div>
              </div>
              <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ color: COLORS.textFaint, fontSize: 11 }}>Por pagar</div>
                <div style={{ color: COLORS.text, fontSize: 17, fontWeight: 700, marginTop: 2 }}>{fmtMoney(resumen.porPagarEmpacadores)}</div>
              </div>
            </div>
            <CaptureCard icon={Package} label="Compra" sub="Registrar compra de kilos" color={COLORS.accent} onClick={() => setFormOpen("compra")} />
            <CaptureCard icon={Send} label="Entrega a empacar" sub="Kilos entregados a un empacador" color="#4f9d8a" onClick={() => setFormOpen("entrega")} />
            <CaptureCard icon={ShoppingCart} label="Venta" sub="Piezas vendidas a un cliente" color="#7b83c4" onClick={() => setFormOpen("venta")} />
          </div>
        )}

        {tab === "historial" && (
          <div style={{ padding: "12px 16px 0" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
              {[["todos", "Todos"], ["compra", "Compras"], ["entrega", "Entregas"], ["venta", "Ventas"]].map(([k, label]) => (
                <button key={k} type="button" onClick={() => setHistorialFilter(k)} style={{ background: historialFilter === k ? COLORS.accent : COLORS.card, color: historialFilter === k ? "#1a1408" : COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "6px 13px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{label}</button>
              ))}
            </div>
            {historialItems.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14, textAlign: "center", padding: "40px 0" }}>Aún no hay movimientos.</div>}
            {historialItems.map((item) => (
              <HistorialRow key={item.id} item={item} empName={empName} cliName={cliName} onEdit={() => { setEditing(item); setFormOpen(item.tipo); }} />
            ))}
          </div>
        )}

        {tab === "resumen" && (
          <div>
            <Resumen resumen={resumen} empacadores={empacadores} clientes={clientes} />
            
            {/* SECCIÓN DE RESPALDO DE DATOS */}
            <div style={{ padding: "0 16px", marginTop: 24 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>Copia de seguridad</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={exportBackup} style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px", color: COLORS.text, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
                  <Download size={16} color={COLORS.accent} /> Exportar JSON
                </button>
                <button type="button" onClick={() => fileInputRef.current.click()} style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px", color: COLORS.text, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
                  <Upload size={16} color={COLORS.paid} /> Importar JSON
                </button>
                <input type="file" ref={fileInputRef} onChange={importBackup} accept=".json" style={{ display: "none" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 40 }}>
        <div style={{ maxWidth: 480, width: "100%", display: "flex", margin: "0 auto" }}>
          {[["capturar", "Capturar", Plus], ["historial", "Historial", Clock], ["resumen", "Resumen", BarChart3]].map(([k, label, Icon]) => (
            <button key={k} type="button" onClick={() => setTab(k)} style={{ flex: 1, padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer" }}>
              <Icon size={19} color={tab === k ? COLORS.accent : COLORS.textFaint} />
              <span style={{ fontSize: 11, color: tab === k ? COLORS.accent : COLORS.textFaint, fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {formOpen === "compra" && <CompraForm initial={editing} onClose={closeForm} onSave={(e) => upsert("compra", e).then(closeForm)} />}
      {formOpen === "entrega" && <EntregaForm initial={editing} empacadores={empacadores} onAddEmpacador={addEmpacador} onClose={closeForm} onSave={(e) => upsert("entrega", e).then(closeForm)} />}
      {formOpen === "venta" && <VentaForm initial={editing} clientes={clientes} onAddCliente={addCliente} onClose={closeForm} onSave={(e) => upsert("venta", e).then(closeForm)} />}
    </div>
  );
}

function HistorialRow({ item, empName, cliName, onEdit }) {
  const prod = PRODUCTOS[item.producto] || { color: COLORS.accent };
  let title, meta, right, status;
  if (item.tipo === "compra") {
    title = "Compra"; meta = `${item.kilos} kg`; right = fmtMoney(item.precioTotal); status = null;
  } else if (item.tipo === "entrega") {
    title = `Entrega · ${empName(item.empacadorId)}`;
    meta = `${item.kilosEntregados} kg entregados${item.piezasObtenidas ? ` · ${item.piezasObtenidas} pz` : ""}`;
    right = item.montoAPagar ? fmtMoney(item.montoAPagar) : "—";
    const aPagar = Number(item.montoAPagar) || 0;
    const pagado = Number(item.montoPagado) || 0;
    status = !item.montoAPagar ? "sin definir" : pagado <= 0 ? "pendiente" : pagado >= aPagar ? "pagado" : "parcial";
  } else {
    title = `Venta · ${cliName(item.clienteId)}`;
    meta = `${item.piezas} pz × ${fmtMoney(item.precioUnitario)}`;
    const total = (Number(item.piezas) || 0) * (Number(item.precioUnitario) || 0);
    right = fmtMoney(total);
    const cobrado = Number(item.montoCobrado) || 0;
    status = cobrado <= 0 ? "pendiente" : cobrado >= total ? "pagado" : "parcial";
  }
  return (
    <button type="button" onClick={onEdit} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 13px", marginBottom: 10, textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <Dot color={prod.color} size={9} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ color: COLORS.textFaint, fontSize: 12, marginTop: 2 }}>{fmtDate(item.fecha)} · {meta}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: COLORS.text, fontSize: 14, fontWeight: 700 }}>{right}</div>
        {status && <div style={{ marginTop: 4 }}><StatusChip status={status} /></div>}
      </div>
    </button>
  );
}

function ProductoSelect({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Object.entries(PRODUCTOS).map(([k, v]) => (
        <button key={k} type="button" onClick={() => onChange(k)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${value === k ? v.color : COLORS.border}`, background: value === k ? v.color + "1a" : COLORS.surface, color: value === k ? v.color : COLORS.textMuted, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Dot color={v.color} />{k}
        </button>
      ))}
    </div>
  );
}

function CompraForm({ initial, onClose, onSave }) {
  const [fecha, setFecha] = useState(initial?.fecha || todayISO());
  const [producto, setProducto] = useState(initial?.producto || "B");
  const [kilos, setKilos] = useState(initial?.kilos ?? "");
  const [precioTotal, setPrecioTotal] = useState(initial?.precioTotal ?? "");
  const precioKg = kilos && precioTotal ? Number(precioTotal) / Number(kilos) : null;
  const valid = fecha && producto && Number(kilos) > 0 && Number(precioTotal) > 0;
  return (
    <Sheet title={initial ? "Editar compra" : "Nueva compra"} onClose={onClose}>
      <Field label="Fecha"><TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
      <Field label="Producto"><ProductoSelect value={producto} onChange={setProducto} /></Field>
      <Field label="Kilos comprados"><TextInput type="number" inputMode="decimal" value={kilos} onChange={(e) => setKilos(e.target.value)} placeholder="0" /></Field>
      <Field label="Precio total pagado"><TextInput type="number" inputMode="decimal" value={precioTotal} onChange={(e) => setPrecioTotal(e.target.value)} placeholder="0" /></Field>
      {precioKg && <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: -8, marginBottom: 12 }}>Precio por kg: <span style={{ color: COLORS.text }}>{fmtMoney(precioKg)}</span></div>}
      <PrimaryButton disabled={!valid} onClick={() => onSave({ id: initial?.id || uid(), fecha, producto, kilos: Number(kilos), precioTotal: Number(precioTotal) })}>Guardar compra</PrimaryButton>
    </Sheet>
  );
}

function EntregaForm({ initial, empacadores, onAddEmpacador, onClose, onSave }) {
  const [fecha, setFecha] = useState(initial?.fecha || todayISO());
  const [producto, setProducto] = useState(initial?.producto || "B");
  const [empacadorId, setEmpacadorId] = useState(initial?.empacadorId || "");
  const [kilosEntregados, setKilosEntregados] = useState(initial?.kilosEntregados ?? "");
  const [piezasObtenidas, setPiezasObtenidas] = useState(initial?.piezasObtenidas ?? "");
  const [montoAPagar, setMontoAPagar] = useState(initial?.montoAPagar ?? "");
  const [montoPagado, setMontoPagado] = useState(initial?.montoPagado ?? "");
  const valid = fecha && producto && empacadorId && Number(kilosEntregados) > 0;
  return (
    <Sheet title={initial ? "Editar entrega" : "Nueva entrega a empacar"} onClose={onClose}>
      <Field label="Fecha"><TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
      <Field label="Producto"><ProductoSelect value={producto} onChange={setProducto} /></Field>
      <Field label="Empacador"><EntitySelect value={empacadorId} onChange={setEmpacadorId} options={empacadores} placeholder="Selecciona empacador" onAdd={async (nombre) => { const it = await onAddEmpacador(nombre); setEmpacadorId(it.id); }} /></Field>
      <Field label="Kilos entregados"><TextInput type="number" inputMode="decimal" value={kilosEntregados} onChange={(e) => setKilosEntregados(e.target.value)} placeholder="0" /></Field>
      <Field label="Piezas recibidas"><TextInput type="number" inputMode="numeric" value={piezasObtenidas} onChange={(e) => setPiezasObtenidas(e.target.value)} placeholder="Opcional" /></Field>
      <Field label="Monto a pagar por el trabajo"><TextInput type="number" inputMode="decimal" value={montoAPagar} onChange={(e) => setMontoAPagar(e.target.value)} placeholder="Opcional" /></Field>
      <Field label="Monto ya pagado"><TextInput type="number" inputMode="decimal" value={montoPagado} onChange={(e) => setMontoPagado(e.target.value)} placeholder="0" /></Field>
      <PrimaryButton disabled={!valid} onClick={() => onSave({ id: initial?.id || uid(), fecha, producto, empacadorId, kilosEntregados: Number(kilosEntregados), piezasObtenidas: piezasObtenidas === "" ? null : Number(piezasObtenidas), montoAPagar: montoAPagar === "" ? null : Number(montoAPagar), montoPagado: montoPagado === "" ? 0 : Number(montoPagado) })}>Guardar entrega</PrimaryButton>
    </Sheet>
  );
}

function VentaForm({ initial, clientes, onAddCliente, onClose, onSave }) {
  const [fecha, setFecha] = useState(initial?.fecha || todayISO());
  const [producto, setProducto] = useState(initial?.producto || "B");
  const [clienteId, setClienteId] = useState(initial?.clienteId || "");
  const [piezas, setPiezas] = useState(initial?.piezas ?? "");
  const [precioUnitario, setPrecioUnitario] = useState(initial?.precioUnitario ?? "");
  const [montoCobrado, setMontoCobrado] = useState(initial?.montoCobrado ?? "");
  const total = piezas && precioUnitario ? Number(piezas) * Number(precioUnitario) : 0;
  const valid = fecha && producto && clienteId && Number(piezas) > 0 && Number(precioUnitario) > 0;
  return (
    <Sheet title={initial ? "Editar venta" : "Nueva venta"} onClose={onClose}>
      <Field label="Fecha"><TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
      <Field label="Producto"><ProductoSelect value={producto} onChange={setProducto} /></Field>
      <Field label="Cliente"><EntitySelect value={clienteId} onChange={setClienteId} options={clientes} placeholder="Selecciona cliente" onAdd={async (nombre) => { const it = await onAddCliente(nombre); setClienteId(it.id); }} /></Field>
      <Field label="Piezas"><TextInput type="number" inputMode="numeric" value={piezas} onChange={(e) => setPiezas(e.target.value)} placeholder="0" /></Field>
      <Field label="Precio unitario"><TextInput type="number" inputMode="decimal" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} placeholder="0" /></Field>
      {total > 0 && <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: -8, marginBottom: 12 }}>Total: <span style={{ color: COLORS.text, fontWeight: 700 }}>{fmtMoney(total)}</span></div>}
      <Field label="Monto ya cobrado"><TextInput type="number" inputMode="decimal" value={montoCobrado} onChange={(e) => setMontoCobrado(e.target.value)} placeholder="0" /></Field>
      <PrimaryButton disabled={!valid} onClick={() => onSave({ id: initial?.id || uid(), fecha, producto, clienteId, piezas: Number(piezas), precioUnitario: Number(precioUnitario), montoCobrado: montoCobrado === "" ? 0 : Number(montoCobrado) })}>Guardar venta</PrimaryButton>
    </Sheet>
  );
}

function Resumen({ resumen, empacadores, clientes }) {
  const empName = (id) => empacadores.find((e) => e.id === id)?.nombre || "—";
  const cliName = (id) => clientes.find((c) => c.id === id)?.nombre || "—";
  return (
    <div style={{ padding: "12px 16px 0" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ color: COLORS.textFaint, fontSize: 11 }}>Por cobrar</div>
          <div style={{ color: COLORS.pending, fontSize: 17, fontWeight: 700, marginTop: 2 }}>{fmtMoney(resumen.porCobrarClientes)}</div>
        </div>
        <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ color: COLORS.textFaint, fontSize: 11 }}>Por pagar</div>
          <div style={{ color: COLORS.pending, fontSize: 17, fontWeight: 700, marginTop: 2 }}>{fmtMoney(resumen.porPagarEmpacadores)}</div>
        </div>
      </div>

      <div style={{ color: COLORS.textMuted, fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>Por producto</div>
      {Object.entries(resumen.porProducto).map(([k, d]) => (
        <div key={k} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "13px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <Dot color={PRODUCTOS[k].color} size={9} />
            <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{PRODUCTOS[k].label}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 6, fontSize: 13, color: COLORS.textMuted }}>
            <span>Comprado: <b style={{ color: COLORS.text }}>{d.kgComprado} kg</b></span>
            <span>Entregado: <b style={{ color: COLORS.text }}>{d.kgEntregado} kg</b></span>
            <span>Piezas obt.: <b style={{ color: COLORS.text }}>{d.piezasObtenidas}</b></span>
            <span>Piezas vend.: <b style={{ color: COLORS.text }}>{d.piezasVendidas}</b></span>
            <span>Rendim.: <b style={{ color: COLORS.text }}>{d.kgEntregado ? (d.piezasObtenidas / d.kgEntregado).toFixed(1) : "—"} pz/kg</b></span>
            <span>Ingreso: <b style={{ color: COLORS.text }}>{fmtMoney(d.ingresoVentas)}</b></span>
          </div>
        </div>
      ))}

      <div style={{ color: COLORS.textMuted, fontSize: 12.5, fontWeight: 600, margin: "18px 0 10px" }}>Por empacador</div>
      {Object.keys(resumen.porEmpacador).length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 13 }}>Sin entregas aún.</div>}
      {Object.entries(resumen.porEmpacador).map(([id, d]) => {
        const pendiente = Math.max(d.aPagar - d.pagado, 0);
        return (
          <div key={id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{empName(id)}</span>
              <span style={{ color: pendiente > 0 ? COLORS.pending : COLORS.paid, fontSize: 13, fontWeight: 700 }}>
                {pendiente > 0 ? `Debe ${fmtMoney(pendiente)}` : "Al día"}
              </span>
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 12.5 }}>
              {d.kg} kg entregados · {d.piezas} piezas · {d.kg ? (d.piezas / d.kg).toFixed(1) : "—"} pz/kg
            </div>
          </div>
        );
      })}

      <div style={{ color: COLORS.textMuted, fontSize: 12.5, fontWeight: 600, margin: "18px 0 10px" }}>Por cliente</div>
      {Object.keys(resumen.porCliente).length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 13 }}>Sin ventas aún.</div>}
      {Object.entries(resumen.porCliente).map(([id, d]) => {
        const porCobrar = Math.max(d.total - d.cobrado, 0);
        return (
          <div key={id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{cliName(id)}</span>
              <span style={{ color: porCobrar > 0 ? COLORS.pending : COLORS.paid, fontSize: 13, fontWeight: 700 }}>
                {porCobrar > 0 ? `Por cobrar ${fmtMoney(porCobrar)}` : "Al día"}
              </span>
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 12.5 }}>
              {d.piezas} piezas · Total: {fmtMoney(d.total)} · Cobrado: {fmtMoney(d.cobrado)}
            </div>
          </div>
        );
      })}
    </div>
  );
}