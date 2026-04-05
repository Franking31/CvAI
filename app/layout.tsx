// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Navbar from './components/layout/Navbar';
import { AuthProvider } from '@/lib/auth-context';
import CloudSyncProvider from './components/CloudSyncProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV IA - Générateur de CV adapté',
  description: "Génère un CV parfaitement adapté à chaque offre d'emploi grâce à l'IA",
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CloudSyncProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster position="top-center" richColors closeButton />
          </CloudSyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}