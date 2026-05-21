import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Provider from "./providers/ReactQueryProvider";
import FloatingChat from "./components/agent/FloatingChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Probesco - Meeting Management",
  description: "Meeting Management App",
  icons: {
    icon: "/probesco.webp",
    
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right"/>
        <Provider >
          {children}
        </Provider>
        <FloatingChat />
      </body>
    </html>
  );
}
