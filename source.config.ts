import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export default defineConfig({});

export const { docs, meta } = defineDocs({
  dir: 'content/docs',
});