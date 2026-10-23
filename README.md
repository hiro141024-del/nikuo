# 勤怠リマインダー

平日（日本時間）に Slack DM で確認する Bot です。祝日も平日と同じ扱いで送ります。

- 9:55 出勤打刻
- 19:00 退勤打刻、日報、振り返り
- 20:00 同じ3つの再確認

送信先は `KINMU_SLACK_USER_ID` です。未設定のときは広夢のユーザー ID に送ります。

Mac の通知センターへ同じ3つを入れるには、日本時間の Mac で次を実行します。

```bash
bash mac/install-kinmu-reminders.sh --test
```

外すときは `bash mac/install-kinmu-reminders.sh --uninstall` です。
