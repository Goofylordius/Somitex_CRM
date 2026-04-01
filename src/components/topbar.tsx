"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import type { UserProfile } from "@/lib/types";

const titles: Record<string, { eyebrow: string; title: string }> = {
  "/": { eyebrow: "Workspace", title: "Dashboard" },
  "/contacts": { eyebrow: "Client Core", title: "Kontakte" },
  "/deals": { eyebrow: "Deal Pipeline", title: "Pipeline" },
  "/tasks": { eyebrow: "Client Tasks", title: "Aufgaben" },
  "/security": { eyebrow: "Cyber Security", title: "Sicherheit" },
  "/compliance": { eyebrow: "Datenschutz", title: "Compliance" }
};

interface TopbarProps {
  userProfile: UserProfile | null;
}

export function Topbar({ userProfile }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const current = titles[pathname] ?? titles["/"];

  async function handleLogout() {
    setBusy(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });

      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">{current.eyebrow}</div>
        <h1>{current.title}</h1>
      </div>
      <div className="topbar-actions">
        <span className="status-chip status-ok">
          <ShieldCheck size={14} />
          Security Active
        </span>
        <span className="status-chip">
          {userProfile?.mfaEnabled ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {userProfile?.mfaEnabled ? "AAL2" : "AAL1"}
        </span>
        <button type="button" className="icon-button" onClick={handleLogout} disabled={busy}>
          <LogOut size={16} />
          <span>{busy ? "..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}

