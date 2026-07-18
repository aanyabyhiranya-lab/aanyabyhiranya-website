import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "For inquiries, collaborations, or just to say hello. Reach out to Hiranya via email, Instagram, or WhatsApp.",
};

export default function ContactPage() {
  return <ContactForm />;
}
