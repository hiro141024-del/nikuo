import { defineSchedule } from "@grok/agent-sdk/schedules";
import { deliverReminder } from "../lib/deliver.js";

// 20:00 Asia/Tokyo = 11:00 UTC.
export default defineSchedule({
  cron: "0 11 * * 1-5",
  async run({ host }) {
    await deliverReminder(host, "clock-out-followup", { dedupe: true });
  },
});
