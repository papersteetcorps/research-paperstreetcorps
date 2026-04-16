import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Research — Paper Street Corps",
  description: "Submit and discover research papers on Paper Street Corps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Header />
          <main className="flex-1 px-6 py-10">
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
