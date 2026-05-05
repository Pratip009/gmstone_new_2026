"use client";
import { useEffect, useState, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { SHAPES, COLORS, CLARITIES, CERTIFICATIONS } from "@/models/Product";
import Link from "next/link";

/* ── Inline design tokens ─────────────────────────────────────────────────── */
const css = `

  .ap-root { font-family: 'DM Sans', sans-serif; color: #0f172a; background: #f8f7f4; min-height: 100vh; padding: 2rem; }
  .ap-root * { box-sizing: border-box; }

  /* typography */
  .ap-display { font-family: 'Playfair Display', serif; font-size: 1.75rem; color: #0f172a; letter-spacing: -0.02em; }
  .ap-breadcrumb { font-size: 0.8rem; color: #64748b; font-weight: 500; text-decoration: none; letter-spacing: 0.04em; text-transform: uppercase; }
  .ap-breadcrumb:hover { color: #b45309; }

  /* card */
  .ap-card { background: #fff; border: 1px solid #e2e0da; border-radius: 12px; }
  .ap-card-inner { padding: 1.75rem; }

  /* form section title */
  .ap-section-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #0f172a; margin: 0 0 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e0da; }

  /* label */
  .ap-label { display: block; font-size: 0.72rem; font-weight: 600; color: #475569; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .ap-label-hint { font-size: 0.7rem; color: #94a3b8; font-weight: 400; text-transform: none; letter-spacing: 0; margin-left: 0.4rem; }

  /* inputs */
  .ap-input { width: 100%; height: 40px; padding: 0 0.875rem; border: 1.5px solid #d1cec7; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #0f172a; background: #fafaf8; transition: border-color 0.15s, box-shadow 0.15s; outline: none; }
  .ap-input:focus { border-color: #b45309; box-shadow: 0 0 0 3px rgba(180,83,9,0.1); background: #fff; }
  .ap-input::placeholder { color: #94a3b8; }
  .ap-textarea { height: auto; padding: 0.625rem 0.875rem; resize: none; line-height: 1.6; }
  select.ap-input { cursor: pointer; }
  .ap-input:disabled { background: #f1f0ec; color: #94a3b8; cursor: not-allowed; border-color: #e2e0da; }

  /* buttons */
  .ap-btn-primary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0 1.25rem; height: 40px; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.825rem; font-weight: 600; letter-spacing: 0.03em; cursor: pointer; transition: background 0.15s, transform 0.1s; }
  .ap-btn-primary:hover { background: #1e293b; }
  .ap-btn-primary:active { transform: scale(0.98); }
  .ap-btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
  .ap-btn-primary.full { width: 100%; justify-content: center; height: 44px; font-size: 0.9rem; background: #b45309; }
  .ap-btn-primary.full:hover { background: #92400e; }

  .ap-btn-ghost { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0 1.1rem; height: 40px; background: transparent; color: #475569; border: 1.5px solid #d1cec7; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.825rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .ap-btn-ghost:hover { border-color: #b45309; color: #b45309; background: #fef3c7; }

  .ap-btn-danger { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0 1.1rem; height: 40px; background: transparent; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .ap-btn-danger:hover { background: #fef2f2; border-color: #dc2626; }
  .ap-btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

  /* grid form */
  .ap-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
  @media (max-width: 640px) { .ap-form-grid { grid-template-columns: 1fr; } .ap-col-2 { grid-column: span 1 !important; } }
  .ap-col-2 { grid-column: span 2; }

  /* pill group */
  .ap-pill-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 0.4rem; padding: 0.75rem; background: #f8f7f4; border: 1.5px solid #d1cec7; border-radius: 8px; }
  .ap-pill { padding: 4px 11px; border-radius: 20px; border: 1.5px solid #d1cec7; font-size: 0.75rem; font-weight: 500; color: #475569; background: #fff; cursor: pointer; transition: all 0.12s; font-family: 'DM Sans', sans-serif; }
  .ap-pill:hover { border-color: #b45309; color: #b45309; }
  .ap-pill.active { background: #fef3c7; border-color: #d97706; color: #92400e; font-weight: 600; }
  .ap-pill-selected { font-size: 0.7rem; color: #b45309; font-weight: 600; margin-left: 0.5rem; }

  /* filter bar */
  .ap-filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 0.75rem; align-items: end; }
  @media (max-width: 900px) { .ap-filter-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .ap-filter-grid { grid-template-columns: 1fr; } }

  /* search input special */
  .ap-search-wrap { position: relative; }
  .ap-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; pointer-events: none; }
  .ap-search-wrap .ap-input { padding-left: 2.25rem; }

  /* table */
  .ap-table { width: 100%; border-collapse: collapse; font-size: 0.855rem; }
  .ap-table thead { background: #f8f7f4; border-bottom: 2px solid #e2e0da; }
  .ap-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.07em; text-transform: uppercase; white-space: nowrap; }
  .ap-table th.sortable { cursor: pointer; user-select: none; }
  .ap-table th.sortable:hover { color: #b45309; }
  .ap-table td { padding: 0.85rem 1rem; color: #1e293b; border-bottom: 1px solid #f1f0ec; vertical-align: middle; }
  .ap-table tbody tr:hover td { background: #fafaf8; }
  .ap-table tbody tr:last-child td { border-bottom: none; }
  .ap-table .td-name { font-weight: 600; color: #0f172a; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ap-table .td-price { font-weight: 700; color: #b45309; font-variant-numeric: tabular-nums; }
  .ap-table .td-muted { color: #64748b; font-size: 0.8rem; }

  /* badges */
  .ap-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .ap-badge.active { background: #dcfce7; color: #15803d; }
  .ap-badge.inactive { background: #f1f5f9; color: #64748b; }

  /* row action buttons */
  .ap-row-actions { display: flex; align-items: center; gap: 6px; }
  .ap-deactivate { font-size: 0.75rem; color: #94a3b8; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; white-space: nowrap; }
  .ap-deactivate:hover { color: #d97706; background: #fef3c7; }
  .ap-delete-row { font-size: 0.75rem; color: #94a3b8; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
  .ap-delete-row:hover { color: #dc2626; background: #fef2f2; }

  /* filter summary */
  .ap-filter-summary { display: flex; align-items: center; justify-content: space-between; margin-top: 0.875rem; padding-top: 0.875rem; border-top: 1px solid #e2e0da; }
  .ap-filter-count { font-size: 0.8rem; color: #475569; }
  .ap-filter-count strong { color: #0f172a; }
  .ap-clear-btn { font-size: 0.78rem; color: #b45309; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; padding: 0; }
  .ap-clear-btn:hover { color: #92400e; text-decoration: underline; }

  /* pagination */
  .ap-pagination { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1rem; border-top: 1px solid #e2e0da; }
  .ap-page-info { font-size: 0.78rem; color: #64748b; }
  .ap-page-btns { display: flex; gap: 4px; }
  .ap-page-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1.5px solid #d1cec7; border-radius: 6px; font-size: 0.78rem; font-weight: 500; color: #475569; background: #fff; cursor: pointer; transition: all 0.12s; font-family: 'DM Sans', sans-serif; }
  .ap-page-btn:hover:not(:disabled) { border-color: #b45309; color: #b45309; }
  .ap-page-btn.current { background: #0f172a; border-color: #0f172a; color: #fff; font-weight: 700; }
  .ap-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* empty state */
  .ap-empty { text-align: center; padding: 4rem 1rem; }
  .ap-empty-icon { font-size: 2rem; margin-bottom: 0.75rem; }
  .ap-empty-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #0f172a; margin-bottom: 0.4rem; }
  .ap-empty-sub { font-size: 0.85rem; color: #64748b; }

  /* alert */
  .ap-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.85rem; color: #15803d; font-weight: 500; margin-bottom: 1rem; }
  .ap-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.85rem; color: #dc2626; font-weight: 500; }

  /* responsive table wrapper */
  .ap-table-wrap { overflow-x: auto; }

  /* top bar */
  .ap-topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap; }
  .ap-topbar-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

  /* form collapse animation */
  .ap-form-outer { margin-bottom: 1.5rem; }

  /* stats row */
  .ap-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.875rem; margin-bottom: 1.5rem; }
  .ap-stat { background: #fff; border: 1px solid #e2e0da; border-radius: 10px; padding: 1rem 1.25rem; }
  .ap-stat-label { font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 0.35rem; }
  .ap-stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; line-height: 1; }
  .ap-stat-value.amber { color: #b45309; }
  .ap-stat-value.green { color: #15803d; }

  /* ── Confirmation Modal ──────────────────────────────────────────────────── */
  .ap-modal-backdrop {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(15,23,42,0.45);
    backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: ap-fade-in 0.15s ease;
  }
  @keyframes ap-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .ap-modal {
    background: #fff; border-radius: 14px; padding: 2rem;
    max-width: 420px; width: 100%;
    box-shadow: 0 24px 48px rgba(15,23,42,0.18), 0 4px 12px rgba(15,23,42,0.08);
    animation: ap-slide-up 0.18s ease;
  }
  @keyframes ap-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .ap-modal-icon { width: 48px; height: 48px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 1.25rem; }
  .ap-modal-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: #0f172a; margin: 0 0 0.5rem; }
  .ap-modal-body { font-size: 0.875rem; color: #475569; line-height: 1.6; margin: 0 0 1.5rem; }
  .ap-modal-body strong { color: #dc2626; }
  .ap-modal-input-wrap { margin-bottom: 1.25rem; }
  .ap-modal-input-label { display: block; font-size: 0.72rem; font-weight: 600; color: #475569; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .ap-modal-confirm-input { width: 100%; height: 38px; padding: 0 0.75rem; border: 1.5px solid #d1cec7; border-radius: 7px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #0f172a; background: #fafaf8; outline: none; transition: border-color 0.15s; }
  .ap-modal-confirm-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
  .ap-modal-actions { display: flex; gap: 0.625rem; }
  .ap-modal-cancel { flex: 1; height: 40px; background: #f8f7f4; border: 1.5px solid #d1cec7; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.825rem; font-weight: 500; color: #475569; cursor: pointer; transition: all 0.15s; }
  .ap-modal-cancel:hover { border-color: #94a3b8; background: #f1f0ec; }
  .ap-modal-confirm-btn { flex: 1; height: 40px; background: #dc2626; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.825rem; font-weight: 600; color: #fff; cursor: pointer; transition: background 0.15s; }
  .ap-modal-confirm-btn:hover { background: #b91c1c; }
  .ap-modal-confirm-btn:disabled { background: #fca5a5; cursor: not-allowed; }
`;

/* ── Interfaces ───────────────────────────────────────────────────────────── */
interface Product {
  _id: string;
  name: string;
  price: number;
  shape: string | string[];
  size: number;
  color: string | string[];
  clarity: string | string[];
  stock: number;
  isActive: boolean;
  category?: { _id: string; name: string } | string;
}
interface Category {
  _id: string;
  name: string;
  subcategories: Subcategory[];
}
interface Subcategory {
  _id: string;
  name: string;
  category: string;
}

const EMPTY_FORM = {
  name: "",
  category: "",
  subcategory: "",
  price: "",
  shapes: [] as string[],
  size: "",
  colors: [] as string[],
  clarities: [] as string[],
  certifications: [] as string[],
  stock: "",
  images: "",
  description: "",
};

/* ── ConfirmModal ─────────────────────────────────────────────────────────── */
function ConfirmDeleteModal({
  mode,
  productName,
  totalCount,
  onConfirm,
  onCancel,
  loading,
}: {
  mode: "single" | "all";
  productName?: string;
  totalCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const required = mode === "all" ? "DELETE ALL" : "";
  const canConfirm = mode === "single" || confirmText === required;

  return (
    <div className="ap-modal-backdrop" onClick={onCancel}>
      <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ap-modal-icon">🗑</div>
        {mode === "all" ? (
          <>
            <h2 className="ap-modal-title">Delete All Products</h2>
            <p className="ap-modal-body">
              This will permanently delete{" "}
              <strong>all {totalCount} products</strong> from the catalogue. This
              action <strong>cannot be undone</strong>.
            </p>
            <div className="ap-modal-input-wrap">
              <label className="ap-modal-input-label">
                Type <strong>DELETE ALL</strong> to confirm
              </label>
              <input
                className="ap-modal-confirm-input"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE ALL"
                autoFocus
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="ap-modal-title">Delete Product</h2>
            <p className="ap-modal-body">
              Permanently delete{" "}
              <strong style={{ color: "#0f172a" }}>{productName}</strong>? This
              action <strong>cannot be undone</strong>.
            </p>
          </>
        )}
        <div className="ap-modal-actions">
          <button className="ap-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="ap-modal-confirm-btn"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
          >
            {loading
              ? "Deleting…"
              : mode === "all"
                ? "Delete All Products"
                : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PillGroup ────────────────────────────────────────────────────────────── */
function PillGroup({
  options,
  selected,
  onChange,
  label,
  required,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (val: string[]) => void;
  label: string;
  required?: boolean;
}) {
  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((x) => x !== opt)
        : [...selected, opt],
    );
  return (
    <div className="ap-col-2">
      <label className="ap-label">
        {label}
        {required && " *"}
        {selected.length > 0 && (
          <span className="ap-pill-selected">{selected.join(", ")}</span>
        )}
      </label>
      <div className="ap-pill-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`ap-pill${selected.includes(opt) ? " active" : ""}`}
          >
            {selected.includes(opt) ? "✓ " : ""}
            {opt}
          </button>
        ))}
      </div>
      {required && selected.length === 0 && (
        <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.35rem" }}>
          Select at least one
        </p>
      )}
    </div>
  );
}

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc";

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function AdminProductsPage() {
  const { apiFetch } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcatLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterShape, setFilterShape] = useState("");
  const [filterClarity, setFilterClarity] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Modal state
  const [modal, setModal] = useState<
    | { mode: "all" }
    | { mode: "single"; id: string; name: string }
    | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        apiFetch("/api/admin/products"),
        apiFetch("/api/categories?withSubcategories=true"),
      ]);
      setProducts(pData.data || []);
      let cats: Category[] = [];
      const raw = cData;
      if (Array.isArray(raw?.data)) cats = raw.data;
      else if (Array.isArray(raw)) cats = raw;
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryChange = (id: string) => {
    setForm((prev) => ({ ...prev, category: id, subcategory: "" }));
    setSubcategories(categories.find((c) => c._id === id)?.subcategories ?? []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filterCategory)
      list = list.filter((p) => {
        const id = typeof p.category === "object" ? p.category?._id : p.category;
        return id === filterCategory;
      });
    if (filterStatus !== "all")
      list = list.filter((p) => (filterStatus === "active" ? p.isActive : !p.isActive));
    if (filterShape)
      list = list.filter((p) =>
        Array.isArray(p.shape) ? (p.shape as string[]).includes(filterShape) : p.shape === filterShape,
      );
    if (filterClarity)
      list = list.filter((p) =>
        Array.isArray(p.clarity) ? (p.clarity as string[]).includes(filterClarity) : p.clarity === filterClarity,
      );
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [products, search, filterCategory, filterStatus, filterShape, filterClarity, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, filterCategory, filterStatus, filterShape, filterClarity]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  const SortArrow = ({ k }: { k: SortKey }) => (
    <span style={{ opacity: sortKey === k ? 1 : 0.3, marginLeft: 4 }}>
      {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.shapes.length === 0) { setError("Select at least one shape"); return; }
    if (form.colors.length === 0) { setError("Select at least one color"); return; }
    if (form.clarities.length === 0) { setError("Select at least one clarity"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      const { shapes, colors, clarities, certifications, images: rawImages, ...rest } = form;
      const payload = {
        ...rest,
        price: Number(form.price),
        size: Number(form.size),
        stock: Number(form.stock),
        shape: shapes, color: colors, clarity: clarities, certification: certifications,
        images: rawImages.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      await apiFetch("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
      setSuccess("Product created successfully.");
      setForm(EMPTY_FORM); setSubcategories([]); setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Deactivate (soft delete)
  const handleDeactivate = async (id: string) => {
    await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  // Hard delete single product
  const handleDeleteSingle = async () => {
    if (modal?.mode !== "single") return;
    setModalLoading(true);
    try {
      await apiFetch(`/api/admin/products/${modal.id}`, { method: "DELETE" });
      setSuccess(`"${modal.name}" deleted successfully.`);
      setModal(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      setModal(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Hard delete all products
  const handleDeleteAll = async () => {
    setModalLoading(true);
    try {
      // Call bulk-delete endpoint; fall back to sequential if not available
      try {
        await apiFetch("/api/admin/products", { method: "DELETE" });
      } catch {
        // Fallback: delete sequentially
        await Promise.all(
          products.map((p) =>
            apiFetch(`/api/admin/products/${p._id}`, { method: "DELETE" })
          )
        );
      }
      setSuccess(`All ${products.length} products deleted successfully.`);
      setModal(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete all products");
      setModal(null);
    } finally {
      setModalLoading(false);
    }
  };

  const selectedCatName = categories.find((c) => c._id === form.category)?.name ?? "";
  const hasFilters = !!(search || filterCategory || filterStatus !== "all" || filterShape || filterClarity);
  const activeCount = products.filter((p) => p.isActive).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="ap-root">
      <style>{css}</style>

      {/* Confirmation Modal */}
      {modal && (
        <ConfirmDeleteModal
          mode={modal.mode}
          productName={modal.mode === "single" ? modal.name : undefined}
          totalCount={products.length}
          onConfirm={modal.mode === "all" ? handleDeleteAll : handleDeleteSingle}
          onCancel={() => setModal(null)}
          loading={modalLoading}
        />
      )}

      {/* Top bar */}
      <div className="ap-topbar">
        <div>
          <Link href="/admin" className="ap-breadcrumb">← Admin</Link>
          <h1 className="ap-display" style={{ marginTop: "0.35rem" }}>Product Catalogue</h1>
        </div>
        <div className="ap-topbar-actions">
          {products.length > 0 && (
            <button
              className="ap-btn-danger"
              onClick={() => setModal({ mode: "all" })}
            >
              🗑 Delete All
            </button>
          )}
          <button className="ap-btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "✕ Cancel" : "+ Add Product"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ap-stats">
        <div className="ap-stat">
          <div className="ap-stat-label">Total Products</div>
          <div className="ap-stat-value">{products.length}</div>
        </div>
        <div className="ap-stat">
          <div className="ap-stat-label">Active</div>
          <div className="ap-stat-value green">{activeCount}</div>
        </div>
        <div className="ap-stat">
          <div className="ap-stat-label">Inactive</div>
          <div className="ap-stat-value">{products.length - activeCount}</div>
        </div>
        <div className="ap-stat">
          <div className="ap-stat-label">Inventory Value</div>
          <div className="ap-stat-value amber">${totalValue.toLocaleString()}</div>
        </div>
      </div>

      {success && <div className="ap-success">✓ {success}</div>}

      {/* Add Product Form */}
      {showForm && (
        <div className="ap-form-outer">
          <div className="ap-card">
            <div className="ap-card-inner">
              <h2 className="ap-section-title">New Product</h2>
              <form onSubmit={handleSubmit}>
                <div className="ap-form-grid">
                  <div className="ap-col-2">
                    <label className="ap-label">Product Name *</label>
                    <input
                      className="ap-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. 1.5ct Round Brilliant Diamond"
                      required
                    />
                  </div>

                  <div>
                    <label className="ap-label">
                      Category *
                      <span className="ap-label-hint">({categories.length} categories)</span>
                    </label>
                    <select
                      className="ap-input"
                      value={form.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      required
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="ap-label">
                      Subcategory
                      {form.category && (
                        <span className="ap-label-hint">
                          {subcatLoading ? "loading…" : `${subcategories.length} in ${selectedCatName}`}
                        </span>
                      )}
                    </label>
                    <select
                      className="ap-input"
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                      disabled={!form.category || subcatLoading}
                    >
                      <option value="">
                        {!form.category ? "Select category first" : subcategories.length === 0 ? "No subcategories" : "Select subcategory…"}
                      </option>
                      {subcategories.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="ap-label">Price (USD) *</label>
                    <input type="number" className="ap-input" value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00" required min="0" step="0.01" />
                  </div>

                  <div>
                    <label className="ap-label">Size (Carat) *</label>
                    <input type="number" className="ap-input" value={form.size}
                      onChange={(e) => setForm({ ...form, size: e.target.value })}
                      placeholder="0.00" required min="0.01" step="0.01" />
                  </div>

                  <div>
                    <label className="ap-label">Stock Quantity *</label>
                    <input type="number" className="ap-input" value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="0" required min="0" />
                  </div>

                  <PillGroup label="Shape" options={SHAPES} selected={form.shapes}
                    onChange={(v) => setForm({ ...form, shapes: v })} required />
                  <PillGroup label="Color Grade" options={COLORS} selected={form.colors}
                    onChange={(v) => setForm({ ...form, colors: v })} required />
                  <PillGroup label="Clarity Grade" options={CLARITIES} selected={form.clarities}
                    onChange={(v) => setForm({ ...form, clarities: v })} required />
                  <PillGroup label="Certification" options={CERTIFICATIONS} selected={form.certifications}
                    onChange={(v) => setForm({ ...form, certifications: v })} />

                  <div className="ap-col-2">
                    <label className="ap-label">Image URLs <span className="ap-label-hint">one per line</span></label>
                    <textarea className="ap-input ap-textarea" rows={3} value={form.images}
                      onChange={(e) => setForm({ ...form, images: e.target.value })}
                      placeholder="https://cdn.example.com/diamond-1.jpg" />
                  </div>

                  <div className="ap-col-2">
                    <label className="ap-label">Description</label>
                    <textarea className="ap-input ap-textarea" rows={3} value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Optional product description…" />
                  </div>

                  {error && <div className="ap-col-2 ap-error">⚠ {error}</div>}

                  <div className="ap-col-2">
                    <button type="submit" disabled={loading} className="ap-btn-primary full">
                      {loading ? "Saving…" : "Create Product"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="ap-card" style={{ marginBottom: "1rem" }}>
        <div className="ap-card-inner" style={{ paddingBottom: hasFilters ? "0.75rem" : "1.75rem" }}>
          <div className="ap-filter-grid">
            <div className="ap-search-wrap">
              <span className="ap-search-icon">⌕</span>
              <input className="ap-input" placeholder="Search products…" value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="ap-input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="ap-input" value={filterShape} onChange={(e) => setFilterShape(e.target.value)}>
              <option value="">All Shapes</option>
              {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="ap-input" value={filterClarity} onChange={(e) => setFilterClarity(e.target.value)}>
              <option value="">All Clarities</option>
              {CLARITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="ap-input" value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {hasFilters && (
            <div className="ap-filter-summary">
              <span className="ap-filter-count">
                Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
              </span>
              <button className="ap-clear-btn" onClick={() => {
                setSearch(""); setFilterCategory(""); setFilterStatus("all");
                setFilterShape(""); setFilterClarity("");
              }}>
                Clear all filters ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("name")}>Name <SortArrow k="name" /></th>
                <th className="sortable" onClick={() => handleSort("price")}>Price <SortArrow k="price" /></th>
                <th>Shape</th>
                <th>Color</th>
                <th>Clarity</th>
                <th className="sortable" onClick={() => handleSort("stock")}>Stock <SortArrow k="stock" /></th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p._id}>
                  <td className="td-name">{p.name}</td>
                  <td className="td-price">${p.price.toLocaleString()}</td>
                  <td className="td-muted">
                    {Array.isArray(p.shape) ? (p.shape as string[]).join(", ") : p.shape}
                  </td>
                  <td className="td-muted">
                    {Array.isArray(p.color) ? (p.color as string[]).join(", ") : p.color}
                  </td>
                  <td className="td-muted">
                    {Array.isArray(p.clarity) ? (p.clarity as string[]).join(", ") : p.clarity}
                  </td>
                  <td style={{ fontWeight: 600, color: p.stock < 5 ? "#dc2626" : "#0f172a" }}>
                    {p.stock}
                  </td>
                  <td>
                    <span className={`ap-badge ${p.isActive ? "active" : "inactive"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="ap-row-actions">
                      <button
                        className="ap-deactivate"
                        onClick={() => handleDeactivate(p._id)}
                        title="Deactivate (soft delete)"
                      >
                        Deactivate
                      </button>
                      <button
                        className="ap-delete-row"
                        onClick={() => setModal({ mode: "single", id: p._id, name: p.name })}
                        title="Permanently delete this product"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginated.length === 0 && (
          <div className="ap-empty">
            <div className="ap-empty-icon">◇</div>
            <div className="ap-empty-title">
              {hasFilters ? "No matching products" : "No products yet"}
            </div>
            <div className="ap-empty-sub">
              {hasFilters ? "Try adjusting your filters" : "Add your first product above"}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="ap-pagination">
            <span className="ap-page-info">
              Page {page} of {totalPages} · {filtered.length} results
            </span>
            <div className="ap-page-btns">
              <button className="ap-page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="ap-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} className={`ap-page-btn${p === page ? " current" : ""}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                );
              })}
              <button className="ap-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              <button className="ap-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}