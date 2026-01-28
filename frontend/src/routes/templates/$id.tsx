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
import { fonts, plugins } from "@/config/pdfme";
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

  const [mode] = useState<Mode>(
    (localStorage.getItem("mode") as Mode) ?? "form",
  );

  const buildUi = useCallback(async (mode: Mode) => {
    if (!uiRef.current) return;
    try {
      let template: Template = {
        schemas: [{}],
        basePdf: {
          width: 210,
          height: 297,
          padding: [20, 10, 20, 10],
        },
      } as Template;
      // const templateIdFromQuery = searchParams.get("template");
      // searchParams.delete("template");
      // setSearchParams(searchParams, { replace: true });
      const templateFromLocal = localStorage.getItem("template");

      // if (templateIdFromQuery) {
      //   const templateJson = await getTemplateById(templateIdFromQuery);
      //   checkTemplate(templateJson);
      //   template = templateJson;

      //   if (!templateFromLocal) {
      //     localStorage.setItem("template", JSON.stringify(templateJson));
      //   }
      // } else if (templateFromLocal) {
      //   const templateJson = JSON.parse(templateFromLocal) as Template;
      //   checkTemplate(templateJson);
      //   template = templateJson;
      // }
      if (templateFromLocal) {
        const templateJson = JSON.parse(templateFromLocal) as Template;
        checkTemplate(templateJson);
        template = templateJson;
      }
      let inputs = getInputFromTemplate(template);
      console.log(inputs);
      const inputsString = localStorage.getItem("inputs");
      if (inputsString) {
        const inputsJson = JSON.parse(inputsString);
        inputs = inputsJson;
      }

      console.log(inputs);
      ui.current = new (mode === "form" ? Form : Viewer)({
        domContainer: uiRef.current,
        template,
        inputs,
        options: {
          font: fonts,
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
    } catch {
      localStorage.removeItem("inputs");
      localStorage.removeItem("template");
    }
  }, []);

  const onResetInputs = () => {
    localStorage.removeItem("inputs");
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

  useEffect(() => {
    if (ui.current && templateData) {
      const templateJSON = JSON.parse(templateData.schema);
      ui.current.updateTemplate(templateJSON);
      ui.current.setInputs(getInputFromTemplate(templateJSON));
    }
  }, [templateData]);

  const generatePDF = async (currentRef: Designer | Form | Viewer | null) => {
    if (!currentRef) return;
    const template = currentRef.getTemplate();
    const options = currentRef.getOptions();
    const inputs =
      typeof (currentRef as Viewer | Form).getInputs === "function"
        ? (currentRef as Viewer | Form).getInputs()
        : getInputFromTemplate(template);
    const font = fonts;

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
    const font = fonts;

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

      // const blob = new Blob([pdf.buffer], { type: "application/pdf" });
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
