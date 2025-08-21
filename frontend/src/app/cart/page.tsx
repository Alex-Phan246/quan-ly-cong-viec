"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: { productId: number; quantity: number }[] } | null>(null);
  const [products, setProducts] = useState<Record<number, any>>({});
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, i) => sum + (products[i.productId]?.price || 0) * i.quantity, 0);
  }, [cart, products]);

  async function load() {
    try {
      const c: any = await api.getCart();
      setCart(c);
      const res: any = await api.products({});
      const map: Record<number, any> = {};
      (res.items || res).forEach((p: any) => (map[p.id] = p));
      setProducts(map);
    } catch (e: any) {
      if (String(e.message).toLowerCase().includes("unauthorized")) {
        router.push("/login?next=/cart");
      } else {
        setError(e.message);
      }
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateQty(productId: number, quantity: number) {
    await api.updateCartItem(productId, Math.max(0, quantity));
    await load();
  }

  async function removeItem(productId: number) {
    await api.removeCartItem(productId);
    await load();
  }

  if (!cart) return <div className="container mx-auto px-4 py-8">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <h1 className="text-2xl font-semibold mb-6">Giỏ hàng</h1>
      {cart.items.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((i) => (
              <div key={i.productId} className="bg-white rounded shadow p-4 flex gap-4 items-center">
                <img src={products[i.productId]?.images?.[0]} alt="" className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{products[i.productId]?.name}</div>
                  <div className="text-emerald-700 font-semibold">${products[i.productId]?.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(i.productId, i.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                  <input value={i.quantity} onChange={(e) => updateQty(i.productId, Number(e.target.value) || 1)} className="w-14 border rounded px-2 py-1 text-center" />
                  <button onClick={() => updateQty(i.productId, i.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                </div>
                <button onClick={() => removeItem(i.productId)} className="text-red-600 text-sm">Xóa</button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded shadow p-4 h-fit">
            <div className="flex justify-between">
              <span>Tổng tiền</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <button onClick={() => router.push("/checkout") } className="mt-4 w-full bg-blue-600 text-white rounded px-4 py-2">Thanh toán</button>
          </div>
        </div>
      )}
    </div>
  );
}

