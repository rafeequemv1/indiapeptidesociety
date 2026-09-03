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
        symposiums: resolve(__dirname, "symposiums.html"),
        ips2027: resolve(__dirname, "ips-2027.html"),
        registration: resolve(__dirname, "registration.html"),
        blog: resolve(__dirname, "blog.html"),
        blogPost: resolve(__dirname, "blog-post.html"),
        gallery: resolve(__dirname, "gallery.html"),
        faq: resolve(__dirname, "faq.html"),
        contact: resolve(__dirname, "contact.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
      },
    },
  },
});
