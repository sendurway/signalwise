export type CarrierSlug = "mint" | "visible" | "us-mobile";

export const OUTBOUND_URLS: Record<CarrierSlug, string> = {
  mint: process.env.AFF_MINT_URL || "https://www.mintmobile.com",
  visible: process.env.AFF_VISIBLE_URL || "https://www.visible.com",
  "us-mobile": process.env.AFF_US_MOBILE_URL || "https://www.usmobile.com",
};