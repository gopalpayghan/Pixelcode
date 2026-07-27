"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Code2 } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function CTABand() {
  const { user } = useAuthContext();
  const openEditorUrl = user ? "/editor" : "/sign-in?redirect=/editor";
  const collaborateUrl = user ? "/collaborate" : "/sign-in?redirect=/collaborate";

  return (
    <section className="py-24 border-t border-hairline bg-canvas-soft relative overflow-hidden">
      <div className="max-w-page mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="w-12 h-12 rounded-xl bg-canvas border border-hairline flex items-center justify-center mx-auto mb-6 shadow-level-2">
          <Code2 className="w-6 h-6 text-link" />
        </div>

        <h2 className="text-display-lg sm:text-display-xl text-ink text-balance max-w-2xl mx-auto">
          Ready to build something great?
        </h2>

        <p className="mt-4 text-body-lg text-body max-w-lg mx-auto text-pretty">
          Join thousands of developers coding in real-time. Write your first line of code in seconds.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={openEditorUrl} prefetch={true}>
            <Button
              variant="primary"
              size="lg"
              pill
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Open Editor
            </Button>
          </Link>
          <Link href={collaborateUrl} prefetch={true}>
            <Button variant="secondary" size="lg" pill>
              Start Collaborating
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
