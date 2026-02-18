/** Tech icon URLs from devicon CDN. Used by home hero and jobs filter. */
const DEVICON_CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
const DEVICON_ICONS: Record<string, string> = {
  JavaScript: "javascript",
  HTML: "html5",
  Python: "python",
  Java: "java",
  SQL: "mysql",
  "Node.js": "nodejs",
  TypeScript: "typescript",
  PHP: "php",
  "C++": "cplusplus",
  "React.js": "react",
  "C#": "csharp",
  Go: "go",
  C: "c",
  Rust: "rust",
  ".NET": "dot-net",
  Angular: "angular",
  Android: "android",
  AWS: "amazonwebservices",
  iOS: "apple",
  Ruby: "ruby",
};

const C_ICON_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#283593" d="M64 12c-28.7 0-52 23.3-52 52s23.3 52 52 52 52-23.3 52-52S92.7 12 64 12zm0 92c-22.1 0-40-17.9-40-40S41.9 24 64 24s40 17.9 40 40-17.9 40-40 40z"/></svg>',
  );

const AWS_ICON_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 154"><path fill="#FF9900" d="M72.4 153.2c-2.8 0-4.8-.6-6-1.9-1.2-1.3-1.8-3.2-1.8-5.8v-61.3H45.8c-2.8 0-4.8-.6-6-1.9-1.2-1.3-1.8-3.2-1.8-5.8v-9.3c0-2.4.6-4.3 1.8-5.8 1.2-1.4 3.2-2.1 6-2.1h18.8V58.5c0-8.4 2.4-14.8 7.1-19.3 4.8-4.5 11.5-6.7 20.2-6.7 2.8 0 5.2.2 7.1.6 1.9.4 3.8 1.1 5.6 1.9v19.2c-1.6-.8-3.3-1.5-5.1-2-1.8-.5-3.7-.7-5.8-.7-3.4 0-6 .9-7.8 2.6-1.8 1.7-2.6 4.2-2.6 7.5v11.8h26.5c2.9 0 4.9.6 6.2 1.9 1.3 1.3 1.9 3.2 1.9 5.8v9.1c0 2.6-.6 4.6-1.9 5.8-1.3 1.3-3.4 1.9-6.2 1.9H72.4z"/></svg>',
  );

export function getTechIconUrl(name: string): string | null {
  if (name === "C") return C_ICON_FALLBACK;
  if (name === "AWS") return AWS_ICON_FALLBACK;
  const icon = DEVICON_ICONS[name];
  if (!icon) return null;
  return `${DEVICON_CDN}/${icon}/${icon}-original.svg`;
}
