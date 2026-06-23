import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        membership: resolve(__dirname, "membership.html"),
        members: resolve(__dirname, "members.html"),
        events: resolve(__dirname, "events.html"),
        faq: resolve(__dirname, "faq.html"),
        contact: resolve(__dirname, "contact.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
      },
    },
  },
});
