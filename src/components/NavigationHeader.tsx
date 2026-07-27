"use client";

import { Code2, Sparkles, Users, BookOpen, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuthContext } from "@/components/providers/AuthProvider";

const NAV_LINKS = [
  { href: "/editor", label: "Editor", icon: Code2 },
  { href: "/snippets", label: "Snippets", icon: BookOpen },
  { href: "/collaborate", label: "Collaborate", icon: Users },
];

function NavigationHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuthContext();

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
                  prefetch={true}
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
            <ThemeToggle />

            {!isLoading && !user && (
              <>
                <Link href="/pricing" prefetch={true}>
                  <Button variant="ghost" size="sm">
                    <Sparkles className="w-3.5 h-3.5 text-warning" aria-hidden="true" />
                    Pro
                  </Button>
                </Link>
                <Link href="/sign-in" prefetch={true}>
                  <Button variant="secondary" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/sign-up" prefetch={true}>
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {!isLoading && user && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-canvas-soft border border-hairline hover:border-hairline-strong transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-link/10 text-link font-semibold text-caption flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-body-sm font-medium text-ink max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-canvas-elevated border border-hairline rounded-lg shadow-level-4 z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-hairline text-caption">
                      <p className="font-medium text-ink truncate">{user.name}</p>
                      <p className="text-mute truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-body-sm text-ink hover:bg-canvas-soft-2 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-mute" />
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-error hover:bg-error/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Mobile Hamburger ─── */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="flex items-center justify-center w-9 h-9 rounded-md text-body hover:text-ink hover:bg-canvas-soft-2 transition-colors"
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
              {!user ? (
                <>
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
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-link/10 text-link font-semibold text-caption flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-body-sm font-medium text-ink">{user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-error hover:bg-error/10 justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default NavigationHeader;
