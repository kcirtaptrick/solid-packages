import { createContext, useContext } from "solid-js";
import createForm from "./createForm";

export const FormContext = createContext<createForm.Result>();

export const useForm = () => useContext(FormContext);
