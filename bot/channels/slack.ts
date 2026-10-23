import { slackChannel } from "@grok/agent-sdk/channels/slack";

export default slackChannel({
  envPrefix: "KINMU",
  suggestedPrompts: [
    { title: "19時の文面", message: "19時のリマインド文を見せて。送らないで。" },
    { title: "今送って", message: "退勤リマインドを今すぐ DM して。" },
  ],
});
