"use client";

import GapiDataFetcher from "@/components/gapi-data-fetcher.client";
import GapiProvider from "@/contexts/GapiContext";

export default function ClientPage() {
  return (
    <GapiProvider>
      <h1>Home</h1>
      <GapiDataFetcher />
    </GapiProvider>
  );
}
