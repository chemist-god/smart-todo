"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyRequestContent() {
    const [token, setToken] = useState("");
    const [type, setType] = useState("EMAIL_VERIFICATION");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [devToken, setDevToken] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for token in URL params (for development)
    useEffect(() => {
        const urlToken = searchParams.get('token');
        const urlType = searchParams.get('type');

        if (urlToken) {
            setToken(urlToken);
            setDevToken(urlToken);
        }

        if (urlType) {
            setType(urlType);
        }
    }, [searchParams]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, type }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Account verified successfully! You can now sign in.");
                setTimeout(() => {
                    router.push("/auth/signin");
                }, 2000);
            } else {
                setError(data.error || "Verification failed");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: "your-email@example.com", // This should come from the registration flow
                    type,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Verification token sent successfully!");
            } else {
                setError(data.error || "Failed to resend verification");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verify your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter the verification code sent to your email or phone
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="flex mb-4">
                        <button
                            type="button"
                            onClick={() => setType("EMAIL_VERIFICATION")}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${type === "EMAIL_VERIFICATION"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-700 border-gray-300"
                                }`}
                        >
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("PHONE_VERIFICATION")}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border ${type === "PHONE_VERIFICATION"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-700 border-gray-300"
                                }`}
                        >
                            Phone
                        </button>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label htmlFor="token" className="sr-only">
                                Verification Code
                            </label>
                            <input
                                id="token"
                                name="token"
                                type="text"
                                required
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter verification code"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}

                        {success && (
                            <div className="text-green-600 text-sm text-center">{success}</div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isLoading ? "Verifying..." : "Verify Account"}
                            </button>

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isLoading ? "Sending..." : "Resend Code"}
                            </button>
                        </div>
                    </form>

                    {/* Development Token Display */}
                    {process.env.NODE_ENV === 'development' && devToken && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                            <h3 className="text-sm font-medium text-yellow-800 mb-2">
                                🚧 Development Mode - Verification Token
                            </h3>
                            <div className="bg-yellow-100 p-3 rounded border">
                                <p className="text-sm text-yellow-700 mb-2">
                                    Copy this token to verify your account:
                                </p>
                                <code className="block text-lg font-mono bg-white p-2 rounded border text-center">
                                    {devToken}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(devToken)}
                                    className="mt-2 text-xs text-yellow-600 hover:text-yellow-800 underline"
                                >
                                    Copy to clipboard
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Check your {type === "EMAIL_VERIFICATION" ? "email" : "phone"} for the verification code.
                            {process.env.NODE_ENV === 'development' && (
                                <>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        (Development: Token is shown above and logged to console)
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyRequestPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyRequestContent />
        </Suspense>
    );
}
