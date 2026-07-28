"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

function HeaderProfileBtn() {
  const { user, signOut } = useAuthContext();

  if (!user) {
    return (
      <Link href="/sign-in">
        <Button variant="primary" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="flex items-center gap-2 text-body-sm font-medium text-ink hover:text-link transition-colors"
      >
        <User className="w-4 h-4 text-link" />
        <span>{user.name}</span>
      </Link>
      <button
        onClick={signOut}
        title="Sign Out"
        className="p-1.5 text-mute hover:text-error rounded-md transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}

export default HeaderProfileBtn;
