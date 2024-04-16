import { env } from "@/env";
import { redis } from "@/lib/redis";

export type ODataResponseArray =
  | {
      "odata.metadata": string;
      value: unknown[];
    }
  | {
      "odata.error": {
        code: string;
        message: {
          lang: string;
          value: string;
        };
      };
    };

export type ODataResponseObject =
  | {
      "odata.metadata": string;
      [key: string]: any;
    }
  | {
      "odata.error": {
        code: string;
        message: {
          lang: string;
          value: string;
        };
      };
    };

interface IODataRequestProperties {
  path: string;
  filter?: string;
  select?: string;
  expand?: string;
  orderBy?: string;
  top?: number;
  skip?: number;
  cacheExpiration?: number;
}

export async function fetchOData(
  fullUrl: string,
  authHeader: string,
  cacheEx = 300,
): Promise<any> {
  const cacheKey = `odata:${fullUrl}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    // Cache hit, return parsed cached data
    if (process.env.NODE_ENV !== "production") {
      console.log(`Cache hit for ${cacheKey}`);
    }
    return JSON.parse(cachedData);
  }
  if (process.env.NODE_ENV !== "production") {
    console.log(`Cache miss for ${cacheKey}, fetching...`);
  }

  // Cache miss, proceed with fetch
  const response = await fetch(fullUrl, {
    headers: {
      Authorization: authHeader ?? "",
    },
  });

  const odataResponse: ODataResponseArray =
    (await response.json()) as ODataResponseArray;

  if ("odata.error" in odataResponse) {
    throw new Error(odataResponse["odata.error"].message.value);
  }

  await redis.setex(cacheKey, cacheEx, JSON.stringify(odataResponse.value));

  return odataResponse.value as unknown as ODataResponseArray;
}

export async function getSpecificODataResponseArray({
  path,
  filter,
  select,
  expand,
  orderBy,
  top,
  skip,
  cacheExpiration,
}: IODataRequestProperties) {
  const authHeader = env.ODATA_API_AUTH_HEADER;
  const baseUrl = env.ODATA_API_URL;

  if (!authHeader || !baseUrl) {
    throw new Error("ODATA_API_AUTH_HEADER and ODATA_API_URL are not set");
  }

  // Cannot use URLParams because it encodes and breaks the OData query
  let params = `$format=json`;
  if (filter) {
    params = `${params}&$filter=${filter}`;
  }
  if (select) {
    params = `${params}&$select=${select}`;
  }
  if (expand) {
    params = `${params}&$expand=${expand}`;
  }
  if (orderBy) {
    params = `${params}&$orderby=${orderBy}`;
  }
  if (top) {
    params = `${params}&$top=${top}`;
  }
  if (skip) {
    params = `${params}&$skip=${skip}`;
  }
  try {
    const fullUrl = `${baseUrl}${path}?${params}`;
    return await fetchOData(fullUrl, authHeader, cacheExpiration);
  } catch (e) {
    console.error("Error while getting OData response", e);
    throw e;
  }
}

export async function getSpecificODataResponseObject({
  path,
  filter,
  select,
}: {
  path: string;
  filter?: string;
  select?: string;
}) {
  const authHeader = env.ODATA_API_AUTH_HEADER;
  const baseUrl = env.ODATA_API_URL;

  // Cannot use URLParams because it encodes and breaks the OData query
  let params = `$format=json`;
  if (filter) {
    params = `${params}&$filter=${filter}`;
  }
  if (select) {
    params = `${params}&$select=${select}`;
  }
  try {
    const fullUrl = `${baseUrl}${path}?${params}`;
    if (process.env.NODE_ENV === "development") {
      console.info(`Fetching OData object response from "${fullUrl}"`);
    }
    // Use fetch to get the response from the OData API
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: authHeader ?? "",
      },
    });
    // Get the JSON response from the OData API
    const odataResponse: ODataResponseObject =
      (await response.json()) as ODataResponseObject;
    // Check if the response is an error
    if ("odata.error" in odataResponse) {
      throw new Error(odataResponse["odata.error"].message.value);
    }
    return odataResponse;
  } catch (e) {
    console.error("Error while getting OData response", e);
    throw e;
  }
}
