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
import { fonts, plugins } from "@/config/pdfme";
import { toaster } from "@/components/ui/toaster";

export const Route = createFileRoute("/dashboard/templates/create")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "新增樣板 - PDF Template Hub",
      },
    ],
  }),
});

function RouteComponent() {
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

  const saveTemplate = () => {
    if (designer.current) {
      const template = designer.current.getTemplate();
      console.log("Saved template:", template);
      console.log("Saved template:", JSON.stringify(template));
      apiService
        .post("/templates", {
          name: name,
          schema: JSON.stringify(template),
          description: description,
          thumbnail: "",
          view: "PUBLIC",
          is_active: true,
        })
        .then(() => {
          toaster.create({
            title: "新增成功",
            type: "success",
          });
        })
        .catch((error) => {
          //
          toaster.create({
            title: "錯誤",
            description: error.message || "發生錯誤",
            type: "error",
          });
        })
        .finally(() => {
          //
        });
      // Here you can add your logic to save the template, e.g., send it to a server
    }
  };

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (designerRef.current) {
      if (!designerRef.current) return;
      try {
        //
        const template: Template = {
          schemas: [[]],
          basePdf: {
            width: 210,
            height: 297,
            padding: [10, 5, 10, 5],
            staticSchema: [],
          },
        };

        designer.current = new Designer({
          domContainer: designerRef.current,
          template: template,
          options: {
            font: fonts,
            sidebarOpen: true,
            maxZoom: 250,
          },
          plugins,
        });
      } catch (error) {
        console.error(error);
      }
    }

    return () => {
      designer.current?.destroy();
    };
  }, [designerRef]);
  return (
    <Container>
      <Button onClick={toggleEditingStaticSchemas}>
        {editingStaticSchemas ? "結束編輯" : "編輯靜態 Schema"}
      </Button>
      <Button
        colorPalette={"blue"}
        onClick={() => {
          saveTemplate();
        }}
      >
        Save
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
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>樣板簡介</Field.Label>
              <Textarea
                placeholder="請輸入樣板簡介"
                value={description}
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
