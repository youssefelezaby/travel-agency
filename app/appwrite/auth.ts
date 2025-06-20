import { ID, OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";

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
    // Initial OAuth2 flow - redirect to Google
    account.createOAuth2Token(
      OAuthProvider.Google,
      `${window.location.origin}/oauth-callback`,
      `${window.location.origin}/404`
    );
  } catch (error) {
    console.error("Error during OAuth2 session creation:", error);
  }
};

export const handleOAuth2Callback = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');

    if (!userId || !secret) {
      console.error("Missing OAuth2 credentials in URL");
      return false;
    }

    // Create session with the OAuth2 credentials
    await account.createSession(userId, secret);
    
    // Check if user exists in our database
    const existingUser = await getExistingUser(userId);
    
    if (!existingUser) {
      // Store user data if they don't exist in our database
      await storeUserData();
    }
    
    // Clean up URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return true;
  } catch (error) {
    console.error("Error handling OAuth2 callback:", error);
    return false;
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
