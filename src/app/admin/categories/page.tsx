'use client';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import {
  Plus, Tag, Layers, CheckCircle2, AlertCircle,
  Search, Trash2, ChevronRight, FolderOpen, Folder, FileDown,
} from 'lucide-react';

interface Category    { _id: string; name: string; slug: string; }
interface Subcategory { _id: string; name: string; slug: string; category: { _id: string; name: string } }

export default function AdminCategoriesPage() {
  const { apiFetch } = useApi();
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCat,   setSelectedCat]   = useState<string | null>(null);

  // forms
  const [catName,  setCatName]  = useState('');
  const [catDesc,  setCatDesc]  = useState('');
  const [subName,  setSubName]  = useState('');
  const [subCat,   setSubCat]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [search,   setSearch]   = useState('');
  const [subSearch,setSubSearch]= useState('');

  // delete confirm
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [deletingSub, setDeletingSub] = useState<string | null>(null);

  const fetchAll = async () => {
    const [c, s] = await Promise.all([
      apiFetch('/api/admin/categories'),
      apiFetch('/api/admin/subcategories'),
    ]);
    const cats: Category[] = c.data || [];
    setCategories(cats);
    setSubcategories(s.data || []);
    if (!selectedCat && cats.length > 0) setSelectedCat(cats[0]._id);
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── PDF EXPORT ── */
  const generatePdf = () => {
    // Build HTML content for the PDF window
    const rows = categories.map(cat => {
      const subs = subcategories.filter(s => s.category._id === cat._id);
      const subRows = subs.length
        ? subs.map(s => `
            <tr class="sub-row">
              <td class="connector-cell">
                <span class="connector-line"></span>
                <span class="sub-dot"></span>
              </td>
              <td class="sub-name">${s.name}</td>
              <td class="slug-cell">${s.slug}</td>
              <td class="type-cell"><span class="badge badge-sub">Subcategory</span></td>
            </tr>`).join('')
        : `<tr class="sub-row empty-sub">
            <td class="connector-cell"></td>
            <td colspan="3" class="empty-text">No subcategories</td>
          </tr>`;

      return `
        <tr class="cat-row">
          <td class="icon-cell"><span class="cat-icon">◆</span></td>
          <td class="cat-name">${cat.name}</td>
          <td class="slug-cell">${cat.slug}</td>
          <td class="type-cell"><span class="badge badge-cat">Category</span></td>
        </tr>
        ${subRows}`;
    }).join('');

    const totalSubs = subcategories.length;
    const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Catalogue Structure</title>
<style>

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1714;
    padding: 48px 52px;
    font-size: 13px;
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-bottom: 28px;
    border-bottom: 1.5px solid #1a1714;
    margin-bottom: 32px;
  }
  .brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #c9a84c;
  }
  .title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    font-weight: 600;
    color: #1a1714;
    line-height: 1;
    margin-top: 4px;
  }
  .meta {
    text-align: right;
    font-size: 10.5px;
    color: #a09a90;
    line-height: 1.7;
  }
  .meta strong { color: #1a1714; font-weight: 600; }

  /* ── STATS ROW ── */
  .stats {
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
  }
  .stat-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .stat-pill.gold { background: #c9a84c18; border: 1px solid #c9a84c40; color: #8a6e24; }
  .stat-pill.blue { background: #7ab0c918; border: 1px solid #7ab0c940; color: #3a7d9a; }
  .stat-dot { width: 7px; height: 7px; border-radius: 50%; }
  .stat-dot.gold-dot { background: #c9a84c; }
  .stat-dot.blue-dot { background: #7ab0c9; }

  /* ── TABLE ── */
  table {
    width: 100%;
    border-collapse: collapse;
  }
  thead tr {
    background: #1a1714;
  }
  thead th {
    padding: 11px 14px;
    text-align: left;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #e8e0d0;
  }
  thead th:first-child { border-radius: 10px 0 0 10px; }
  thead th:last-child  { border-radius: 0 10px 10px 0; }

  /* category rows */
  .cat-row td {
    padding: 13px 14px 10px;
    border-bottom: 1px solid #f0ece4;
    background: #faf9f6;
  }
  .cat-row + .cat-row td { border-top: 8px solid #fff; }

  .icon-cell { width: 32px; }
  .cat-icon {
    color: #c9a84c;
    font-size: 9px;
    display: inline-block;
    margin-top: 1px;
  }
  .cat-name {
    font-weight: 600;
    font-size: 13.5px;
    color: #1a1714;
  }

  /* sub rows */
  .sub-row td {
    padding: 7px 14px 7px;
    border-bottom: 1px solid #f6f3ee;
    background: #fff;
  }
  .connector-cell {
    width: 32px;
    position: relative;
  }
  .connector-line {
    display: inline-block;
    width: 1px;
    height: 100%;
    background: #e2ddd5;
    margin-left: 5px;
    vertical-align: middle;
  }
  .sub-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #7ab0c9;
    margin-left: 2px;
    vertical-align: middle;
  }
  .sub-name {
    font-size: 12.5px;
    color: #3a3530;
    padding-left: 10px !important;
  }
  .empty-sub td { background: #fff; }
  .empty-text {
    font-size: 11px;
    color: #c8c2b8;
    font-style: italic;
    padding-left: 16px !important;
  }

  .slug-cell {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    color: #b0a99f;
    width: 180px;
  }
  .type-cell { width: 120px; }

  /* badges */
  .badge {
    display: inline-block;
    padding: 2.5px 9px;
    border-radius: 100px;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .badge-cat { background: #c9a84c18; color: #8a6e24; border: 1px solid #c9a84c30; }
  .badge-sub { background: #7ab0c918; color: #3a7d9a; border: 1px solid #7ab0c930; }

  /* ── FOOTER ── */
  .footer {
    margin-top: 36px;
    padding-top: 20px;
    border-top: 1px solid #ede9e1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9.5px;
    color: #c8c2b8;
  }
  .footer-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 600;
    color: #c9a84c;
    letter-spacing: 0.08em;
  }

  @media print {
    body { padding: 32px 40px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">Admin · Catalogue Report</div>
    <div class="title">Category Structure</div>
  </div>
  <div class="meta">
    <div>Generated on <strong>${now}</strong></div>
    <div>${categories.length} categories · ${totalSubs} subcategories</div>
  </div>
</div>

<div class="stats">
  <div class="stat-pill gold">
    <span class="stat-dot gold-dot"></span>
    ${categories.length} ${categories.length === 1 ? 'Category' : 'Categories'}
  </div>
  <div class="stat-pill blue">
    <span class="stat-dot blue-dot"></span>
    ${totalSubs} ${totalSubs === 1 ? 'Subcategory' : 'Subcategories'}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th></th>
      <th>Name</th>
      <th>Slug</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<div class="footer">
  <div class="footer-brand">Catalogue Admin</div>
  <div>Confidential · Internal use only</div>
</div>

<script>
  window.onload = () => { window.print(); }
<\/script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups to view the PDF.'); return; }
    win.document.write(html);
    win.document.close();
  };

  const flash = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  /* ── CREATE ── */
  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: catName, description: catDesc }),
      });
      flash('Category created', 'success');
      setCatName(''); setCatDesc('');
      fetchAll();
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Failed', 'error');
    } finally { setLoading(false); }
  };

  const createSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/admin/subcategories', {
        method: 'POST',
        body: JSON.stringify({ name: subName, categoryId: subCat }),
      });
      flash('Subcategory created', 'success');
      setSubName(''); setSubCat('');
      fetchAll();
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Failed', 'error');
    } finally { setLoading(false); }
  };

  /* ── DELETE ── */
  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      flash('Category deleted', 'success');
      if (selectedCat === id) setSelectedCat(null);
      setDeletingCat(null);
      fetchAll();
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Failed', 'error');
    } finally { setLoading(false); }
  };

  const deleteSubcategory = async (id: string) => {
    setLoading(true);
    try {
      await apiFetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' });
      flash('Subcategory deleted', 'success');
      setDeletingSub(null);
      fetchAll();
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Failed', 'error');
    } finally { setLoading(false); }
  };

  /* ── DERIVED ── */
  const filteredCats = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCatObj = categories.find(c => c._id === selectedCat);

  const visibleSubs = subcategories
    .filter(s => s.category._id === selectedCat)
    .filter(s =>
      !subSearch || s.name.toLowerCase().includes(subSearch.toLowerCase())
    );

  const subCount = (catId: string) =>
    subcategories.filter(s => s.category._id === catId).length;

  return (
    <div className="max-w-6xl font-['DM_Sans',sans-serif]">

      {/* ── Page header ── */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-[#c9a84c] mb-1">
            Catalogue Management
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[2.4rem] font-semibold text-[#1a1714] leading-none">
            Categories
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[0.72rem] text-[#a09a90]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
              {categories.length} categories
            </span>
            <span className="w-px h-3 bg-[#e2ddd5]" />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7ab0c9]" />
              {subcategories.length} subcategories
            </span>
          </div>
          <button
            onClick={generatePdf}
            disabled={categories.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ede9e1] bg-white text-[0.78rem] font-semibold text-[#1a1714] hover:border-[#c9a84c]/50 hover:bg-[#fdf9f0] hover:text-[#c9a84c] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
          >
            <FileDown size={14} strokeWidth={2} />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {msg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-[0.8rem] font-medium border
          ${msg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {msg.type === 'success'
            ? <CheckCircle2 size={14} strokeWidth={2} />
            : <AlertCircle size={14} strokeWidth={2} />}
          {msg.text}
        </div>
      )}

      {/* ── Three-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4">

        {/* ══ COL 1 — Category list ══ */}
        <div className="bg-white border border-[#ede9e1] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-[#f0ece4]">
            <p className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-[#a09a90] mb-3">
              Categories
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#faf9f6] border border-[#e8e3db]">
              <Search size={12} strokeWidth={1.8} className="text-[#c8c2b8]" />
              <input
                className="flex-1 bg-transparent text-[0.8rem] text-[#1a1714] placeholder:text-[#c8c2b8] outline-none"
                placeholder="Find category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <ul className="overflow-y-auto flex-1 py-1.5" style={{ maxHeight: '480px' }}>
            {filteredCats.length === 0 ? (
              <li className="px-4 py-8 text-center text-[0.75rem] text-[#c8c2b8]">
                {search ? 'No results.' : 'No categories yet.'}
              </li>
            ) : filteredCats.map(cat => {
              const isActive = selectedCat === cat._id;
              const count = subCount(cat._id);

              return (
                <li key={cat._id} className="px-2">
                  <div
                    className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 relative
                      ${isActive
                        ? 'bg-[#1a1714] shadow-sm'
                        : 'hover:bg-[#f7f5f1]'}`}
                    onClick={() => { setSelectedCat(cat._id); setSubSearch(''); }}
                  >
                    {/* folder icon */}
                    <span className={`flex-shrink-0 ${isActive ? 'text-[#c9a84c]' : 'text-[#c9a84c]/70'}`}>
                      {isActive
                        ? <FolderOpen size={15} strokeWidth={1.6} />
                        : <Folder size={15} strokeWidth={1.6} />}
                    </span>

                    <span className={`flex-1 text-[0.825rem] font-medium truncate
                      ${isActive ? 'text-white' : 'text-[#1a1714]'}`}>
                      {cat.name}
                    </span>

                    {/* sub count badge */}
                    {count > 0 && (
                      <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full
                        ${isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-[#c9a84c]/12 text-[#c9a84c]'}`}>
                        {count}
                      </span>
                    )}

                    {/* delete — shows on hover, hides when active */}
                    {!isActive && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeletingCat(cat._id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-[#c8c2b8] hover:text-red-400"
                      >
                        <Trash2 size={12} strokeWidth={1.8} />
                      </button>
                    )}

                    {isActive && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeletingCat(cat._id); }}
                        className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/10 transition-all"
                      >
                        <Trash2 size={12} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ══ COL 2 — Subcategory grid (filtered by selected cat) ══ */}
        <div className="bg-white border border-[#ede9e1] rounded-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-[#f0ece4] flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-[#a09a90] mb-0.5">
                Subcategories
              </p>
              {activeCatObj ? (
                <div className="flex items-center gap-1.5">
                  <ChevronRight size={11} strokeWidth={2} className="text-[#c9a84c]" />
                  <span className="text-[0.8rem] font-semibold text-[#1a1714]">{activeCatObj.name}</span>
                  <span className="text-[0.7rem] text-[#a09a90]">
                    · {visibleSubs.length} {visibleSubs.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              ) : (
                <p className="text-[0.75rem] text-[#c8c2b8]">Select a category</p>
              )}
            </div>

            {/* Sub search */}
            {activeCatObj && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#faf9f6] border border-[#e8e3db] w-52">
                <Search size={11} strokeWidth={1.8} className="text-[#c8c2b8]" />
                <input
                  className="flex-1 bg-transparent text-[0.78rem] text-[#1a1714] placeholder:text-[#c8c2b8] outline-none"
                  placeholder="Search…"
                  value={subSearch}
                  onChange={e => setSubSearch(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-4" style={{ maxHeight: '480px' }}>
            {!selectedCat ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-16">
                <div className="w-12 h-12 rounded-2xl bg-[#f7f5f1] border border-[#ede9e1] flex items-center justify-center">
                  <Layers size={20} strokeWidth={1.3} className="text-[#c8c2b8]" />
                </div>
                <p className="text-[0.78rem] text-[#c8c2b8]">
                  Select a category on the left<br />to view its subcategories.
                </p>
              </div>
            ) : visibleSubs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-16">
                <div className="w-12 h-12 rounded-2xl bg-[#f7f5f1] border border-[#ede9e1] flex items-center justify-center">
                  <Layers size={20} strokeWidth={1.3} className="text-[#c8c2b8]" />
                </div>
                <p className="text-[0.78rem] text-[#c8c2b8]">
                  {subSearch ? 'No results.' : 'No subcategories yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visibleSubs.map(sub => (
                  <div
                    key={sub._id}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-[#ede9e1] bg-[#faf9f6] hover:border-[#7ab0c9]/40 hover:bg-white transition-all duration-150"
                  >
                    {/* icon */}
                    <span className="w-7 h-7 rounded-lg bg-[#7ab0c9]/10 border border-[#7ab0c9]/20 flex items-center justify-center flex-shrink-0">
                      <Layers size={12} strokeWidth={1.6} className="text-[#7ab0c9]" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-[0.825rem] font-semibold text-[#1a1714] truncate">{sub.name}</p>
                      <p className="text-[0.65rem] font-mono text-[#c8c2b8] truncate">{sub.slug}</p>
                    </div>

                    {/* delete */}
                    <button
                      onClick={() => setDeletingSub(sub._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-[#c8c2b8] hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={13} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══ COL 3 — Forms ══ */}
        <div className="flex flex-col gap-4">

          {/* New Category */}
          <form onSubmit={createCategory} className="bg-white border border-[#ede9e1] rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
                <Tag size={13} strokeWidth={1.6} className="text-[#c9a84c]" />
              </div>
              <div>
                <h2 className="text-[0.85rem] font-semibold text-[#1a1714]">New Category</h2>
                <p className="text-[0.7rem] text-[#a09a90]">Top-level grouping</p>
              </div>
            </div>
            <div className="h-px bg-[#f0ece4]" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold tracking-[0.09em] uppercase text-[#a09a90]">Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[#e2ddd5] bg-[#faf9f6] text-[0.83rem] text-[#1a1714] placeholder:text-[#c8c2b8] focus:outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/10 transition-all"
                placeholder="e.g. Diamonds"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold tracking-[0.09em] uppercase text-[#a09a90]">
                Description <span className="normal-case font-normal text-[#c8c2b8]">(optional)</span>
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[#e2ddd5] bg-[#faf9f6] text-[0.83rem] text-[#1a1714] placeholder:text-[#c8c2b8] focus:outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/10 transition-all"
                placeholder="Short description"
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1a1714] text-white text-[0.8rem] font-semibold tracking-wide hover:bg-[#2a2420] disabled:opacity-50 transition-all"
            >
              <Plus size={14} strokeWidth={2.2} /> Create Category
            </button>
          </form>

          {/* New Subcategory */}
          <form onSubmit={createSubcategory} className="bg-white border border-[#ede9e1] rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#7ab0c9]/10 border border-[#7ab0c9]/20 flex items-center justify-center flex-shrink-0">
                <Layers size={13} strokeWidth={1.6} className="text-[#7ab0c9]" />
              </div>
              <div>
                <h2 className="text-[0.85rem] font-semibold text-[#1a1714]">New Subcategory</h2>
                <p className="text-[0.7rem] text-[#a09a90]">Nested under a category</p>
              </div>
            </div>
            <div className="h-px bg-[#f0ece4]" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold tracking-[0.09em] uppercase text-[#a09a90]">Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[#e2ddd5] bg-[#faf9f6] text-[0.83rem] text-[#1a1714] placeholder:text-[#c8c2b8] focus:outline-none focus:border-[#7ab0c9] focus:ring-2 focus:ring-[#7ab0c9]/10 transition-all"
                placeholder="e.g. Loose Diamonds"
                value={subName}
                onChange={e => setSubName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold tracking-[0.09em] uppercase text-[#a09a90]">Parent Category</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-[#e2ddd5] bg-[#faf9f6] text-[0.83rem] text-[#1a1714] focus:outline-none focus:border-[#7ab0c9] focus:ring-2 focus:ring-[#7ab0c9]/10 transition-all appearance-none cursor-pointer"
                value={subCat}
                onChange={e => setSubCat(e.target.value)}
                required
              >
                <option value="">Select a category…</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit" disabled={loading || categories.length === 0}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1a1714] text-white text-[0.8rem] font-semibold tracking-wide hover:bg-[#2a2420] disabled:opacity-50 transition-all"
            >
              <Plus size={14} strokeWidth={2.2} /> Create Subcategory
            </button>
          </form>
        </div>
      </div>

      {/* ══ Delete Confirm Modal — Category ══ */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,23,20,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#ede9e1] w-full max-w-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} strokeWidth={1.8} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[0.9rem] font-semibold text-[#1a1714]">Delete Category</h3>
                <p className="text-[0.72rem] text-[#a09a90]">
                  "{categories.find(c => c._id === deletingCat)?.name}"
                </p>
              </div>
            </div>
            <p className="text-[0.8rem] text-[#6b6560] leading-relaxed">
              This will permanently delete the category and all its subcategories. This action cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeletingCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2ddd5] text-[#6b6560] text-[0.8rem] font-semibold hover:bg-[#f7f5f1] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(deletingCat)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[0.8rem] font-semibold hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Confirm Modal — Subcategory ══ */}
      {deletingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,23,20,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#ede9e1] w-full max-w-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} strokeWidth={1.8} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[0.9rem] font-semibold text-[#1a1714]">Delete Subcategory</h3>
                <p className="text-[0.72rem] text-[#a09a90]">
                  "{subcategories.find(s => s._id === deletingSub)?.name}"
                </p>
              </div>
            </div>
            <p className="text-[0.8rem] text-[#6b6560] leading-relaxed">
              This subcategory will be permanently removed. Products linked to it may need reassignment.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeletingSub(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2ddd5] text-[#6b6560] text-[0.8rem] font-semibold hover:bg-[#f7f5f1] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteSubcategory(deletingSub)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[0.8rem] font-semibold hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}