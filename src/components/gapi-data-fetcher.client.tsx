"use client";

import { useState } from "react";
import useGapiContext from "@/contexts/useGapiContext";

export default function GapiDataFetcher() {
  const { isGapiReady, client, accessToken } = useGapiContext();
  const [gaMetadata, setGaMetadata] =
    useState<gapi.client.analyticsdata.Metadata | null>(null);

  function executeGapi(): void {
    if (!isGapiReady || !client) {
      console.error("GAPI client is not initialized");
      return;
    }

    if (!accessToken) {
      console.error("Access token is not set");
      return;
    }

    window.gapi.client.setToken(accessToken);
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

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => client?.requestAccessToken()}
        className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200"
      >
        Authorize with Google
      </button>
      <button
        onClick={executeGapi}
        disabled={!accessToken}
        className="rounded border px-4 py-2 hover:cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Execute
      </button>
      {isGapiReady ? (
        <p className="text-green-500">GAPI is ready</p>
      ) : (
        <p className="text-red-500">GAPI is not ready</p>
      )}
      {accessToken ? (
        <p className="text-green-500">Access token is set</p>
      ) : (
        <p className="text-red-500">Access token is not set</p>
      )}
      {gaMetadata && gaMetadata.name ? (
        <p className="text-green-500">
          {gaMetadata.name} - {gaMetadata.dimensions?.length} dimensions,{" "}
          {gaMetadata.metrics?.length} metrics, {gaMetadata.comparisons?.length}{" "}
          comparisons
        </p>
      ) : (
        <p className="text-red-500">Metadata is not set</p>
      )}
    </div>
  );
}
