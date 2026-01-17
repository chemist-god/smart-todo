import { CheckIcon } from "@heroicons/react/24/outline";

export function Pricing() {
    return (
        <section id="pricing" className="py-24 sm:py-32 relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-jakarta">Simple, transparent pricing</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Start for free, upgrade when you need to.</p>
                </div>

                <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                    {/* Free Tier */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 xl:p-10 ring-1 ring-white/10 hover:ring-white/20 transition-all">
                        <h3 className="text-lg font-semibold leading-8 text-foreground">Starter</h3>
                        <p className="text-sm leading-6 text-muted-foreground">Perfect for individuals just getting started.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">$0</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </p>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            {['Up to 5 Projects', 'Basic Analytics', 'Standard Support', 'Mobile App Access'].map(feature => (
                                <li key={feature} className="flex gap-x-3">
                                    <CheckIcon className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <a href="#" className="mt-8 block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors">
                            Get started
                        </a>
                    </div>

                    {/* Pro Tier (Highlighted) */}
                    <div className="rounded-3xl border border-indigo-500/50 bg-indigo-500/5 p-8 xl:p-10 ring-1 ring-indigo-500/50 relative">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 lg:translate-x-0 mr-6">
                            <span className="inline-flex items-center rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-indigo-600/10">Most Popular</span>
                        </div>
                        <h3 className="text-lg font-semibold leading-8 text-foreground">Pro</h3>
                        <p className="text-sm leading-6 text-muted-foreground">For power users who need more focus.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">$12</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </p>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            {['Unlimited Projects', 'Advanced Analytics', 'Priority Support', 'Focus Mode (AI)', 'Goal Tracking'].map(feature => (
                                <li key={feature} className="flex gap-x-3">
                                    <CheckIcon className="h-6 w-5 flex-none text-indigo-400" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <a href="#" className="mt-8 block rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors shadow-indigo-500/20">
                            Upgrade to Pro
                        </a>
                    </div>

                    {/* Team Tier */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 xl:p-10 ring-1 ring-white/10 hover:ring-white/20 transition-all">
                        <h3 className="text-lg font-semibold leading-8 text-foreground">Team</h3>
                        <p className="text-sm leading-6 text-muted-foreground">Collaborate with your entire organization.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">$49</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </p>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            {['Unlimited Members', 'Team Analytics', 'Dedicated Success Manager', 'SSO & Advanced Security', 'API Access'].map(feature => (
                                <li key={feature} className="flex gap-x-3">
                                    <CheckIcon className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <a href="#" className="mt-8 block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors">
                            Contact Sales
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
