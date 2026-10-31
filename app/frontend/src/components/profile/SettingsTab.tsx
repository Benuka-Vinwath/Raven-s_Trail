import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import type { User } from "../../types";

function Field({ label, hint, ...props }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-900">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
      />
      {hint && <span className="mt-1 block text-xs text-ink-700/60">{hint}</span>}
    </label>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink-900/10 bg-parchment-100/60 p-6 sm:p-8">
      <h2 className="font-display text-xl text-ink-900">{title}</h2>
      <p className="mt-1 text-sm text-ink-700/70">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Notice({ error, saved }: { error: string | null; saved: string | null }) {
  if (error) return <p className="rounded-2xl border border-clay-600/30 bg-clay-100/40 p-3 text-sm text-clay-700">{error}</p>;
  if (saved) return <p className="rounded-2xl border border-forest-600/30 bg-forest-600/10 p-3 text-sm text-forest-700">{saved}</p>;
  return null;
}

function AccountForm({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== user.email;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    const body: Parameters<typeof updateProfile>[0] = {};
    if (name.trim() !== user.name) body.name = name.trim();
    if (emailChanged) {
      body.email = email.trim();
      body.currentPassword = currentPassword;
    }
    if (phone.trim() !== (user.phone ?? "")) body.phone = phone.trim();
    if (Object.keys(body).length === 0) {
      setError("Nothing to save yet. Change a detail first.");
      return;
    }
    setBusy(true);
    try {
      await updateProfile(body);
      setCurrentPassword("");
      setSaved("Saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Account" description="Your name, email and contact number. The phone number pre-fills at checkout so shops can reach you about pickup.">
      <form onSubmit={submit} className="max-w-xl space-y-5">
        <Field label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {/* only asked for when it's needed, so the browser has nothing to autofill here */}
        {emailChanged && (
          <Field
            label="Current password"
            type="password"
            required
            autoComplete="current-password"
            hint="Needed to change your email address."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        )}
        <Field label="Phone number" type="tel" autoComplete="tel" placeholder="e.g. 077 123 4567" maxLength={20} hint="Optional." value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Notice error={error} saved={saved} />
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}

function strength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return { score, label: ["Too short", "Weak", "Fair", "Good", "Strong"][score] };
}

function SecurityForm() {
  const { updateProfile } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const s = strength(next);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    if (next !== confirm) {
      setError("The two new passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await updateProfile({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setSaved("Password changed.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const type = show ? "text" : "password";
  return (
    <Card title="Security" description="Change your password. Use something long that you don't use anywhere else.">
      <form onSubmit={submit} className="max-w-xl space-y-5">
        <Field label="Current password" type={type} required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <div>
          <Field label="New password" type={type} required minLength={8} autoComplete="new-password" hint="At least 8 characters." value={next} onChange={(e) => setNext(e.target.value)} />
          {next && (
            <div className="mt-2">
              <div className="flex gap-1.5" aria-hidden>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={clsx("h-1.5 flex-1 rounded-full", n <= s.score ? (s.score <= 1 ? "bg-clay-600" : s.score === 2 ? "bg-gold-500" : "bg-forest-600") : "bg-ink-900/10")} />
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-700/70">Strength: {s.label}</p>
            </div>
          )}
        </div>
        <Field label="Confirm new password" type={type} required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button type="button" onClick={() => setShow((v) => !v)} className="flex items-center gap-1.5 text-sm text-forest-700 hover:underline">
          {show ? <EyeOff size={15} /> : <Eye size={15} />} {show ? "Hide passwords" : "Show passwords"}
        </button>
        <Notice error={error} saved={saved} />
        <Button type="submit" disabled={busy}>
          {busy ? "Changing…" : "Change password"}
        </Button>
      </form>
    </Card>
  );
}

function PhotoCard({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  if (!user.avatarUrl) return null;
  return (
    <Card title="Profile photo" description="Change it with the camera button on your photo at the top of the page.">
      <Button
        variant="secondary"
        onClick={async () => {
          setError(null);
          try {
            await updateProfile({ avatarUrl: null });
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't remove it. Try again.");
          }
        }}
      >
        Remove photo
      </Button>
      {error && <p className="mt-3 text-sm text-clay-700">{error}</p>}
    </Card>
  );
}

export default function SettingsTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <AccountForm user={user} />
      <SecurityForm />
      <PhotoCard user={user} />
    </div>
  );
}
