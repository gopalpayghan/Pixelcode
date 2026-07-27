import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";

function LoginButton() {
  return (
    <Link href="/sign-in">
      <Button
        variant="primary"
        size="md"
        className="w-full"
        icon={<LogIn className="w-4 h-4" />}
      >
        Sign In to Upgrade
      </Button>
    </Link>
  );
}

export default LoginButton;
