import { generate } from '@pdfme/generator';
import { getInputFromTemplate, getDefaultFont, checkTemplate } from '@pdfme/common';
import { pdf2img } from '@pdfme/converter';
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
import { transaction, getMany } from '../db/helpers.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lineFontPath = path.join(__dirname, '../fonts/LINESeedTW_TTF_Rg.ttf');
const kaiFontPath = path.join(__dirname, '../fonts/TW-Kai-98_1.ttf');
const mantouFontPath = path.join(__dirname, '../fonts/MantouSans-Regular.ttf');
const chenYuluoyanFontPath = path.join(__dirname, '../fonts/ChenYuluoyan-2.0-Thin.ttf');
const iansuiFontPath = path.join(__dirname, '../fonts/Iansui-Regular.ttf');
const cubic11FontPath = path.join(__dirname, '../fonts/Cubic_11.ttf');

const builtinFont = {
  ...getDefaultFont(),
  LINESeed: {
    data: fs.readFileSync(lineFontPath),
    fallback: false,
  },
  Kai: {
    data: fs.readFileSync(kaiFontPath),
    fallback: false,
  },
  MantouSans: {
    data: fs.readFileSync(mantouFontPath),
    fallback: false,
  },
  ChenYuluoyan: {
    data: fs.readFileSync(chenYuluoyanFontPath),
    fallback: false,
  },
  Iansui: {
    data: fs.readFileSync(iansuiFontPath),
    fallback: false,
  },
  Cubic11: {
    data: fs.readFileSync(cubic11FontPath),
    fallback: false,
  },
};

// 自訂字型快取
const customFontCache = new Map();
const uploadDir = path.join(__dirname, '../../uploads/fonts');

async function getAllFonts() {
  const font = { ...builtinFont };

  try {
    const customFonts = await getMany('SELECT * FROM fonts WHERE is_builtin = false');
    for (const f of customFonts) {
      if (!customFontCache.has(f.file_name)) {
        const filePath = path.join(uploadDir, f.file_name);
        if (fs.existsSync(filePath)) {
          customFontCache.set(f.file_name, fs.readFileSync(filePath));
        }
      }
      const data = customFontCache.get(f.file_name);
      if (data) {
        font[f.name] = { data, fallback: false };
      }
    }
  } catch {
    // DB 尚未初始化時忽略錯誤，僅使用內建字型
  }

  return font;
}

// 清除快取（上傳/刪除字型時呼叫）
export function clearFontCache() {
  customFontCache.clear();
}

const plugins = {
  multiVariableText,
  text,
  qrcode: barcodes.qrcode,
  japanpost: barcodes.japanpost,
  ean13: barcodes.ean13,
  code128: barcodes.code128,
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
};

async function pdfToThumbnail(pdfBuffer) {
  const images = await pdf2img(pdfBuffer, {
    imageType: 'jpeg',
    range: { end: 1 },
  });
  return `data:image/jpeg;base64,${Buffer.from(images[0]).toString('base64')}`;
}

class TemplateService {
  async create({ name, schema, description, view, is_active, created_by }) {
    const templateJson = JSON.parse(schema);

    checkTemplate(templateJson);

    const font = await getAllFonts();

    const pdf = await generate({
      template: templateJson,
      inputs: getInputFromTemplate(templateJson),
      options: { font },
      plugins,
    });

    const thumbnailBase64 = await pdfToThumbnail(pdf.buffer);

    let result;
    await transaction(async (client) => {
      const queryResult = await client.query(
        `INSERT INTO templates (name, schema, description, thumbnail, view, is_active, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, schema, description, thumbnailBase64, view, is_active, created_by]
      );
      result = queryResult.rows[0];
    });

    return result;
  }

  async update(id, { name, schema, description, view, is_active }) {
    const templateJson = JSON.parse(schema);

    checkTemplate(templateJson);

    const font = await getAllFonts();

    const pdf = await generate({
      template: templateJson,
      inputs: getInputFromTemplate(templateJson),
      options: { font },
      plugins,
    });

    const thumbnailBase64 = await pdfToThumbnail(pdf.buffer);

    let result;
    await transaction(async (client) => {
      const queryResult = await client.query(
        `UPDATE templates SET name = $1, schema = $2, description = $3, thumbnail = $4, view = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *`,
        [name, schema, description, thumbnailBase64, view, is_active, id]
      );
      result = queryResult.rows[0];
    });

    return result;
  }
}

export default new TemplateService();
