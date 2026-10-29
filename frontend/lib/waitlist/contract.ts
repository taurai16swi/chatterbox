export const WAITLIST_FEATURES = [
  "Personal profiles",
  "ChatterTags",
  "Direct messaging",
  "Photo sharing",
  "Document sharing",
  "Contacts",
  "Voice notes",
  "Audio/video calls",
  "Group chats",
  "Communities and channels",
  "Home feed",
  "Business accounts",
] as const;

export const WAITLIST_REFERRAL_SOURCES = [
  "Social media",
  "Friend or family",
  "School or university",
  "Online search",
  "Other",
] as const;

export const WAITLIST_COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Nigeria",
  "South Africa",
  "Zambia",
  "Other",
] as const;

export type WaitlistField =
  | "fullName"
  | "email"
  | "country"
  | "chatterTag"
  | "interests"
  | "source"
  | "consent";

export type WaitlistSubmission = {
  fullName: string;
  email: string;
  country: string;
  chatterTag: string;
  interests: string[];
  source: string;
  consent: boolean;
  website: string;
};

export type WaitlistApiResponse =
  | { ok: true; message: string }
  | {
      ok: false;
      error: string;
      message: string;
      fields?: Partial<Record<WaitlistField, string>>;
    };
