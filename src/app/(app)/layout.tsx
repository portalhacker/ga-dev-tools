import Link from "next/link";
import { ReactNode } from "react";

import GapiContextProvider from "@/contexts/GapiContextProvider";

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="flex gap-4">
        <Link href="/dev">Dev</Link>
        <Link href="/dev2">Dev2</Link>
        <Link href="/query-explorer">Query Explorer</Link>
      </div>
      <GapiContextProvider>{children}</GapiContextProvider>
    </>
  );
}
