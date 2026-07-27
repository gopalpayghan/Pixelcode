import { SignUp } from "@clerk/nextjs";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <NavigationHeader />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <SignUp
          appearance={{
            elements: {
              card: "bg-canvas-soft border border-hairline shadow-level-4 rounded-xl",
              headerTitle: "text-ink font-semibold text-display-sm",
              headerSubtitle: "text-mute text-body-sm",
              socialButtonsBlockButton:
                "bg-canvas border border-hairline text-ink hover:bg-canvas-soft-2",
              formFieldLabel: "text-ink text-body-sm font-medium",
              formFieldInput:
                "bg-canvas border border-hairline text-ink focus:border-link rounded-md",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:opacity-90 rounded-md",
              footerActionLink: "text-link hover:text-link-deep",
            },
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
