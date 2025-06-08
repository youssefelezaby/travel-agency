import type { Route } from "./+types/sign-in";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, redirect, useSearchParams } from "react-router";
import { loginWithGoogle } from "~/appwrite/auth";
import { account } from "~/appwrite/client";
import { useEffect, useState } from "react";

// Import debug utility in development
if (import.meta.env.DEV) {
  import("~/lib/oauth-debug");
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Sign in to Explore the app" },
  ];
}

export async function clientLoader() {
  try {
    const user = await account.get();
    if (user.$id) return redirect("/");
  } catch (error) {
    console.error("Error fetching user:", error);
  }
  return null;
}

const SignIn = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth error in URL params
    const oauthError = searchParams.get("error");
    if (oauthError === "oauth_failed") {
      setError("Sign in failed. Please try again.");
    }
  }, [searchParams]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
      setError("Sign in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <header className="header">
            <Link to="/">
              <img
                src="/assets/icons/logo.svg"
                alt="logo"
                className="size-[30px]"
              />
            </Link>

            <h1 className="p-28-bold text-dark-100">Tourvisto</h1>
          </header>

          <article>
            <h2 className="p-28-semibold text-dark-100 text-center">
              Start Your Travel Journey
            </h2>

            <p className="p-18-regular text-center text-gray-100 !leading-7">
              Sign in with Google to explore AI-generated itineraries, trending
              destinations, and much more
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
          </article>

          <ButtonComponent
            type="button"
            iconCss="e-search-icon"
            className="button-class !h-11 !w-full"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="p-18-semibold text-white">Signing in...</span>
              </div>
            ) : (
              <>
                <img
                  src="/assets/icons/google.svg"
                  alt="google"
                  className="size-5"
                />
                <span className="p-18-semibold text-white">
                  Sign in with Google
                </span>
              </>
            )}
          </ButtonComponent>
        </div>
      </section>
    </main>
  );
};

export default SignIn;
