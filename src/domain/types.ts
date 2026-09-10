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
  membershipNo?: string;
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
  ctaLabel?: string;
  ctaUrl?: string;
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

/** Full society member directory (admin-managed “All Members” list). */
export interface SocietyMember {
  name: string;
  /** Canonical number, e.g. IPS-000470 */
  registrationNo?: string;
  membershipNo?: string;
  affiliation?: string;
  city?: string;
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

export interface GalleryImage {
  id: string;
  title: string;
  image: string;
  storagePath?: string;
}

/** Home announcement / hero strip images (admin-managed row). */
export type HeroImage = GalleryImage;

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
  /** Category fees in INR for fee summary and member discount. */
  fees?: Partial<Record<string, number>>;
  /** Discount in INR for IPS members on symposium registration. */
  memberDiscount?: number;
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
  /** IPS member discount applied */
  isIpsMember?: boolean;
  ipsMembershipNo?: string;
  baseFee?: number;
  memberDiscount?: number;
  amountDue?: number;
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

export interface MembershipApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  city?: string;
  category: string;
  submittedAt: string;
  paymentStatus?: PaymentStatus;
  amountLabel?: string;
  amountDue?: number;
}

/** Aggregate used by the current UI (localStorage today, Supabase soon). */
export interface SiteContent {
  announcement: Announcement;
  /** Linear image row under the home announcement hero */
  heroImages: HeroImage[];
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
  /** Full member directory shown under Members → All Members */
  allMembers: SocietyMember[];
  /** Student membership directory (5-year student members) */
  studentMembers: SocietyMember[];
  /** @deprecated Migrated to permanentMembers */
  directoryMembers?: PermanentMember[];
  symposiumAttendees: SymposiumAttendee[];
  recognizedPeople: RecognizedPerson[];
  blogPosts: BlogPost[];
  galleryImages: GalleryImage[];
  symposiumRegistration: SymposiumRegistrationConfig;
  contactMessages: ContactMessage[];
  membershipApplications: MembershipApplication[];
  symposiumRegistrations: SymposiumRegistration[];
  totalMembers: number;
  faqItems: FaqItem[];
  /** Scalable counters for IPS- / IPS-SYM-YYYY- numbers */
  registrationCounters: {
    member: number;
    symposium: Record<string, number>;
  };
}
