import { Inter, Playfair_Display, Poppins, Baloo_2, Archivo_Black } from "next/font/google";

// Every Google Font referenced across the 27 theme mockups' fontFamily
// blocks (see theme-registry.raw.json) — loaded once here and exposed as
// CSS variables so theme-tokens.css can point --theme-font-* at whichever
// ones a given theme actually uses.
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
export const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
export const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", display: "swap" });
export const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo", display: "swap" });

export const themeFontVariables = [
  inter.variable,
  playfair.variable,
  poppins.variable,
  baloo.variable,
  archivo.variable,
].join(" ");
