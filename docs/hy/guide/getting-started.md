# Սկիզբ

Հյուրընկալված Streamable HTTP MCP endpoint-ը՝

```text
https://climatenet-mcp.tomauger.am/mcp
```

Օգտագործեք այս URL-ը ուղղակիորեն այն client-ներում, որոնք աջակցում են հեռակա Streamable HTTP MCP սերվերներ։

## Codex

Տեղադրեք սերվերը՝

```sh
codex mcp add climatenet --url https://climatenet-mcp.tomauger.am/mcp
```

Ստուգեք այն՝

```sh
codex mcp get climatenet
codex mcp list
```

Սա գրում է հետևյալին համարժեք config՝

```toml
[mcp_servers.climatenet]
url = "https://climatenet-mcp.tomauger.am/mcp"
enabled = true
```

Սերվերն ավելացնելուց հետո վերագործարկեք Codex-ը։

## Claude Code

Տեղադրեք սերվերը՝

```sh
claude mcp add --transport http --scope user climatenet https://climatenet-mcp.tomauger.am/mcp
```

Ստուգեք այն՝

```sh
claude mcp get climatenet
claude mcp list
```

::: tip Փլագինի տեղադրման հրահանգնե՞ր եք փնտրում
Claude Code-ի և Cowork-ի համար տեղադրեք [Փլագինը](/hy/guide/plugin). այն այս սերվերը միացնում է skill-ի հետ, որն օգնում է Claude-ին արդյունավետ օգտագործել գործիքները։
:::

## Claude Desktop (Chat)

Claude Desktop-ի Chat ներդիրը միանում է հեռակա MCP սերվերներին custom connectors-ի միջոցով։ **Settings → Connectors** բաժնում ավելացրեք custom remote connector այս URL-ով՝

```text
https://climatenet-mcp.tomauger.am/mcp
```

Եթե պետք է local stdio bridge, օգտագործեք `mcp-remote`-ը `claude_desktop_config.json`-ում՝

```json
{
  "mcpServers": {
    "climatenet": {
      "command": "npx",
      "args": ["mcp-remote", "https://climatenet-mcp.tomauger.am/mcp"]
    }
  }
}
```

Config-ը թարմացնելուց հետո վերագործարկեք Claude Desktop-ը։

## Առաջին հարցումը

Միանալուց հետո խնդրեք ձեր MCP client-ին ցուցակել ClimateNet սարքերը՝

```text
List online ClimateNet devices in Yerevan.
```

Այնուհետև հարցրեք մեկ սարք՝

```text
Get the latest ClimateNet reading for device 8.
```

Ճշգրիտ գործիքների անունների, պարամետրերի և արդյունքների կառուցվածքների համար օգտագործեք [Գործիքների հղումը](/hy/guide/tools)։
