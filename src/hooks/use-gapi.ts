import { useEffect, useState } from "react";

declare global {
  export interface Window {
    gapi: typeof gapi;
    google: typeof google;
    client: google.accounts.oauth2.TokenClient;
    accessToken: gapi.client.TokenObject;
    handleCredentialResponse: (
      response: google.accounts.oauth2.TokenResponse,
    ) => void;
  }
}

export default function useGapi(
  handleCredentialResponse: (
    response: google.accounts.oauth2.TokenResponse,
  ) => void,
) {
  const [isGapiReady, setIsGapiReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      window.handleCredentialResponse = handleCredentialResponse;

      const googleScript = document.createElement("script");
      googleScript.src = "https://accounts.google.com/gsi/client";
      googleScript.async = true;
      googleScript.onload = () => {
        console.log("Google Sign-In script loaded");

        window.client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          scope: "https://www.googleapis.com/auth/analytics.readonly",
          callback: handleCredentialResponse,
        });
      };
      googleScript.onerror = () => {
        console.error("Error loading Google Sign-In script");
      };
      document.body.appendChild(googleScript);

      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.async = true;
      gapiScript.onload = () => {
        console.log("GAPI script loaded");
        window.gapi.load("client", () => {
          console.log("GAPI client loaded");
          setIsGapiReady(true); // Mark GAPI as ready
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
  }, [handleCredentialResponse]);

  return isGapiReady;
}
