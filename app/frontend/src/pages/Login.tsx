import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell, { AuthError, AuthField } from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { heroPhoto } from "../lib/photos";

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
    <AuthShell
      photo={heroPhoto(1800)}
      headline={
        <>
          Welcome
          <br />
          <span className="text-white/45">back to the</span>
          <br />
          trail
        </>
      }
      blurb="Pick up your saved trails, gear reservations and trip plans right where you left off."
      cardTitle="Sign in"
      cardSub="Good to see you again."
      footer={
        <>
          New to Raven's Trail?{" "}
          <Link to="/signup" className="font-medium text-gold-400 hover:text-white">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <AuthField label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <AuthError message={error} />}
        <Button type="submit" variant="light" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
