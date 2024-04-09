import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  password: process.env.REDIS_PASSWORD ?? "",
  port: Number.parseInt(process.env.REDIS_PORT ?? "6379", 10),
});

export async function clearAllRedisCache(): Promise<void> {
  await redis.flushall();
}

export interface KeyMemoryInfo {
  key: string;
  sizeInBytes: number;
}

export async function scanKeys(pattern: string): Promise<KeyMemoryInfo[]> {
  let cursor = "0";
  let keysWithSize: KeyMemoryInfo[] = [];

  do {
    const reply: [string, string[]] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = reply[0];
    const keys = reply[1];

    // Fetch and accumulate size for each key
    for (const key of keys) {
      const sizeInBytes = await redis.memory("USAGE", key);
      keysWithSize.push({ key, sizeInBytes: sizeInBytes ?? 0 }); // If memoryUsage is null, default to 0
    }
  } while (cursor !== "0");

  return keysWithSize;
}
