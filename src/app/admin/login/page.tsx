import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول — لوحة التحكم",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-radial px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="زُغْرُوطَة" width={88} height={88} className="rounded-full ring-1 ring-gold-200" />
          <h1 className="mt-4 font-display text-2xl font-bold text-espresso-900">
            لوحة تحكّم زُغْرُوطَة
          </h1>
          <p className="mt-1 text-sm text-espresso-500">أهلاً إيمان، سجّلي دخولك للوحة التحكم</p>
        </div>
        <div className="card-zg p-6 sm:p-8">
          <LoginForm />
        </div>
        <p className="mt-5 text-center text-xs text-espresso-400">
          لوحة التحكم خاصة بإدارة زُغْرُوطَة فقط.
        </p>
      </div>
    </div>
  );
}
