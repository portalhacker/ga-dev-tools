import Link from "next/link";

import ClientPage from "./page.client";

export default function Page() {
  return (
    <>
      <h1>Dev</h1>
      <Link href="/dev">Dev</Link>
      <ClientPage />
    </>
  );
}
