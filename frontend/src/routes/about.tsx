import { Container, Box, Text, SimpleGrid } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { TechStackCard, type TechStackItem } from "../components/TechStackCard";
import { CreditCard, type CreditItem } from "../components/CreditCard";
import { FontCard, type FontItem } from "../components/FontCard";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "關於本服務 - PDF Template Hub",
      },
    ],
  }),
});

const techStack: TechStackItem[] = [
  {
    category: "前端",
    title: "React",
    license: "MIT",
    url: "https://react.dev",
  },
  {
    category: "後端",
    title: "Express",
    license: "MIT",
    url: "https://expressjs.com/",
  },
  {
    category: "資料庫",
    title: "PostgreSQL",
    license: "PostgreSQL",
    url: "https://postgresql.org",
  },
];

const fonts: FontItem[] = [
  {
    name: "全字庫楷體字型檔",
    desc: "",
    url: "https://data.gov.tw/dataset/5961",
  },
  {
    name: "饅頭黑體 / MantouSans",
    desc: "基於字型 デラゴシック (Dela Gothic One) ，修改而成的臺灣繁體中文補充版本。",
    url: "https://github.com/mant0u0/MantouSans",
  },
  {
    name: "LINE Seed",
    desc: "",
    url: "https://seed.line.me/index_tw.html",
  },
  {
    name: "辰宇落雁體 / chenyuluoyan",
    desc: "",
    url: "https://github.com/Chenyu-otf/chenyuluoyan_thin",
  },
  {
    name: "芫荽 / iansui",
    desc: "",
    url: "https://github.com/ButTaiwan/iansui",
  },
  {
    name: "Cubic-11",
    desc: "免費開源的 11×11 中文點陣體",
    url: "https://github.com/ACh-K/Cubic-11",
  },
];

const credits: CreditItem[] = [
  {
    name: "axios",
    desc: "Promise based HTTP client for the browser and node.js",
    url: "https://axios-http.com",
  },
  {
    name: "pdfme",
    desc: "TypeScript base PDF generator and React base UI. Open source, developed by the community, and completely free to use under the MIT license!",
    url: "https://pdfme.com",
  },
  {
    name: "chakra-ui",
    desc: "Responsive and accessible React UI components built with React and Emotion",
    url: "https://chakra-ui.com",
  },
  {
    name: "date-fns",
    desc: "Modern JavaScript date utility library",
    url: "https://date-fns.org",
  },
  {
    name: "lucide-react",
    desc: "A Lucide icon library package for React applications.",
    url: "https://lucide.dev",
  },
  {
    name: "TanStack Query",
    desc: "Hooks for managing, caching and syncing asynchronous and remote data in React",
    url: "https://tanstack.com/query",
  },
  {
    name: "TanStack Router",
    desc: "Modern and scalable routing for React applications",
    url: "https://tanstack.com/router/latest",
  },
  {
    name: "node-postgres",
    desc: "PostgreSQL client - pure javascript & libpq with the same API",
    url: "https://node-postgres.com",
  },
];

function RouteComponent() {
  return (
    <Container pt={4} mb={16}>
      <Box textAlign={"center"} mt={4} mb={8}>
        <Text
          as={"h2"}
          fontSize={"4xl"}
          mb={4}
          position="relative"
          display="inline-block"
          _after={{
            content: '""',
            position: "absolute",
            bottom: "-0.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "3px",
            bg: "#1a4d2e",
          }}
        >
          核心工具
        </Text>
        <Text
          maxW="700px"
          mx="auto"
          mt={4}
          fontSize="lg"
          color="#6b625a"
        ></Text>
      </Box>
      <SimpleGrid columns={[1, 1, 2, 3]} gap={10}>
        {techStack.map((tech, index) => (
          <TechStackCard key={index} tech={tech} />
        ))}
      </SimpleGrid>

      {/*  */}
      <Box textAlign={"center"} mt={4} mb={8}>
        <Text
          as={"h2"}
          fontSize={"4xl"}
          mb={4}
          position="relative"
          display="inline-block"
          _after={{
            content: '""',
            position: "absolute",
            bottom: "-0.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "3px",
            bg: "#1a4d2e",
          }}
        >
          開發套件
        </Text>
        <Text maxW="700px" mx="auto" mt={4} fontSize="lg" color="#6b625a">
          感謝這些優秀的開源專案，讓本服務得以實現，深深感謝開源社群的無私貢獻。
        </Text>
      </Box>
      <SimpleGrid columns={[1, 2, 3, 4]} gap={6}>
        {credits.map((credit, index) => (
          <CreditCard key={index} credit={credit} />
        ))}
      </SimpleGrid>

      {/* 字體 */}
      <Box textAlign={"center"} mt={4} mb={8}>
        <Text
          as={"h2"}
          fontSize={"4xl"}
          mb={4}
          position="relative"
          display="inline-block"
          _after={{
            content: '""',
            position: "absolute",
            bottom: "-0.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "3px",
            bg: "#1a4d2e",
          }}
        >
          字體
        </Text>
        <Text maxW="700px" mx="auto" mt={4} fontSize="lg" color="#6b625a">
          本服務採用以下開源字體，皆遵循 SIL Open Font License 授權。
        </Text>
      </Box>
      <SimpleGrid columns={[1, 2, 3, 4]} gap={6}>
        {fonts.map((font, index) => (
          <FontCard key={index} font={font} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
