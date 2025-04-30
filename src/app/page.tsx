import Link from "next/link";

export default function Page() {
  return (
    <>
      <h1>Home</h1>
      <Link href={"/dev"}>Dev</Link>
    </>
  );
}
