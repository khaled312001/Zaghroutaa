import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-radial px-6 text-center">
      <Image src="/logo.png" alt="زُغْرُوطَة" width={120} height={120} className="opacity-90" />
      <h1 className="mt-6 font-display text-6xl font-extrabold text-gold-gradient">٤٠٤</h1>
      <p className="mt-3 text-xl font-bold text-espresso-800">الصفحة دي مش موجودة</p>
      <p className="mt-2 max-w-md text-espresso-600">
        يمكن الرابط اتغيّر أو القطعة اتشالت. ارجعي للرئيسية وكملي تسوّقك 🌷
      </p>
      <Link href="/" className="btn-gold mt-7">
        <Home className="h-5 w-5" /> الرجوع للرئيسية
      </Link>
    </div>
  );
}
