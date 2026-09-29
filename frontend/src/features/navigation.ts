import type { LinkProps } from '@tanstack/react-router'
import {
  BarChart3,
  Bot,
  BookOpen,
  CalendarDays,
  CalendarClock,
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  MessagesSquare,
  Salad,
  Shield,
  Trophy,
  Users,
} from 'lucide-react'

import type { Role } from '@/lib/auth/session'

export type ModuleKey =
  | 'dashboard'
  | 'training'
  | 'program'
  | 'planning'
  | 'stats'
  | 'coaching'
  | 'booking'
  | 'messaging'
  | 'ai'
  | 'gamification'
  | 'nutrition'
  | 'catalog'
  | 'admin'

export interface NavItem {
  key: ModuleKey
  to: LinkProps['to']
  label: string
  description: string
  icon: LucideIcon
  /** Roles autorises. Absent = visible par tout utilisateur connecte. */
  roles?: Role[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/**
 * Registre unique de la navigation : sidebar, menu mobile et palette de recherche
 * sont generes a partir de cette liste. Ajouter une feature = ajouter une entree ici.
 */
export const NAVIGATION: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      {
        key: 'dashboard',
        to: '/dashboard',
        label: 'Tableau de bord',
        description: "Vue d'ensemble de votre activité.",
        icon: LayoutDashboard,
      },
      {
        key: 'training',
        to: '/training',
        label: 'Entraînements',
        description: 'Carnet de séances : exercices, séries, charges et ressenti.',
        icon: Dumbbell,
      },
      {
        key: 'program',
        to: '/program',
        label: 'Programmes',
        description: 'Programmes structurés en semaines et séances types.',
        icon: ListChecks,
      },
      {
        key: 'planning',
        to: '/planning',
        label: 'Planning',
        description: 'Calendrier des séances à venir et rappels.',
        icon: CalendarDays,
      },
      {
        key: 'stats',
        to: '/stats',
        label: 'Statistiques',
        description: 'Évolution des charges, du volume et des records personnels.',
        icon: BarChart3,
      },
    ],
  },
  {
    label: 'Coaching',
    items: [
      {
        key: 'coaching',
        to: '/coaching',
        label: 'Coaching',
        description: 'Relation coach / athlètes, suivi et retours.',
        icon: Users,
      },
      {
        key: 'booking',
        to: '/booking',
        label: 'Réservations',
        description: 'Créneaux de coaching disponibles et réservations.',
        icon: CalendarClock,
      },
      {
        key: 'messaging',
        to: '/messaging',
        label: 'Messages',
        description: 'Conversations entre athlètes et coachs.',
        icon: MessagesSquare,
      },
      {
        key: 'ai',
        to: '/ai',
        label: 'Coach IA',
        description: 'Génération de programmes personnalisés par intelligence artificielle.',
        icon: Bot,
      },
    ],
  },
  {
    label: 'Progression',
    items: [
      {
        key: 'gamification',
        to: '/gamification',
        label: 'Défis & badges',
        description: 'Objectifs, séries, badges et classements.',
        icon: Trophy,
      },
      {
        key: 'nutrition',
        to: '/nutrition',
        label: 'Nutrition',
        description: 'Suivi des repas, calories et macronutriments.',
        icon: Salad,
      },
      {
        key: 'catalog',
        to: '/catalog',
        label: 'Exercices',
        description: 'Bibliothèque des exercices, groupes musculaires et matériel.',
        icon: BookOpen,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        key: 'admin',
        to: '/admin',
        label: 'Administration',
        description: 'Gestion des utilisateurs, rôles et modération.',
        icon: Shield,
        roles: ['ADMIN'],
      },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((group) => group.items)

export function getNavItem(key: ModuleKey): NavItem {
  const item = NAV_ITEMS.find((i) => i.key === key)
  if (!item) throw new Error(`Module de navigation inconnu : ${key}`)
  return item
}
