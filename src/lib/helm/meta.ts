export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · HELM` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · HELM` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
