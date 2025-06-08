import type { Route } from "./+types/oauth-callback";
import { redirect } from "react-router";
import { handleOAuth2Callback } from "~/appwrite/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Authenticating..." },
    { name: "description", content: "Processing OAuth authentication" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const secret = url.searchParams.get('secret');

    if (!userId || !secret) {
      console.error("Missing OAuth2 credentials in URL");
      return redirect("/sign-in");
    }

    // Handle OAuth callback on the client side
    const success = await handleOAuth2Callback();
    
    if (success) {
      return redirect("/");
    } else {
      return redirect("/sign-in");
    }
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return redirect("/sign-in");
  }
}

const OAuthCallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg">Authenticating...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;