import { ReactNode } from "react";

import GapiContextProvider from "@/contexts/GapiContextProvider";

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <GapiContextProvider>{children}</GapiContextProvider>
    </>
  );
}
