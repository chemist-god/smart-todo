import { ChartBarIcon, ClockIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";

export function FeaturesGrid() {
    return (
        <section id="features" className="py-24 sm:py-32 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-3xl rounded-full -z-10" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-jakarta">
                        Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">modern workflow</span>
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        A complete ecosystem designed to keep you in flow state. No clutter, just clarity.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2">

                        {/* Feature 1: Intelligent Focus (Large) */}
                        <div className="relative lg:col-span-2 lg:row-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <SparklesIcon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground">Intelligent Focus</h3>
                                    </div>
                                    <p className="text-muted-foreground max-w-md">Our AI analyzes your habits to suggest the perfect task for right now. Enter flow state faster than ever.</p>
                                </div>
                                {/* Abstract Visual Placeholder for Tasks */}
                                <div className="mt-8 relative h-64 w-full rounded-2xl border border-white/5 bg-black/40 overflow-hidden shadow-inner">
                                    <div className="absolute top-4 left-4 right-4 space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
                                                <div className={`h-5 w-5 rounded-full border border-white/20 ${i === 1 ? 'bg-indigo-500 border-indigo-500' : ''}`} />
                                                <div className="h-2 w-32 rounded bg-white/10" />
                                                <div className="ml-auto h-2 w-8 rounded bg-white/5" />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Gradient overlay to simulate "infinity" list */}
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Analytics (Tall) */}
                        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 overflow-hidden group row-span-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                                    <ChartBarIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Deep Analytics</h3>
                                <p className="text-sm text-muted-foreground mb-6"> visualize your productivity trends over time.</p>

                                {/* Abstract Chart */}
                                <div className="flex items-end gap-2 h-40 mt-auto">
                                    {[40, 70, 45, 90, 60, 85].map((h, i) => (
                                        <div key={i} className="w-full bg-emerald-500/20 rounded-t-lg relative group-hover:bg-emerald-500/30 transition-colors" style={{ height: `${h}%` }}>
                                            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-400/50" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Calendar (Wide) */}
                        <div className="relative lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-8 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
                                        <ClockIcon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">Smart Calendar</h3>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4: Goals */}
                        <div className="relative lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-8 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div>
                                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                                    <CheckCircleIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Goal Tracking</h3>
                            </div>
                        </div>

                        {/* Feature 5: Stake */}
                        <div className="relative lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-8 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div>
                                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                                    <CheckCircleIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Smart Stake</h3>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
