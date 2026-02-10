import { useRef, useState, useEffect, useCallback } from "react";
import apiService from "@/services/api";
import { createFileRoute, Link } from "@tanstack/react-router";

import {
  type Template,
  checkTemplate,
  getInputFromTemplate,
} from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { Designer, Form, Viewer } from "@pdfme/ui";
import {
  Button,
  Flex,
  Spacer,
  Link as ChakraLink,
  Container,
} from "@chakra-ui/react";
import { PiFilePdf } from "react-icons/pi";
import { ImageDownIcon } from "lucide-react";
import { loadAllFonts, plugins } from "@/config/pdfme";
import type { Font } from "@pdfme/common";
import { pdf2img } from "@pdfme/converter";
import { toaster } from "@/components/ui/toaster";

type Mode = "form" | "viewer";

export const Route = createFileRoute("/templates/$id")({
  loader: async ({ params: { id } }) => {
    console.log(id);
    const templateData = await apiService
      .get(`/templates/${id}`)
      .then((res) => {
        console.log(res);
        const { data } = res;
        return data;
      });
    return templateData;
  },
  component: RouteComponent,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData.name || ""} - PDF Template Hub`,
      },
    ],
  }),
});

function RouteComponent() {
  const templateData = Route.useLoaderData();
  const uiRef = useRef<HTMLDivElement | null>(null);
  const ui = useRef<Form | Viewer | null>(null);
  const loadedFonts = useRef<Font | null>(null);

  const [mode] = useState<Mode>(
    (localStorage.getItem("mode") as Mode) ?? "form",
  );

  const buildUi = useCallback(
    async (mode: Mode) => {
      if (!uiRef.current) return;
      try {
        const allFonts = await loadAllFonts();
        loadedFonts.current = allFonts;

        let template: Template = {
          schemas: [{}],
          basePdf: {
            width: 210,
            height: 297,
            padding: [20, 10, 20, 10],
          },
        } as Template;

        // 優先使用 API 載入的 templateData
        if (templateData?.schema) {
          const templateJson = JSON.parse(templateData.schema) as Template;
          checkTemplate(templateJson);
          template = templateJson;
        }

        const inputs = getInputFromTemplate(template);

        ui.current = new (mode === "form" ? Form : Viewer)({
          domContainer: uiRef.current,
          template,
          inputs,
          options: {
            font: allFonts,
            lang: "en",
            labels: { "signature.clear": "Clear" },
            theme: {
              token: {
                colorPrimary: "#25c2a0",
              },
            },
          },
          plugins,
        });
      } catch (e) {
        console.error("Failed to build UI:", e);
        toaster.error({
          title: "載入模板失敗",
          description: String(e),
        });
      }
    },
    [templateData],
  );

  const onResetInputs = () => {
    if (ui.current) {
      const template = ui.current.getTemplate();
      ui.current.setInputs(getInputFromTemplate(template));
    }
  };

  useEffect(() => {
    buildUi(mode);
    return () => {
      if (ui.current) {
        ui.current.destroy();
      }
    };
  }, [mode, uiRef, buildUi]);

  const generatePDF = async (currentRef: Designer | Form | Viewer | null) => {
    if (!currentRef) return;
    const template = currentRef.getTemplate();
    const options = currentRef.getOptions();
    const inputs =
      typeof (currentRef as Viewer | Form).getInputs === "function"
        ? (currentRef as Viewer | Form).getInputs()
        : getInputFromTemplate(template);
    const font = loadedFonts.current || (await loadAllFonts());

    try {
      const pdf = await generate({
        template,
        inputs,
        options: {
          font,
          lang: options.lang,
          title: templateData ? templateData.name : "Generated PDF",
        },
        plugins,
      });

      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      window.open(URL.createObjectURL(blob));
    } catch (e) {
      toaster.error({
        title: "錯誤",
        description: e,
      });
      throw e;
    }
  };

  const generateImage = async (currentRef: Designer | Form | Viewer | null) => {
    if (!currentRef) return;
    const template = currentRef.getTemplate();
    const options = currentRef.getOptions();
    const inputs =
      typeof (currentRef as Viewer | Form).getInputs === "function"
        ? (currentRef as Viewer | Form).getInputs()
        : getInputFromTemplate(template);
    const font = loadedFonts.current || (await loadAllFonts());

    try {
      const pdf = await generate({
        template,
        inputs,
        options: {
          font,
          lang: options.lang,
          title: templateData ? templateData.name : "Generated PDF",
        },
        plugins,
      });

      const images = await pdf2img(pdf.buffer, {
        scale: 2,
        imageType: "jpeg",
        range: { end: 1 },
      });
      const blob = new Blob([images[0]], { type: "image/jpeg" });
      window.open(URL.createObjectURL(blob));
    } catch (e) {
      toaster.error({
        title: "錯誤",
        description: e,
      });
      throw e;
    }
  };

  return (
    <>
      <Container>
        <Flex gap={2}>
          <ChakraLink asChild variant={"underline"}>
            <Link to="/templates">樣板主頁</Link>
          </ChakraLink>
          <Spacer />
          <Button onClick={onResetInputs}>重置輸入</Button>
          <Button
            colorPalette={"green"}
            onClick={async () => {
              await generateImage(ui.current);
            }}
          >
            <ImageDownIcon /> 產生圖片
          </Button>
          <Button
            colorPalette={"green"}
            onClick={async () => {
              await generatePDF(ui.current);
            }}
          >
            <PiFilePdf /> 產生PDF
          </Button>
        </Flex>
      </Container>

      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div ref={uiRef} className="flex-1 w-full" />
      </div>
    </>
  );
}
