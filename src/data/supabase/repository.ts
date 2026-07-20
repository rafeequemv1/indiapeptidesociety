import type { ContactMessage, SiteContent, SymposiumRegistration } from "../../domain/types";
import type { ContentRepository } from "../repository";
import { getSupabaseClient } from "./client";
import type { Database } from "./database.types";
import {
  emptySiteContent,
  mapAnnouncement,
  mapAttendee,
  mapAward,
  mapBlog,
  mapContact,
  mapFaq,
  mapGallery,
  mapNews,
  mapPermanent,
  mapRecognized,
  mapRegistration,
  mapRegistrationSettings,
  mapService,
  mapStat,
  mapSymposium,
  mapTeam,
  toRegistrationCategory,
} from "./mappers";

type Tables = Database["public"]["Tables"];
type SympRow = Tables["symposia"]["Row"];
type PermanentRow = Tables["permanent_members"]["Row"];
type MetaRow = Tables["site_meta"]["Row"];
type ContactRow = Tables["contact_messages"]["Row"];
type RegRow = Tables["symposium_registrations"]["Row"];

/**
 * Supabase-backed repository.
 * load() assembles SiteContent from normalized tables.
 * save() is intentionally not a blunt replace — use table-level admin writes later.
 */
export function createSupabaseRepository(): ContentRepository {
  const sb = () => getSupabaseClient();

  return {
    async load() {
      const client = sb();
      const [
        announcementRes,
        newsRes,
        statsRes,
        awardsRes,
        servicesRes,
        teamRes,
        symposiaRes,
        faqRes,
        permanentRes,
        attendeesRes,
        recognizedRes,
        blogRes,
        galleryRes,
        regSettingsRes,
        metaRes,
        contactsRes,
        registrationsRes,
      ] = await Promise.all([
        client.from("announcements").select("*").eq("is_active", true).limit(1).maybeSingle(),
        client.from("news_items").select("*").eq("published", true).order("sort_order"),
        client.from("site_stats").select("*").order("sort_order"),
        client.from("lifetime_awards").select("*").order("sort_order"),
        client.from("services").select("*").order("sort_order"),
        client.from("team_members").select("*").order("sort_order"),
        client.from("symposia").select("*").order("sort_order"),
        client.from("faq_items").select("*").eq("published", true).order("sort_order"),
        client.from("permanent_members").select("*").order("sort_order"),
        client.from("symposium_attendees").select("*").order("sort_order"),
        client.from("recognized_people").select("*").order("sort_order"),
        client.from("blog_posts").select("*").eq("published", true).order("sort_order"),
        client.from("gallery_images").select("*").order("sort_order"),
        client.from("registration_settings").select("*").limit(1).maybeSingle(),
        client.from("site_meta").select("*").eq("key", "total_members").maybeSingle(),
        client.from("contact_messages").select("*").order("submitted_at", { ascending: false }),
        client
          .from("symposium_registrations")
          .select("*")
          .order("submitted_at", { ascending: false }),
      ]);

      const content = emptySiteContent();

      if (announcementRes.data) content.announcement = mapAnnouncement(announcementRes.data);
      if (newsRes.data) content.news = newsRes.data.map(mapNews);
      if (statsRes.data) content.stats = statsRes.data.map(mapStat);
      if (awardsRes.data) content.lifetimeAwards = awardsRes.data.map(mapAward);
      if (servicesRes.data) content.services = servicesRes.data.map(mapService);
      if (teamRes.data) content.team = teamRes.data.map(mapTeam);

      const symposia = (symposiaRes.data ?? []) as SympRow[];
      content.upcomingSymposia = symposia.filter((s) => s.kind === "upcoming").map(mapSymposium);
      content.pastSymposia = symposia.filter((s) => s.kind === "past").map(mapSymposium);
      content.pastStudentSymposia = symposia.filter((s) => s.kind === "student").map(mapSymposium);

      if (faqRes.data) content.faqItems = faqRes.data.map(mapFaq);
      const permanents = (permanentRes.data ?? []) as PermanentRow[];
      if (permanents.length) {
        content.permanentMembers = permanents.map(mapPermanent);
        content.founderMembers = permanents
          .filter((m) => m.is_founder)
          .map((m) => ({ name: m.name, title: "", role: "Founder" }));
      }
      if (attendeesRes.data) content.symposiumAttendees = attendeesRes.data.map(mapAttendee);
      if (recognizedRes.data) content.recognizedPeople = recognizedRes.data.map(mapRecognized);
      if (blogRes.data) content.blogPosts = blogRes.data.map(mapBlog);
      if (galleryRes.data) content.galleryImages = galleryRes.data.map(mapGallery);
      if (regSettingsRes.data) {
        content.symposiumRegistration = mapRegistrationSettings(regSettingsRes.data);
      }

      const meta = metaRes.data as MetaRow | null;
      if (meta && typeof meta.value === "number") {
        content.totalMembers = meta.value;
      } else if (meta && typeof meta.value === "string") {
        content.totalMembers = Number(meta.value) || 0;
      }

      // Inbox requires staff JWT; anon gets empty (expected on public pages)
      if (!contactsRes.error && contactsRes.data) {
        content.contactMessages = (contactsRes.data as ContactRow[]).map(mapContact);
      }
      if (!registrationsRes.error && registrationsRes.data) {
        content.symposiumRegistrations = (registrationsRes.data as RegRow[]).map(mapRegistration);
      }

      return content;
    },

    async save(_content: SiteContent) {
      throw new Error(
        "Supabase save() is not a full dump. Persist via dashboard table writes / seed script after Auth is wired.",
      );
    },

    async reset() {
      throw new Error("Supabase reset() is disabled. Use SQL seed / dashboard instead.");
    },

    async addContactMessage(input) {
      const { data, error } = await sb()
        .from("contact_messages")
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
        } as Tables["contact_messages"]["Insert"])
        .select("*")
        .single();

      if (error || !data) throw error ?? new Error("Failed to insert contact message");
      return mapContact(data as ContactRow);
    },

    async addSymposiumRegistration(input) {
      const { data, error } = await sb()
        .from("symposium_registrations")
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone,
          affiliation: input.affiliation,
          category: toRegistrationCategory(input.category),
          payment_status: input.paymentStatus ?? "pending",
          razorpay_payment_id: input.razorpayPaymentId ?? null,
          amount_label: input.amountLabel ?? null,
          receipt_no: input.receiptNo ?? null,
          abstract_title: input.abstractTitle ?? null,
          abstract_file_name: input.abstractFileName ?? null,
          abstract_mime_type: input.abstractMimeType ?? null,
          abstract_storage_path: input.abstractStoragePath ?? null,
          abstract_file_size: input.abstractFileSize ?? null,
          has_abstract: Boolean(input.hasAbstract),
        } as Tables["symposium_registrations"]["Insert"])
        .select("*")
        .single();

      if (error || !data) throw error ?? new Error("Failed to insert registration");
      return mapRegistration(data as RegRow);
    },

    async deleteContactMessage(id: string) {
      const { error } = await sb().from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },

    async deleteSymposiumRegistration(id: string) {
      const { error } = await sb().from("symposium_registrations").delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export type { ContactMessage, SymposiumRegistration };
