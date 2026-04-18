import { client } from "./client";
import { Class } from "../../types/school.types";

export const classesApi = {
  list: () => client.get<Class[]>("/classes"),
  getById: (id: number) => client.get<Class>(`/classes/${id}`),
};
