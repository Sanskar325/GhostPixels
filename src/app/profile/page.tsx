import { ProfileForm } from "@/components/profile-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground font-body p-4 sm:p-6 lg:p-8">
       <header className="absolute top-0 left-0 right-0 z-20 py-4">
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
           <Button asChild variant="outline" size="icon">
                <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <h1 className="text-2xl font-headline font-bold text-foreground">Profile Settings</h1>
            <div className="w-10"></div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center pt-20">
        <ProfileForm />
      </main>
    </div>
  );
}
