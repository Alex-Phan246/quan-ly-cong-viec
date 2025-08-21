"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const id = Number(params?.id);

  useEffect(() => {
    if (!id) return;
    api
      .product(id)
      .then((res: any) => {
        setProduct(res.product);
        setRelated(res.related || []);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function handleAddToCart() {
    try {
      await api.addToCart({ productId: id, quantity: qty });
      router.push("/cart");
    } catch (e: any) {
      if (String(e.message).toLowerCase().includes("unauthorized")) {
        router.push("/login?next=" + encodeURIComponent(`/products/${id}`));
      } else {
        setError(e.message);
      }
    }
  }

  if (!product) return <div className="container mx-auto px-4 py-8">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img src={product.images?.[0]} alt={product.name} className="w-full h-80 object-cover rounded" />
          <div className="flex gap-2 mt-2">
            {product.images?.slice(1).map((src: string, idx: number) => (
              <img key={idx} src={src} alt={product.name} className="w-20 h-20 object-cover rounded" />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-emerald-700 font-semibold mt-2">${product.price}</p>
          <p className="mt-4 text-sm text-gray-700">{product.description}</p>
          <div className="mt-4">
            <label className="mr-2">Số lượng:</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="border rounded px-2 py-1 w-24" />
          </div>
          <button onClick={handleAddToCart} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {related.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow p-4">
              <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded" />
              <h3 className="mt-3 font-medium line-clamp-2 min-h-12">{p.name}</h3>
              <p className="text-emerald-700 font-semibold mt-1">${p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

