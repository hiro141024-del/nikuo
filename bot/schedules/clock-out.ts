import { defineSchedule } from "@grok/agent-sdk/schedules";
import { deliverReminder } from "../lib/deliver.js";

// 19:00 Asia/Tokyo = 10:00 UTC.
export default defineSchedule({
  cron: "0 10 * * 1-5",
  async run({ host }) {
    await deliverReminder(host, "clock-out", { dedupe: true });
  },
});
