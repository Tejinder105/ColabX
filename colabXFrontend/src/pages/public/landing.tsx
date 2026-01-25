import { Link } from "react-router";
import Publicheader from "@/components/headers/Publicheader";
import Publicfooter from "@/components/footer/publicfooter";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { useEffect } from "react";

function HeroSection() {
  return (
    <div className="relative isolate pt-10 lg:pt-14">
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
      </div>
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
              Collaborate smarter. <br />
              <span className="text-primary block mt-2">Scale partnerships faster.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              ColabX is a workspace-based collaboration platform that helps startups and businesses manage partners, agreements, goals, tasks, and performance — all in one secure place.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Start your project
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg" className="h-12 px-8 text-base font-semibold bg-secondary/80 hover:bg-secondary text-secondary-foreground">
                  Request a demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  // Scroll to top on mount to prevent browser scroll restoration from hiding the hero
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Publicheader />
      <div className="flex-1">
        <HeroSection />
      </div>
      <Publicfooter />
    </div>
  );
}

export default LandingPage;