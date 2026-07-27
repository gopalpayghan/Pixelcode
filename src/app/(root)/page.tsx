import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import HeroBand from "./_components/HeroBand";
import LanguageGrid from "./_components/LanguageGrid";
import FeatureBand from "./_components/FeatureBand";
import ShowcaseBand from "./_components/ShowcaseBand";
import CTABand from "./_components/CTABand";

export default function HomePage() {
  return (
    <>
      <NavigationHeader />
      <main>
        <HeroBand />
        <LanguageGrid />
        <FeatureBand />
        <ShowcaseBand />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
