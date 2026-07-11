import Redis from "ioredis";
import { logger } from "./logger";

let redis: Redis | null = null;
let disabled = false;

/** Redis is optional — empty REDIS_URL or REDIS_DISABLED=true skips cache. */
export function isRedisEnabled(): boolean {
  if (disabled) return false;
  if (process.env.REDIS_DISABLED === "true") return false;
  const url = process.env.REDIS_URL?.trim();
  if (!url || url === "0" || url === "false") return false;
  return true;
}

export function getRedis(): Redis | null {
  if (!isRedisEnabled()) return null;
  if (disabled) return null;

  if (!redis) {
    const url = process.env.REDIS_URL!.trim();
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableReadyCheck: true,
      retryStrategy: () => null,
      showFriendlyErrorStack: false,
    });

    redis.on("error", (err) => {
      // One warning then mute — common on shared hosting without Redis
      if (!disabled) {
        logger.warn({ err: String(err) }, "Redis unavailable — caching disabled");
        disabled = true;
      }
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
  GOLD_CURRENT: 300,
  GOLD_HISTORY: 3600,
  FOREX_CURRENT: 600,
  INTEREST: 3600,
  STOCKS: 60,
  FUEL: 3600,
  SEO_PAGE: 1800,
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    if (client.status !== "ready") {
      await client.connect().catch(() => {
        disabled = true;
      });
    }
    if (disabled) return null;
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
    if (!client || disabled) return;
    if (client.status !== "ready") {
      await client.connect().catch(() => {
        disabled = true;
      });
    }
    if (disabled) return;
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client || disabled) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch {
    // ignore
  }
}
