import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <div>
        <NavigationHeader />
        <main className="max-w-page-narrow mx-auto px-4 sm:px-6 py-12">
          <div className="h-40 rounded-xl bg-canvas-soft border border-hairline p-8 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="h-28 rounded-xl bg-canvas-soft border border-hairline p-4 animate-pulse" />
            <div className="h-28 rounded-xl bg-canvas-soft border border-hairline p-4 animate-pulse" />
            <div className="h-28 rounded-xl bg-canvas-soft border border-hairline p-4 animate-pulse" />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
