import {
  Card,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileTextIcon, UsersIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "後台管理 - PDF Template Hub" }],
  }),
});

const menuItems = [
  {
    to: "/dashboard/templates" as const,
    icon: FileTextIcon,
    title: "樣板維護",
    description: "管理 PDF 模板，新增、編輯與刪除",
  },
  {
    to: "/dashboard/users" as const,
    icon: UsersIcon,
    title: "使用者管理",
    description: "管理系統用戶，建立帳號與權限設定",
  },
];

function RouteComponent() {
  return (
    <Container py="10">
      <Heading size="3xl" mb="2">
        後台管理
      </Heading>
      <Text color="fg.muted" mb="8">
        PDF Template Hub 管理控制台
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        {menuItems.map((item) => (
          <ChakraLink asChild key={item.to} _hover={{ textDecoration: "none" }}>
            <Link to={item.to}>
              <Card.Root
                variant="outline"
                _hover={{ shadow: "md", borderColor: "blue.300" }}
                transition="all 0.2s"
                cursor="pointer"
                width={"100%"}
              >
                <Card.Body gap="3">
                  <item.icon size={28} />
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Description>{item.description}</Card.Description>
                </Card.Body>
              </Card.Root>
            </Link>
          </ChakraLink>
        ))}
      </SimpleGrid>
    </Container>
  );
}
