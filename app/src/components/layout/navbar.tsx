"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// import { WalletConnect } from "@/components/ui/wallet-connect";
import { Database, Home, Plus, ShoppingBag, Shield, User, BarChart3, Code, ChevronDown, Bug } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: Database,
  },
  {
    name: "Generate",
    href: "/generate",
    icon: Plus,
  },
  {
    name: "Verify",
    href: "/verify",
    icon: Shield,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
    // {
  //   name: "Analytics",
  //   href: "/analytics",
  //   icon: ShoppingBag,
  // },
];

const dropdownItems = [
  {
    name: "Verification Dashboard",
    href: "/verification-dashboard",
    icon: BarChart3,
  },
  {
    name: "Contract Data",
    href: "/smart-contracts",
    icon: Code,
  },
  {
    name: "Debug Tools",
    href: "/debug",
    icon: Bug,
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
          />
            <span className="font-bold text-2xl">Filethetic</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <item.icon className="mr-1 h-4 w-4" />
              {item.name}
            </Link>
          ))}
          
          {/* Dropdown Menu for Dashboard, Contracts, and Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                  dropdownItems.some(item => pathname === item.href)
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                More
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {dropdownItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center w-full cursor-pointer",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : ""
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        <div className="flex items-center gap-2">
<ConnectButton />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
