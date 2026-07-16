import { syncForexToDb } from "@/modules/forex/service";
import { createCronSyncHandler } from "@/lib/cron-sync-handler";

export const POST = createCronSyncHandler({
  jobName: "sync-forex",
  cachePattern: "forex:*",
  run: syncForexToDb,
});
