import NavigationHeader from "@/components/NavigationHeader";

export default function EditorLoading() {
  return (
    <div className="flex flex-col h-screen bg-canvas">
      <NavigationHeader />
      <div className="h-14 px-4 bg-canvas-soft border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-28 h-8 rounded-md bg-canvas-soft-2 animate-pulse" />
          <div className="w-28 h-8 rounded-md bg-canvas-soft-2 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-8 rounded-md bg-canvas-soft-2 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-h-0 bg-canvas flex items-center justify-center">
          <div className="flex items-center gap-2 text-caption text-mute font-mono">
            <div className="w-4 h-4 border-2 border-hairline border-t-link rounded-full animate-spin" />
            Loading Editor Workspace...
          </div>
        </div>
        <div className="lg:w-[420px] bg-canvas-soft border-l border-hairline" />
      </div>
    </div>
  );
}
