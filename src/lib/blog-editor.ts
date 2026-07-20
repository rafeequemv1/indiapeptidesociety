import type { Editor } from "@tiptap/core";
import { readImageAsDataUrl } from "./csv";

let editor: Editor | null = null;
let toolbarRoot: HTMLElement | null = null;

function btn(label: string, title: string, action: string, mark?: string): string {
  return `<button type="button" class="tiptap-toolbar__btn" data-action="${action}"${mark ? ` data-mark="${mark}"` : ""} title="${title}" aria-label="${title}">${label}</button>`;
}

function buildShell(host: HTMLElement): { toolbar: HTMLElement; mount: HTMLElement } {
  host.innerHTML = `
    <div class="tiptap-toolbar" role="toolbar" aria-label="Formatting">
      ${btn("<b>B</b>", "Bold", "bold", "bold")}
      ${btn("<i>I</i>", "Italic", "italic", "italic")}
      ${btn("<u>U</u>", "Underline", "underline", "underline")}
      ${btn("S", "Strikethrough", "strike", "strike")}
      <span class="tiptap-toolbar__sep" aria-hidden="true"></span>
      ${btn("H2", "Heading 2", "h2")}
      ${btn("H3", "Heading 3", "h3")}
      <span class="tiptap-toolbar__sep" aria-hidden="true"></span>
      ${btn("• List", "Bullet list", "bullet")}
      ${btn("1. List", "Numbered list", "ordered")}
      ${btn("❝", "Quote", "quote")}
      <span class="tiptap-toolbar__sep" aria-hidden="true"></span>
      ${btn("Link", "Add / edit link", "link")}
      ${btn("Unlink", "Remove link", "unlink")}
      ${btn("Image", "Insert image", "image")}
      <span class="tiptap-toolbar__sep" aria-hidden="true"></span>
      ${btn("↩", "Undo", "undo")}
      ${btn("↪", "Redo", "redo")}
    </div>
    <input type="file" accept="image/*" class="tiptap-image-input" hidden />
    <div class="tiptap-mount"></div>
  `;
  return {
    toolbar: host.querySelector(".tiptap-toolbar") as HTMLElement,
    mount: host.querySelector(".tiptap-mount") as HTMLElement,
  };
}

function syncToolbar(): void {
  if (!editor || !toolbarRoot) return;
  toolbarRoot.querySelectorAll<HTMLButtonElement>("[data-mark]").forEach((el) => {
    const mark = el.dataset.mark || "";
    el.classList.toggle("is-active", editor!.isActive(mark));
  });
  toolbarRoot.querySelectorAll<HTMLButtonElement>('[data-action="h2"]').forEach((el) => {
    el.classList.toggle("is-active", editor!.isActive("heading", { level: 2 }));
  });
  toolbarRoot.querySelectorAll<HTMLButtonElement>('[data-action="h3"]').forEach((el) => {
    el.classList.toggle("is-active", editor!.isActive("heading", { level: 3 }));
  });
  toolbarRoot.querySelectorAll<HTMLButtonElement>('[data-action="bullet"]').forEach((el) => {
    el.classList.toggle("is-active", editor!.isActive("bulletList"));
  });
  toolbarRoot.querySelectorAll<HTMLButtonElement>('[data-action="ordered"]').forEach((el) => {
    el.classList.toggle("is-active", editor!.isActive("orderedList"));
  });
  toolbarRoot.querySelectorAll<HTMLButtonElement>('[data-action="quote"]').forEach((el) => {
    el.classList.toggle("is-active", editor!.isActive("blockquote"));
  });
  toolbarRoot.querySelectorAll<HTMLButtonElement>('[data-action="link"]').forEach((el) => {
    el.classList.toggle("is-active", editor!.isActive("link"));
  });
}

function bindToolbar(host: HTMLElement): void {
  const fileInput = host.querySelector<HTMLInputElement>(".tiptap-image-input");
  toolbarRoot = host.querySelector(".tiptap-toolbar");

  toolbarRoot?.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
    if (!target || !editor) return;
    e.preventDefault();
    const action = target.dataset.action;

    switch (action) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "strike":
        editor.chain().focus().toggleStrike().run();
        break;
      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "bullet":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "ordered":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "quote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "link": {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Link URL", prev || "https://");
        if (url === null) break;
        if (!url.trim()) {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
          editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
        }
        break;
      }
      case "unlink":
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        break;
      case "image":
        fileInput?.click();
        break;
      case "undo":
        editor.chain().focus().undo().run();
        break;
      case "redo":
        editor.chain().focus().redo().run();
        break;
      default:
        break;
    }
    syncToolbar();
  });

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file || !editor) return;
    try {
      const src = await readImageAsDataUrl(file);
      editor.chain().focus().setImage({ src, alt: file.name }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not insert image");
    }
    fileInput.value = "";
  });
}

/** Lazy-loads TipTap and mounts a rich editor into `host`. */
export async function mountBlogEditor(host: HTMLElement, initialHtml: string): Promise<void> {
  destroyBlogEditor();

  const [
    { Editor },
    starterKitMod,
    imageMod,
    placeholderMod,
  ] = await Promise.all([
    import("@tiptap/core"),
    import("@tiptap/starter-kit"),
    import("@tiptap/extension-image"),
    import("@tiptap/extension-placeholder"),
  ]);

  const StarterKit = starterKitMod.default ?? starterKitMod.StarterKit;
  const Image = imageMod.default ?? imageMod.Image;
  const Placeholder = placeholderMod.default ?? placeholderMod.Placeholder;

  const { mount } = buildShell(host);
  bindToolbar(host);

  editor = new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        code: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: "blog-inline-image" },
      }),
      Placeholder.configure({
        placeholder: "Write your article… Use the toolbar for headings, lists, links, and images.",
      }),
    ],
    content: initialHtml || "<p></p>",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        spellcheck: "true",
      },
    },
    onSelectionUpdate: () => syncToolbar(),
    onTransaction: () => syncToolbar(),
  });

  syncToolbar();
}

export function getBlogEditorHtml(): string {
  if (!editor) return "";
  const html = editor.getHTML();
  return html === "<p></p>" ? "" : html;
}

export function destroyBlogEditor(): void {
  editor?.destroy();
  editor = null;
  toolbarRoot = null;
}
