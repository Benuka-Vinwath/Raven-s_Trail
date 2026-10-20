import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell, { AuthError, AuthField } from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { trailPhoto } from "../lib/photos";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      photo={trailPhoto("adams-peak", 1800)}
      headline={
        <>
          Your next
          <br />
          <span className="text-white/45">summit starts</span>
          <br />
          here
        </>
      }
      blurb="Save trails, reserve gear and plan your hiking budget — free, in under a minute."
      cardTitle="Create account"
      cardSub="Join hikers exploring the island."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-gold-400 hover:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthField label="Name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <AuthField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <AuthField label="Password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        {error && <AuthError message={error} />}
        <Button type="submit" variant="light" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
