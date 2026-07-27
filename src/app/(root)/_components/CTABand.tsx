"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function CTABand() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-page-narrow mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-display-lg sm:text-display-xl text-ink text-balance">
            Ready to start coding?
          </h2>
          <p className="mt-4 text-body-lg text-body max-w-md mx-auto">
            No setup required. Open the editor, pick a language, and write
            your first line of code in seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/editor">
              <Button
                variant="primary"
                size="lg"
                pill
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Open Editor
              </Button>
            </Link>
            <Link href="/collaborate">
              <Button variant="secondary" size="lg" pill>
                Start Collaborating
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
