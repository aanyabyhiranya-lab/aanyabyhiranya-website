"use client";
import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      setStatus(res.ok ? "sent" : "error");
    } catch { setStatus("error"); }
  };

  return (
    <div className="bg-beige dark:bg-dark min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <p className="text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 mb-3">Get in Touch</p>
            <h1 className="font-serif text-5xl md:text-6xl text-forest dark:text-beige mb-8">Contact</h1>
            <p className="text-dark/70 dark:text-beige/70 leading-relaxed mb-10 max-w-sm">
              For inquiries, collaborations, or just to say hello. Reach out through any of the channels below.
            </p>
            <div className="flex flex-col gap-4">
              <a href="mailto:Aanyabyhiranya@gmail.com" className="flex items-center gap-2 text-sm text-dark/70 dark:text-beige/70 hover:text-forest dark:hover:text-rose transition-colors">
                <Mail size={16} /> Aanyabyhiranya@gmail.com
              </a>
              <a href="https://instagram.com/AanyaByHiranya" target="_blank" rel="noopener noreferrer"
                className="text-sm text-dark/70 dark:text-beige/70 hover:text-forest dark:hover:text-rose transition-colors">
                Instagram: @AanyaByHiranya
              </a>
              <a href="https://wa.me/919392640611" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-dark/70 dark:text-beige/70 hover:text-forest dark:hover:text-rose transition-colors">
                <MessageCircle size={16} /> WhatsApp: +91 93926 40611
              </a>
            </div>
          </div>

          <div>
            {status === "sent" ? (
              <div className="py-16 text-center">
                <p className="font-serif text-3xl text-forest dark:text-beige mb-3">Thank you.</p>
                <p className="text-dark/60 dark:text-beige/60">Your message has been sent. Hiranya will be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-6">
                {[["name","Name","text"],["email","Email","email"]].map(([id,label,type])=>(
                  <div key={id}>
                    <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-2">{label}</label>
                    <input type={type} required value={(form as any)[id]}
                      onChange={e=>setForm({...form,[id]:e.target.value})}
                      className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none focus:border-forest dark:focus:border-rose transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-2">Message</label>
                  <textarea required rows={5} value={form.message}
                    onChange={e=>setForm({...form,message:e.target.value})}
                    className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none focus:border-forest dark:focus:border-rose transition-colors resize-none" />
                </div>
                {status==="error" && <p className="text-sm text-red-500">Something went wrong. Please try again or email directly.</p>}
                <button type="submit" disabled={status==="sending"}
                  className="self-start text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors disabled:opacity-50">
                  {status==="sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
