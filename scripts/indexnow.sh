#!/usr/bin/env bash
# Tells Bing (and the other IndexNow engines) that specific akluxnails.com URLs are new or changed,
# so they get recrawled within hours instead of weeks. ChatGPT's web search uses Bing's index,
# which is why this matters. Added 2026-09-29.
#
# Run by hand, only with URLs whose content actually changed (IndexNow's own rule: submitting
# unchanged URLs over and over is ignored and can get a key throttled). Not wired into deploys
# for that reason.
#
#   scripts/indexnow.sh https://akluxnails.com/prices https://akluxnails.com/russian-pedicure
#
# The key below is public by design: IndexNow verifies it by fetching public/<key>.txt from
# this same host, which proves we control the site.
set -euo pipefail
KEY="d904c8298fd2ab7d9a1f290e1cc4e660"
[ $# -gt 0 ] || { echo "usage: $0 URL [URL...]" >&2; exit 1; }
urls=$(printf '"%s",' "$@"); urls="[${urls%,}]"
curl -sS -o /dev/null -w "IndexNow HTTP %{http_code}\n" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"akluxnails.com\",\"key\":\"$KEY\",\"keyLocation\":\"https://akluxnails.com/$KEY.txt\",\"urlList\":$urls}"
