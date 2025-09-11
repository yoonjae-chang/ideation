import Link from "next/link";
import { AuthButton } from "./auth-button";
import Image from "next/image";

export default function Navbar() {
    return (
<nav className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center border-b bg-background  md:h-18 h-16">
<div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
  <div className="flex gap-5 items-center font-semibold md:text-[18px]">
    <Link href={"/"}>Prototyping Ideas</Link>
    <Image src="@/public/logo/favicon.svg" alt="Prototyping Ideas" width={24} height={24} />
    <div className="flex items-center gap-2">

    </div>
  </div>
   <AuthButton />
</div>
</nav>
);
}
