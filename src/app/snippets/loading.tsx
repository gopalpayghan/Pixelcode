import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";

export default function SnippetsLoading() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />
        <main className="max-w-page mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="w-48 h-6 bg-canvas-soft-2 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="w-80 h-10 bg-canvas-soft-2 rounded-lg mx-auto mb-12 animate-pulse" />
          <div className="max-w-4xl mx-auto h-11 bg-canvas-soft border border-hairline rounded-lg mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            <div className="h-56 rounded-xl bg-canvas-soft border border-hairline p-5 animate-pulse" />
            <div className="h-56 rounded-xl bg-canvas-soft border border-hairline p-5 animate-pulse" />
            <div className="h-56 rounded-xl bg-canvas-soft border border-hairline p-5 animate-pulse" />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
