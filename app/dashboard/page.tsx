// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCVStore } from '@/lib/store';
import { 
  FileText, Briefcase, User, MessageSquare, 
  TrendingUp, Clock, CheckCircle, Award,
  ChevronRight, Sparkles, Shield, Zap,
  Eye, Download, Plus, Star, Target,
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  color: string;
  href: string;
}

function StatCard({ title, value, icon: Icon, trend, color, href }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  };

  return (
    <Link href={href} className="group block">
      <div className="relative rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-current/5 to-transparent rounded-full blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <TrendingUp className={`w-3 h-3 ${trend >= 0 ? '' : 'rotate-180'}`} />
                <span>{Math.abs(trend)}% cette semaine</span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: any;
  color: string;
  href: string;
  badge?: string;
}

function ActionCard({ title, description, icon: Icon, color, href, badge }: ActionCardProps) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', hover: 'hover:border-blue-500/40' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/40' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', hover: 'hover:border-amber-500/40' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20', hover: 'hover:border-violet-500/40' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', hover: 'hover:border-rose-500/40' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', hover: 'hover:border-cyan-500/40' },
  };
  const c = colors[color as keyof typeof colors];

  return (
    <Link href={href} className="group block">
      <div className={`relative rounded-2xl border ${c.border} bg-card p-5 transition-all duration-200 ${c.hover} hover:shadow-md overflow-hidden`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${c.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{title}</h3>
              {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform ${c.text}`} />
        </div>
      </div>
    </Link>
  );
}

interface TemplateCardProps {
  name: string;
  description: string;
  preview: string;
  color: string;
  popular?: boolean;
}

function TemplateCard({ name, description, preview, color, popular }: TemplateCardProps) {
  const colors = {
    blue: 'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    violet: 'from-violet-500 to-purple-600',
    rose: 'from-rose-500 to-pink-600',
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      {popular && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-2.5 h-2.5" /> Populaire
          </span>
        </div>
      )}
      <div className={`h-32 bg-gradient-to-br ${colors[color as keyof typeof colors]} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-2 left-3 text-white text-[10px] font-mono opacity-50">{preview}</div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-sm">{name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <button className="mt-3 w-full py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted transition-colors">
          Utiliser ce template
        </button>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { profile, jobDescription, generatedCV } = useCVStore();
  
  const [stats] = useState({
    profileComplete: profile ? 75 : 0,
    cvsGenerated: generatedCV ? 1 : 0,
    jobMatches: jobDescription ? 8 : 0,
    applicationsSent: 0,
  });

  const quickStats = [
    { title: 'Complétion profil', value: `${stats.profileComplete}%`, icon: User, trend: 12, color: 'blue', href: '/dashboard/profile' },
    { title: 'CV générés', value: stats.cvsGenerated, icon: FileText, trend: 0, color: 'emerald', href: '/dashboard/generate' },
    { title: 'Offres analysées', value: stats.jobMatches, icon: Target, trend: 5, color: 'amber', href: '/dashboard/job' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Welcome Header */}
        <div className="relative rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5 p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Tableau de bord</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Bonjour {profile?.fullName?.split(' ')[0] || 'candidat'} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Votre hub de candidature — gérez vos CV, suivez vos offres et préparez vos entretiens.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">JD</div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">CV</div>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">✓</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Dernière activité: <span className="text-foreground font-medium">Aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Actions - 2 columns layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Actions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-base">Actions rapides</h2>
                <p className="text-xs text-muted-foreground">Gérez votre candidature en quelques clics</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <ActionCard 
                title="Mon profil"
                description="Complétez vos informations personnelles et professionnelles"
                icon={User}
                color="blue"
                href="/dashboard/profile"
                badge={stats.profileComplete < 100 ? `${stats.profileComplete}%` : 'Complet'}
              />
              <ActionCard 
                title="Offres d'emploi"
                description="Analysez et suivez les offres qui vous intéressent"
                icon={Briefcase}
                color="amber"
                href="/dashboard/job"
                badge="Nouvelle"
              />
              <ActionCard 
                title="Générer un CV"
                description="Créez des CV adaptés à chaque offre d'emploi"
                icon={FileText}
                color="emerald"
                href="/dashboard/generate"
              />
              <ActionCard 
                title="Assistant"
                description="Préparez vos entretiens et améliorez votre candidature"
                icon={MessageSquare}
                color="violet"
                href="/dashboard/chat"
              />
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-sm">Activité récente</h2>
                </div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { action: 'CV généré pour "Développeur Full-Stack"', time: 'Il y a 2 jours', icon: FileText, color: 'emerald' },
                  { action: 'Offre analysée: "Ingénieur IA Senior"', time: 'Il y a 3 jours', icon: Briefcase, color: 'amber' },
                  { action: 'Profil mis à jour', time: 'Il y a 5 jours', icon: User, color: 'blue' },
                ].map((item, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                    <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/10 flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-4 h-4 text-${item.color}-500`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Stats & Templates */}
          <div className="space-y-4">
            {/* Application Stats */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-sm">Statistiques</h2>
                </div>
                <select className="text-xs bg-transparent border border-border rounded-lg px-2 py-1">
                  <option>Cette semaine</option>
                  <option>Ce mois</option>
                </select>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Taux de complétion</span>
                    <span className="font-medium">{stats.profileComplete}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.profileComplete}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">CV générés</span>
                    <span className="font-medium">{stats.cvsGenerated}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stats.cvsGenerated / 5) * 100}%` }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taux de match moyen</span>
                    <span className="font-bold text-amber-500">78%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Votre profil est bien optimisé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <h2 className="font-semibold text-sm">Templates populaires</h2>
                </div>
                <Link href="/dashboard/templates" className="text-xs text-primary hover:underline">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-3">
                <TemplateCard 
                  name="Professionnel"
                  description="Classique et élégant, idéal pour les postes cadres"
                  preview="A4 · 2 colonnes"
                  color="blue"
                  popular
                />
                <TemplateCard 
                  name="Moderne"
                  description="Design épuré avec accents de couleur"
                  preview="A4 · 1 colonne"
                  color="violet"
                />
                <TemplateCard 
                  name="Tech"
                  description="Optimisé pour les profils techniques et développeurs"
                  preview="A4 · Sidebar"
                  color="emerald"
                />
              </div>
            </div>

            {/* Tips Card */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Conseil du jour</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personnalisez chaque CV avec les mots-clés de l'offre pour augmenter vos chances de passer les ATS.
                  </p>
                  <button className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline">
                    En savoir plus →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Section - Applications Tracking */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Suivi des candidatures</h2>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
              <Plus className="w-3 h-3" /> Ajouter une candidature
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Aucune candidature suivie</p>
                <p className="text-sm text-muted-foreground mt-1">Commencez à tracker vos candidatures pour ne rien oublier</p>
              </div>
              <button className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                <Plus className="w-4 h-4" /> Nouvelle candidature
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}