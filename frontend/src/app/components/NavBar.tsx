"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuth, getUser } from "@/lib/auth";

export default function NavBar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function logout() {
    clearAuth();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Ecommerce</Link>
          <Link href="/products" className="text-sm text-gray-700 hover:text-black">Sản phẩm</Link>
          <Link href="/contact" className="text-sm text-gray-700 hover:text-black">Liên hệ</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-sm text-gray-700 hover:text-black">Giỏ hàng</Link>
          {user ? (
            <>
              <Link href="/account" className="text-sm text-gray-700 hover:text-black">Tài khoản của tôi</Link>
              <button onClick={logout} className="text-sm text-red-600">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-black">Đăng nhập</Link>
              <Link href="/register" className="text-sm text-gray-700 hover:text-black">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

