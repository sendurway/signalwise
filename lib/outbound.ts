export type CarrierSlug = "mint" | "visible" | "us-mobile";

export const OUTBOUND_URLS: Record<CarrierSlug, string> = {
  mint: "https://www.mintmobile.com",
  visible: "https://www.visible.com",
  "us-mobile": "https://www.usmobile.com",
};