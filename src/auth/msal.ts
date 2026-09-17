import { PublicClientApplication } from "@azure/msal-browser";

const tenant = import.meta.env.VITE_MICROSOFT_TENANT || "common";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${tenant}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : undefined,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
});
