"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn, AlertCircle, Lock } from "lucide-react";
import { loginAction, type LoginState } from "@/modules/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-60"
    >
      <LogIn className="h-4 w-4" />
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-300">
          Email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="admin@taichinh.vn"
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-300">
          Mật khẩu
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
        />
      </label>

      <SubmitButton />

      <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-500">
        <Lock className="h-3 w-3" />
        Khu vực quản trị — chỉ dành cho người được cấp quyền.
      </p>
    </form>
  );
}
