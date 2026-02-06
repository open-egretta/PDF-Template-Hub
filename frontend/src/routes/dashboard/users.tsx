import apiService from "@/services/api";
import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  Container,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  Table,
  Badge,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PiPlus } from "react-icons/pi";
import { Trash2Icon, PencilIcon, XIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard/users")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "使用者管理 - PDF Template Hub" }],
  }),
});

interface User {
  id: number;
  email: string;
  username: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

type FormMode = "list" | "create" | "edit";

const roleCollection = createListCollection({
  items: [
    { label: "一般用戶", value: "user" },
    { label: "管理員", value: "admin" },
  ],
});

function RouteComponent() {
  const [mode, setMode] = useState<FormMode>("list");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string[]>(["user"]);

  const query = useQuery<User[]>({
    queryKey: ["admin/users"],
    queryFn: () => apiService.get("/users").then((res) => res.users),
  });

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setRole(["user"]);
    setEditingId(null);
    setMode("list");
  };

  const openCreate = () => {
    resetForm();
    setMode("create");
  };

  const openEdit = (user: User) => {
    setEmail(user.email);
    setUsername(user.username);
    setRole([user.role]);
    setPassword("");
    setEditingId(user.id);
    setMode("edit");
  };

  const handleCreate = () => {
    apiService
      .post("/users", { email, password, username, role: role[0] })
      .then(() => {
        toaster.create({ title: "建立成功", type: "success" });
        query.refetch();
        resetForm();
      })
      .catch((error) => {
        toaster.create({
          title: "建立失敗",
          description: error.message || "發生錯誤",
          type: "error",
        });
      });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    apiService
      .put(`/users/${editingId}`, { email, username })
      .then(() => {
        toaster.create({ title: "更新成功", type: "success" });
        query.refetch();
        resetForm();
      })
      .catch((error) => {
        toaster.create({
          title: "更新失敗",
          description: error.message || "發生錯誤",
          type: "error",
        });
      });
  };

  const handleDelete = (id: number, name: string) => {
    apiService
      .delete(`/users/${id}`)
      .then(() => {
        toaster.create({
          title: "刪除成功",
          description: `已刪除用戶: ${name}`,
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
        <Heading size="2xl">使用者管理</Heading>
        {mode === "list" ? (
          <Button colorPalette="blue" onClick={openCreate}>
            <PiPlus />
            新增用戶
          </Button>
        ) : (
          <Button variant="ghost" onClick={resetForm}>
            <XIcon />
            返回列表
          </Button>
        )}
      </Flex>

      {/* Create / Edit Form */}
      {mode !== "list" && (
        <Box mb="8" p="6" borderWidth="1px" borderRadius="md">
          <Heading size="lg" mb="4">
            {mode === "create" ? "新增用戶" : "編輯用戶"}
          </Heading>
          <Flex gap="4" direction="column">
            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>用戶名稱</Field.Label>
              <Input
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field.Root>
            {mode === "create" && (
              <>
                <Field.Root>
                  <Field.Label>密碼</Field.Label>
                  <Input
                    type="password"
                    placeholder="至少 8 位，需包含數字"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>角色</Field.Label>
                  <Select.Root
                    collection={roleCollection}
                    value={role}
                    onValueChange={(e) => setRole(e.value)}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="選擇角色" />
                    </Select.Trigger>
                    <Select.Content>
                      {roleCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Field.Root>
              </>
            )}
            <Flex gap="2">
              <Button
                colorPalette="blue"
                onClick={mode === "create" ? handleCreate : handleUpdate}
              >
                {mode === "create" ? "建立" : "儲存"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                取消
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* User List Table */}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>用戶名稱</Table.ColumnHeader>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>角色</Table.ColumnHeader>
            <Table.ColumnHeader>狀態</Table.ColumnHeader>
            <Table.ColumnHeader>建立時間</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {query.data?.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.id}</Table.Cell>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={user.role === "admin" ? "purple" : "gray"}
                >
                  {user.role === "admin" ? "管理員" : "用戶"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={user.is_active ? "green" : "red"}
                >
                  {user.is_active ? "啟用" : "停用"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {new Date(user.created_at).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell textAlign="end">
                <Flex gap="1" justify="flex-end">
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(user)}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleDelete(user.id, user.username)}
                  >
                    <Trash2Icon />
                  </IconButton>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Container>
  );
}
