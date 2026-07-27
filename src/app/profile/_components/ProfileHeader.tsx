"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Activity, Code2, Star, Timer, TrendingUp, Trophy, UserIcon, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/Card";

interface ProfileHeaderProps {
  userStats: {
    totalExecutions: number;
    languagesCount: number;
    languages: string[];
    last24Hours: number;
    favoriteLanguage: string;
    languageStats: Record<string, number>;
    mostStarredLanguage: string;
  };
  userData: {
    _id: Id<"users">;
    _creationTime: number;
    proSince?: number | undefined;
    lemonSqueezyCustomerId?: string | undefined;
    lemonSqueezyOrderId?: string | undefined;
    name: string;
    userId: string;
    email: string;
    isPro: boolean;
  };
  user: {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

function ProfileHeader({ userStats, userData, user }: ProfileHeaderProps) {
  const starredSnippets = useQuery(api.snippets.getStarredSnippets, {
    userId: user.userId,
  });

  const STATS = [
    {
      label: "Code Executions",
      value: userStats?.totalExecutions ?? 0,
      icon: Activity,
      description: "Total code runs",
      metric: {
        label: "Last 24h",
        value: userStats?.last24Hours ?? 0,
        icon: Timer,
      },
    },
    {
      label: "Starred Snippets",
      value: starredSnippets?.length ?? 0,
      icon: Star,
      description: "Saved for later",
      metric: {
        label: "Most starred",
        value: userStats?.mostStarredLanguage ?? "N/A",
        icon: Trophy,
      },
    },
    {
      label: "Languages Used",
      value: userStats?.languagesCount ?? 0,
      icon: Code2,
      description: "Different languages",
      metric: {
        label: "Most used",
        value: userStats?.favoriteLanguage ?? "N/A",
        icon: TrendingUp,
      },
    },
  ];

  return (
    <div className="mb-8">
      {/* User profile card */}
      <Card variant="default" className="p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-hairline object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-hairline bg-link/10 text-link text-display-md font-semibold flex items-center justify-center uppercase">
                {user.name.charAt(0)}
              </div>
            )}
            {userData.isPro && (
              <div className="absolute -top-1 -right-1 bg-link text-white p-1.5 rounded-full shadow-level-2">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-display-md text-ink">{userData.name}</h1>
              {userData.isPro ? (
                <span className="px-2.5 py-0.5 bg-link/10 text-link border border-link/20 rounded-full text-caption font-medium">
                  Pro Member
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-canvas-soft border border-hairline text-mute rounded-full text-caption">
                  Free Plan
                </span>
              )}
            </div>
            <p className="text-body-sm text-mute flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" />
              {userData.email}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card variant="soft" padding="md" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption text-mute">{stat.description}</span>
                  <stat.icon className="w-4 h-4 text-mute" />
                </div>
                <div className="text-display-md text-ink font-mono tabular-nums">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-caption text-body font-medium mt-1">{stat.label}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-hairline flex items-center gap-1.5 text-caption text-mute">
                <stat.metric.icon className="w-3.5 h-3.5" />
                <span>{stat.metric.label}:</span>
                <span className="text-ink font-medium capitalize">{stat.metric.value}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ProfileHeader;
