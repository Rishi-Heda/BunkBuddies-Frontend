import { Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata = {
  title: "BunkBuddies",
  description: "Find your perfect bunk buddy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={syne.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
