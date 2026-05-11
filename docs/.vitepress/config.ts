import { defineConfig } from "vitepress";
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons";
import llmstxt from "vitepress-plugin-llms";
import pkg from "../../package.json";

type VitePlugins = NonNullable<NonNullable<Parameters<typeof defineConfig>[0]["vite"]>["plugins"]>;

const siteUrl = "https://tom-auger.github.io/climatenet-mcp/";
const description =
  "MCP server for querying ClimateNet environmental monitoring data from Armenia.";
const armenianDescription =
  "MCP սերվեր Հայաստանի ClimateNet բնապահպանական մոնիթորինգի տվյալները հարցնելու համար։";

const versionNav = {
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
};

const englishNav = [
  { text: "Live Map", link: "/air-quality-map" },
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
  versionNav,
];

const armenianNav = [
  { text: "Կենդանի քարտեզ", link: "/hy/air-quality-map" },
  {
    text: "Ուղեցույց",
    items: [
      { text: "Ընդհանուր ակնարկ", link: "/hy/guide/" },
      { text: "Սկիզբ", link: "/hy/guide/getting-started" },
      { text: "Փլագին", link: "/hy/guide/plugin" },
      { text: "Տեղակայում", link: "/hy/guide/deployment" },
    ],
  },
  {
    text: "Հղում",
    items: [
      { text: "Գործիքների հղում", link: "/hy/guide/tools" },
      { text: "Մշակում", link: "/hy/guide/development" },
    ],
  },
  versionNav,
];

const englishSidebar = {
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
};

const armenianSidebar = {
  "/hy/guide/": [
    {
      text: "Ներածություն",
      collapsed: false,
      items: [
        { text: "Ի՞նչ է climatenet-mcp-ն", link: "/hy/guide/" },
        { text: "Սկիզբ", link: "/hy/guide/getting-started" },
        { text: "Փլագին", link: "/hy/guide/plugin" },
      ],
    },
    {
      text: "Հղում",
      collapsed: false,
      items: [{ text: "Գործիքների հղում", link: "/hy/guide/tools" }],
    },
    {
      text: "Գործարկում",
      collapsed: false,
      items: [
        { text: "Տեղակայում", link: "/hy/guide/deployment" },
        { text: "Մշակում", link: "/hy/guide/development" },
      ],
    },
  ],
};

const socialLinks = [{ icon: "github", link: "https://github.com/tom-auger/climatenet-mcp" }];

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
    nav: englishNav,
    sidebar: englishSidebar,
    socialLinks,
    footer: {
      message:
        "Released under the MIT License. climatenet-mcp is not affiliated with, endorsed by, or maintained by ClimateNet.",
      copyright: "Copyright © 2026 Tom Auger",
    },
  },
  locales: {
    root: {
      label: "English",
      lang: "en-US",
    },
    hy: {
      label: "Հայերեն",
      lang: "hy-AM",
      link: "/hy/",
      title: "climatenet-mcp",
      description: armenianDescription,
      themeConfig: {
        nav: armenianNav,
        sidebar: armenianSidebar,
        socialLinks,
        docFooter: {
          prev: "Նախորդ էջը",
          next: "Հաջորդ էջը",
        },
        outline: {
          label: "Այս էջում",
        },
        lastUpdated: {
          text: "Վերջին թարմացում",
        },
        langMenuLabel: "Փոխել լեզուն",
        returnToTopLabel: "Վերադառնալ վերև",
        sidebarMenuLabel: "Մենյու",
        darkModeSwitchLabel: "Մուգ ռեժիմ",
        lightModeSwitchTitle: "Անցնել լուսավոր ռեժիմի",
        darkModeSwitchTitle: "Անցնել մուգ ռեժիմի",
        footer: {
          message:
            "Թողարկված է MIT լիցենզիայով։ climatenet-mcp-ն կապ չունի ClimateNet-ի հետ, հաստատված չէ նրա կողմից և չի սպասարկվում նրա կողմից։",
          copyright: "Copyright © 2026 Tom Auger",
        },
      },
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
