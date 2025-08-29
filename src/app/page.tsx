import { GhostPixelsClient } from "@/components/ghost-pixels-client";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground font-headline">GhostPixels</h1>
            </div>
            <p className="text-muted-foreground hidden md:block">Hide your secrets in plain sight.</p>
          </div>
        </div>
      </header>
      <main className="flex-1">
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
