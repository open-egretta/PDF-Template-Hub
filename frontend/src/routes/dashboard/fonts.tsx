import apiService from "@/services/api";
import { toaster } from "@/components/ui/toaster";
import {
  Badge,
  Box,
  Button,
  Container,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  Table,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PiPlus } from "react-icons/pi";
import { Trash2Icon, UploadIcon } from "lucide-react";
import { invalidateFontCache } from "@/config/pdfme";

export const Route = createFileRoute("/dashboard/fonts")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "字型管理 - PDF Template Hub" }],
  }),
});

interface FontRecord {
  id: number;
  name: string;
  file_name: string;
  original_name: string;
  file_size: number;
  is_builtin: boolean;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RouteComponent() {
  const [showUpload, setShowUpload] = useState(false);
  const [fontName, setFontName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const query = useQuery<FontRecord[]>({
    queryKey: ["admin/fonts"],
    queryFn: () => apiService.get("/fonts").then((res) => res.data),
  });

  const resetForm = () => {
    setFontName("");
    setSelectedFile(null);
    setShowUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!fontName.trim()) {
      toaster.create({ title: "請輸入字型名稱", type: "error" });
      return;
    }
    if (!selectedFile) {
      toaster.create({ title: "請選擇字型檔案", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", fontName.trim());
      formData.append("file", selectedFile);

      await apiService.post("/fonts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      invalidateFontCache();
      toaster.create({ title: "字型上傳成功", type: "success" });
      query.refetch();
      resetForm();
    } catch (error: any) {
      toaster.create({
        title: "上傳失敗",
        description: error.message || "發生錯誤",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (font: FontRecord) => {
    if (!confirm(`確定要刪除字型「${font.name}」嗎？`)) return;

    apiService
      .delete(`/fonts/${font.id}`)
      .then(() => {
        invalidateFontCache();
        toaster.create({
          title: "刪除成功",
          description: `已刪除字型: ${font.name}`,
          type: "success",
        });
        query.refetch();
      })
      .catch((error) => {
        toaster.create({
          title: "刪除失敗",
          description: error.message || "發生錯誤",
          type: "error",
        });
      });
  };

  return (
    <Container py="6">
      <Flex justify="space-between" align="center" mb="6">
        <Heading size="2xl">字型管理</Heading>
        {!showUpload ? (
          <Button colorPalette="blue" onClick={() => setShowUpload(true)}>
            <PiPlus />
            上傳字型
          </Button>
        ) : (
          <Button variant="ghost" onClick={resetForm}>
            取消
          </Button>
        )}
      </Flex>

      {/* Upload Form */}
      {showUpload && (
        <Box mb="8" p="6" borderWidth="1px" borderRadius="md">
          <Heading size="lg" mb="4">
            上傳新字型
          </Heading>
          <Flex gap="4" direction="column">
            <Field.Root>
              <Field.Label>字型名稱</Field.Label>
              <Input
                placeholder="例如：NotoSansTC"
                value={fontName}
                onChange={(e) => setFontName(e.target.value)}
              />
              <Field.HelperText>
                此名稱將顯示在模板編輯器的字型選單中
              </Field.HelperText>
            </Field.Root>
            <Field.Root>
              <Field.Label>字型檔案</Field.Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Field.HelperText>
                支援 .ttf, .otf, .woff, .woff2 格式，最大 50MB
              </Field.HelperText>
            </Field.Root>
            {selectedFile && (
              <Text fontSize="sm" color="fg.muted">
                已選擇: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </Text>
            )}
            <Flex gap="2">
              <Button
                colorPalette="blue"
                onClick={handleUpload}
                disabled={uploading}
              >
                <UploadIcon />
                {uploading ? "上傳中..." : "上傳"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                取消
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Font List Table */}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>字型名稱</Table.ColumnHeader>
            <Table.ColumnHeader>原始檔名</Table.ColumnHeader>
            <Table.ColumnHeader>檔案大小</Table.ColumnHeader>
            <Table.ColumnHeader>類型</Table.ColumnHeader>
            <Table.ColumnHeader>建立時間</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {query.data?.map((font) => (
            <Table.Row key={font.id}>
              <Table.Cell>{font.id}</Table.Cell>
              <Table.Cell fontWeight="medium">{font.name}</Table.Cell>
              <Table.Cell>{font.original_name}</Table.Cell>
              <Table.Cell>{formatFileSize(font.file_size)}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={font.is_builtin ? "blue" : "green"}>
                  {font.is_builtin ? "內建" : "自訂"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {new Date(font.created_at).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell textAlign="end">
                {!font.is_builtin && (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleDelete(font)}
                  >
                    <Trash2Icon />
                  </IconButton>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {query.isLoading && (
        <Text textAlign="center" py="8" color="fg.muted">
          載入中...
        </Text>
      )}

      {query.data?.length === 0 && (
        <Text textAlign="center" py="8" color="fg.muted">
          尚無字型資料
        </Text>
      )}
    </Container>
  );
}
