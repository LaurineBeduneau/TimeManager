import { team } from "./teams";

export interface userState {
  isLogged: boolean;
  token: string;
  username: string;
  email: string;
  userId: number;
  role: string;
  teams: team[];
}
