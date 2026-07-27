"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Code2, Sparkles, Users, BookOpen, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/editor", label: "Editor", icon: Code2 },
  { href: "/snippets", label: "Snippets", icon: BookOpen },
  { href: "/collaborate", label: "Collaborate", icon: Users },
];

function NavigationHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-canvas/80 backdrop-blur-xl border-b border-hairline">
      <nav
        className="max-w-page mx-auto px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <div className="h-16 flex items-center justify-between">
          {/* ─── Logo ─── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="PixelCode home"
          >
            <Image
              src="/pixelcode.svg"
              alt=""
              width={28}
              height={28}
              className="transition-transform duration-300 group-hover:rotate-6"
              aria-hidden="true"
            />
            <span className="text-body-sm font-semibold text-ink tracking-tight">
              PixelCode
            </span>
          </Link>

          {/* ─── Desktop Nav Links (center) ─── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full
                    text-body-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? "text-ink bg-canvas-soft-2"
                        : "text-body hover:text-ink hover:bg-canvas-soft-2"
                    }
                  `}
                >
                  <link.icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ─── Desktop Right Section ─── */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  <Sparkles className="w-3.5 h-3.5 text-warning" aria-hidden="true" />
                  Pro
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="secondary" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  <Sparkles className="w-3.5 h-3.5 text-warning" aria-hidden="true" />
                  Pro
                </Button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7",
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* ─── Mobile Hamburger ─── */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-body hover:text-ink hover:bg-canvas-soft-2 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* ─── Mobile Menu ─── */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-hairline mt-0 pt-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-md
                      text-body-sm font-medium transition-colors
                      ${
                        isActive
                          ? "text-ink bg-canvas-soft-2"
                          : "text-body hover:text-ink hover:bg-canvas-soft-2"
                      }
                    `}
                  >
                    <link.icon className="w-4 h-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-hairline flex flex-col gap-2">
              <SignedOut>
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-body-sm text-body">Account</span>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default NavigationHeader;
