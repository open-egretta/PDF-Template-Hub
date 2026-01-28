import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "@/components/ui/provider";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { AuthProvider, useAuth } from "./auth";
import { Toaster } from "./components/ui/toaster";
import { Spinner, VStack, Text } from "@chakra-ui/react";

export const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <VStack colorPalette={"teal"} mt={4}>
      <Spinner color={"colorPalette.500"} size={"xl"} borderWidth="4px" />
      <Text color={"colorPalette.600"}>Loading......</Text>
    </VStack>
  ),
  context: { auth: undefined! },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth }} />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <Toaster />
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
