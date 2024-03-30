import { useRouter, useSearchParams } from "next/navigation";

export function useSearchParamState<T>({
  searchParamName,
  postSetCallback,
  serialize = (value: T) => value as unknown as string,
  deserialize = (value: string) => value as unknown as T,
  defaultValue,
}: {
  searchParamName: string;
  postSetCallback: () => void;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  defaultValue?: T;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchParamValue = searchParams.get(searchParamName);
  if (!searchParamValue && defaultValue) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(searchParamName, serialize(defaultValue));
    router.push(`?${newSearchParams.toString()}`);
  }
  const value = deserialize(searchParamValue ?? "");

  const setValue = (value: T) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(searchParamName, serialize(value));
    router.push(`?${newSearchParams.toString()}`);
    postSetCallback();
  };

  return [value, setValue] as const;
}
