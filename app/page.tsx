import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import SceneClient from "@/components/SceneClient";
import ScrollSections from "@/components/ScrollSections";
import StaticSections from "@/components/StaticSections";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <main className="relative">
        <LoadingScreen />
        <Header />
        <div className="scene-fixed">
          <SceneClient />
        </div>
        <div className="section-stack">
          <ScrollSections />
        </div>
      </main>
      <StaticSections />
      <Footer />
    </>
  );
}
