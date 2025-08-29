import { GhostPixelsClient } from "@/components/ghost-pixels-client";
import { LampDemo } from "@/components/lamp-demo";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground font-body">
      <LampDemo />
      <main className="flex-1 -mt-[24rem] z-10">
        <GhostPixelsClient />
      </main>
      <footer className="bg-card/50 border-t py-6 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} GhostPixels. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
