export function ValueProp() {
    return (
        <section id="how" className="py-24 sm:py-32 bg-black/40 relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-jakarta">How Smart Todo works</h2>
                    <p className="mt-4 text-lg text-muted-foreground">From chaos to clarity in three simple steps.</p>
                </div>

                <div className="space-y-24">
                    {/* Step 1 */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="aspect-video rounded-2xl border border-white/10 bg-white/5 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
                                {/* Abstract UI representation */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border border-white/10 bg-black/60 rounded-xl shadow-2xl flex flex-col p-4">
                                    <div className="h-4 w-1/3 bg-white/10 rounded mb-4" />
                                    <div className="space-y-2">
                                        <div className="h-8 bg-white/5 rounded w-full" />
                                        <div className="h-8 bg-white/5 rounded w-full" />
                                        <div className="h-8 bg-white/5 rounded w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-6 border border-blue-500/20">1</div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">Capture everything instantly</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Don't let ideas slip away. Capture tasks, notes, and goals in seconds with our Quick Add. AI automatically categorizes and tags them for you.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-6 border border-purple-500/20">2</div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">Focus on what matters</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Our Smart Feed filters out the noise. See only what you need to do today, prioritized by deadline and importance.
                            </p>
                        </div>
                        <div>
                            <div className="aspect-video rounded-2xl border border-white/10 bg-white/5 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-transparent" />
                                {/* Abstract UI representation */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-purple-500/20 flex items-center justify-center">
                                    <div className="w-48 h-48 rounded-full border border-purple-500/40 flex items-center justify-center animate-pulse">
                                        <div className="text-xs text-purple-200">Focus Mode</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="aspect-video rounded-2xl border border-white/10 bg-white/5 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                                {/* Abstract UI representation */}
                                <div className="absolute bottom-0 left-10 right-10 h-1/2 bg-white/5 border-t border-x border-white/10 rounded-t-xl p-4 grid grid-cols-4 gap-2 items-end">
                                    <div className="h-[40%] bg-emerald-500/20 rounded" />
                                    <div className="h-[70%] bg-emerald-500/30 rounded" />
                                    <div className="h-[50%] bg-emerald-500/20 rounded" />
                                    <div className="h-[90%] bg-emerald-500/40 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-6 border border-emerald-500/20">3</div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">Track progress & improve</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Visualize your productivity with beautiful charts. Understand your peak hours and build better habits over time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
