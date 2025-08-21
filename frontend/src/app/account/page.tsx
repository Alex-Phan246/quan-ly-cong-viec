"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/login?next=/account");
      return;
    }
    api
      .me()
      .then(setMe)
      .catch((e) => setError(e.message));
    api
      .myOrders()
      .then((o: any[]) => setOrders(o))
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!me) return <div className="container mx-auto px-4 py-8">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Tài khoản của tôi</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div>Họ và tên: {me.name}</div>
        <div>Email: {me.email}</div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-medium mb-3">Lịch sử đặt hàng</h2>
        {orders.length === 0 ? (
          <p>Chưa có đơn hàng.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between text-sm">
                <span>Mã #{o.id}</span>
                <span>{new Date(o.createdAt).toLocaleString()}</span>
                <span className="font-semibold">${o.total}</span>
                <span>{o.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

