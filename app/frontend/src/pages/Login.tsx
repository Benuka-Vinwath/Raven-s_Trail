import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RavenMark from "../components/icons/RavenMark";
import RidgeIllustration from "../components/illustrations/RidgeIllustration";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem-1px)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2">
            <RavenMark className="h-6 w-6 text-forest-600" />
            <span className="font-display text-lg text-ink-900">Raven's Trail</span>
          </Link>

          <h1 className="mt-8 font-display text-3xl text-ink-900">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-700/70">Sign in to pick up your saved trails and trip plans.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-ink-900 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-900 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
              />
            </div>

            {error && (
              <p className="text-sm text-clay-700 bg-clay-100 border border-clay-600/30 rounded px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-ink-700/70 text-center">
            New to Raven's Trail?{" "}
            <Link to="/signup" className="text-clay-600 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative">
        <RidgeIllustration variant="misty" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
