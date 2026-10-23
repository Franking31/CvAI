'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  User, 
  Briefcase, 
  Sparkles, 
  MessageSquare, 
  PenLine, 
  LogOut, 
  LogIn, 
  Cloud 
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import AuthModal from '@/app/components/AuthModal';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/app/components/ThemeToggle';

const links = [
  { href: '/dashboard/profile',      label: 'Profil',    icon: User },
  { href: '/dashboard/job',          label: 'Offre',     icon: Briefcase },
  { href: '/dashboard/generate',     label: 'CV',        icon: Sparkles },
  { href: '/dashboard/cover-letter', label: 'Lettre',    icon: PenLine },
  { href: '/dashboard/chat',         label: 'Assistant', icon: MessageSquare },
  { href: '/dashboard/test',         label: 'Test QCM',  icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
  <>
    <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">

        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <FileText className="w-5 h-5 text-primary" />
          <span>CV<span className="text-primary">IA</span></span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {!loading && (
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <Cloud className="w-3 h-3" />
                  <span>Sync</span>
                </div>
                <span className="hidden lg:block text-xs text-muted-foreground max-w-[130px] truncate">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground gap-1.5">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuth(true)} className="gap-1.5">
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </Button>
            )}
          </div>
        )}

        {loading && <div className="w-24 h-7 rounded-md bg-muted animate-pulse" />}
      </div>
    </header>

    {/* Barre de navigation mobile (en bas) */}
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white dark:bg-slate-950 flex pb-[env(safe-area-inset-bottom)]">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
            pathname === href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      ))}
    </nav>

    {showAuth && (
      <AuthModal
        onClose={() => setShowAuth(false)}
        reason="Connectez-vous pour sauvegarder vos données dans le cloud."
      />
    )}
  </>
);
}