import { Syne } from "next/font/google";
import ToastProvider from "./components/Toast";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata = {
  title: "BunkBuddies by VinnovateIT",
  description: "Find your perfect bunk buddy",
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={syne.variable}>
      <body className="antialiased">
        <ToastProvider />
        {children}
        
      </body>
    </html>
  );
}
