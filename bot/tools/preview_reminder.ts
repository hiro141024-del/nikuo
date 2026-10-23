import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { reminderText } from "../lib/reminders.js";

export default defineTool({
  description:
    "勤怠リマインドの文面を返す。Slack には送らない。9:55 は clock-in、19:00 は clock-out、20:00 は clock-out-followup。",
  effect: "read",
  inputSchema: z.object({
    kind: z.enum(["clock-in", "clock-out", "clock-out-followup"]),
  }),
  execute({ kind }) {
    return { kind, text: reminderText(kind) };
  },
});
