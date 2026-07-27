import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";

export default function CollaborateLoading() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />
        <main className="max-w-page-narrow mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="w-48 h-6 bg-canvas-soft-2 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="w-80 h-10 bg-canvas-soft-2 rounded-lg mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="h-64 rounded-xl bg-canvas-soft border border-hairline p-6 animate-pulse" />
            <div className="h-64 rounded-xl bg-canvas-soft border border-hairline p-6 animate-pulse" />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
