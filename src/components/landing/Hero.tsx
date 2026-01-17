import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
            {/* Background Gradients */}
            <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Text Content */}
                    <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted-foreground backdrop-blur-md mb-6 ring-1 ring-white/10 hover:bg-white/10 transition-colors cursor-default">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-medium text-primary">v2.0 is now live</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground font-jakarta mb-6 leading-[1.1]">
                            Master your flow with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x">
                                Intelligent Focus
                            </span>
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-xl mx-auto lg:mx-0">
                            Stop juggling tasks. Smart Todo combines AI-driven prioritization, deep focus timers, and adaptive scheduling into one beautiful workspace.
                        </p>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
                            <Link
                                href="/dashboard"
                                className="group relative inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 hover:scale-105"
                            >
                                Get Started Free
                                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
                            </Link>
                            <Link href="#features" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
                                See how it works <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-xs text-muted-foreground">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden`}>
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by <span className="font-semibold text-foreground">10,000+</span> creators</p>
                        </div>
                    </div>

                    {/* Abstract Composition Visual (Changes to Image later) */}
                    <div className="relative isolate">
                        {/* Glow effect behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[100px] -z-10 rounded-full" />

                        {/* Main Glass Card */}
                        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ease-out">
                            <div className="rounded-xl border border-white/5 bg-black/40 aspect-[4/3] overflow-hidden relative">
                                {/* Placeholder content for specific areas to simulate UI */}
                                <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                                </div>
                                {/* Abstract Shapes representing content */}
                                <div className="p-8 space-y-4 pt-14">
                                    <div className="h-8 w-1/3 rounded-lg bg-white/10 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-full rounded-md bg-white/5" />
                                        <div className="h-4 w-5/6 rounded-md bg-white/5" />
                                        <div className="h-4 w-4/6 rounded-md bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="h-24 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 p-4">
                                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 mb-2" />
                                            <div className="h-2 w-12 rounded bg-emerald-500/20" />
                                        </div>
                                        <div className="h-24 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/10 p-4">
                                            <div className="h-8 w-8 rounded-full bg-violet-500/20 mb-2" />
                                            <div className="h-2 w-12 rounded bg-violet-500/20" />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements (Parallax feel) */}
                                <div className="absolute -right-8 top-20 bg-card p-3 rounded-lg border border-border shadow-xl transform rotate-6 animate-bounce delay-1000 duration-[3000ms]">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <SparklesIcon className="h-4 w-4" />
                                        </div>
                                        <div className="text-xs">
                                            <div className="font-semibold">Goal Reached!</div>
                                            <div className="text-muted-foreground">+250 XP</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom gradient */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
                <div
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                />
            </div>
        </section>
    );
}
