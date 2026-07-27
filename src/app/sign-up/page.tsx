"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { ArrowRight, Lock, Mail, User, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CustomSignUpPage() {
  const router = useRouter();
  const { signUp } = useAuthContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    const success = await signUp(name, email, password);
    setLoading(false);

    if (success) {
      router.push("/editor");
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <NavigationHeader />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <Card variant="default" className="p-8 shadow-level-4">
            <div className="text-center mb-8">
              <span className="mono-label text-mute inline-flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-link" />
                PixelCode Auth
              </span>
              <h1 className="text-display-sm text-ink font-semibold">
                Create an account
              </h1>
              <p className="text-body-sm text-mute mt-1">
                Start coding in seconds with your free account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-caption text-body font-medium mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Developer"
                    className="w-full h-10 pl-9 pr-3 bg-canvas-soft border border-hairline focus:border-link rounded-md text-ink text-body-sm placeholder:text-mute focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption text-body font-medium mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 pl-9 pr-3 bg-canvas-soft border border-hairline focus:border-link rounded-md text-ink text-body-sm placeholder:text-mute focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption text-body font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full h-10 pl-9 pr-3 bg-canvas-soft border border-hairline focus:border-link rounded-md text-ink text-body-sm placeholder:text-mute focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-hairline text-center text-body-sm text-mute">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-link hover:underline font-medium"
              >
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
