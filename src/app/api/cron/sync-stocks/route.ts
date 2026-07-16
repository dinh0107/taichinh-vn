import { syncStocksToDb } from "@/modules/stocks/service";
import { createCronSyncHandler } from "@/lib/cron-sync-handler";

export const POST = createCronSyncHandler({
  jobName: "sync-stocks",
  cachePattern: "stocks:*",
  run: syncStocksToDb,
});
