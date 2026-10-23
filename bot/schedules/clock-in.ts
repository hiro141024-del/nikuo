import { defineSchedule } from "@grok/agent-sdk/schedules";
import { deliverReminder } from "../lib/deliver.js";

// 09:55 Asia/Tokyo = 00:55 UTC. Japan has no daylight saving.
export default defineSchedule({
  cron: "55 0 * * 1-5",
  async run({ host }) {
    await deliverReminder(host, "clock-in", { dedupe: true });
  },
});
