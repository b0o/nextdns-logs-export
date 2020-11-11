NextDNS Logs Export
===================

Export a your NextDNS logs as JSON.

Usage
-----

1. Install this tool locally:
- 1. `git clone https://github.com/b0o/nextdns-logs-export`
- 2. `cd nextdns-logs-export`
- 3. `npm install`

2. Navigate to the [NextDNS Control Panel](https://my.nextdns.io/) and sign in.

3. Determine your configuration ID:
- 1. Your configuration ID can be found on the setup tab of your [NextDNS control panel](https://my.nextdns.io), i.e. `e06d1e`.

4. Obtain a session token:
- 1. Navigate to your [NextDNS control panel](https://my.nextdns.io) and open your browser's devtools.
- 2. Select the Network tab.
- 3. Refresh the page.
- 4. Find any request to the domain `api.nextdns.io`.
- 5. Select the request, then under *Request Headers* find the `cookie: ...` row.
- 6. Look for the `sid=<sid>;` entry and copy the string between (but not
     including) the `sid=` and the `;`.

4. Run `index.js`, passing your configuration ID and session token, and redirect stdout to a file:

```sh
$ ./index.js "<configId>" "<sessionId>" > nextdns-logs.json
```

5. You can use [jq](https://github.com/stedolan/jq) to transform the JSON output as desired, e.g:

```sh
# count the number of DNS queries made for the domain github.com
$ jq --slurp 'map(select(.name == "github.com")) | length' nextdns-logs.json
1927
```

License
-------
&copy; 2020 Maddison Hellstrom

Released under the GNU General Public License, version 3.0 or later.
