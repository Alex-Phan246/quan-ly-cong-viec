"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
	const [featured, setFeatured] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		api
			.featured()
			.then((data: any[]) => setFeatured(data))
			.catch((e) => setError(e.message));
	}, []);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6">Sản phẩm nổi bật</h1>
			{error && <p className="text-red-600 mb-4">{error}</p>}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{featured.map((p) => (
					<div key={p.id} className="bg-white rounded-lg shadow p-4">
						<img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded" />
						<h3 className="mt-3 font-medium line-clamp-2 min-h-12">{p.name}</h3>
						<p className="text-emerald-700 font-semibold mt-1">${p.price}</p>
						<Link href={`/products/${p.id}`} className="inline-block mt-3 text-sm text-blue-600 hover:underline">
							Xem chi tiết
						</Link>
					</div>
				))}
			</div>
			<div className="mt-8">
				<Link href="/products" className="text-blue-600 hover:underline">
					Xem tất cả sản phẩm →
				</Link>
			</div>
		</div>
	);
}