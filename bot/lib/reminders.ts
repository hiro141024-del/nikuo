export const REMINDER_KINDS = ["clock-in", "clock-out", "clock-out-followup"] as const;

export type ReminderKind = (typeof REMINDER_KINDS)[number];

const DEFAULT_SLACK_USER_ID = "U0C52F0941M";

const COPY: Record<ReminderKind, string> = {
  "clock-in": "出勤打刻の時間です。打刻は済みですか？",
  "clock-out":
    "退勤の時間です。次の3つを確認してください。\n• 退勤打刻\n• 日報\n• 振り返り",
  "clock-out-followup":
    "まだ残っているものがないか、もう一度確認してください。\n• 退勤打刻\n• 日報\n• 振り返り",
};

export function isReminderKind(value: string): value is ReminderKind {
  return (REMINDER_KINDS as readonly string[]).includes(value);
}

export function reminderText(kind: ReminderKind): string {
  return COPY[kind];
}

export function reminderUserId(): string {
  const configured = process.env.KINMU_SLACK_USER_ID?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_SLACK_USER_ID;
}

export function tokyoDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
