import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "show-clock-out",
      description: "Shows the 19:00 reminder without posting it.",
      async test(t) {
        await t.send("19時のリマインド文を見せて。送らないで。");
        t.succeeded();
        t.calledTool("preview_reminder", { input: { kind: "clock-out" } });
        t.notCalledTool("send_reminder");
      },
    },
  ],
});
