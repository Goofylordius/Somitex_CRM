"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { navItems } from "@/lib/nav";
import type { UserProfile } from "@/lib/types";

interface SidebarProps {
  userProfile: UserProfile | null;
}

export function Sidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-mark">S</div>
        <div>
          <strong>Somitex CRM</strong>
          <p>Secure Workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Hauptnavigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className={cn("sidebar-link", isActive && "is-active")}>
              <Icon size={18} />
              <span>
                <strong>{item.label}</strong>
                <small>{item.caption}</small>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="security-pill">MFA Pflichtbetrieb</div>
        <div className="profile-card">
          <strong>{userProfile?.fullName ?? "Nicht angemeldet"}</strong>
          <p>
            {(userProfile?.role ?? "guest").toUpperCase()}
            {" · "}
            {userProfile?.jobTitle ?? "Restricted"}
          </p>
        </div>
      </div>
    </aside>
  );
}

