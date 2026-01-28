import { Box, Text, Heading, Link, Badge, Flex } from "@chakra-ui/react";

export interface FontItem {
  name: string;
  desc: string;
  url: string;
}

interface FontCardProps {
  font: FontItem;
}

export function FontCard({ font }: FontCardProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderRadius="md"
      p={6}
      position="relative"
    >
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Heading as="h4" size="sm" color={"#2a2520"}>
          {font.name}
        </Heading>
        <Badge
          fontFamily="mono"
          variant="subtle"
          bg={"#f5f1e8"}
          color={"#6b625a"}
          px={2}
          py={0.5}
          borderRadius="4px"
          textTransform="none"
          fontSize="xs"
        >
          OFL
        </Badge>
      </Flex>

      <Text fontSize="sm" color="#6b625a" mb={3}>
        {font.desc}
      </Text>

      <Link href={font.url} color={"#d4682e"} fontWeight="500" fontSize="sm">
        {font.url.replace("https://", "")}
      </Link>
    </Box>
  );
}
