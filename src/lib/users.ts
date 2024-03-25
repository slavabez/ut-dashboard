import { ConvertFrom1C, IParsedUser } from "@/lib/1c-adapter";
import { From1C } from "@/lib/odata";

export const getUsersParsed = async (): Promise<IParsedUser[]> => {
  const allUsersRaw = await From1C.getAllUsers();
  // Do an async map to convert the raw data to the parsed data
  return Promise.all(
    allUsersRaw.map(async (user) => {
      return ConvertFrom1C.user(user);
    }),
  );
};
