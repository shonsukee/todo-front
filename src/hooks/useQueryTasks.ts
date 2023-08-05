import axios from "axios";
import { useError } from "./useError";
import { Task } from "../types";
import { useQuery } from "@tanstack/react-query";

export const useQueryTasks = () => {
  const { switchErrorHandling } = useError();
  const getTasks = async () => {
    const { data } = await axios.get<Task[]>(
      `${process.env.REACT_APP_API_URL}/tasks`,
      { withCredentials: true }
    );
    return data;
  };

  return useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: Infinity,
    onError: (err: any) => {
      if (err.response.data.message) {
        switchErrorHandling(err.response.data.message);
      } else {
        switchErrorHandling(err.response.data);
      }
    },
  });
};
