import type { PropsWithChildren } from "react";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import type { UserProfile } from "@/lib/types";

interface AppShellProps extends PropsWithChildren {
  userProfile: UserProfile | null;
}

export function AppShell({ children, userProfile }: AppShellProps) {
  return (
    <div className="shell">
      <Sidebar userProfile={userProfile} />
      <div className="shell-content">
        <Topbar userProfile={userProfile} />
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}

