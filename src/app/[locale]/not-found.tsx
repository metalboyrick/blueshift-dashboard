import { Link } from "@/i18n/navigation";
import Button from "../components/Button/Button";
import { headers } from "next/headers";

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get("x-current-path") || "";
  

  const isChallengesRoute = pathname.includes("/challenges");
  const isCoursesRoute = pathname.includes("/courses");
  
  // Set appropriate content based on the route
  let message: string;
  let buttons: React.ReactNode;
  
  if (isChallengesRoute) {
    message = "The challenge you are looking for doesn't exist.";
    buttons = (
      <Link href="/challenges">
        <Button icon="ArrowLeft" label="Head to Challenges" />
      </Link>
    );
  } else if (isCoursesRoute) {
    message = "The course or lesson you are looking for doesn't exist.";
    buttons = (
      <Link href="/">
        <Button icon="ArrowLeft" label="Head to Courses" />
      </Link>
    );
  } else {
    message = "The page you are looking for doesn't exist.";
    buttons = (
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button icon="ArrowLeft" label="Head to Courses" />
        </Link>
        <Link href="/challenges">
          <Button icon="ArrowLeft" label="Head to Challenges" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 items-center justify-center h-screen">
      <div className="flex flex-col gap-y-2 items-center justify-center">
        <div className="font-mono text-brand-primary text-9xl">
          4<span className="animate-pulse">0</span>4
        </div>
        <p className="text-secondary font-medium">
          {message}
        </p>
      </div>
      {buttons}
    </div>
  );
}
