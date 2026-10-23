import type { ScheduleHandlerArgs } from "@grok/agent-sdk/schedules";
import { reminderText, reminderUserId, tokyoDateKey, type ReminderKind } from "./reminders.js";

type Host = ScheduleHandlerArgs["host"];

export type DeliveryResult = {
  kind: ReminderKind;
  userId: string;
  text: string;
  delivered: boolean;
  skipped?: "already-sent" | "eval";
  error?: string;
};

export async function deliverReminder(
  host: Host,
  kind: ReminderKind,
  options: { dedupe?: boolean; eval?: boolean } = {},
): Promise<DeliveryResult> {
  const text = reminderText(kind);
  const userId = reminderUserId();
  const base = { kind, userId, text };

  if (options.eval) {
    return { ...base, delivered: false, skipped: "eval" };
  }

  const dedupeKey = `sent:${kind}:${tokyoDateKey()}`;
  if (options.dedupe) {
    const existing = await host.kv.get(dedupeKey);
    if (existing !== undefined) {
      return { ...base, delivered: false, skipped: "already-sent" };
    }
  }

  try {
    const client = await host.slack.getClient();
    await client.chat.postMessage({ channel: userId, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Slack post failed";
    return { ...base, delivered: false, error: message.slice(0, 300) };
  }

  if (options.dedupe) {
    await host.kv.put(dedupeKey, { sentAt: new Date().toISOString() });
  }

  return { ...base, delivered: true };
}
