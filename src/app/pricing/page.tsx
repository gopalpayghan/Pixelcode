import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import { ENTERPRISE_FEATURES } from "./_constants";
import { Check, Sparkles, Zap, Clock, ArrowRight, ShieldCheck, Code2, Cpu, Rocket } from "lucide-react";
import Link from "next/link";

function PricingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between relative overflow-hidden transition-colors duration-200 selection:bg-link/20 selection:text-link">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-link/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10">
        <NavigationHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          {/* Header section */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-link/10 border border-link/20 text-link text-xs font-semibold uppercase tracking-wider mb-6 shadow-level-1">
              <Sparkles className="w-4 h-4 text-warning fill-current" />
              <span>100% Free Access — All Pro Features Unlocked</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-ink tracking-tight text-balance leading-tight">
              Predictable Pricing, <br />
              <span className="bg-gradient-to-r from-link via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Unlimited Possibilities.
              </span>
            </h1>

            <p className="mt-4 text-lg sm:text-xl text-body max-w-2xl mx-auto text-pretty font-normal">
              Experience the full power of multi-language execution, live pair programming, and code tools completely free today.
            </p>
          </div>

          {/* 2-Card Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
            
            {/* CARD 1: FREE PLAN (ALL PRO FEATURES INCLUDED) */}
            <div className="relative group rounded-3xl bg-gradient-to-br from-link/40 via-indigo-500/30 to-purple-500/40 p-[2px] shadow-level-4 hover:shadow-level-5 transition-all duration-300 flex flex-col justify-between">
              
              {/* Floating Highlight Badge */}
              <div className="absolute -top-4 left-8 px-4 py-1 rounded-full bg-link text-white text-xs font-bold uppercase tracking-wider shadow-level-2 ring-1 ring-white/20 flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Free Plan — All Features Included</span>
              </div>

              <div className="bg-canvas-soft border border-hairline rounded-[22px] p-8 sm:p-10 flex-1 flex flex-col justify-between shadow-level-3">
                <div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-warning fill-current" />
                      <h2 className="text-xl font-bold text-ink">Free Pro Access</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold uppercase tracking-wider">
                      Active Now
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-5xl sm:text-6xl font-extrabold text-ink">
                      $0
                    </span>
                    <span className="text-mute text-base font-medium">/ free forever</span>
                  </div>

                  <p className="mt-3 text-body text-sm leading-relaxed">
                    Enjoy full unrestricted access to all professional development, collaboration, and multi-language execution features.
                  </p>

                  <div className="my-8 h-px bg-hairline" />

                  {/* Feature checklist */}
                  <ul className="space-y-4 text-sm text-body">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-ink">
                        <strong className="font-semibold text-ink">10+ Multi-Language Executions</strong> (JS, TS, Python, Java, Go, Rust, C++, C#, Ruby, Swift)
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-ink">
                        <strong className="font-semibold text-ink">Interactive Console & STDIN Support</strong> with line-by-line input & expected data-type hints
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-ink">
                        <strong className="font-semibold text-ink">Real-Time Collaboration Rooms</strong> with live cursor sync, voice chat & room chat
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-ink">
                        <strong className="font-semibold text-ink">Inline Code Autocompletions</strong> for all 10 supported programming languages
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-ink">
                        <strong className="font-semibold text-ink">Practice Challenge Timers</strong> & 1-Click Code File Export
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-ink">
                        <strong className="font-semibold text-ink">Public & Private Snippet Library</strong> hosting & sharing
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-ink">Fast code execution engine queue</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-10">
                  <Link
                    href="/editor"
                    className="flex items-center justify-center gap-3 w-full py-4 px-8 rounded-xl bg-link hover:bg-link-deep text-white font-bold text-base shadow-level-2 transition-all duration-200 hover:scale-[1.01] group"
                  >
                    <span>Start Coding Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CARD 2: PAID PRO VERSION (COMING SOON) */}
            <div className="relative group rounded-3xl bg-gradient-to-br from-warning/30 via-purple-500/20 to-pink-500/20 p-[1px] shadow-level-3 flex flex-col justify-between">
              
              {/* Floating Coming Soon Badge */}
              <div className="absolute -top-4 left-8 px-4 py-1 rounded-full bg-warning/15 border border-warning/40 text-warning text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-warning"></span>
                </span>
                <span>Coming Soon — Pro Tier</span>
              </div>

              <div className="bg-canvas-soft-2 border border-hairline rounded-[23px] p-8 sm:p-10 flex-1 flex flex-col justify-between relative overflow-hidden">
                
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-warning/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-warning" />
                      <h2 className="text-xl font-bold text-ink">Paid Pro Version</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-semibold uppercase tracking-wider">
                      In Development
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-extrabold text-mute">
                      Pro Tier
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-canvas border border-hairline text-mute font-mono">
                      Next-Gen AI
                    </span>
                  </div>

                  <p className="mt-3 text-body text-sm leading-relaxed">
                    Advanced AI pair programming, dedicated zero-latency cloud infrastructure, and enterprise team workspaces.
                  </p>

                  <div className="my-8 h-px bg-hairline" />

                  {/* Future Pro features list */}
                  <ul className="space-y-4 text-sm text-mute">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-warning/10 border border-warning/30 text-warning flex items-center justify-center shrink-0 mt-0.5">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong className="font-semibold text-ink">AI Pair Programming Assistant</strong> — GPT-4o inline code generation, bug fixing & explanation
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-warning/10 border border-warning/30 text-warning flex items-center justify-center shrink-0 mt-0.5">
                        <Rocket className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong className="font-semibold text-ink">Dedicated Zero-Latency Cloud Containers</strong> with unlimited RAM & CPU cores
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-warning/10 border border-warning/30 text-warning flex items-center justify-center shrink-0 mt-0.5">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong className="font-semibold text-ink">Team Workspaces & Private GitHub Sync</strong> for enterprise codebases
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-warning/10 border border-warning/30 text-warning flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong className="font-semibold text-ink">Custom Domain Snippets & Branded Embeds</strong> for portfolio sites
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-warning/10 border border-warning/30 text-warning flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong className="font-semibold text-ink">24/7 Priority Support & Enterprise SLA</strong> guarantees
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-10">
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full py-4 px-8 rounded-xl bg-canvas border border-hairline text-mute font-semibold text-base cursor-not-allowed opacity-80"
                  >
                    <Clock className="w-4 h-4 text-warning" />
                    <span>Paid Pro Version — Coming Soon</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Enterprise features footer section */}
          <div className="max-w-5xl mx-auto border-t border-hairline pt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink text-center mb-12">
              Built for performance, security & developer speed.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {ENTERPRISE_FEATURES.map((feature) => (
                <div
                  key={feature.label}
                  className="bg-canvas-soft border border-hairline rounded-2xl p-6 hover:border-link/40 transition-colors shadow-level-1"
                >
                  <feature.icon className="w-6 h-6 text-link mb-3" />
                  <h3 className="text-base font-bold text-ink mb-1">{feature.label}</h3>
                  <p className="text-xs text-mute leading-relaxed">{feature.desc}</p>
                </div>
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
