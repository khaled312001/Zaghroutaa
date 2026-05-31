"use client";

import { useActionState } from "react";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { loginAction, type LoginState } from "../actions";

const inputClass =
  "w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200 placeholder:text-espresso-400";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-2xl border border-blush-200 bg-blush-50 px-4 py-3 text-sm font-medium text-blush-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-espresso-700">البريد الإلكتروني</span>
        <input name="email" type="email" dir="ltr" required className={inputClass} placeholder="eman@zaghroutaa.com" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-espresso-700">كلمة المرور</span>
        <input name="password" type="password" required className={inputClass} placeholder="••••••••" />
      </label>
      <button type="submit" disabled={pending} className="btn-gold w-full">
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> جاري الدخول...
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" /> دخول
          </>
        )}
      </button>
    </form>
  );
}
