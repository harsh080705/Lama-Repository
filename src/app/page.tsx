import Header from "@/components/ui/Header";
import HeroCanvas from "@/components/canvas/HeroCanvas";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main className="relative w-full">
      <Header />

      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <HeroCanvas />
      </div>

      <div className="relative z-10">
        <section className="relative min-h-screen w-full">
          <HeroSection />
        </section>

        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </main>
  );
}
