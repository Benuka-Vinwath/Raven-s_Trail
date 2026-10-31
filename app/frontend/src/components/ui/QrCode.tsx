import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Draws a QR code for `value` as an image. White background and dark modules so phone cameras read it reliably,
// including when printed.
export default function QrCode({ value, size = 160, alt }: { value: string; size?: number; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: "M", color: { dark: "#14241d", light: "#ffffff" } })
      .then((url) => !cancelled && setSrc(url))
      .catch(() => !cancelled && setSrc(null));
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) return <div style={{ width: size, height: size }} className="animate-pulse rounded-xl bg-ink-900/5" />;
  return <img src={src} width={size} height={size} alt={alt} className="rounded-xl border border-ink-900/10 bg-white" />;
}
