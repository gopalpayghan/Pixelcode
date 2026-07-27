"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import SnippetLoadingSkeleton from "./_components/SnippetLoadingSkeleton";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import { Clock, Code, MessageSquare, User, Play, ArrowLeft } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/lib/constants";
import CopyButton from "./_components/CopyButton";
import Comments from "./_components/Comments";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

function SnippetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const snippetId = params?.id as string | undefined;
  const { setLanguage } = useCodeEditorStore();

  const snippet = useQuery(
    api.snippets.getSnippetById,
    snippetId ? { snippetId: snippetId as Id<"snippets"> } : "skip"
  );
  const comments = useQuery(
    api.snippets.getComments,
    snippetId ? { snippetId: snippetId as Id<"snippets"> } : "skip"
  );

  if (!snippetId || typeof snippetId !== "string") {
    return (
      <div className="min-h-screen bg-canvas">
        <NavigationHeader />
        <div className="max-w-page mx-auto px-4 py-16 text-center">
          <h1 className="text-display-md text-error mb-2">Snippet Not Found</h1>
          <p className="text-body-sm text-body mb-6">The requested snippet could not be located.</p>
          <Link href="/snippets">
            <Button variant="secondary" size="md">Back to Snippets</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (snippet === undefined) return <SnippetLoadingSkeleton />;
  if (snippet === null) {
    return (
      <div className="min-h-screen bg-canvas">
        <NavigationHeader />
        <div className="max-w-page mx-auto px-4 py-16 text-center">
          <h1 className="text-display-md text-error mb-2">Snippet Deleted</h1>
          <p className="text-body-sm text-body mb-6">This snippet has been removed by its author.</p>
          <Link href="/snippets">
            <Button variant="secondary" size="md">Back to Snippets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentLangConfig = LANGUAGE_CONFIG[snippet.language] || LANGUAGE_CONFIG.javascript;

  const handleOpenInEditor = () => {
    setLanguage(snippet.language);
    localStorage.setItem(`editor-code-${snippet.language}`, snippet.code);
    router.push(`/editor?lang=${snippet.language}`);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />

        <main className="max-w-page-narrow mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back button */}
          <Link
            href="/snippets"
            className="inline-flex items-center gap-1.5 text-body-sm text-mute hover:text-ink transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Snippets</span>
          </Link>

          {/* Header Card */}
          <div className="bg-canvas border border-hairline rounded-xl p-6 mb-6 shadow-level-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-canvas-soft border border-hairline flex items-center justify-center shrink-0">
                  <img
                    src={`/${snippet.language}.png`}
                    alt=""
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-display-sm sm:text-display-md text-ink mb-1.5">
                    {snippet.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-mute">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{snippet.userName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(snippet._creationTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{comments?.length ?? 0} comments</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenInEditor}
                  icon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  Open in Editor
                </Button>
              </div>
            </div>
          </div>

          {/* Code Editor Preview */}
          <div className="mb-8 rounded-xl overflow-hidden border border-hairline bg-[#0d1117] shadow-level-3">
            <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-hairline">
              <div className="flex items-center gap-2 text-caption text-body font-mono">
                <Code className="w-3.5 h-3.5 text-link" />
                <span>{currentLangConfig.fileName}</span>
              </div>
              <CopyButton code={snippet.code} />
            </div>
            <Editor
              height="450px"
              language={currentLangConfig.monacoLanguage}
              value={snippet.code}
              theme="github-dark"
              beforeMount={defineMonacoThemes}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                readOnly: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              }}
            />
          </div>

          {/* Comments section */}
          <Comments snippetId={snippet._id} />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default SnippetDetailPage;
