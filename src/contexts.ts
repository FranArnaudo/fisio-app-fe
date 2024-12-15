import { createContext } from "react";
import { Professional } from "./types";

export const AuthContext = createContext<{
  jwt: string;
  user: Professional | null;
  loaded: boolean;
}>({
  jwt: "",
  user: null,
  loaded: false,
});
