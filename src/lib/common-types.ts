export type IActionResponse<T> =
  | {
      data: T;
      status: "success";
    }
  | {
      error: string;
      status: "error";
    };
