import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthStatus from "@/components/auth/AuthStatus";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Todo</h1>
          <p className="text-gray-600 mb-8">Your Personal Productivity Ecosystem</p>
        </div>
        <AuthStatus />
      </div>
    </main>
  );
}
