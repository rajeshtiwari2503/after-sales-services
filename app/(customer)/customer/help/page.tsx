"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Search, Star, Eye, ChevronRight, ThumbsUp,
  ThumbsDown, ArrowLeft, Tag, RefreshCw, HelpCircle,
} from "lucide-react";

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  tags: string[];
  featured: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  content?: string;
}

interface CategoryItem {
  _id: string;
  count: number;
}

export default function CustomerHelpPage() {
  const [articles,   setArticles]   = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [catFilter,  setCatFilter]  = useState("");
  const [selected,   setSelected]   = useState<Article | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [voted, setVoted] = useState<Record<string, "up" | "down" | null>>({});

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        published: "true", limit: "50",
        ...(search    ? { search }                    : {}),
        ...(catFilter ? { category: catFilter }       : {}),
      });
      const res  = await fetch(`/api/knowledge-base?${params}`, { credentials: "include" });
      const data = await res.json();
      setArticles(data.data?.articles ?? []);
      setCategories(data.data?.categories ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, catFilter]);

  useEffect(() => {
    const t = setTimeout(fetchArticles, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchArticles, search]);

  const openArticle = async (article: Article) => {
    setArticleLoading(true);
    setSelected({ ...article });
    try {
      const res  = await fetch(`/api/knowledge-base/${article._id}`, { credentials: "include" });
      const data = await res.json();
      setSelected(data.data ?? article);
    } catch { /* use cached */ }
    finally { setArticleLoading(false); }
  };

  const vote = async (id: string, helpful: boolean) => {
    if (voted[id]) return; // already voted
    try {
      await fetch(`/api/knowledge-base/${id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      });
      setVoted(v => ({ ...v, [id]: helpful ? "up" : "down" }));
      if (selected?._id === id) {
        setSelected(s => s ? {
          ...s,
          helpfulCount:    helpful ? s.helpfulCount + 1    : s.helpfulCount,
          notHelpfulCount: !helpful ? s.notHelpfulCount + 1 : s.notHelpfulCount,
        } : null);
      }
    } catch { /* silent */ }
  };

  const featuredArticles = articles.filter(a => a.featured).slice(0, 3);
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

  // Article detail view
  if (selected) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer transition">
          <ArrowLeft className="w-4 h-4" /> Back to Help Center
        </button>

        {articleLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">{selected.category}</span>
                {selected.featured && <Star className="w-4 h-4 text-amber-500" />}
              </div>
              <h1 className="text-2xl font-bold text-slate-800 leading-snug">{selected.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {selected.viewCount} views</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-green-500" /> {selected.helpfulCount} helpful</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Article content */}
            <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {selected.content ?? selected.excerpt ?? "No content available."}
            </div>

            {/* Tags */}
            {selected.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    <Tag className="w-2.5 h-2.5" /> {t}
                  </span>
                ))}
              </div>
            )}

            {/* Helpful vote */}
            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm font-semibold text-slate-700 mb-3 text-center">Was this article helpful?</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => vote(selected._id, true)} disabled={!!voted[selected._id]}
                  className={`flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-medium border transition cursor-pointer ${voted[selected._id] === "up" ? "bg-green-100 text-green-700 border-green-200" : "border-slate-200 text-slate-600 hover:bg-green-50 hover:border-green-200"} disabled:cursor-default`}>
                  <ThumbsUp className="w-4 h-4" /> Yes, helpful ({selected.helpfulCount})
                </button>
                <button onClick={() => vote(selected._id, false)} disabled={!!voted[selected._id]}
                  className={`flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-medium border transition cursor-pointer ${voted[selected._id] === "down" ? "bg-red-50 text-red-600 border-red-100" : "border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-100"} disabled:cursor-default`}>
                  <ThumbsDown className="w-4 h-4" /> Not really ({selected.notHelpfulCount})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* ── Hero ── */}
      <div className="text-center py-8 px-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100">
        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Help Center</h1>
        <p className="text-slate-500 text-sm mb-6">Find answers to your questions about our services</p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search for help articles..."
            className="w-full pl-12 pr-4 h-12 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Categories</h3>
            <div className="space-y-1">
              <button onClick={() => setCatFilter("")}
                className={`w-full text-left text-sm px-3 py-2 rounded-xl transition cursor-pointer ${!catFilter ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                All Articles
              </button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setCatFilter(cat._id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl flex items-center justify-between transition cursor-pointer ${catFilter === cat._id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span>{cat._id}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Articles ── */}
        <div className="space-y-4">
          {/* Featured */}
          {!catFilter && !search && featuredArticles.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Featured Articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {featuredArticles.map(a => (
                  <button key={a._id} onClick={() => openArticle(a)}
                    className="text-left p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl hover:shadow-md transition cursor-pointer group">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">{a.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{a.excerpt}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-600">
                      <Eye className="w-2.5 h-2.5" /> {a.viewCount} views
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Article List */}
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <BookOpen className="w-10 h-10 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 text-sm">No articles found.</p>
              {search && <button onClick={() => setSearch("")} className="text-xs text-indigo-600 hover:underline mt-1 cursor-pointer">Clear search</button>}
            </div>
          ) : articles.map(a => (
            <button key={a._id} onClick={() => openArticle(a)}
              className="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-indigo-200 hover:shadow-sm transition cursor-pointer group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{a.category}</span>
                    {a.featured && <Star className="w-3 h-3 text-amber-500" />}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">{a.title}</p>
                  {a.excerpt && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {a.viewCount}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-green-500" /> {a.helpfulCount}</span>
                    {a.tags.slice(0, 2).map(t => (
                      <span key={t} className="flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" /> {t}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
