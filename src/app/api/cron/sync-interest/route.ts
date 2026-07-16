import { syncInterestToDb } from "@/modules/interest/service";
import { createCronSyncHandler } from "@/lib/cron-sync-handler";

export const POST = createCronSyncHandler({
  jobName: "sync-interest",
  cachePattern: "interest:*",
  run: syncInterestToDb,
});
