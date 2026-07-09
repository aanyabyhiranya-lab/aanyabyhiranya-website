import type { Metadata } from "next";
import CommissionForm from "./CommissionForm";

export const metadata: Metadata = {
  title: "Commission a Piece",
  description: "Hiranya takes on a limited number of bespoke commissions each season — share your idea and get a quote.",
};

export default function CommissionPage() {
  return <CommissionForm />;
}
