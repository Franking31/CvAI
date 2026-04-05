'use client';
// app/components/layout/Navbar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, User, Briefcase, Sparkles, MessageSquare, LogOut, LogIn, Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import AuthModal from '@/app/components/AuthModal';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/dashboard/profile', label: 'Mon Profil', icon: User },
  { href: '/dashboard/job', label: "Offre d'emploi", icon: Briefcase },
  { href: '/dashboard/generate', label: 'Générer CV', icon: Sparkles },
  { href: '/dashboard/chat', label: 'Assistant IA', icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <FileText className="w-5 h-5 text-primary" />
            <span>CV<span className="text-primary">IA</span></span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Auth zone */}
          {!loading && (
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Indicateur de sync */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                    <Cloud className="w-3 h-3" />
                    <span>Sync activé</span>
                  </div>
                  {/* Email tronqué */}
                  <span className="hidden md:block text-xs text-muted-foreground max-w-[140px] truncate">
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuth(true)}
                  className="gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          reason="Connectez-vous pour sauvegarder vos données dans le cloud."
        />
      )}
    </>
  );
}