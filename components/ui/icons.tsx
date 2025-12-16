import {
  Loader2,
  LogOut,
  Mail,
  User,
  Settings,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  ChevronRight,
  Check,
  AlertCircle,
  Lock,
  Key,
  Bell,
  Server,
  Building,
  Github,
  ShieldAlert,
  MonitorSmartphone,
  FileText,
  Palette,
  Globe,
  BarChart,
  Webhook,
  Database,
  Link,
  ScrollText,
  TrendingUp,
} from "lucide-react"

export const Icons = {
  spinner: Loader2,
  logout: LogOut,
  mail: Mail,
  user: User,
  settings: Settings,
  dashboard: LayoutDashboard,
  shield: Shield,
  menu: Menu,
  close: X,
  chevronRight: ChevronRight,
  check: Check,
  alert: AlertCircle,
  lock: Lock,
  key: Key,
  bell: Bell,
  server: Server,
  building: Building,
  gitHub: Github,
  shieldAlert: ShieldAlert,
  monitorSmartphone: MonitorSmartphone,
  fileText: FileText,
  palette: Palette,
  globe: Globe,
  barChart: BarChart,
  webhook: Webhook,
  database: Database,
  link: Link,
  scrollText: ScrollText,
  trendingUp: TrendingUp,
  google: ({ ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
}
