import { NomenclatureSelect, UserSelect } from "@/drizzle/schema";

export type IActionError = {
  error: string;
  status: "error";
};

export type IActionResponse<T> =
  | {
      data: T;
      status: "success";
    }
  | IActionError;

export type IUserMeta = {
  id: string;
  showOnSite: boolean;
  isDeleted: boolean;
  name: string;
  inactive: boolean;
  realId: string;
  realName: string;
  iin: string;
  phone: string;
  email: string;
  siteRole: "admin" | "user";
};

export type UserSelectNonSensitive = Omit<UserSelect, "password">;

export interface NomenclatureWithChildren extends NomenclatureSelect {
  children: NomenclatureWithChildren[];
  count: number;
}
