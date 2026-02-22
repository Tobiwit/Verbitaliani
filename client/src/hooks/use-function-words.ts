import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FunctionWord } from "@shared/schema";

export function useFunctionWords() {
  return useQuery<FunctionWord[]>({
    queryKey: ["functionWords"],
    queryFn: async () => {
      const res = await axios.get("/api/function-words");
      return res.data.words;
    },
  });
}
