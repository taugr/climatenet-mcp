# Փլագին

Claude Code-ի և Cowork-ի օգտատերերի համար այս նախագիծը նաև տրամադրվում է որպես տեղադրվող փլագին, որը MCP սերվերի կապը միացնում է skill-ի հետ, որն օգնում է Claude-ին արդյունավետ շղթայել գործիքները։

## Ի՞նչ է ներառված

| Բաղադրիչ                   | Նպատակ                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| MCP Server (`climatenet`)  | HTTP կապ `https://climatenet-mcp.tomauger.am/mcp` հասցեին                                                                |
| Skill (`climatenet-query`) | Ուղղորդում է Claude-ին սարքերի հայտնաբերման, վերջին չափումների, պատմական միտումների և կայանների համեմատությունների միջով |

Փլագինը read-only է և API key չի պահանջում։

## Claude Code

Տեղադրեք public marketplace-ից՝

```sh
/plugin marketplace add taugr/claude-marketplace
/plugin install climatenet@taugr
```

Ստուգեք `/plugin list` և `/mcp` հրամաններով։

## Cowork

Cowork-ը գտնվում է Claude Desktop հավելվածում՝ **Cowork** ներդիրի տակ։

1. Ներբեռնեք `climatenet.plugin`-ը [վերջին թողարկումից](https://github.com/taugr/climatenet-mcp/releases/latest)
2. Բացեք Claude Desktop-ը և անցեք **Cowork** ներդիր
3. Ձախ sidebar-ում սեղմեք **Customize**
4. Սեղմեք **Browse plugins**, ապա ընտրեք **upload a custom plugin file**
5. Ընտրեք ներբեռնած `climatenet.plugin` ֆայլը

Փլագինը պահվում է ձեր մեքենայում։ Skill-ը և MCP սերվերը հասանելի են դառնում անմիջապես։

## Փորձեք

Տեղադրելուց հետո հարցրեք բնական լեզվով՝

> List active ClimateNet devices in Yerevan and show me the latest PM2.5 reading from one of them.

> Compare PM10 levels between three monitoring stations over the past 24 hours.

> Which ClimateNet sensors are currently reporting issues?

`climatenet-query` skill-ը ակտիվանում է ClimateNet-ի, Հայաստանի օդի որակի, բնապահպանական մոնիթորինգի, սենսորային չափումների և նման արտահայտությունների մասին հարցերի դեպքում։ Գործիքների ամբողջական ցանկի համար տեսեք [Գործիքների հղումը](/hy/guide/tools)։

## Առանց փլագինի

Եթե ուզում եք միայն MCP սերվերը՝ առանց skill-ի, տեսեք [Սկիզբ](/hy/guide/getting-started) էջը raw connector setup-ի համար, որն աշխատում է Codex-ի, Claude Desktop-ի և ցանկացած այլ Streamable HTTP MCP client-ի հետ։
