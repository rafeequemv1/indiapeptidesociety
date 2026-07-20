/**
 * Hand-maintained Database types matching supabase/migrations.
 * After linking a project, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/data/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TeamSection = "executive" | "advisors";
export type SymposiumKind = "upcoming" | "past" | "student";
export type RegistrationCategory = "Student" | "Academia" | "Industry" | "Other";

export interface Database {
  public: {
    Tables: {
      site_meta: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value?: Json; updated_at?: string };
        Update: { key?: string; value?: Json; updated_at?: string };
      };
      announcements: {
        Row: {
          id: string;
          lead: string;
          dates: string;
          venue: string;
          coordinator: string;
          cta: string;
          cta_url: string;
          show_cta_button: boolean;
          ticker: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["announcements"]["Row"]> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
      Relationships: [];
      };
      news_items: {
        Row: {
          id: string;
          tag: string;
          display_date: string;
          title: string;
          excerpt: string;
          image_url: string;
          sort_order: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["news_items"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["news_items"]["Row"]>;
      Relationships: [];
      };
      site_stats: {
        Row: {
          id: string;
          value: string;
          label: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_stats"]["Row"]> & {
          value: string;
          label: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_stats"]["Row"]>;
      Relationships: [];
      };
      lifetime_awards: {
        Row: {
          id: string;
          image_url: string;
          caption: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lifetime_awards"]["Row"]> & {
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["lifetime_awards"]["Row"]>;
      Relationships: [];
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["services"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
      Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          affiliation: string;
          image_url: string;
          section: TeamSection;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["team_members"]["Row"]> & {
          name: string;
          section: TeamSection;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Row"]>;
      Relationships: [];
      };
      symposia: {
        Row: {
          id: string;
          kind: SymposiumKind;
          title: string;
          dates: string;
          venue: string;
          coordinator: string | null;
          status: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["symposia"]["Row"]> & {
          kind: SymposiumKind;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["symposia"]["Row"]>;
      Relationships: [];
      };
      faq_items: {
        Row: {
          id: string;
          question: string;
          answer: string;
          sort_order: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["faq_items"]["Row"]> & {
          question: string;
          answer: string;
        };
        Update: Partial<Database["public"]["Tables"]["faq_items"]["Row"]>;
      Relationships: [];
      };
      permanent_members: {
        Row: {
          id: string;
          name: string;
          membership_no: number;
          is_founder: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["permanent_members"]["Row"]> & {
          name: string;
          membership_no: number;
        };
        Update: Partial<Database["public"]["Tables"]["permanent_members"]["Row"]>;
      Relationships: [];
      };
      symposium_attendees: {
        Row: {
          id: string;
          name: string;
          affiliation: string | null;
          symposium_year: number;
          symposium_title: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["symposium_attendees"]["Row"]> & {
          name: string;
          symposium_year: number;
        };
        Update: Partial<Database["public"]["Tables"]["symposium_attendees"]["Row"]>;
      Relationships: [];
      };
      recognized_people: {
        Row: {
          id: string;
          name: string;
          honor: string;
          year: string | null;
          affiliation: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["recognized_people"]["Row"]> & {
          name: string;
          honor: string;
        };
        Update: Partial<Database["public"]["Tables"]["recognized_people"]["Row"]>;
      Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          display_date: string;
          tag: string;
          excerpt: string;
          cover_image_url: string | null;
          body: string;
          published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]> & {
          slug: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]>;
      Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          storage_path: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gallery_images"]["Row"]> & {
          image_url?: string;
          title?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_images"]["Row"]>;
        Relationships: [];
      };
      registration_settings: {
        Row: {
          id: string;
          enabled: boolean;
          title: string;
          subtitle: string;
          dates: string;
          venue: string;
          fee_note: string;
          razorpay_url: string;
          cta_label: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["registration_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["registration_settings"]["Row"]>;
      Relationships: [];
      };
      symposium_registrations: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          affiliation: string;
          category: RegistrationCategory;
          payment_status: string;
          razorpay_payment_id: string | null;
          notes: string | null;
          submitted_at: string;
          created_at: string;
          abstract_title: string | null;
          abstract_file_name: string | null;
          abstract_mime_type: string | null;
          abstract_storage_path: string | null;
          abstract_file_size: number | null;
          has_abstract: boolean;
          receipt_no: string | null;
          amount_label: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["symposium_registrations"]["Row"]> & {
          name: string;
          email: string;
          category: RegistrationCategory;
        };
        Update: Partial<Database["public"]["Tables"]["symposium_registrations"]["Row"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          message: string;
          is_read: boolean;
          submitted_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]> & {
          name: string;
          email: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
      Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean };
    };
    CompositeTypes: Record<string, never>;
    Enums: {
      team_section: TeamSection;
      symposium_kind: SymposiumKind;
      registration_category: RegistrationCategory;
    };
  };
}
