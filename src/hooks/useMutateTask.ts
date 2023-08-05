import axios from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Task } from "../types";
import useStore from "../store";
import { useError } from "../hooks/useError";

export const useMutateTask = () => {
  const queryClient = useQueryClient();
  const { switchErrorHandling } = useError();
  const resetEditedTask = useStore((state) => state.resetEditedTask);

  const createTaskMutation = useMutation(
    (
      task: Omit<Task, "id" | "created_at" | "updated_at"> // Taskから3つの属性を除いたもの引数
    ) => axios.post<Task>(`${process.env.REACT_APP_API_URL}/tasks`, task),
    {
      onSuccess: (res) => {
        const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]); // キャッシュに格納されてるタスクの一覧をtasksのキーワードを使って取得
        // キャッシュが存在していれば，前回までのタスクに現在のタスクを追加
        if (previousTasks) {
          queryClient.setQueryData(["tasks"], [...previousTasks, res.data]);
        }
        resetEditedTask();
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message);
        } else {
          switchErrorHandling(err.response.data);
        }
      },
    }
  );
  const updateTaskMutation = useMutation(
    (task: Omit<Task, "created_at" | "updated_at">) =>
      axios.put<Task>(`${process.env.REACT_APP_API_URL}/tasks/${task.id}`, {
        //タスクのid，titleを送信
        title: task.title,
      }),
    {
      onSuccess: (res, variables) => {
        const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
        // 一致するIDがあれば書き換える
        if (previousTasks) {
          queryClient.setQueryData<Task[]>(
            ["tasks"],
            previousTasks.map((task) =>
              task.id === variables.id ? res.data : task
            )
          );
        }
        resetEditedTask();
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message);
        } else {
          switchErrorHandling(err.response.data);
        }
      },
    }
  );
  const deleteTaskMutation = useMutation(
    (id: number) =>
      axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`),
    {
      onSuccess: (_, variables) => {
        const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
        // 一致するIDがあれば削除
        if (previousTasks) {
          queryClient.setQueryData<Task[]>(
            ["tasks"],
            previousTasks.filter((task) => task.id !== variables)
          );
        }
        resetEditedTask();
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message);
        } else {
          switchErrorHandling(err.response.data);
        }
      },
    }
  );
  return {
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  };
};
