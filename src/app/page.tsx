import AuthStatus from "@/components/auth/AuthStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Smart Todo</h1>
        <AuthStatus />
      </div>
    </main>
  );
}
