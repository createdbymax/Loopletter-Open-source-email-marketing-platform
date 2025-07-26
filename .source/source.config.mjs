// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var source_config_default = defineConfig({});
var { docs, meta } = defineDocs({
  dir: "content/docs"
});
export {
  source_config_default as default,
  docs,
  meta
};
