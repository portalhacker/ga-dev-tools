'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
    client: google.accounts.oauth2.TokenClient;
    accessToken: gapi.client.TokenObject;
    handleCredentialResponse: (
      response: google.accounts.oauth2.TokenResponse
    ) => void;
  }
}

export default function Page() {
  const [isGapiReady, setIsGapiReady] = useState<boolean>(false);

  function handleCredentialResponse(
    response: google.accounts.oauth2.TokenResponse
  ): void {
    console.log(response);
    window.accessToken = response || '';
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      window.handleCredentialResponse = handleCredentialResponse;

      const googleScript = document.createElement('script');
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.async = true;
      googleScript.onload = () => {
        console.log('Google Sign-In script loaded');

        window.client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/analytics.readonly',
          callback: handleCredentialResponse,
        });
      };
      googleScript.onerror = () => {
        console.error('Error loading Google Sign-In script');
      };
      document.body.appendChild(googleScript);

      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.onload = () => {
        console.log('GAPI script loaded');
        window.gapi.load('client', () => {
          console.log('GAPI client loaded');
          setIsGapiReady(true); // Mark GAPI as ready
        });
      };
      gapiScript.onerror = () => {
        console.error('Error loading GAPI script');
      };
      document.body.appendChild(gapiScript);

      return () => {
        document.body.removeChild(googleScript);
        document.body.removeChild(gapiScript);
      };
    }
  }, []);

  function execute(): void {
    if (!isGapiReady || !window.gapi || !window.gapi.client) {
      console.error('GAPI client is not initialized');
      return;
    }

    window.gapi.client.setToken(window.accessToken);
    window.gapi.client
      .load(
        'https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta'
      )
      .then(
        () => {
          console.log('GAPI client loaded for API');
          window.gapi.client.analyticsdata.properties
            .getMetadata({
              name: 'properties/456086743/metadata',
            })
            .then((response: gapi.client.Response<any>) => {
              console.log('Response', response);
            })
            .catch((err: Error) => {
              console.error('Execute error', err);
            });
        },
        (err: Error) => {
          console.error('Error loading GAPI client for API', err);
        }
      );
  }

  return (
    <>
      <h1>Home</h1>
      <button onClick={() => window.client.requestAccessToken()}>
        Authorize with Google
      </button>
      <button onClick={execute} disabled={!isGapiReady}>
        Execute
      </button>
    </>
  );
}
