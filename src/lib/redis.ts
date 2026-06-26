import Redis from "ioredis";
import { logger } from "./logger";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableReadyCheck: true,
      retryStrategy: () => null,
    });

    redis.on("error", (err) => {
      logger.error({ err }, "Redis connection error");
    });
  }
  return redis;
}

export const CACHE_KEYS = {
  gold: {
    current: "gold:current",
    history: (code: string, days: number) => `gold:history:${code}:${days}`,
    compare: (codes: string[]) => `gold:compare:${codes.sort().join(",")}`,
  },
  forex: {
    current: "forex:current",
    bank: (bank: string, currency: string) => `forex:${bank}:${currency}`,
  },
  interest: {
    all: "interest:all",
    bank: (bank: string) => `interest:bank:${bank}`,
  },
  stocks: {
    indices: "stocks:indices",
    top: (type: string) => `stocks:top:${type}`,
  },
  fuel: {
    current: "fuel:current",
  },
  seo: {
    page: (slug: string) => `seo:page:${slug}`,
  },
} as const;

export const CACHE_TTL = {
  GOLD_CURRENT: 300, // 5 min — matches giavang.now
  GOLD_HISTORY: 3600, // 1 hour
  FOREX_CURRENT: 600, // 10 min
  INTEREST: 3600,
  STOCKS: 60, // 1 min during market hours
  FUEL: 3600,
  SEO_PAGE: 1800,
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  try {
    const client = getRedis();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn({ err, key }, "Cache set failed");
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch (err) {
    logger.warn({ err, pattern }, "Cache delete failed");
  }
}
