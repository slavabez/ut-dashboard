import React from "react";

import { getRedisCacheInfo } from "@/actions/site-settings";
import RedisClearCacheButton from "@/app/(protected)/admin/site-settings/redis/_components/redis-clear-cache-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes } from "@/lib/utils";

const RedisInfo = async () => {
  const redisInfoResponse = await getRedisCacheInfo();
  if (redisInfoResponse.status === "error") {
    return (
      <div>
        <p>{redisInfoResponse.error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <h1 className="text-xl font-bold">Кэш Redis</h1>
      <RedisClearCacheButton />
      <h2>Список кэш-ключей в Redis:</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ключ</TableHead>
            <TableHead>Размер</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redisInfoResponse.data.map((item) => (
            <TableRow key={item.key}>
              <TableCell>{item.key}</TableCell>
              <TableCell>{formatBytes(item.sizeInBytes)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RedisInfo;
