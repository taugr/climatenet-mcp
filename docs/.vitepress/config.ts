import { defineConfig } from "vitepress";
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons";
import llmstxt from "vitepress-plugin-llms";
import pkg from "../../package.json";

type VitePlugins = NonNullable<NonNullable<Parameters<typeof defineConfig>[0]["vite"]>["plugins"]>;

const siteUrl = "https://tom-auger.github.io/climatenet-mcp/";
const description =
  "MCP server for querying ClimateNet environmental monitoring data from Armenia.";

export default defineConfig({
  title: "climatenet-mcp",
  description,
  base: "/climatenet-mcp/",
  sitemap: {
    hostname: siteUrl,
  },
  cleanUrls: true,
  head: [
    ["link", { rel: "icon", href: "/climatenet-mcp/favicon.ico", sizes: "any" }],
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/climatenet-mcp/favicon.svg",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/climatenet-mcp/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        href: "/climatenet-mcp/favicon-48x48.png",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/climatenet-mcp/apple-touch-icon.png",
      },
    ],
    ["link", { rel: "canonical", href: siteUrl }],
    ["meta", { name: "description", content: description }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "climatenet,armenia,environmental data,air quality,weather,mcp,model context protocol",
      },
    ],
    ["meta", { name: "author", content: "Tom Auger" }],
    ["meta", { name: "robots", content: "index,follow" }],
    ["meta", { property: "og:title", content: "climatenet-mcp" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: siteUrl }],
    ["meta", { property: "og:image", content: `${siteUrl}logo.svg` }],
    ["meta", { name: "twitter:card", content: "summary" }],
    ["meta", { name: "twitter:title", content: "climatenet-mcp" }],
    ["meta", { name: "twitter:description", content: description }],
    ["meta", { name: "twitter:image", content: `${siteUrl}logo.svg` }],
    ["meta", { name: "theme-color", content: "#2e8b57" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    search: {
      provider: "local",
    },
    nav: [
      {
        text: "Guide",
        items: [
          { text: "Overview", link: "/guide/" },
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Plugin", link: "/guide/plugin" },
          { text: "Deployment", link: "/guide/deployment" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Tool Reference", link: "/guide/tools" },
          { text: "Development", link: "/guide/development" },
        ],
      },
      {
        text: `v${pkg.version}`,
        items: [
          {
            text: `Package v${pkg.version}`,
            link: "https://github.com/tom-auger/climatenet-mcp",
          },
          {
            text: "MCP Endpoint",
            link: "https://climatenet-mcp.tomauger.am/mcp",
          },
          {
            text: "Contributing",
            link: "https://github.com/tom-auger/climatenet-mcp/blob/main/CONTRIBUTING.md",
          },
        ],
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            { text: "What Is climatenet-mcp?", link: "/guide/" },
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Plugin", link: "/guide/plugin" },
          ],
        },
        {
          text: "Reference",
          collapsed: false,
          items: [{ text: "Tool Reference", link: "/guide/tools" }],
        },
        {
          text: "Operations",
          collapsed: false,
          items: [
            { text: "Deployment", link: "/guide/deployment" },
            { text: "Development", link: "/guide/development" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/tom-auger/climatenet-mcp" }],
    footer: {
      message:
        "Released under the MIT License. climatenet-mcp is not affiliated with, endorsed by, or maintained by ClimateNet.",
      copyright: "Copyright © 2026 Tom Auger",
    },
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin(), llmstxt()] as unknown as VitePlugins,
  },
});
