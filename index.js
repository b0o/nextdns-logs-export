#!/usr/bin/env node

/*
 * NextDNS Logs Export: Export your logs from NextDNS.
 *
 * Copyright © 2020 Maddison Hellstrom (github.com/b0o)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const fetch = require("node-fetch")

const getLogsPage = async (configId, sid, before = null) => {
  const url = `https://api.nextdns.io/configurations/${configId}/logs?lng=en${before ? `&before=${before}` : ""}`
  const res = await fetch(url, {
    method:  "GET",
    body:    null,
    mode:    "cors",
    headers: {
      cookie:            `sid=${sid};`,
      authority:         "api.nextdns.io",
      accept:            "application/json",
      "user-agent":      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4315.5 Safari/537.36",
      origin:            "https://my.nextdns.io",
      "sec-fetch-site":  "same-site",
      "sec-fetch-mode":  "cors",
      "sec-fetch-dest":  "empty",
      referer:           "https://my.nextdns.io/",
      "accept-language": "en-US,en;q=0.9",
      "sec-gpc":         "1",
    },
  })
  if (!res.ok) {
    throw new Error(`fetch failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

const getLogs = (pst, sid, before = null, after = 0) => ({
  async* [Symbol.asyncIterator]() {
    let res
    let next = before
    do {
      // eslint-disable-next-line no-await-in-loop
      res = await getLogsPage(pst, sid, next)
      const logs = res.logs.map((e) => ({
        ...e,
        timestr: new Date(e.timestamp).toUTCString(),
      }))
      yield logs
      next = logs[logs.length - 1].timestamp
    } while (res.hasMore && next >= after)
  },
})

const main = async () => {
  if (process.argv.length < 4) {
    throw new Error(`usage: ${process.argv[1]} <configId> <sessionId> [before] [after]\n`)
  }
  const configId = process.argv[2]
  const sid = process.argv[3]
  const before = process.argv.length >= 5 ? process.argv[4] : null
  const after = process.argv.length >= 6 ? process.argv[5] : 0
  if (before !== null && after > before) {
    throw new Error("expected before > after")
  }
  for await (const chunk of getLogs(configId, sid, before, after)) {
    for (const entry of chunk) {
      process.stdout.write(`${JSON.stringify(entry, null, 2)}\n`)
    }
  }
}

main()
  .then(() => {})
  .catch((e) => {
    process.stderr.write(`${e.message}\n`)
    process.exit(1)
  })
