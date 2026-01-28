import { useQuery } from "@tanstack/react-query";
import apiService from "@/services/api";

export function useTemplates() {
  return useQuery<
    {
      id: number;
      thumbnail: string;
      name: string;
      description: string;
    }[]
  >({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await apiService.get("/templates");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 分鐘內視為新鮮
  });
}
