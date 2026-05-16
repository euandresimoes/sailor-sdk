# @sailor/sdk

TypeScript SDK for building external Sailor plugins.

## Install

```bash
npm install @sailor/sdk
```

## Minimal plugin

```ts
import { defineManifest, definePlugin } from "@sailor/sdk";

const manifest = defineManifest({
  metadata: {
    id: "my-plugin",
    name: "My Plugin",
    description: "Small external plugin",
    icon: "plug",
    category: "Utilities",
    author: "Acme",
    version: "1.0.0",
    repository: "https://github.com/acme/my-plugin",
  },
  methods: {
    ping: {
      metadata: {
        label: "Ping",
        description: "Returns pong",
      },
      parameters: {
        type: "object",
        properties: {},
      },
      responseSchema: {
        type: "object",
      },
      ui: {
        component: "card",
      },
    },
  },
});

export default definePlugin({
  id: "my-plugin",
  manifest,
  auth: { type: "none" },
  methods: {
    async ping() {
      return { pong: true };
    },
  },
});
```

## Validate a manifest

```ts
import { validateManifest } from "@sailor/sdk";

const result = validateManifest(manifest);

if (!result.valid) {
  console.error(result.errors);
}
```

## Exports

- `defineManifest`
- `definePlugin`
- `validateManifest`
- `manifestSchema`
- Sailor plugin, auth, method, trigger and JSON schema types

## Publish

```bash
npm login
npm publish --access public
```
