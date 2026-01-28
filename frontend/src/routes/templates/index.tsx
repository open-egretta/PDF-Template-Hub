import { useTemplates } from "@/hooks/queries/useTemplates";
import {
  Container,
  Card,
  Image,
  SimpleGrid,
  Text,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/templates/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "瀏覽樣板 - PDF Template Hub",
      },
    ],
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: templates, isLoading, error } = useTemplates();

  if (isLoading)
    return (
      <VStack colorPalette={"teal"} mt={4}>
        <Spinner color={"colorPalette.500"} size={"xl"} borderWidth="4px" />
        <Text color={"colorPalette.600"}>Loading......</Text>
      </VStack>
    );
  if (error) return <Container>{JSON.stringify(error)}</Container>;

  return (
    <Container>
      <Text textStyle={"4xl"} fontWeight="medium" mb={2}>
        樣板
      </Text>

      <SimpleGrid columns={{ sm: 1, md: 3 }} gap="6">
        {templates?.map((template) => (
          <Card.Root
            key={template.id}
            marginBottom="4"
            cursor={"pointer"}
            onClick={() =>
              navigate({
                to: `/templates/$id`,
                params: {
                  id: String(template.id),
                },
              })
            }
          >
            <Image
              src={
                template.thumbnail
                  ? template.thumbnail
                  : "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0RERERERCIvPjxwYXRoIGZpbGw9IiM5OTk5OTkiIGQ9Ik0xNjEuMTQgMjI0Ljc4NXYtMjYuNDVxLTIuNDItMi45My01LjI3LTQuMTQtMi44NC0xLjIxLTYuMTItMS4yMS0zLjIyIDAtNS44MSAxLjIxdC00LjQyIDMuNjVxLTEuODUgMi40NC0yLjgyIDYuMjEtLjk4IDMuNzctLjk4IDguODggMCA1LjE4LjgzIDguNzcuODQgMy42IDIuMzkgNS44N3QzLjggMy4yOHEyLjI0IDEgNSAxIDQuNDIgMCA3LjUzLTEuODQgMy4xLTEuODQgNS44Ny01LjIzbTAtNjcuOTdoMTQuMnY4NS40NWgtOC42OXEtMi44MSAwLTMuNTYtMi41OWwtMS4yMS01LjY5cS0zLjU2IDQuMDgtOC4xOSA2LjYxdC0xMC43OCAyLjUzcS00LjgzIDAtOC44Ni0yLjAxLTQuMDItMi4wMS02LjkzLTUuODQtMi45LTMuODItNC40OC05LjQ2LTEuNTgtNS42My0xLjU4LTEyLjg4IDAtNi41NSAxLjc4LTEyLjE5IDEuNzgtNS42MyA1LjEyLTkuNzcgMy4zMy00LjE0IDcuOTktNi40N3QxMC40Ni0yLjMzcTQuOTUgMCA4LjQ2IDEuNTUgMy41IDEuNTYgNi4yNyA0LjJ6bTM5LjQ0IDQ5LjE3aDI2Ljc5cTAtMi43Ni0uNzctNS4yMS0uNzgtMi40NC0yLjMzLTQuMjh0LTMuOTQtMi45cS0yLjM5LTEuMDctNS41NS0xLjA3LTYuMTUgMC05LjY5IDMuNTEtMy41MyAzLjUxLTQuNTEgOS45NW0zNi4yMiA4LjU3aC0zNi41MXEuMzUgNC41NCAxLjYxIDcuODQgMS4yNyAzLjMxIDMuMzQgNS40NyAyLjA3IDIuMTUgNC45MSAzLjIyIDIuODUgMS4wNiA2LjMgMS4wNnQ1Ljk1LS44MXEyLjUtLjggNC4zNy0xLjc4dDMuMjgtMS43OCAyLjczLS44cTEuNzggMCAyLjY0IDEuMzJsNC4wOSA1LjE3cS0yLjM2IDIuNzYtNS4yOSA0LjYzLTIuOTQgMS44Ny02LjEzIDIuOTl0LTYuNDkgMS41OHEtMy4zMS40Ni02LjQyLjQ2LTYuMTUgMC0xMS40NC0yLjA0dC05LjItNi4wNHEtMy45MS0zLjk5LTYuMTUtOS44OS0yLjI0LTUuODktMi4yNC0xMy42NSAwLTYuMDQgMS45NS0xMS4zNiAxLjk2LTUuMzIgNS42MS05LjI2dDguOTEtNi4yNHE1LjI2LTIuMjkgMTEuODctMi4yOSA1LjU4IDAgMTAuMyAxLjc4IDQuNzEgMS43OCA4LjEgNS4yIDMuNCAzLjQyIDUuMzIgOC40IDEuOTMgNC45NyAxLjkzIDExLjM1IDAgMy4yMi0uNjkgNC4zNC0uNjkgMS4xMy0yLjY1IDEuMTNtMzIuMzIgMjcuNzFoLTE0LjJ2LTQ4LjNsLTUuMTItLjgxcS0xLjY3LS4zNC0yLjY3LTEuMTctMS4wMS0uODQtMS4wMS0yLjM5di01LjgxaDguOHYtNC4zN3EwLTUuMDYgMS41Mi05LjA4IDEuNTItNC4wMyA0LjM3LTYuODUgMi44NS0yLjgxIDYuOTMtNC4zMSA0LjA4LTEuNDkgOS4yLTEuNDkgNC4wOCAwIDcuNTkgMS4wOWwtLjI5IDcuMTNxLS4wNi44LS40NiAxLjI5dC0xLjA2Ljc1LTEuNTIuMzVxLS44Ny4wOC0xLjg1LjA4LTIuNTMgMC00LjUxLjU1LTEuOTguNTQtMy4zNiAxLjktMS4zOCAxLjM1LTIuMSAzLjU2dC0uNzIgNS40OXYzLjkxaDE1LjM1djEwLjEyaC0xNC44OXptNTQuMDUtMTUuMjR2LTkuOTVxLTYuMTUuMjktMTAuMzUgMS4wNy00LjIuNzctNi43MyAxLjk4dC0zLjYyIDIuODItMS4wOSAzLjUxcTAgMy43MyAyLjIxIDUuMzUgMi4yMSAxLjYgNS43OCAxLjYgNC4zNyAwIDcuNTYtMS41OHQ2LjI0LTQuOG0tMzAuMDItMzAuOTktMi41My00LjU0cTEwLjE4LTkuMzIgMjQuNS05LjMyIDUuMTcgMCA5LjI2IDEuNyA0LjA4IDEuNjkgNi45IDQuNzF0NC4yOCA3LjIycTEuNDcgNC4yIDEuNDcgOS4ydjM3LjI2aC02LjQ0cS0yLjAyIDAtMy4xMS0uNi0xLjA5LS42MS0xLjcyLTIuNDVsLTEuMjctNC4yNXEtMi4yNCAyLjAxLTQuMzcgMy41My0yLjEzIDEuNTMtNC40MyAyLjU2LTIuMyAxLjA0LTQuOTEgMS41OC0yLjYyLjU1LTUuNzguNTUtMy43NCAwLTYuOS0xLjAxLTMuMTYtMS01LjQ2LTMuMDEtMi4zLTIuMDItMy41Ny01LjAxLTEuMjYtMi45OS0xLjI2LTYuOTYgMC0yLjI0Ljc0LTQuNDUuNzUtMi4yMSAyLjQ1LTQuMjMgMS42OS0yLjAxIDQuNC0zLjc5IDIuNy0xLjc5IDYuNjQtMy4xMXQ5LjE3LTIuMTVxNS4yMy0uODQgMTEuOTYtMS4wMXYtMy40NXEwLTUuOTItMi41My04Ljc3dC03LjMtMi44NXEtMy40NSAwLTUuNzIuODEtMi4yOC44LTQgMS44MS0xLjczIDEuMDEtMy4xMyAxLjgxLTEuNDEuODEtMy4xNC44MS0xLjQ5IDAtMi41My0uNzgtMS4wMy0uNzgtMS42Ny0xLjgxbTkzLjg1LTEyLjc3aDE0LjJ2NTloLTguNjhxLTIuODIgMC0zLjU3LTIuNTlsLS45OC00LjcxcS0zLjYyIDMuNjgtNy45OSA1Ljk1dC0xMC4yOSAyLjI3cS00LjgzIDAtOC41NC0xLjY0dC02LjI0LTQuNjMtMy44Mi03LjFxLTEuMy00LjExLTEuMy05LjA2di0zNy40OUgzNjR2MzcuNDlxMCA1LjQxIDIuNSA4LjM3dDcuNSAyLjk2cTMuNjggMCA2LjktMS42NHQ2LjEtNC41MXptMjguNC0yNi40NWgxNC4ydjg1LjQ1aC0xNC4yem00OC4wNyA4Ni4zN3EtNy43MSAwLTExLjgyLTQuMzR0LTQuMTEtMTEuOTl2LTMyLjk1aC02LjA0cS0xLjE1IDAtMS45NS0uNzUtLjgxLS43NC0uODEtMi4yNHYtNS42M2w5LjQ5LTEuNTYgMi45OS0xNi4xcS4yOS0xLjE0IDEuMDktMS43OC44MS0uNjMgMi4wNy0uNjNoNy4zNnYxOC41N2gxNS43NnYxMC4xMmgtMTUuNzZ2MzEuOTdxMCAyLjc2IDEuMzYgNC4zMSAxLjM1IDEuNTYgMy43IDEuNTYgMS4zMyAwIDIuMjItLjMydDEuNTUtLjY2cS42Ni0uMzUgMS4xOC0uNjYuNTItLjMyIDEuMDMtLjMyLjY0IDAgMS4wNC4zMi40LjMxLjg2Ljk1bDQuMjYgNi45cS0zLjExIDIuNTgtNy4xMyAzLjkxLTQuMDMgMS4zMi04LjM0IDEuMzIiLz48L3N2Zz4="
              }
              alt="Green double couch with wooden legs"
              objectFit={"contain"}
              height={"300px"}
            />
            <Card.Body gap="2">
              <Card.Title mt="2">{template.name}</Card.Title>
              <Card.Description>{template.description}</Card.Description>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Container>
  );
}
