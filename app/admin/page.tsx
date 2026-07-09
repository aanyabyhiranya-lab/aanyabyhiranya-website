"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErr(json.error || "Incorrect email or password.");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setErr("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige dark:bg-dark flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-serif text-3xl text-forest dark:text-beige mb-8">Admin Login</p>
        <form onSubmit={login} className="flex flex-col gap-5">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required
            className="bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none" />
          <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} required
            className="bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none" />
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button type="submit" disabled={loading}
            className="bg-forest text-white py-3 text-sm tracking-widest uppercase hover:bg-teal transition-colors disabled:opacity-50">
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
