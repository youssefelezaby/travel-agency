import { ID, OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";

// Helper function to detect mobile devices
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper function to check if we're in a popup window
const isPopupWindow = () => {
  try {
    return window.opener && window.opener !== window;
  } catch {
    return false;
  }
};

export const getExistingUser = async (id: string) => {
  try {
    const { documents, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", id)]
    );
    return total > 0 ? documents[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const getAllUsers = async (limit: number, offset: number) => {
  try {
    const { documents: users, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(limit), Query.offset(offset)]
    );

    if (total === 0) return { users: [], total }; // Return total for pagination

    const usersWithItineraryCount = await Promise.all(
      users.map(async (user) => {
        const { total: itineraryCount } = await database.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.tripCollectionId,
          [Query.equal("userId", user.accountId)]
        );
        return {
          accountId: user.accountId,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          joinedAt: user.joinedAt,
          status: user.status,
          itineraryCount,
        };
      })
    );

    return { users: usersWithItineraryCount, total };
  } catch (error) {
    console.error("Error fetching users with itinerary count:", error);
    return { users: [], total: 0 };
  }
};

export const storeUserData = async () => {
  try {
    const user = await account.get();
    if (!user) throw new Error("User not found");

    const { providerAccessToken } = (await account.getSession("current")) || {};
    const profilePicture = providerAccessToken
      ? await getGooglePicture(providerAccessToken)
      : null;

    const createdUser = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: profilePicture,
        joinedAt: new Date().toISOString(),
      }
    );

    if (!createdUser.$id) redirect("/sign-in");
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

const getGooglePicture = async (accessToken: string) => {
  try {
    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=photos",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) throw new Error("Failed to fetch Google profile picture");

    const { photos } = await response.json();
    return photos?.[0]?.url || null;
  } catch (error) {
    console.error("Error fetching Google picture:", error);
    return null;
  }
};

export const loginWithGoogle = async () => {
  try {
    const successUrl = `${window.location.origin}/auth/callback`;
    const failureUrl = `${window.location.origin}/sign-in?error=oauth_failed`;

    // For mobile devices, always use redirect method
    if (isMobileDevice()) {
      // Store the intended redirect URL in localStorage for mobile
      localStorage.setItem(
        "oauth_redirect_after_login",
        window.location.pathname
      );

      // Use redirect-based OAuth for mobile
      await account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      );
    } else {
      // For desktop, try popup first, fallback to redirect
      try {
        await account.createOAuth2Session(
          OAuthProvider.Google,
          successUrl,
          failureUrl
        );
      } catch (popupError) {
        console.warn("Popup blocked, falling back to redirect:", popupError);
        // Fallback to redirect method
        await account.createOAuth2Session(
          OAuthProvider.Google,
          successUrl,
          failureUrl
        );
      }
    }
  } catch (error) {
    console.error("Error during OAuth2 session creation:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

export const getUser = async () => {
  try {
    const user = await account.get();
    if (!user) return redirect("/sign-in");

    const { documents } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal("accountId", user.$id),
        Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
      ]
    );

    return documents.length > 0 ? documents[0] : redirect("/sign-in");
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const handleOAuthCallback = async () => {
  try {
    // Check if user is authenticated after OAuth callback
    const user = await account.get();
    if (user) {
      // Check if user exists in database
      const existingUser = await getExistingUser(user.$id);

      if (!existingUser) {
        // Store user data if they're new
        await storeUserData();
      }

      // Get redirect URL from localStorage (for mobile) or default to home
      const redirectTo =
        localStorage.getItem("oauth_redirect_after_login") || "/";
      localStorage.removeItem("oauth_redirect_after_login");

      // Close popup if this is a popup window
      if (isPopupWindow()) {
        window.close();
        return;
      }

      // Redirect to intended page
      return redirect(redirectTo);
    } else {
      return redirect("/sign-in?error=oauth_failed");
    }
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return redirect("/sign-in?error=oauth_failed");
  }
};
