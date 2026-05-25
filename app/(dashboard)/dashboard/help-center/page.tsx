"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, Search, Eye, EyeOff, Star, StarOff,
  Pencil, Trash2, RefreshCw, X, Save, Tag, BarChart2, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  count: number;
}

const KB_CATEGORIES = [
  "General", "Warranty", "Service Process", "Troubleshooting",
  "Payment & Billing", "Feedback", "Account", "Technical", "Other",
];

export default function HelpCenterPage() {
  const [articles,    setArticles]    = useState<Article[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("");
  const [pubFilter,   setPubFilter]   = useState<"all" | "published" | "draft">("all");
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const LIMIT = 15;

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({
    title: "", category: "General", content: "", excerpt: "",
    tags: "", published: false, featured: false,
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(LIMIT),
        ...(search    ? { search }                              : {}),
        ...(catFilter ? { category: catFilter }                : {}),
        ...(pubFilter !== "all" ? { published: String(pubFilter === "published") } : {}),
      });
      const res  = await fetch(`/api/knowledge-base?${params}`, { credentials: "include" });
      const data = await res.json();
      setArticles(data.data?.articles ?? []);
      setCategories(data.data?.categories ?? []);
      setTotal(data.data?.pagination?.total ?? 0);
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter, pubFilter]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openNew = () => {
    setEditId(null);
    setForm({ title: "", category: "General", content: "", excerpt: "", tags: "", published: false, featured: false });
    setShowEditor(true);
  };

  const openEdit = async (article: Article) => {
    try {
      const res  = await fetch(`/api/knowledge-base/${article._id}`, { credentials: "include" });
      const data = await res.json();
      const a    = data.data ?? article;
      setForm({
        title: a.title, category: a.category, content: a.content ?? "",
        excerpt: a.excerpt ?? "", tags: (a.tags ?? []).join(", "),
        published: a.published, featured: a.featured,
      });
      setEditId(article._id);
      setShowEditor(true);
    } catch {
      toast.error("Failed to load article");
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error("Title and content required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      const url    = editId ? `/api/knowledge-base/${editId}` : "/api/knowledge-base";
      const method = editId ? "PATCH" : "POST";
      const res    = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(editId ? "Article updated" : "Article created");
      setShowEditor(false);
      fetchArticles();
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (article: Article) => {
    try {
      const res = await fetch(`/api/knowledge-base/${article._id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !article.published }),
      });
      if (!res.ok) throw new Error();
      toast.success(article.published ? "Unpublished" : "Published");
      fetchArticles();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/knowledge-base/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Article deleted");
      fetchArticles();
    } catch {
      toast.error("Delete failed");
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Help Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage knowledge base articles for customers and staff</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchArticles} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 bg-white cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openNew} className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Articles", value: total, icon: <BookOpen className="w-4 h-4" />, color: "bg-indigo-50 text-indigo-600" },
          { label: "Published", value: articles.filter(a => a.published).length, icon: <Eye className="w-4 h-4" />, color: "bg-green-50 text-green-600" },
          { label: "Drafts", value: articles.filter(a => !a.published).length, icon: <EyeOff className="w-4 h-4" />, color: "bg-amber-50 text-amber-600" },
          { label: "Total Views", value: articles.reduce((s, a) => s + a.viewCount, 0).toLocaleString(), icon: <BarChart2 className="w-4 h-4" />, color: "bg-violet-50 text-violet-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer focus:outline-none">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c._id} ({c.count})</option>)}
        </select>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => { setPubFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer capitalize ${pubFilter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Articles Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Title", "Category", "Tags", "Views", "Helpful", "Status", "Updated", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : articles.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                No articles yet. <button onClick={openNew} className="text-indigo-600 hover:underline cursor-pointer">Create your first article</button>
              </td></tr>
            ) : articles.map(a => (
              <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex items-center gap-1.5">
                    {a.featured && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                  </div>
                  {a.excerpt && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{a.excerpt}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">{a.category}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">{t}</span>
                    ))}
                    {a.tags.length > 2 && <span className="text-[10px] text-slate-400">+{a.tags.length - 2}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{a.viewCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <span className="text-green-600">{a.helpfulCount}</span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="text-red-400">{a.notHelpfulCount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${a.published ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {a.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(a.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePublish(a)} title={a.published ? "Unpublish" : "Publish"}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition ${a.published ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                      {a.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(a)}
                      className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 cursor-pointer transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(a._id, a.title)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 cursor-pointer transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Article Editor Modal ── */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-800">{editId ? "Edit Article" : "New Article"}</h2>
              <button onClick={() => setShowEditor(false)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Article title..."
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer focus:outline-none">
                    {KB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="e.g. warranty, repair, AC"
                    className="w-full h-9 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Excerpt (short summary)</label>
                <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Brief description shown in search results..."
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write the article content here. You can use markdown formatting..."
                  rows={12}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 resize-none leading-relaxed" />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                    className={`w-9 h-5 rounded-full transition-colors relative ${form.published ? "bg-green-500" : "bg-slate-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.published ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Published</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                    className={`w-9 h-5 rounded-full transition-colors relative ${form.featured ? "bg-amber-500" : "bg-slate-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              <button onClick={() => setShowEditor(false)} className="h-9 px-4 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.content}
                className="flex items-center gap-2 h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition disabled:opacity-60">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editId ? "Save Changes" : "Create Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
