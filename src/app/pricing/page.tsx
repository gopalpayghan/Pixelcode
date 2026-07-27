import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import ProPlanView from "./_components/ProPlanView";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import { ENTERPRISE_FEATURES } from "./_constants";
import { Check, Sparkles, Zap } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import UpgradeButton from "./_components/UpgradeButton";
import LoginButton from "@/components/LoginButton";
import { Card } from "@/components/ui/Card";

async function PricingPage() {
  const user = await currentUser();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  let isPro = false;

  if (convexUrl && user?.id) {
    try {
      const convex = new ConvexHttpClient(convexUrl);
      const convexUser = await convex.query(api.users.getUser, {
        userId: user.id,
      });
      isPro = !!convexUser?.isPro;
    } catch (e) {
      console.error("Convex pricing query error:", e);
    }
  }

  if (isPro) return <ProPlanView />;

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />

        <main className="max-w-page mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="mono-label text-mute flex items-center justify-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-warning" />
              Simple Pricing
            </span>
            <h1 className="text-display-lg sm:text-display-xl text-ink text-balance">
              Predictable pricing for developers.
            </h1>
            <p className="mt-3 text-body-lg text-body text-pretty">
              Get full access to multi-language execution, live pair programming, and community snippet hosting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            <Card variant="default" className="flex flex-col justify-between p-8">
              <div>
                <span className="text-body-sm font-semibold text-mute">Hobby</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-display-xl text-ink">$0</span>
                  <span className="text-body-sm text-mute">/ forever</span>
                </div>
                <p className="mt-2 text-body-sm text-mute">
                  Essential tools for learning and experimenting.
                </p>

                <ul className="mt-8 space-y-3 text-body-sm text-ink">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>JavaScript execution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Monaco Code Editor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Public Snippet library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Real-time pair programming</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  disabled
                  className="w-full py-2.5 rounded-full bg-canvas-soft border border-hairline text-body-sm text-mute font-medium"
                >
                  Current Plan
                </button>
              </div>
            </Card>

            <Card variant="featured" className="flex flex-col justify-between p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-link text-white text-caption font-semibold uppercase tracking-wider shadow-level-2">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-primary-foreground">Pro Tier</span>
                  <Zap className="w-4 h-4 text-warning fill-current" />
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-display-xl text-primary-foreground">$39</span>
                  <span className="text-body-sm opacity-80">one-time</span>
                </div>
                <p className="mt-2 text-body-sm opacity-80">
                  Lifetime access for power developers and professionals.
                </p>

                <ul className="mt-8 space-y-3 text-body-sm text-primary-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-link" />
                    <span className="font-medium">10+ Multi-language executions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-link" />
                    <span>Interactive STDIN support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-link" />
                    <span>Unlimited real-time collaboration rooms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-link" />
                    <span>Priority Piston execution queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-link" />
                    <span>Pro profile badge & analytics</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <SignedIn>
                  <UpgradeButton />
                </SignedIn>
                <SignedOut>
                  <LoginButton />
                </SignedOut>
              </div>
            </Card>

            <Card variant="default" className="flex flex-col justify-between p-8">
              <div>
                <span className="text-body-sm font-semibold text-mute">Team</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-display-xl text-ink">$99</span>
                  <span className="text-body-sm text-mute">/ month</span>
                </div>
                <p className="mt-2 text-body-sm text-mute">
                  Dedicated collaboration tools for engineering teams.
                </p>

                <ul className="mt-8 space-y-3 text-body-sm text-ink">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Up to 10 team seats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Private workspace snippet store</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Dedicated support SLA</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  disabled
                  className="w-full py-2.5 rounded-full bg-canvas-soft border border-hairline text-body-sm text-mute font-medium"
                >
                  Contact Sales
                </button>
              </div>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto border-t border-hairline pt-16">
            <h2 className="text-display-md text-ink text-center mb-10">
              Built for performance and security.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {ENTERPRISE_FEATURES.map((feature) => (
                <Card key={feature.label} variant="soft" padding="md">
                  <feature.icon className="w-5 h-5 text-link mb-3" />
                  <h3 className="text-body-sm font-semibold text-ink mb-1">{feature.label}</h3>
                  <p className="text-caption text-mute">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default PricingPage;
