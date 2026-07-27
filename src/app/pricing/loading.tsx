import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />
        <main className="max-w-page mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-48 h-6 bg-canvas-soft-2 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="w-80 h-10 bg-canvas-soft-2 rounded-lg mx-auto mb-16 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="h-96 rounded-xl bg-canvas-soft border border-hairline p-8 animate-pulse" />
            <div className="h-96 rounded-xl bg-canvas-soft border border-hairline p-8 animate-pulse" />
            <div className="h-96 rounded-xl bg-canvas-soft border border-hairline p-8 animate-pulse" />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
