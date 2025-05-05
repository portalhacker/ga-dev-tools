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
      <div className="mb-3 flex gap-4">
        {["dev", "dev2", "query-explorer"].map((path) => (
          <Link key={path} href={`/${path}`} className="hover:underline">
            {path.charAt(0).toUpperCase() + path.slice(1)}
          </Link>
        ))}
      </div>
      <GapiContextProvider>{children}</GapiContextProvider>
    </>
  );
}
