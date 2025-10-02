import Room from "@/components/room";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center text-white overflow-hidden">
      <BackgroundBeams />
      <div className="mt-8 w-full">
        <Room
          title="404 – Page Not Found"
          subTitle="Oops! The room you’re looking for doesn’t exist or may have been removed."
        />
      </div>
    </div>
  );
}
