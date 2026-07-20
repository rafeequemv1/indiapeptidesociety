import type {
  Announcement,
  BlogPost,
  ContactMessage,
  FaqItem,
  GalleryImage,
  LifetimeAward,
  NewsItem,
  PermanentMember,
  RecognizedPerson,
  ServiceItem,
  SiteContent,
  StatItem,
  SymposiumAttendee,
  SymposiumEvent,
  SymposiumRegistration,
  SymposiumRegistrationConfig,
  TeamMember,
} from "../../domain/types";
import type { Database, RegistrationCategory } from "./database.types";

type Tables = Database["public"]["Tables"];

export function mapAnnouncement(row: Tables["announcements"]["Row"]): Announcement {
  return {
    lead: row.lead,
    dates: row.dates,
    venue: row.venue,
    coordinator: row.coordinator,
    cta: row.cta,
    ctaUrl: row.cta_url,
    showCtaButton: row.show_cta_button,
    ticker: row.ticker,
  };
}

export function mapNews(row: Tables["news_items"]["Row"]): NewsItem {
  return {
    tag: row.tag,
    date: row.display_date,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image_url,
  };
}

export function mapStat(row: Tables["site_stats"]["Row"]): StatItem {
  return { value: row.value, label: row.label };
}

export function mapAward(row: Tables["lifetime_awards"]["Row"]): LifetimeAward {
  return { image: row.image_url, caption: row.caption };
}

export function mapService(row: Tables["services"]["Row"]): ServiceItem {
  return { title: row.title, description: row.description };
}

export function mapTeam(row: Tables["team_members"]["Row"]): TeamMember {
  return {
    name: row.name,
    role: row.role,
    affiliation: row.affiliation,
    image: row.image_url,
    section: row.section,
  };
}

export function mapSymposium(row: Tables["symposia"]["Row"]): SymposiumEvent {
  return {
    title: row.title,
    dates: row.dates,
    venue: row.venue,
    coordinator: row.coordinator ?? undefined,
    status: row.status ?? undefined,
  };
}

export function mapFaq(row: Tables["faq_items"]["Row"]): FaqItem {
  return { question: row.question, answer: row.answer };
}

export function mapPermanent(row: Tables["permanent_members"]["Row"]): PermanentMember {
  return {
    name: row.name,
    membershipNo: row.membership_no,
    isFounder: row.is_founder,
  };
}

export function mapAttendee(row: Tables["symposium_attendees"]["Row"]): SymposiumAttendee {
  return {
    name: row.name,
    affiliation: row.affiliation ?? undefined,
    symposiumYear: row.symposium_year,
    symposiumTitle: row.symposium_title ?? undefined,
  };
}

export function mapRecognized(row: Tables["recognized_people"]["Row"]): RecognizedPerson {
  return {
    name: row.name,
    honor: row.honor,
    year: row.year ?? undefined,
    affiliation: row.affiliation ?? undefined,
  };
}

export function mapBlog(row: Tables["blog_posts"]["Row"]): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.display_date,
    tag: row.tag,
    excerpt: row.excerpt,
    coverImage: row.cover_image_url ?? undefined,
    body: row.body,
  };
}

export function mapGallery(row: Tables["gallery_images"]["Row"]): GalleryImage {
  return {
    id: row.id,
    title: row.title,
    image: row.image_url,
    storagePath: row.storage_path ?? undefined,
  };
}

export function mapRegistrationSettings(
  row: Tables["registration_settings"]["Row"],
): SymposiumRegistrationConfig {
  return {
    enabled: row.enabled,
    title: row.title,
    subtitle: row.subtitle,
    dates: row.dates,
    venue: row.venue,
    feeNote: row.fee_note,
    razorpayUrl: row.razorpay_url,
    ctaLabel: row.cta_label,
  };
}

export function mapContact(row: Tables["contact_messages"]["Row"]): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    submittedAt: row.submitted_at,
  };
}

export function mapRegistration(
  row: Tables["symposium_registrations"]["Row"],
): SymposiumRegistration {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    affiliation: row.affiliation,
    category: row.category,
    submittedAt: row.submitted_at,
    paymentStatus: (row.payment_status as SymposiumRegistration["paymentStatus"]) || "pending",
    razorpayPaymentId: row.razorpay_payment_id ?? undefined,
    amountLabel: row.amount_label ?? undefined,
    receiptNo: row.receipt_no ?? undefined,
    abstractTitle: row.abstract_title ?? undefined,
    abstractFileName: row.abstract_file_name ?? undefined,
    abstractMimeType: row.abstract_mime_type ?? undefined,
    abstractStoragePath: row.abstract_storage_path ?? undefined,
    abstractFileSize: row.abstract_file_size ?? undefined,
    hasAbstract: row.has_abstract,
  };
}

export function toRegistrationCategory(value: string): RegistrationCategory {
  const allowed: RegistrationCategory[] = ["Student", "Academia", "Industry", "Other"];
  return (allowed.includes(value as RegistrationCategory) ? value : "Other") as RegistrationCategory;
}

export function emptySiteContent(): SiteContent {
  return {
    announcement: {
      lead: "",
      dates: "",
      venue: "",
      coordinator: "",
      cta: "",
      ctaUrl: "",
      showCtaButton: false,
      ticker: "",
    },
    news: [],
    stats: [],
    lifetimeAwards: [],
    services: [],
    team: [],
    upcomingSymposia: [],
    pastSymposia: [],
    pastStudentSymposia: [],
    founderMembers: [],
    permanentMembers: [],
    symposiumAttendees: [],
    recognizedPeople: [],
    blogPosts: [],
    galleryImages: [],
    symposiumRegistration: {
      enabled: false,
      title: "",
      subtitle: "",
      dates: "",
      venue: "",
      feeNote: "",
      razorpayUrl: "",
      ctaLabel: "Register & Pay",
    },
    contactMessages: [],
    symposiumRegistrations: [],
    totalMembers: 0,
    faqItems: [],
  };
}
