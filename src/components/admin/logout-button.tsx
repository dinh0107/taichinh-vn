"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { logoutAction } from "@/modules/auth/actions";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
      title="Đăng xuất"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Đăng xuất</span>
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Inner />
    </form>
  );
}
