import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MsalProvider } from "@azure/msal-react";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { msalInstance } from "./auth/msal";

msalInstance.initialize().then(() => {
  createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <MsalProvider instance={msalInstance}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </MsalProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
});
