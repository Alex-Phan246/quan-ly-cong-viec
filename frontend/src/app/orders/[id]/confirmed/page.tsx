"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

export default function OrderConfirmedPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .order(Number(id))
      .then((o: any) => setOrder(o))
      .catch((e) => {
        if (String(e.message).toLowerCase().includes("unauthorized")) {
          router.push("/login");
        } else {
          setError(e.message);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!order) return <div className="container mx-auto px-4 py-8">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <h1 className="text-2xl font-semibold mb-2">Đặt hàng thành công!</h1>
      <p className="mb-6">Mã đơn hàng: <span className="font-mono">#{order.id}</span></p>
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-medium mb-3">Chi tiết đơn hàng</h2>
        <ul className="list-disc pl-5 text-sm">
          {order.items.map((i: any, idx: number) => (
            <li key={idx}>
              {i.name} x {i.quantity} — ${i.price}
            </li>
          ))}
        </ul>
        <div className="mt-4 font-semibold">Tổng tiền: ${order.total}</div>
      </div>
      <div className="flex gap-4">
        <Link href="/products" className="text-blue-600 hover:underline">Tiếp tục mua sắm</Link>
        <Link href="/account" className="text-blue-600 hover:underline">Xem lịch sử đơn hàng</Link>
      </div>
    </div>
  );
}

