import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "./polish.css";

// Reuse the real Latin variable fonts from the existing local build. No fetch.
// RootLayout still loads its four families for the other routes; only these
// two are used inside /v6. Montserrat 800 is intentionally not registered here.
/* Reed review: fonts come from the root layout (the same Montserrat + Roboto files "/" uses). The earlier local
   copies were a variable font declared as fixed weights, which rendered as "Montserrat Thin". */
export const metadata: Metadata = {
  robots: { index: false, follow: false }, // Reed: /v6 is a preview route until Aman says it replaces "/"
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  twitter: { card: "summary_large_image" },
};
export default function PolishLayout({ children }: { children: React.ReactNode }) {
  return <div data-site="polish" id="top">{children}</div>;
}
