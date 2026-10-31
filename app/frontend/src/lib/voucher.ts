import { formatDate } from "./trips";
import type { Booking, BookingShop } from "../types";

// The QR code holds only a link. The page it opens checks the booking live, so an edited PDF or a cancelled booking is caught.
export const masterVoucherUrl = (b: Booking) => `${window.location.origin}/v/${b.verifyToken}`;

// a per-shop link: only that shop's items show, and the signature stops anyone swapping in another shop's name
export const shopVoucherUrl = (b: Booking, s: BookingShop) =>
  `${window.location.origin}/v/${b.verifyToken}?shop=${encodeURIComponent(s.name)}&s=${s.signature}`;

// Shops list phones as free text ("076 056 5427 (Katunayaka) · 071 079 7988 (Ragama)").
// Returns the first Sri Lankan mobile as a WhatsApp number (94...), or null if there is only a landline.
export function whatsappNumber(phone: string | null): string | null {
  if (!phone) return null;
  const compact = phone.split(" ").join("").split("-").join("");
  const match = compact.match(/(?:\+?94|0)(7[0-9]{8})/);
  return match ? `94${match[1]}` : null;
}

export function whatsappLink(b: Booking, shop: BookingShop): string | null {
  const number = whatsappNumber(shop.phone);
  if (!number) return null;
  const items = b.items.filter((i) => i.shopName === shop.name).map((i) => `- ${i.quantity} × ${i.itemName}`);
  const text = [
    `Hi ${shop.name}, I booked gear for ${b.trailName} on Raven's Trail.`,
    `Reference: ${b.reference}`,
    `Name: ${b.customerName}`,
    `Dates: ${formatDate(b.startDate)} to ${formatDate(b.endDate)}`,
    ...items,
    `Check my booking: ${shopVoucherUrl(b, shop)}`,
    "When can I collect it?",
  ].join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
