import "server-only";
import { Resvg } from "@resvg/resvg-js";
import type { CardRequest } from "@gps/core";
import { renderCardSvg } from "./index";

export function renderCardPng(request: CardRequest): Uint8Array {
  const svg = renderCardSvg(request);
  return new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 640
    }
  })
    .render()
    .asPng();
}

