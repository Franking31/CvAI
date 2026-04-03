// app/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, User, Briefcase, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard/profile', label: 'Mon Profil', icon: User },
  { href: '/dashboard/job', label: "Offre d'emploi", icon: Briefcase },
  { href: '/dashboard/generate', label: 'Générer CV', icon: Sparkles },
  { href: '/dashboard/chat', label: 'Assistant IA', icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-50">
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
      </div>
    </header>
  );
}