export function Faq() {
    const faqs = [
        {
            question: "How does the AI prioritization work?",
            answer: "Our AI analyzes your task list, deadlines, estimated effort, and your past completion patterns to suggest the most impactful task to work on next."
        },
        {
            question: "Is there a mobile app?",
            answer: "Yes! Smart Todo is available on iOS and Android. Your data syncs instantly across all your devices."
        },
        {
            question: "Can I use it offline?",
            answer: "Absolutely. You can creating and editing tasks offline. Changes will sync once you're back online."
        },
        {
            question: "Do you offer student discounts?",
            answer: "Yes, we offer 50% off for students with a valid .edu email address. Contact support to apply."
        }
    ];

    return (
        <section id="faq" className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold leading-10 tracking-tight text-foreground font-jakarta">Frequently asked questions</h2>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                        Have a different question and can't find the answer you're looking for? Reach out to our support team.
                    </p>
                </div>
                <div className="mt-20 max-w-2xl mx-auto divide-y divide-white/10">
                    {faqs.map((faq, i) => (
                        <div key={i} className="py-8">
                            <details className="group cursor-pointer">
                                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                                    <span>{faq.question}</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <p className="group-open:animate-fadeIn mt-3 text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </details>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
