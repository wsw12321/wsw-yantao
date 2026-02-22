// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';  // ← 新增这行

// https://astro.build/config
export default defineConfig({
  output: 'server',                // ← 新增：启用服务端渲染
  adapter: cloudflare({            // ← 新增：使用 Cloudflare 适配器
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [mdx()]           // ← 保留你原有的 MDX
});