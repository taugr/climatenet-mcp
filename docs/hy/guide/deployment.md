# Տեղակայում

`climatenet-mcp`-ն ունի երկու runtime adapter նույն MCP գործիքների շուրջ՝

- local Express սերվեր մշակման համար
- Cloudflare Worker՝ հյուրընկալված հեռակա MCP հասանելիության համար

Երկուսն էլ տրամադրում են Streamable HTTP MCP endpoint `/mcp` հասցեում։

## Production endpoint

Հյուրընկալված MCP սերվերը՝

```text
https://climatenet-mcp.tomauger.am/mcp
```

Օգտագործեք այս URL-ը remote MCP client-ներում։

## Local Express սերվեր

Գործարկեք Express սերվերը՝

```sh
pnpm dev
```

Լռելյայն endpoint-ը՝

```text
http://localhost:3000/mcp
```

Եթե port 3000-ն արդեն օգտագործվում է, ընտրեք այլ port՝

```sh
PORT=3030 pnpm dev
```

Այնուհետև smoke check-երը ուղղեք այդ port-ին՝

```sh
MCP_ENDPOINT=http://localhost:3030/mcp pnpm smoke
MCP_ENDPOINT=http://localhost:3030/mcp pnpm smoke:edge
```

## Local Cloudflare Worker

Գործարկեք Worker-ը local՝

```sh
pnpm dev:worker
```

Local Worker endpoint-ը՝

```text
http://localhost:8788/mcp
```

Ստուգեք՝

```sh
MCP_ENDPOINT=http://localhost:8788/mcp pnpm smoke
MCP_ENDPOINT=http://localhost:8788/mcp pnpm smoke:edge
```

## Deploy to Cloudflare

Տեղակայեք Wrangler-ով՝

```sh
pnpm deploy:worker
```

Worker-ի config-ը գտնվում է `wrangler.jsonc`-ում և օգտագործում է Cloudflare `agents/mcp` Streamable HTTP handler-ը։ Ներկայիս Worker-ը պահանջում է `nodejs_compat` compatibility flag, քանի որ Cloudflare `agents` package-ը import է անում Node built-ins։

## GitHub Pages docs

Փաստաթղթերի կայքը կազմաձևված է GitHub Pages-ի համար՝

```text
https://tom-auger.github.io/climatenet-mcp/
```

VitePress base path-ը՝

```text
/climatenet-mcp/
```
