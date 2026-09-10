import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Home,
  CalendarCheck,
  UserPlus,
  HandHeart,
  UsersRound,
  Crown,
  CalendarDays,
  Mic2,
  Images,
  Newspaper,
  Megaphone,
  HeartHandshake,
  Wallet,
  Receipt,
  BarChart3,
  ShieldCheck,
  ScrollText,
  Settings,
  HandCoins,
  Landmark,
  ClipboardList,
  PiggyBank,
  ListChecks,
  CheckCheck,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission required to see this item. Omit for items every staff role can see. */
  permission?: string;
  /** Not yet built — shown but disabled so the sidebar reflects the full spec without dead links. */
  comingSoon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users, permission: 'member.view' },
  { label: 'Families', href: '/admin/families', icon: Home, permission: 'member.view' },
  { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck, permission: 'attendance.view' },
  { label: 'Visitors', href: '/admin/visitors', icon: UserPlus, permission: 'visitor.view' },
  { label: 'Ministries', href: '/admin/ministries', icon: HandHeart, permission: 'ministry.view' },
  { label: 'Groups', href: '/admin/groups', icon: UsersRound, permission: 'group.view' },
  { label: 'Leadership', href: '/admin/leadership', icon: Crown, permission: 'leadership.view' },
  { label: 'Events', href: '/admin/events', icon: CalendarDays, permission: 'event.view' },
  { label: 'Sermons', href: '/admin/sermons', icon: Mic2, permission: 'sermon.view' },
  { label: 'Media', href: '/admin/media', icon: Images, permission: 'media.view' },
  { label: 'News', href: '/admin/news', icon: Newspaper, permission: 'news.view' },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, permission: 'announcement.view' },
  { label: 'Prayer Requests', href: '/admin/prayer-requests', icon: HeartHandshake, permission: 'prayer-request.view' },
  { label: 'Tithes', href: '/admin/tithes', icon: HandCoins, permission: 'finance.view' },
  { label: 'Giving', href: '/admin/giving', icon: Wallet, permission: 'finance.view' },
  { label: 'Expenses', href: '/admin/expenses', icon: Receipt, permission: 'finance.view' },
  { label: 'Funds', href: '/admin/funds', icon: PiggyBank, permission: 'finance.view' },
  { label: 'Liabilities', href: '/admin/liabilities', icon: ClipboardList, permission: 'finance.view' },
  { label: 'Budgets', href: '/admin/budgets', icon: ListChecks, permission: 'finance.view' },
  { label: 'Financial Statements', href: '/admin/balance-sheet', icon: Landmark, permission: 'finance.report' },
  { label: 'Reconciliation', href: '/admin/reconciliation', icon: CheckCheck, permission: 'finance.view' },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3, permission: 'finance.report' },
  { label: 'Users', href: '/admin/users', icon: ShieldCheck, permission: 'user.view' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText, permission: 'audit.view' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.manage' },
];
