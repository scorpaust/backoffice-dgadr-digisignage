import { Employee } from "../constants/Types";

export type RootStackParamList = {
  Login?: undefined;
  Employees?: undefined;
  EditEmployee?: { employee?: Employee };
};