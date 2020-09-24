import { UserRecord } from "./user";

export interface MessageRecord {
  id: number;
  user: UserRecord;
  status: "active" | "deleted";
  content: string;
  readonly?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
