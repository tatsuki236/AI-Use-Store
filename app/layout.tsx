import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AiUseStore",
    template: "%s | AiUseStore",
  },
  description:
    "実践的なAI・プログラミングスキルを、記事スタイルのレッスンで学べる学習プラットフォーム",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "AiUseStore",
    description:
      "実践的なAI・プログラミングスキルを、記事スタイルのレッスンで学べる学習プラットフォーム",
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "https://aiusestore.com/images/ogp.png",
        width: 1200,
        height: 630,
        alt: "AiUseStore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://aiusestore.com/images/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
