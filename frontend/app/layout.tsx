import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeatherGPT | AI Weather Assistant for India (SIH26068)",
  description: "Multilingual, voice-enabled AI weather assistant designed for India (General, Farmer, Aviation & Marine modes). MoES / IMD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF9F5] text-slate-800 antialiased selection:bg-sky-200 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}

