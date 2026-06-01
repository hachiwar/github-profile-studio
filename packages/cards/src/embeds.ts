import type { CardRequest } from "@gps/core";

export type CardEmbeds = {
  url: string;
  markdown: string;
  html: string;
  iframe: string;
  ogImage: string;
};

export function buildCardEmbeds(request: Pick<CardRequest, "type" | "user" | "locale" | "theme">, appUrl: string): CardEmbeds {
  const url = `${appUrl.replace(/\/$/, "")}/api/cards/${encodeURIComponent(request.type)}?user=${encodeURIComponent(request.user)}&theme=${encodeURIComponent(request.theme)}&locale=${encodeURIComponent(request.locale)}&format=svg`;
  return {
    url,
    markdown: `![${request.type}](${url})`,
    html: `<img src="${url}" alt="${request.type}" />`,
    iframe: `<iframe src="${url}" title="${request.type}" loading="lazy"></iframe>`,
    ogImage: url
  };
}

