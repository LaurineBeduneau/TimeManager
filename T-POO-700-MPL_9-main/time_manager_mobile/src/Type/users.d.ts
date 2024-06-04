import { team } from "./teams";

export interface user {
    username: string;
    email: string;
    id: number;
    role: string;
    teams: team[];
}