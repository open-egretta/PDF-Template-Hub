import { type Font, getDefaultFont } from "@pdfme/common";
import {
  multiVariableText,
  text,
  barcodes,
  image,
  svg,
  line,
  table,
  rectangle,
  ellipse,
  dateTime,
  date,
  time,
  select,
  checkbox,
  radioGroup,
} from "@pdfme/schemas";
import apiService from "@/services/api";

// 靜態字型
export const builtinFonts: Font = {
  ...getDefaultFont(),
  LINESeed: {
    data: new URL("../fonts/LINESeedTW_TTF_Rg.ttf", import.meta.url).href,
    fallback: false,
    subset: false,
  },
  ...(import.meta.env.VITE_NEED_Kai === "true" && {
    Kai: {
      data: new URL("../fonts/TW-Kai-98_1.ttf", import.meta.url).href,
      fallback: false,
      subset: false,
    },
  }),
  MantouSans: {
    data: new URL("../fonts/MantouSans-Regular.ttf", import.meta.url).href,
    fallback: false,
    subset: false,
  },
  ChenYuluoyan: {
    data: new URL("../fonts/ChenYuluoyan-2.0-Thin.ttf", import.meta.url).href,
    fallback: false,
    subset: false,
  },
  Iansui: {
    data: new URL("../fonts/Iansui-Regular.ttf", import.meta.url).href,
    fallback: false,
    subset: false,
  },
  Cubic11: {
    data: new URL("../fonts/Cubic_11.ttf", import.meta.url).href,
    fallback: false,
    subset: false,
  },
};

export const fonts: Font = builtinFonts;

interface FontRecord {
  id: number;
  name: string;
  is_builtin: boolean;
  download_url: string | null;
}

let fontCachePromise: Promise<Font> | null = null;

export function loadAllFonts(): Promise<Font> {
  if (!fontCachePromise) {
    fontCachePromise = _doLoadAllFonts();
  }
  return fontCachePromise;
}

export function invalidateFontCache() {
  fontCachePromise = null;
}

async function _doLoadAllFonts(): Promise<Font> {
  try {
    const res = await apiService.get<{ data: FontRecord[] }>("/fonts");
    const customFonts: Font = {};

    const fetches = res.data
      .filter((f) => !f.is_builtin && f.download_url)
      .map(async (f) => {
        const resp = await fetch(f.download_url!, { cache: "force-cache" });
        if (!resp.ok) return;
        const buffer = await resp.arrayBuffer();
        customFonts[f.name] = {
          data: buffer,
          fallback: false,
          subset: false,
        };
      });

    await Promise.all(fetches);

    return { ...builtinFonts, ...customFonts };
  } catch {
    fontCachePromise = null;
    return { ...builtinFonts };
  }
}

export const plugins = {
  Text: text,
  "Multi-Variable Text": multiVariableText,
  Table: table,
  Line: line,
  Rectangle: rectangle,
  Ellipse: ellipse,
  Image: image,
  SVG: svg,
  QR: barcodes.qrcode,
  DateTime: dateTime,
  Date: date,
  Time: time,
  Select: select,
  Checkbox: checkbox,
  RadioGroup: radioGroup,
  EAN13: barcodes.ean13,
  Code128: barcodes.code128,
};
