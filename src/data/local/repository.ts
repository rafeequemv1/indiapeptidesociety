import type { ContactMessage, SymposiumRegistration } from "../../domain/types";
import type { ContentRepository } from "../repository";
import { loadContent, newId, resetContent, saveContent } from "../store";

export function createLocalRepository(): ContentRepository {
  return {
    async load() {
      return loadContent();
    },

    async save(content) {
      saveContent(content);
    },

    async reset() {
      return resetContent();
    },

    async addContactMessage(input) {
      const content = loadContent();
      const row: ContactMessage = {
        id: input.id ?? newId(),
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        submittedAt: input.submittedAt ?? new Date().toISOString(),
      };
      content.contactMessages.unshift(row);
      saveContent(content);
      return row;
    },

    async addSymposiumRegistration(input) {
      const content = loadContent();
      const row: SymposiumRegistration = {
        id: input.id ?? newId(),
        name: input.name,
        email: input.email,
        phone: input.phone,
        affiliation: input.affiliation,
        category: input.category,
        submittedAt: input.submittedAt ?? new Date().toISOString(),
      };
      content.symposiumRegistrations.unshift(row);
      saveContent(content);
      return row;
    },

    async deleteContactMessage(id) {
      const content = loadContent();
      content.contactMessages = content.contactMessages.filter((m) => m.id !== id);
      saveContent(content);
    },

    async deleteSymposiumRegistration(id) {
      const content = loadContent();
      content.symposiumRegistrations = content.symposiumRegistrations.filter((m) => m.id !== id);
      saveContent(content);
    },
  };
}
