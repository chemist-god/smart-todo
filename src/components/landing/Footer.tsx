import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-black/40 border-t border-white/5" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="Smart Todo" width={32} height={32} className="h-8 w-8" />
                            <span className="text-lg font-bold font-jakarta tracking-tight">Smart Todo</span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground max-w-xs">
                            The intelligent workspace for high-performers. Master your time, focus, and goals.
                        </p>
                        <div className="flex space-x-6">
                            {/* Social placeholders */}
                            {[1, 2, 3, 4].map((i) => (
                                <a key={i} href="#" className="text-muted-foreground hover:text-foreground">
                                    <span className="sr-only">Social</span>
                                    <div className="h-6 w-6 bg-current opacity-50 rounded" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Product</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {['Features', 'Integrations', 'Pricing', 'Changelog'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Resources</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {['Documentation', 'API Reference', 'Community', 'Blog'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Company</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {['About', 'Careers', 'Legal', 'Privacy'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Stay updated</h3>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">Subscribe to our newsletter for tips and updates.</p>
                                <form className="mt-4 sm:flex sm:max-w-md">
                                    <label htmlFor="email-address" className="sr-only">Email address</label>
                                    <input type="email" name="email-address" id="email-address" autoComplete="email" required className="w-full min-w-0 appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-base leading-7 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:w-56 sm:text-sm sm:leading-6" placeholder="Enter your email" />
                                    <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                                        <button type="submit" className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Subscribe</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-xs leading-5 text-muted-foreground">&copy; {new Date().getFullYear()} Smart Todo, Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
