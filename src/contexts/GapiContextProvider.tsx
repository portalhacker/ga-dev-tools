"use client";

import { createContext, ReactNode, useEffect, useState } from "react";

type GapiProviderProps = {
  children: ReactNode;
};

type GapiContext = {
  isGapiReady: boolean;
  client?: google.accounts.oauth2.TokenClient;
  accessToken?: gapi.client.TokenObject;
};

export const GapiContext = createContext<GapiContext | undefined>(undefined);

export default function GapiContextProvider({ children }: GapiProviderProps) {
  const [isGapiReady, setIsGapiReady] = useState<boolean>(false);

  const [client, setClient] = useState<
    google.accounts.oauth2.TokenClient | undefined
  >(undefined);

  const [accessToken, setAccessToken] = useState<
    gapi.client.TokenObject | undefined
  >(undefined);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      function handleCredentialResponse(
        response: google.accounts.oauth2.TokenResponse,
      ): void {
        setAccessToken(response);
        console.log("Access token received and saved:", response);
      }

      // Load the Google Sign-In script (https://developers.google.com/identity/oauth2/web/guides/use-token-model)
      const googleScript = document.createElement("script");
      googleScript.src = "https://accounts.google.com/gsi/client";
      googleScript.async = true;
      googleScript.onload = () => {
        console.log("Google Sign-In script loaded");
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          scope:
            "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/marketingplatformadmin.analytics.read",
          callback: handleCredentialResponse,
        });
        tokenClient.requestAccessToken();
        setClient(tokenClient);
      };
      googleScript.onerror = () => {
        console.error("Error loading Google Sign-In script");
      };
      document.body.appendChild(googleScript);

      // Load the GAPI script (from the Discovery service https://developers.google.com/discovery)
      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.async = true;
      gapiScript.onload = () => {
        console.log("GAPI script loaded");
        window.gapi.load("client", () => {
          console.log("GAPI client loaded");
          setIsGapiReady(true);
        });
      };
      gapiScript.onerror = () => {
        console.error("Error loading GAPI script");
      };
      document.body.appendChild(gapiScript);

      return () => {
        document.body.removeChild(googleScript);
        document.body.removeChild(gapiScript);
      };
    }
  }, []);

  return (
    <GapiContext.Provider value={{ isGapiReady, client, accessToken }}>
      {children}
    </GapiContext.Provider>
  );
}
