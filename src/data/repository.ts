import type {
  ContactMessage,
  SiteContent,
  SymposiumRegistration,
} from "../domain/types";

/**
 * Async content port. Local adapter wraps sync localStorage;
 * Supabase adapter will talk to Postgres when VITE_DATA_SOURCE=supabase.
 */
export interface ContentRepository {
  load(): Promise<SiteContent>;
  save(content: SiteContent): Promise<void>;
  reset(): Promise<SiteContent>;
  addContactMessage(
    input: Omit<ContactMessage, "id" | "submittedAt"> & { id?: string; submittedAt?: string },
  ): Promise<ContactMessage>;
  addSymposiumRegistration(
    input: Omit<SymposiumRegistration, "id" | "submittedAt"> & {
      id?: string;
      submittedAt?: string;
    },
  ): Promise<SymposiumRegistration>;
  deleteContactMessage(id: string): Promise<void>;
  deleteSymposiumRegistration(id: string): Promise<void>;
}
