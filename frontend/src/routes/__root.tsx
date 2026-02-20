import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Outlet,
  useRouter,
  createRootRouteWithContext,
  Link,
  HeadContent,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { CiMenuBurger } from "react-icons/ci";
import githubSVG from "../assets/github.svg";

import type { AuthContext } from "../auth";

interface MyRouterContext {
  auth: AuthContext;
}

const RootLayout = () => {
  const router = useRouter();
  const { auth } = Route.useRouteContext();
  const { open: isOpen, onOpen, onClose } = useDisclosure();

  const handleToggle = () => (isOpen ? onClose() : onOpen());

  const handleAuthAction = async () => {
    if (auth.status === "loggedIn") {
      await auth.logout();
      router.invalidate();
      router.navigate({ to: "/" });
    } else {
      router.navigate({ to: "/login" });
    }
  };

  return (
    <>
      <HeadContent />
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding={6}
        bg="teal.500"
        color="white"
      >
        <Flex alignItems={"center"} gap={2}>
          <Heading as={"h1"} size={"lg"} letterSpacing={"tighter"} mr={2}>
            <Link to="/">PDF Template Hub</Link>
          </Heading>
          <Link to="/about">關於本服務</Link>
          <a
            target="_blank"
            href="https://github.com/open-egretta/PDF-Template-Hub"
          >
            <img src={githubSVG} alt="GitHub" style={{ height: "24px" }} />
          </a>
        </Flex>

        <Box display={{ base: "block", md: "none" }} onClick={handleToggle}>
          <CiMenuBurger />
        </Box>

        <Stack
          direction={{ base: "column", md: "row" }}
          display={{ base: isOpen ? "block" : "none", md: "flex" }}
          width={{ base: "full", md: "auto" }}
          alignItems="center"
          flexGrow={1}
          mt={{ base: 4, md: 0 }}
        ></Stack>

        <Box
          display={{ base: isOpen ? "block" : "none", md: "block" }}
          mt={{ base: 4, md: 0 }}
        >
          {auth.status === "loggedIn" ? (
            <Flex align="center" gap={4}>
              <Box>Hi, {auth.user?.email || auth.user?.name || "User"}</Box>
              <Button
                variant="outline"
                _hover={{ bg: "teal.700", borderColor: "teal.700" }}
                onClick={handleAuthAction}
              >
                Logout
              </Button>
            </Flex>
          ) : (
            <Button
              variant="outline"
              _hover={{ bg: "teal.700", borderColor: "teal.700" }}
              onClick={handleAuthAction}
            >
              Login
            </Button>
          )}
        </Box>
      </Flex>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
});
