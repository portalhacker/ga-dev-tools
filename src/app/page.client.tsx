"use client";

import { useState } from "react";

import useGapi from "@/hooks/use-gapi";

export default function ClientPage() {
  const window: any = globalThis;
  const [token, setToken] =
    useState<google.accounts.oauth2.TokenResponse | null>(null);
  const [gaMetadata, setGaMetadata] =
    useState<gapi.client.analyticsdata.Metadata | null>(null);

  function handleCredentialResponse(
    response: google.accounts.oauth2.TokenResponse,
  ): void {
    console.log(response);
    setToken(response || null);
  }

  function executeGapi(isGapiReady: boolean): void {
    if (!isGapiReady || !window.gapi || !window.gapi.client) {
      console.error("GAPI client is not initialized");
      return;
    }

    window.gapi.client.setToken(token);
    window.gapi.client
      .load(
        "https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta",
      )
      .then(
        () => {
          console.log("GAPI client loaded for API");
          window.gapi.client.analyticsdata.properties
            .getMetadata({
              name: "properties/456086743/metadata",
            })
            .then(
              (
                response: gapi.client.Response<gapi.client.analyticsdata.Metadata>,
              ) => {
                console.log("Response", response);
                setGaMetadata(response.result);
              },
            )
            .catch((err: Error) => {
              console.error("Execute error", err);
            });
        },
        (err: Error) => {
          console.error("Error loading GAPI client for API", err);
        },
      );
  }

  const isGapiReady = useGapi(handleCredentialResponse);

  return (
    <>
      <h1>Home</h1>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => window.client.requestAccessToken()}
          className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200"
        >
          Authorize with Google
        </button>
        <button
          onClick={() => executeGapi(isGapiReady)}
          disabled={!token}
          className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Execute
        </button>
        {isGapiReady ? (
          <p className="text-green-500">GAPI is ready</p>
        ) : (
          <p className="text-red-500">GAPI is not ready</p>
        )}
        {token ? (
          <p className="text-green-500">Access token is set</p>
        ) : (
          <p className="text-red-500">Access token is not set</p>
        )}
        {gaMetadata && gaMetadata.name ? (
          <p className="text-green-500">
            {gaMetadata.name} - {gaMetadata.dimensions?.length} dimensions,{" "}
            {gaMetadata.metrics?.length} metrics,{" "}
            {gaMetadata.comparisons?.length} comparisons
          </p>
        ) : (
          <p className="text-red-500">Metadata is not set</p>
        )}
      </div>
    </>
  );
}
