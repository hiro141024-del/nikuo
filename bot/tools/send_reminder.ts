import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { deliverReminder } from "../lib/deliver.js";

export default defineTool({
  description:
    "勤怠リマインドを広夢の Slack DM に今すぐ送る。本人が送るよう明示したときだけ使う。文面の確認だけなら preview_reminder。",
  effect: "write",
  dryRunResult: ({ kind }) => ({ delivered: false, dryRun: true, kind }),
  inputSchema: z.object({
    kind: z.enum(["clock-in", "clock-out", "clock-out-followup"]),
  }),
  async execute({ kind }, ctx) {
    return deliverReminder(ctx.host, kind, {
      dedupe: false,
      eval: ctx.session.purpose === "eval",
    });
  },
});
