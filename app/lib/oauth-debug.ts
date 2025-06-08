// Test utility to check OAuth configuration
// Run this in the browser console to debug OAuth issues

export const debugOAuth = () => {
  console.log("🔍 OAuth Debug Information:");
  console.log("Current URL:", window.location.href);
  console.log("User Agent:", navigator.userAgent);
  console.log(
    "Is Mobile:",
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
  console.log("Is Popup:", window.opener && window.opener !== window);
  console.log(
    "Local Storage OAuth Redirect:",
    localStorage.getItem("oauth_redirect_after_login")
  );

  // Test localStorage availability
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    console.log("✅ localStorage is available");
  } catch (error) {
    console.log("❌ localStorage is not available:", error);
  }

  // Test window.location functionality
  try {
    const testUrl = window.location.href;
    console.log("✅ window.location is accessible:", testUrl);
  } catch (error) {
    console.log("❌ window.location error:", error);
  }

  // Test Appwrite client configuration
  try {
    console.log(
      "Appwrite Endpoint:",
      import.meta.env.VITE_APPWRITE_API_ENDPOINT
    );
    console.log(
      "Appwrite Project ID:",
      import.meta.env.VITE_APPWRITE_PROJECT_ID
    );
  } catch (error) {
    console.log("❌ Cannot access Appwrite config:", error);
  }
};

// Add to window for easy access in console
if (typeof window !== "undefined") {
  (window as any).debugOAuth = debugOAuth;
}
