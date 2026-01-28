import { Box, Text, Heading, Flex, Badge, Link } from "@chakra-ui/react";

export interface TechStackItem {
  category: string;
  title: string;
  license: string;
  url: string;
}

interface TechStackCardProps {
  tech: TechStackItem;
}

export function TechStackCard({ tech }: TechStackCardProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderRadius="lg"
      p={8}
      position="relative"
    >
      <Text
        fontFamily="mono"
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="widest"
        fontWeight="bold"
        mb={4}
        color={"#d4682e"}
      >
        {tech.category}
      </Text>
      <Heading as="h3" size="lg" mb={4} color={"#2a2520"}>
        {tech.title}
      </Heading>

      <Flex
        mt="auto"
        pt={4}
        borderTop="1px solid"
        justify="space-between"
        align="center"
      >
        <Badge
          fontFamily="mono"
          variant="subtle"
          bg={"#f5f1e8"}
          color={"#6b625a"}
          px={3}
          py={1}
          borderRadius="4px"
          textTransform="none"
        >
          {tech.license}
        </Badge>
        <Link href={tech.url} color={"#d4682e"} fontWeight="500" fontSize="sm">
          官網{" "}
          <Text as="span" fontSize="lg">
            →
          </Text>
        </Link>
      </Flex>
    </Box>
  );
}
