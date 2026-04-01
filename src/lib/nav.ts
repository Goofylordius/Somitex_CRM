import { LayoutDashboard, ShieldCheck, Users, BriefcaseBusiness, ListTodo, Scale } from "lucide-react";

export const navItems = [
  {
    href: "/",
    label: "Dashboard",
    caption: "KPIs & Fokus",
    icon: LayoutDashboard
  },
  {
    href: "/contacts",
    label: "Kontakte",
    caption: "PII kontrolliert",
    icon: Users
  },
  {
    href: "/deals",
    label: "Pipeline",
    caption: "Deals & Leads",
    icon: BriefcaseBusiness
  },
  {
    href: "/tasks",
    label: "Aufgaben",
    caption: "Faelligkeiten",
    icon: ListTodo
  },
  {
    href: "/security",
    label: "Sicherheit",
    caption: "Audit & Sessions",
    icon: ShieldCheck
  },
  {
    href: "/compliance",
    label: "Compliance",
    caption: "DSAR & Consent",
    icon: Scale
  }
] as const;

