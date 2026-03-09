import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Calculator - E-Commerce Pricing Tool',
  description: 'Professional e-commerce pricing, shipping, discount, and tax calculator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-gray-950">
        {children}
      </body>
    </html>
  );
}
