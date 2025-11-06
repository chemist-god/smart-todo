import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthStatus from "@/components/auth/AuthStatus";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background text-foreground overflow-hidden">
      {/* Aurora background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-56 -left-24 h-[60vh] w-[60vh] rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute top-20 -right-32 h-[50vh] w-[50vh] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[55vh] w-[75vw] rounded-[40%] bg-indigo-500/15 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex h-14 items-center justify-between rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl px-3 sm:px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Smart Todo" width={28} height={28} className="h-7 w-7" />
              <span className="hidden sm:inline text-sm font-semibold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Smart Todo</span>
            </div>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <a href="#features" className="px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors">Features</a>
              <a href="#how" className="px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors">How it works</a>
              <a href="#faq" className="px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/help" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground px-2 py-1.5">Help</Link>
              <AuthStatus size="sm" label="Sign In" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
              <SparklesIcon className="h-3.5 w-3.5" />
              Productivity reimagined with AI assistance
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">Focus better.</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Achieve more.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl">
              Smart Todo is your personal productivity ecosystem — intelligent todos, goals, analytics, calendar, and a unified timer. Built for speed, clarity, and deep focus.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-xl">
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-3 py-2">
                <CheckCircleIcon className="h-4 w-4 text-primary" />
                <span className="text-sm">Intelligent Tasks</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-3 py-2">
                <ClockIcon className="h-4 w-4 text-primary" />
                <span className="text-sm">Timer & Calendar</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-3 py-2">
                <ChartBarIcon className="h-4 w-4 text-primary" />
                <span className="text-sm">Deep Analytics</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <AuthStatus size="lg" label="Get started — it's free" className="w-full sm:w-auto" />
              <Link href="#features" className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border/60 text-foreground hover:bg-muted/40 transition-colors">
                Learn more
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">No credit card required</p>
          </div>

          {/* Visual mock */}
          <div className="relative">
            <div className="relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-xl p-4 sm:p-6">
              {/* top bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70"></span>
                </div>
                <div className="text-xs text-muted-foreground">Preview</div>
              </div>

              {/* mock content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Todos card */}
                <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">Today</div>
                    <span className="text-xs text-muted-foreground">3/5</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary/60"></span><span>Finish wireframes</span></div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500/60"></span><span>Daily review</span></div>
                    <div className="flex items-center gap-2 opacity-70"><span className="h-2 w-2 rounded-full bg-muted-foreground/40"></span><span>Plan next sprint</span></div>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary to-primary/70"></div>
                  </div>
                </div>

                {/* Analytics card */}
                <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">Focus analytics</div>
                    <span className="text-xs text-muted-foreground">This week</span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[40, 55, 72, 60].map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-6 sm:w-8 rounded-full bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${h}px` }} />
                        <span className="text-[10px] text-muted-foreground">{['M','T','W','T'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar card */}
                <div className="rounded-2xl border border-border/50 bg-background/60 p-4 sm:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium"><CalendarIcon className="h-4 w-4" /> Calendar</div>
                    <span className="text-xs text-muted-foreground">Nov</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 text-[10px]">
                    {[...Array(28)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg border border-border/40 bg-card/40 flex items-center justify-center">
                        {i % 6 === 0 ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : <span>{i+1}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to stay in flow</h2>
          <p className="mt-3 text-muted-foreground">A minimal system powered by thoughtful design. Seamless across devices.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[{
            title: 'Intelligent Todos',
            desc: 'Prioritize, focus, and finish with clarity.',
            Icon: CheckCircleIcon
          },{
            title: 'Deep Analytics',
            desc: 'Understand your habits and optimize time.',
            Icon: ChartBarIcon
          },{
            title: 'Calendar & Timer',
            desc: 'Plan and execute with rhythm.',
            Icon: ClockIcon
          },{
            title: 'Stakes & Goals',
            desc: 'Make progress visible and meaningful.',
            Icon: CurrencyDollarIcon
          }].map(({title, desc, Icon}) => (
            <div key={title} className="rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-sm hover:bg-card/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Smart Todo. Built with the Aurora design system.</p>
          <div className="text-xs text-muted-foreground">Privacy · Terms</div>
        </div>
      </footer>
    </main>
  );
}
