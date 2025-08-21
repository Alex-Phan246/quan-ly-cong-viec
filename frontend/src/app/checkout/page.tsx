"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCart()
      .then((c: any) => {
        if (!c.items?.length) router.replace("/cart");
        setCart(c);
      })
      .catch((e) => {
        if (String(e.message).toLowerCase().includes("unauthorized")) {
          router.push("/login?next=/checkout");
        } else {
          setError(e.message);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    try {
      const order = await api.checkout({ fullName, phone, address });
      router.replace(`/orders/${order.id}/confirmed`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Thanh toán</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium mb-3">Thông tin giao hàng</h2>
          <div className="space-y-3">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ tên" className="w-full border rounded px-3 py-2" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="SĐT" className="w-full border rounded px-3 py-2" />
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ" className="w-full border rounded px-3 py-2" />
          </div>
          <button onClick={submit} className="mt-4 bg-blue-600 text-white rounded px-4 py-2">Xác nhận</button>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium mb-3">Tóm tắt đơn hàng</h2>
          {!cart ? (
            <p>Đang tải...</p>
          ) : (
            <ul className="space-y-2">
              {cart.items.map((i: any) => (
                <li key={i.productId} className="flex justify-between text-sm">
                  <span>SP #{i.productId} x {i.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

