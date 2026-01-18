export function SocialProof() {
    const companies = [
        { name: "Acme Corp", opacity: "opacity-40" },
        { name: "Quantum", opacity: "opacity-60" },
        { name: "Echo Valley", opacity: "opacity-30" },
        { name: "Neptune", opacity: "opacity-50" },
        { name: "Global Bank", opacity: "opacity-60" },
        { name: "Nia", opacity: "opacity-40" },
    ];

    return (
        <div className="py-12 sm:py-16 border-y border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="text-center text-sm font-semibold leading-8 text-muted-foreground mb-8">
                    Trusted by the world's most innovative teams
                </h2>
                <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-6 pl-[5%]">
                    {/* 
               In a real scenario, use <Image /> here with grayscale classes.
               For now, using text/abstract placeholders 
            */}
                    {companies.map((brand, i) => (
                        <div key={i} className={`flex items-center justify-center grayscale invert dark:invert-0 ${brand.opacity} hover:opacity-100 transition-opacity duration-300`}>
                            <div className="h-8 w-24 rounded bg-current opacity-20" /* Placeholder for logo */ />
                            <span className="sr-only">{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
