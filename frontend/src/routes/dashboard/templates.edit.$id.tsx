import {
  Button,
  Container,
  Field,
  Flex,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { cloneDeep, isBlankPdf, type Template } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import apiService from "@/services/api";
import { toaster } from "@/components/ui/toaster";
import { loadAllFonts, plugins } from "@/config/pdfme";

export const Route = createFileRoute("/dashboard/templates/edit/$id")({
  loader: async ({ params: { id } }) => {
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
        title: `編輯 ${loaderData.name || ""} - PDF Template Hub`,
      },
    ],
  }),
});

function RouteComponent() {
  const templateData = Route.useLoaderData();

  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);

  const [editingStaticSchemas, setEditingStaticSchemas] = useState(false);
  const [originalTemplate, setOriginalTemplate] = useState<Template | null>(
    null,
  );
  const toggleEditingStaticSchemas = () => {
    if (!designer.current) return;

    if (!editingStaticSchemas) {
      const currentTemplate = cloneDeep(designer.current.getTemplate());
      if (!isBlankPdf(currentTemplate.basePdf)) {
        return;
      }

      setOriginalTemplate(currentTemplate);

      const { width, height } = currentTemplate.basePdf;
      const staticSchema = currentTemplate.basePdf.staticSchema || [];
      designer.current.updateTemplate({
        ...currentTemplate,
        schemas: [staticSchema],
        basePdf: { width, height, padding: [0, 0, 0, 0] },
      });

      setEditingStaticSchemas(true);
    } else {
      const editedTemplate = designer.current.getTemplate();
      if (!originalTemplate) return;
      const merged = cloneDeep(originalTemplate);
      if (!isBlankPdf(merged.basePdf)) {
        // toast.error("Invalid basePdf format");
        return;
      }

      merged.basePdf.staticSchema = editedTemplate.schemas[0];
      designer.current.updateTemplate(merged);

      setOriginalTemplate(null);
      setEditingStaticSchemas(false);
    }
  };

  const updateTemplate = () => {
    if (designer.current) {
      const template = designer.current.getTemplate();
      console.log("Saved template:", template);
      console.log("Saved template:", JSON.stringify(template));
      apiService
        .put("/templates/" + templateData.id, {
          name: name,
          schema: JSON.stringify(template),
          description: description,
          thumbnail: "",
          view: "PUBLIC",
          is_active: true,
        })
        .then(() => {
          toaster.create({
            title: "更新成功",
            type: "success",
          });
        });
      // Here you can add your logic to save the template, e.g., send it to a server
    }
  };

  useEffect(() => {
    if (!designerRef.current) return;

    let destroyed = false;

    const init = async () => {
      try {
        const allFonts = await loadAllFonts();

        if (destroyed || !designerRef.current) return;

        // 如果有 templateData，直接使用它作為初始 template
        let template: Template = {
          schemas: [[]],
          basePdf: {
            width: 210,
            height: 297,
            padding: [10, 5, 10, 5],
            staticSchema: [],
          },
        };

        if (templateData?.schema) {
          template = JSON.parse(templateData.schema);
        }

        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: {
            font: allFonts,
            sidebarOpen: true,
            maxZoom: 250,
          },
          plugins,
        });
      } catch (error) {
        console.error(error);
      }
    };

    init();

    return () => {
      destroyed = true;
      designer.current?.destroy();
    };
  }, [designerRef, templateData]);

  const [name, setName] = useState(templateData.name || "");
  const [description, setDescription] = useState(
    templateData.description || "",
  );
  return (
    <Container>
      <Button onClick={toggleEditingStaticSchemas}>
        {editingStaticSchemas ? "結束編輯" : "編輯靜態 Schema"}
      </Button>
      <Button
        colorPalette={"blue"}
        onClick={() => {
          updateTemplate();
        }}
      >
        Update
      </Button>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div>
          <Flex gap={2} direction={"column"}>
            <Field.Root>
              <Field.Label>樣板名稱</Field.Label>
              <Input
                placeholder="請輸入樣板名稱"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>樣板名稱</Field.Label>
              <Textarea
                placeholder="請輸入樣板簡介"
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field.Root>
          </Flex>
        </div>
        <div ref={designerRef} className="flex-1 w-full"></div>
      </div>
    </Container>
  );
}
