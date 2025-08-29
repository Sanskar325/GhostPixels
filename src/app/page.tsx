import { GhostPixelsClient } from "@/components/ghost-pixels-client";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-4 z-20 px-4">
        <div className="container mx-auto bg-card/80 backdrop-blur-sm border rounded-full shadow-lg h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground font-headline">GhostPixels</h1>
            </div>
            <p className="text-muted-foreground hidden md:block">Hide your secrets in plain sight.</p>
        </div>
      </header>
      <main className="flex-1 pt-8">
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
