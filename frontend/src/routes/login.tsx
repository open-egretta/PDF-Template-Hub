import { useAuth } from "@/auth";
import { Button, Container, Field, Input } from "@chakra-ui/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import * as React from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Login - PDF Template Hub",
      },
    ],
  }),
});

function RouteComponent() {
  const router = useRouter();
  const auth = useAuth();
  const search = Route.useSearch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await auth.login(username, password);
      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  // Redirect after login
  React.useLayoutEffect(() => {
    if (auth.status === "loggedIn") {
      const redirectTo = (search as any)?.redirect || "/dashboard";
      router.history.push(redirectTo);
    }
  }, [auth.status, search, router]);

  return (
    <Container>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={onSubmit}>
        <Field.Root>
          <Field.Label>Username</Field.Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Password</Field.Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>
        <Button type="submit" loading={loading}>
          Login
        </Button>
      </form>
    </Container>
  );
}
