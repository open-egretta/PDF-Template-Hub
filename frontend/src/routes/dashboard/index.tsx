import { Container } from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  // beforeLoad: ({ location }) => ({}),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container>
      WelCome <br />
      <Link to="/dashboard/templates">樣板維護</Link>
    </Container>
  );
}
