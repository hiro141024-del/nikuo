#!/bin/bash
# Install weekday kinmu reminders as macOS notifications.
# 9:55 clock-in, 19:00 and 20:00 clock-out / daily report / reflection.
# Times follow the Mac clock. The installer refuses a clock that is not Japan time.
set -euo pipefail

APP_DIR="${HOME}/Library/Application Support/kinmu-reminder"
AGENT_DIR="${HOME}/Library/LaunchAgents"
NOTIFY="${APP_DIR}/notify.sh"
DOMAIN="gui/$(id -u)"

LABELS=(
  com.kinmu-reminder.clock-in
  com.kinmu-reminder.clock-out
  com.kinmu-reminder.clock-out-followup
)

uninstall() {
  local label
  for label in "${LABELS[@]}"; do
    launchctl bootout "${DOMAIN}/${label}" >/dev/null 2>&1 || true
    rm -f "${AGENT_DIR}/${label}.plist"
  done
  rm -rf "${APP_DIR}"
  echo "勤怠リマインドを外しました。"
}

write_notify() {
  mkdir -p "${APP_DIR}"
  cat > "${NOTIFY}" <<'EOF'
#!/bin/bash
set -euo pipefail

kind="${1:-}"
case "${kind}" in
  clock-in)
    title="出勤打刻"
    message="出勤打刻の時間です。打刻は済みですか？"
    ;;
  clock-out)
    title="退勤の確認"
    message="退勤の時間です。次の3つを確認してください。
• 退勤打刻
• 日報
• 振り返り"
    ;;
  clock-out-followup)
    title="もう一度確認"
    message="まだ残っているものがないか、もう一度確認してください。
• 退勤打刻
• 日報
• 振り返り"
    ;;
  *)
    echo "unknown kind: ${kind}" >&2
    exit 2
    ;;
esac

/usr/bin/osascript - "${title}" "${message}" <<'APPLESCRIPT'
on run argv
  display notification (item 2 of argv) with title (item 1 of argv) sound name "Glass"
end run
APPLESCRIPT
EOF
  chmod 755 "${NOTIFY}"
}

write_plist() {
  local label="$1" kind="$2" hour="$3" minute="$4"
  local plist="${AGENT_DIR}/${label}.plist"
  local day
  mkdir -p "${AGENT_DIR}"
  {
    cat <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${NOTIFY}</string>
    <string>${kind}</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>LANG</key>
    <string>en_US.UTF-8</string>
  </dict>
  <key>StartCalendarInterval</key>
  <array>
EOF
    for day in 1 2 3 4 5; do
      cat <<EOF
    <dict>
      <key>Weekday</key>
      <integer>${day}</integer>
      <key>Hour</key>
      <integer>${hour}</integer>
      <key>Minute</key>
      <integer>${minute}</integer>
    </dict>
EOF
    done
    cat <<EOF
  </array>
  <key>StandardOutPath</key>
  <string>${APP_DIR}/notify.log</string>
  <key>StandardErrorPath</key>
  <string>${APP_DIR}/notify.log</string>
</dict>
</plist>
EOF
  } > "${plist}"
}

install_agents() {
  local offset
  offset="$(date +%z)"
  if [[ "${offset}" != "+0900" && "${KINMU_ALLOW_ANY_TZ:-}" != "1" ]]; then
    echo "この Mac の時計が日本時間ではありません (${offset})。日本時間の Mac で実行してください。" >&2
    exit 1
  fi

  write_notify
  write_plist com.kinmu-reminder.clock-in clock-in 9 55
  write_plist com.kinmu-reminder.clock-out clock-out 19 0
  write_plist com.kinmu-reminder.clock-out-followup clock-out-followup 20 0

  local label
  for label in "${LABELS[@]}"; do
    launchctl bootout "${DOMAIN}/${label}" >/dev/null 2>&1 || true
    launchctl bootstrap "${DOMAIN}" "${AGENT_DIR}/${label}.plist"
    launchctl enable "${DOMAIN}/${label}" >/dev/null 2>&1 || true
  done

  echo "入れました。平日 9:55、19:00、20:00（日本時間、祝日も含む）に通知します。"
  echo "Mac にログインしているときだけ出ます。スリープ中の時刻は、起きたあとに出ます。"
  echo "初回に通知が出なければ、システム設定の通知で Script Editor を許可してください。"
}

case "${1:-}" in
  --uninstall)
    uninstall
    ;;
  --test)
    install_agents
    "${NOTIFY}" clock-in
    "${NOTIFY}" clock-out
    "${NOTIFY}" clock-out-followup
    echo "3通の試し通知を出しました。"
    ;;
  "")
    install_agents
    ;;
  *)
    echo "usage: $0 [--test|--uninstall]" >&2
    exit 2
    ;;
esac
