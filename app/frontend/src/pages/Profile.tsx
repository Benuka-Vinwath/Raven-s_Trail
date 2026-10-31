import { useState, type InputHTMLAttributes } from "react";
import { Navigate } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import MyBookings from "../components/profile/MyBookings";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import type { User } from "../types";

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

// Center-crop to a 256px square JPEG so the data URL stays ~20KB.
function resizeToDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't a readable image."));
    };
    img.src = url;
  });
}

function AvatarPicker({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(avatarUrl: string | null) {
    setBusy(true);
    setError(null);
    try {
      await updateProfile({ avatarUrl });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update your photo. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await save(await resizeToDataUrl(file));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="mb-6 flex max-w-xl items-center gap-5 rounded-3xl border border-ink-900/10 bg-parchment-100/60 p-6">
      <Avatar name={user.name} src={user.avatarUrl} className="h-20 w-20 text-3xl" />
      <div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={handleFile} />
            <span className="inline-flex rounded-xl bg-forest-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ease-smooth hover:bg-forest-700">
              {busy ? "Saving…" : user.avatarUrl ? "Change photo" : "Upload photo"}
            </span>
          </label>
          {user.avatarUrl && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => save(null)}>
              Remove
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-700/60">JPG, PNG or WebP. It's cropped to a square.</p>
        {error && <p className="mt-2 text-sm text-clay-700">{error}</p>}
      </div>
    </div>
  );
}

function ProfileForm({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const body: Parameters<typeof updateProfile>[0] = {};
    if (name.trim() !== user.name) body.name = name.trim();
    if (email.trim().toLowerCase() !== user.email) body.email = email.trim();
    if (newPassword) body.newPassword = newPassword;
    if (currentPassword) body.currentPassword = currentPassword;
    if (!body.name && !body.email && !body.newPassword) {
      setError("Nothing to save yet — change your name, email or password first.");
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile(body);
      setCurrentPassword("");
      setNewPassword("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-3xl border border-ink-900/10 bg-parchment-100/60 p-8">
      <Field label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

      <div className="border-t border-ink-900/10 pt-5">
        <p className="mb-4 text-sm text-ink-700/70">
          Changing your email or password? Confirm it's you with your current password.
        </p>
        <div className="space-y-5">
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            hint="At least 8 characters. Leave blank to keep your current one."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="rounded-2xl border border-clay-600/30 bg-clay-100/40 p-3 text-sm text-clay-700">{error}</p>}
      {saved && (
        <p className="rounded-2xl border border-forest-600/30 bg-forest-600/10 p-3 text-sm text-forest-700">
          Profile updated.
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: "/profile" }} replace />;

  return (
    <>
      <PageHero
        page="profile"
        title="Your"
        dim="profile"
        blurb={`Member since ${new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}. Update your name, email or password.`}
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)]">
        <Reveal>
          <AvatarPicker user={user} />
          <ProfileForm user={user} />
        </Reveal>
        <Reveal delay={0.1}>
          <MyBookings />
        </Reveal>
      </div>
    </>
  );
}
