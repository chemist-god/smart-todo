import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthStatus from "@/components/auth/AuthStatus";

// Landing Page Components
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ValueProp } from "@/components/landing/ValueProp";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Navbar Overlay */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex h-14 items-center justify-between rounded-full border border-white/10 bg-black/50 backdrop-blur-xl px-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Smart Todo" width={24} height={24} className="h-6 w-6" />
              <span className="font-bold tracking-tight font-jakarta">Smart Todo</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="#how" className="hover:text-foreground transition-colors">How it works</Link>
              <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/auth/signin" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link href="/auth/signup" className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <Hero />
      <SocialProof />
      <FeaturesGrid />
      <ValueProp />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
