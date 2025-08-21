"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirm) {
      setError("Mật khẩu không khớp");
      return;
    }
    try {
      await api.register({ name, email, password });
      setSuccess("Đăng ký thành công. Vui lòng đăng nhập.");
      setTimeout(() => router.push("/login"), 800);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Đăng ký</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-700 mb-4">{success}</p>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên" className="w-full border rounded px-3 py-2" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border rounded px-3 py-2" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Mật khẩu" className="w-full border rounded px-3 py-2" required />
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Nhập lại mật khẩu" className="w-full border rounded px-3 py-2" required />
        <button type="submit" className="w-full bg-blue-600 text-white rounded px-3 py-2">Đăng ký</button>
      </form>
    </div>
  );
}

