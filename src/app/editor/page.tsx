"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import EditorTopBar from "./_components/EditorTopBar";
import CodePanel from "./_components/CodePanel";
import OutputPanel from "./_components/OutputPanel";
import StatusBar from "./_components/StatusBar";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useAuthContext } from "@/components/providers/AuthProvider";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const { setLanguage } = useCodeEditorStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in?redirect=/editor");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const lang = searchParams?.get("lang");
    if (lang) {
      setLanguage(lang);
    }
  }, [searchParams, setLanguage]);

  if (!isLoading && !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <NavigationHeader />
      <EditorTopBar />

      {/* Main editor area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Code editor panel */}
        <div className="flex-1 min-h-0 min-w-0 border-r border-hairline">
          <CodePanel />
        </div>

        {/* Output panel */}
        <div className="lg:w-[420px] min-h-0 flex flex-col border-t lg:border-t-0 border-hairline">
          <OutputPanel />
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-canvas">
          <div className="w-8 h-8 border-2 border-hairline border-t-ink rounded-full animate-spin" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
