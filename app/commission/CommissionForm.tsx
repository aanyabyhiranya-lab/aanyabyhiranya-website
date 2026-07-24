"use client";
import { useState } from "react";

export default function CommissionForm() {
  const [form, setForm] = useState({ name:"", email:"", description:"" });
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/commission", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      setStatus(res.ok ? "sent" : "error");
    } catch { setStatus("error"); }
  };

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">Bespoke Work</p>
            <h1 className="font-serif text-5xl md:text-6xl text-forest dark:text-beige mb-8">Commission a Piece</h1>
            <p className="text-dark/70 dark:text-beige/70 leading-relaxed mb-6 max-w-sm">
              Hiranya takes on a limited number of commissions each season. Each piece is made with full attention and care.
            </p>
            <div className="flex flex-col gap-4 mb-10">
              {["Share your idea, theme, or reference","Hiranya will respond within 3–5 days","A quote and timeline will be discussed","Work begins after mutual agreement"].map((s,i)=>(
                <div key={i} className="flex gap-4 items-start">
                  <span className="font-serif text-2xl text-forest/40 dark:text-beige/30 leading-none">{i+1}</span>
                  <p className="text-sm text-dark/70 dark:text-beige/70 leading-relaxed pt-1">{s}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-dark/50 dark:text-beige/50">
              Prefer to reach out directly?{" "}
              <a href="mailto:Aanyabyhiranya@gmail.com" className="underline hover:text-forest dark:hover:text-rose transition-colors">Email Hiranya</a>
              {" "}or{" "}
              <a href="https://wa.me/919392640611" target="_blank" rel="noopener noreferrer" className="underline hover:text-forest dark:hover:text-rose transition-colors">WhatsApp</a>
            </p>
          </div>

          <div>
            {status === "sent" ? (
              <div className="py-16 text-center">
                <p className="font-serif text-3xl text-forest dark:text-beige mb-3">Request received.</p>
                <p className="text-dark/60 dark:text-beige/60">Hiranya will be in touch within a few days.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-6">
                {[["name","Your Name","text"],["email","Email","email"]].map(([id,label,type])=>(
                  <div key={id}>
                    <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-2">{label}</label>
                    <input type={type} required value={(form as any)[id]}
                      onChange={e=>setForm({...form,[id]:e.target.value})}
                      className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none focus:border-forest dark:focus:border-rose transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-2">Describe your idea</label>
                  <textarea required rows={6} value={form.description}
                    onChange={e=>setForm({...form,description:e.target.value})}
                    placeholder="What are you envisioning? Any colours, themes, sizes, or occasions in mind?"
                    className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige placeholder:text-dark/30 dark:placeholder:text-beige/30 focus:outline-none focus:border-forest dark:focus:border-rose transition-colors resize-none text-sm" />
                </div>
                {status==="error" && <p className="text-sm text-red-500">Something went wrong. Please email directly.</p>}
                <button type="submit" disabled={status==="sending"}
                  className="self-start text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors disabled:opacity-50">
                  {status==="sending" ? "Sending…" : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
