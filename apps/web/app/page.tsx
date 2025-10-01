import Room from "@/components/room";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Users, Code2, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center text-white overflow-hidden">
      <BackgroundBeams />

      <section className="relative z-10 text-center max-w-4xl px-6 py-10">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          CodeCollab
        </h1>
        <p className="mt-2 text-lg md:text-xl text-gray-300">
          Work together on code with your team, in real-time. Share ideas, debug
          faster, and build better — all inside one collaborative editor.
        </p>

        <div className="mt-10">
          <Room />
        </div>
      </section>

      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-20 max-w-6xl">
        <FeatureCard
          icon={<Users className="h-8 w-8 text-blue-400" />}
          title="Collaborative Editing"
          description="See changes live as your teammates type. Stay in sync without conflicts."
        />
        <FeatureCard
          icon={<Code2 className="h-8 w-8 text-purple-400" />}
          title="Powerful Code Editor"
          description="Syntax highlighting, autocompletion, and formatting — powered by Monaco Editor."
        />
        <FeatureCard
          icon={<Share2 className="h-8 w-8 text-pink-400" />}
          title="Instant Sharing"
          description="Create a room and share the link. No sign-up needed — just start coding."
        />
      </section>

      <section className="relative z-10 text-center px-6 py-20 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to start collaborating?
        </h2>
        <p className="mt-4 text-lg text-gray-300">
          Join a room now and experience seamless, real-time coding with your
          team.
        </p>
      </section>

      <footer className="relative z-10 text-center py-6 text-sm text-gray-500 border-t border-gray-800 w-full">
        © {new Date().getFullYear()} CodeCollab. Built for real-time
        collaboration.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-neutral-900/50 border border-gray-800 rounded-xl p-6 text-center hover:border-blue-500 transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  );
}
