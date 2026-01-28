import { Box, Text, Heading, Link } from "@chakra-ui/react";

export interface CreditItem {
  name: string;
  desc: string;
  url: string;
}

interface CreditCardProps {
  credit: CreditItem;
}

export function CreditCard({ credit }: CreditCardProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderRadius="md"
      p={6}
      position="relative"
    >
      <Heading as="h4" size="sm" mb={2} color={"#2a2520"}>
        {credit.name}
      </Heading>

      <Text fontSize="sm" color="#6b625a" mb={3}>
        {credit.desc}
      </Text>

      <Link href={credit.url} color={"#d4682e"} fontWeight="500" fontSize="sm">
        {credit.url.replace("https://", "")}
      </Link>
    </Box>
  );
}
