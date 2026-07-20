/** Domain models for Indian Peptide Society (storage-agnostic). */

export interface Announcement {
  lead: string;
  dates: string;
  venue: string;
  coordinator: string;
  cta: string;
  ctaUrl: string;
  showCtaButton: boolean;
  ticker: string;
}

export interface NewsItem {
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface LifetimeAward {
  image: string;
  caption: string;
}

export interface ServiceItem {
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  affiliation: string;
  image: string;
  section: "executive" | "advisors";
}

/** @deprecated Legacy shape — migrated on load */
export interface TeamGroup {
  title: string;
  description: string;
  members: string[];
}

export interface SymposiumEvent {
  title: string;
  dates: string;
  venue: string;
  coordinator?: string;
  status?: string;
}

export interface FounderMember {
  name: string;
  role: string;
  title: string;
}

/** @deprecated Use PermanentMember */
export type DirectoryMember = PermanentMember;

export interface PermanentMember {
  name: string;
  membershipNo: number;
  isFounder?: boolean;
}

export interface SymposiumAttendee {
  name: string;
  affiliation?: string;
  symposiumYear: number;
  symposiumTitle?: string;
}

export interface RecognizedPerson {
  name: string;
  honor: string;
  year?: string;
  affiliation?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  coverImage?: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
}

export interface SymposiumRegistrationConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  dates: string;
  venue: string;
  feeNote: string;
  razorpayUrl: string;
  ctaLabel: string;
}

export type PaymentStatus = "pending" | "paid" | "failed";

export interface SymposiumRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  category: string;
  submittedAt: string;
  paymentStatus?: PaymentStatus;
  razorpayPaymentId?: string;
  amountLabel?: string;
  receiptNo?: string;
  /** Optional symposium abstract */
  abstractTitle?: string;
  abstractFileName?: string;
  abstractMimeType?: string;
  /** Local preview/storage until Supabase: data URL */
  abstractDataUrl?: string;
  /** Supabase Storage path: symposium-abstracts/{id}/{filename} */
  abstractStoragePath?: string;
  abstractFileSize?: number;
  hasAbstract?: boolean;
}

/** Aggregate used by the current UI (localStorage today, Supabase soon). */
export interface SiteContent {
  announcement: Announcement;
  news: NewsItem[];
  stats: StatItem[];
  lifetimeAwards: LifetimeAward[];
  services: ServiceItem[];
  team: TeamMember[];
  upcomingSymposia: SymposiumEvent[];
  pastSymposia: SymposiumEvent[];
  pastStudentSymposia: SymposiumEvent[];
  founderMembers: FounderMember[];
  permanentMembers: PermanentMember[];
  /** @deprecated Migrated to permanentMembers */
  directoryMembers?: PermanentMember[];
  symposiumAttendees: SymposiumAttendee[];
  recognizedPeople: RecognizedPerson[];
  blogPosts: BlogPost[];
  symposiumRegistration: SymposiumRegistrationConfig;
  contactMessages: ContactMessage[];
  symposiumRegistrations: SymposiumRegistration[];
  totalMembers: number;
  faqItems: FaqItem[];
}
