"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import ProfileHeader from "./_components/ProfileHeader";
import ProfileHeaderSkeleton from "./_components/ProfileHeaderSkeleton";
import { Clock, Code, ListVideo, Loader2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import StarButton from "@/components/StarButton";
import CodeBlock from "./_components/CodeBlock";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const TABS = [
  {
    id: "executions",
    label: "Code Executions",
    icon: ListVideo,
  },
  {
    id: "starred",
    label: "Starred Snippets",
    icon: Star,
  },
];

function ProfilePage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"executions" | "starred">(
    "executions",
  );

  const userStats = useQuery(api.codeExecutions.getUserStats, {
    userId: user?.userId ?? "",
  });

  const starredSnippets = useQuery(api.snippets.getStarredSnippets, {
    userId: user?.userId ?? "",
  });

  const {
    results: executions,
    status: executionStatus,
    isLoading: isLoadingExecutions,
    loadMore,
  } = usePaginatedQuery(
    api.codeExecutions.getUserExecutions,
    {
      userId: user?.userId ?? "",
    },
    { initialNumItems: 5 },
  );

  const userData = useQuery(api.users.getUser, { userId: user?.userId ?? "" });

  const handleLoadMore = () => {
    if (executionStatus === "CanLoadMore") loadMore(5);
  };

  if (!isLoading && !user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />

        <main className="max-w-page-narrow mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {userStats && userData && user && (
            <ProfileHeader
              userStats={userStats}
              userData={userData}
              user={user}
            />
          )}

          {(userStats === undefined || isLoading) && <ProfileHeaderSkeleton />}

          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="border-b border-hairline px-4 pt-3 flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "executions" | "starred")
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md text-body-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-link text-ink bg-canvas-soft"
                      : "border-transparent text-mute hover:text-ink"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "executions" && (
                    <div className="space-y-4">
                      {executions?.map((execution) => (
                        <div
                          key={execution._id}
                          className="border border-hairline rounded-xl overflow-hidden bg-canvas-soft"
                        >
                          <div className="flex items-center justify-between p-4 border-b border-hairline bg-canvas">
                            <div className="flex items-center gap-3">
                              <Image
                                src={"/" + execution.language + ".png"}
                                alt=""
                                className="w-6 h-6 object-contain"
                                width={24}
                                height={24}
                              />
                              <div>
                                <span className="text-body-sm font-medium text-ink capitalize">
                                  {execution.language}
                                </span>
                                <span className="text-caption text-mute ml-3">
                                  {new Date(
                                    execution._creationTime,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-caption font-mono px-2 py-0.5 rounded ${
                                execution.error
                                  ? "bg-error/10 text-error border border-error/20"
                                  : "bg-success/10 text-success border border-success/20"
                              }`}
                            >
                              {execution.error ? "Error" : "Success"}
                            </span>
                          </div>

                          <div className="p-4 space-y-3">
                            <CodeBlock
                              code={execution.code}
                              language={execution.language}
                            />

                            {(execution.output || execution.error) && (
                              <div className="p-3 rounded-md bg-canvas border border-hairline">
                                <span className="text-caption text-mute font-mono block mb-1">
                                  Output:
                                </span>
                                <pre
                                  className={`text-caption font-mono ${
                                    execution.error ? "text-error" : "text-ink"
                                  }`}
                                >
                                  {execution.error || execution.output}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isLoadingExecutions && (
                        <div className="text-center py-12">
                          <Loader2 className="w-8 h-8 text-mute mx-auto mb-3 animate-spin" />
                          <p className="text-body-sm text-mute">
                            Loading execution history...
                          </p>
                        </div>
                      )}

                      {!isLoadingExecutions && executions?.length === 0 && (
                        <div className="text-center py-12">
                          <Code className="w-8 h-8 text-mute mx-auto mb-3" />
                          <h3 className="text-body-md font-semibold text-ink mb-1">
                            No executions yet
                          </h3>
                          <p className="text-body-sm text-mute">
                            Run code in the editor to view history here.
                          </p>
                        </div>
                      )}

                      {executionStatus === "CanLoadMore" && (
                        <div className="flex justify-center pt-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleLoadMore}
                          >
                            Load More Executions
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "starred" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {starredSnippets?.map((snippet) => (
                        <div key={snippet._id}>
                          <Link href={`/snippets/${snippet._id}`}>
                            <div className="bg-canvas-soft border border-hairline hover:border-hairline-strong rounded-xl p-5 transition-all shadow-level-1 hover:shadow-level-2">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={`/${snippet.language}.png`}
                                    alt=""
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                  />
                                  <span className="text-caption font-mono text-mute capitalize">
                                    {snippet.language}
                                  </span>
                                </div>
                                <div onClick={(e) => e.preventDefault()}>
                                  <StarButton snippetId={snippet._id} />
                                </div>
                              </div>

                              <h3 className="text-body-md font-semibold text-ink line-clamp-1 mb-2">
                                {snippet.title}
                              </h3>

                              <div className="flex items-center gap-2 text-caption text-mute mb-3">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {new Date(
                                    snippet._creationTime,
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="bg-canvas border border-hairline rounded-md p-3">
                                <pre className="font-mono text-caption text-body line-clamp-2">
                                  {snippet.code}
                                </pre>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}

                      {(!starredSnippets || starredSnippets.length === 0) && (
                        <div className="col-span-full text-center py-12">
                          <Star className="w-8 h-8 text-mute mx-auto mb-3" />
                          <h3 className="text-body-md font-semibold text-ink mb-1">
                            No starred snippets
                          </h3>
                          <p className="text-body-sm text-mute">
                            Explore community snippets and star your favorites!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default ProfilePage;
