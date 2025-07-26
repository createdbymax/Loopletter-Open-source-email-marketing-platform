import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Send } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="relative group pl-4 cursor-pointer">
          <Image
            src="/newlogo.svg"
            alt="Loopletter"
            width={125}
            height={32}
            className="flex-shrink-0"
          />
          <Send className="absolute -bottom-1 -right-1 w-3 h-3 text-blue-500 opacity-70 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:scale-110" />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="mailto:support@loopletter.com">Support</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
