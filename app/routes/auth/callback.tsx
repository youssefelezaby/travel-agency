import type { Route } from "./+types/callback";
import { redirect } from "react-router";
import { handleOAuthCallback } from "~/appwrite/auth";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Authenticating..." },
    { name: "description", content: "Processing authentication..." },
  ];
}

export async function clientLoader() {
  try {
    return await handleOAuthCallback();
  } catch (error) {
    console.error("OAuth callback error:", error);
    return redirect("/sign-in?error=oauth_failed");
  }
}

const AuthCallback = () => {
  useEffect(() => {
    // Fallback handling in case clientLoader doesn't redirect
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="p-24-semibold text-dark-100 text-center">
              Completing Sign In...
            </h2>
            <p className="p-16-regular text-center text-gray-100">
              Please wait while we finish setting up your account.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthCallback;
