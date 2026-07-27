"use client";

import { motion } from "framer-motion";
import { Code2, Users, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    icon: Code2,
    title: "Multi-Language Editor",
    description:
      "Monaco-powered editor with IntelliSense, syntax highlighting, and 5 custom themes. Run code in 10+ languages instantly.",
    gradient: "from-[#007cf0] to-[#00dfd8]",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Create rooms and code together. Live cursors, synchronized edits, and shared execution — pair programming in the browser.",
    gradient: "from-[#7928ca] to-[#ff0080]",
  },
  {
    icon: BookOpen,
    title: "Community Snippets",
    description:
      "Share your solutions, star the best, and learn from others. A growing library of code snippets with comments and discussions.",
    gradient: "from-[#ff4d4d] to-[#f9cb28]",
  },
];

export default function FeatureBand() {
  return (
    <section className="py-20 sm:py-24 bg-canvas-soft">
      <div className="max-w-page-narrow mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="mono-label text-mute">Features</span>
          <h2 className="mt-3 text-display-lg text-ink">
            Everything you need to code.
          </h2>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="default" hover className="h-full">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}
                >
                  <feature.icon
                    className="w-5 h-5 text-white"
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <h3 className="text-display-sm text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-body leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
