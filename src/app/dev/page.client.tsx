"use client";

import GapiCaller from "@/components/gapi-caller.client";
import GapiProvider from "@/contexts/GapiContext";

export default function ClientPage() {
  return (
    <GapiProvider>
      <GapiCaller />
    </GapiProvider>
  );
}
