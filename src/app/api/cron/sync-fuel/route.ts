import { syncFuelToDb } from "@/modules/fuel/service";
import { createCronSyncHandler } from "@/lib/cron-sync-handler";

export const POST = createCronSyncHandler({
  jobName: "sync-fuel",
  cachePattern: "fuel:*",
  run: syncFuelToDb,
});
