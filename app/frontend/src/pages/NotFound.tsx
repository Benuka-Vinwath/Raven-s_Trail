import RavenMark from "../components/icons/RavenMark";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-28 text-center">
      <RavenMark className="h-10 w-10 text-forest-600 mx-auto" />
      <h1 className="mt-6 font-display text-3xl text-ink-900">Off the marked trail</h1>
      <p className="mt-2 text-ink-700/75">This page doesn't exist — let's get you back on route.</p>
      <Button to="/" className="mt-6">
        Back to home
      </Button>
    </div>
  );
}
