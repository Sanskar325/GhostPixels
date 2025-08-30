import { GhostPixelsClient } from "@/components/ghost-pixels-client";
import { LampDemo } from "@/components/lamp-demo";
import FollowingPointerDemo from "@/components/following-pointer-demo";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="absolute top-0 left-0 right-0 z-20 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-headline font-bold text-foreground">GhostPixels</h1>
        </div>
      </header>
      <LampDemo />
      <main className="flex-1 -mt-[20rem] z-10 mb-16">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">What is GhostPixels?</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg">
                GhostPixels leverages the ancient art of steganography, reborn for the digital age, to seamlessly embed your secret messages, files, or sensitive data within the very pixels of an image. This process makes your information completely invisible to the naked eye, appearing as nothing more than an ordinary picture. Secure your data, protect your privacy, and communicate with confidence.
            </p>
        </section>
        <GhostPixelsClient />
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-8 text-center">
          <FollowingPointerDemo />
        </section>
      </main>
      <footer className="bg-card/50 border-t py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} GhostPixels. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
