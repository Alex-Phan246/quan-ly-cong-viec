"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  images?: string[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .products({ q, category, minPrice, maxPrice, sortBy, order, page, pageSize })
      .then((res: any) => {
        setProducts(res.items || []);
        setTotal(res.total || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, category, minPrice, maxPrice, sortBy, order, page, pageSize]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Tất cả sản phẩm</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm tên sản phẩm" className="border rounded px-3 py-2" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Danh mục" className="border rounded px-3 py-2" />
        <div className="flex gap-2">
          <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Giá từ" className="border rounded px-3 py-2 w-1/2" />
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="đến" className="border rounded px-3 py-2 w-1/2" />
        </div>
        <div className="flex gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-3 py-2">
            <option value="price">Giá</option>
            <option value="name">Tên</option>
          </select>
          <select value={order} onChange={(e) => setOrder(e.target.value)} className="border rounded px-3 py-2">
            <option value="asc">Tăng</option>
            <option value="desc">Giảm</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow p-4">
                <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded" />
                <h3 className="mt-3 font-medium line-clamp-2 min-h-12">{p.name}</h3>
                <p className="text-emerald-700 font-semibold mt-1">${p.price}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mt-8">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-2 border rounded disabled:opacity-50">
              Trước
            </button>
            <span>
              Trang {page}/{totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-2 border rounded disabled:opacity-50">
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}

