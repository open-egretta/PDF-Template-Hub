import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
} from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Container pt={4} maxW={"4xl"} px={2}>
        <Box width={"100%"}>
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
            <GridItem>
              <LinkBox p="5" borderWidth="1px" rounded="md">
                <Heading size="lg" my="2">
                  <LinkOverlay asChild>
                    <Link to="/templates">瀏覽樣板</Link>
                  </LinkOverlay>
                </Heading>
                <Text mb="3" color="fg.muted">
                  瀏覽各式樣板來產生對應文件。
                </Text>
              </LinkBox>
            </GridItem>
            <GridItem>
              <LinkBox p="5" borderWidth="1px" rounded="md">
                <Heading size="lg" my="2">
                  <LinkOverlay asChild>
                    <Link to="/dashboard">管理樣板</Link>
                  </LinkOverlay>
                </Heading>
                <Text mb="3" color="fg.muted">
                  登入後進行樣板編輯和維護。
                </Text>
              </LinkBox>
            </GridItem>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
