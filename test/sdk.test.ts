import { describe, expect, it } from "vitest";
import {
  defineManifest,
  definePlugin,
  validateManifest,
  type SailorPlugin,
} from "../src/index.js";

const validManifest = {
  metadata: {
    id: "external-demo",
    name: "External Demo",
    description: "Demo plugin",
    icon: "plug",
    category: "Utilities",
    author: "Sailor",
    version: "1.0.0",
    repository: "https://github.com/example/external-demo",
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
} as const;

describe("SDK plugin contracts", () => {
  it("returns the same typed manifest from defineManifest", () => {
    const manifest = defineManifest(validManifest);

    expect(manifest.metadata.id).toBe("external-demo");
    expect(manifest.methods.ping.ui.component).toBe("card");
  });

  it("returns the same typed plugin from definePlugin", async () => {
    const plugin = definePlugin({
      id: "external-demo",
      manifest: validManifest,
      auth: { type: "none" },
      methods: {
        async ping() {
          return { pong: true };
        },
      },
    });

    const typedPlugin: SailorPlugin = plugin;
    await expect(typedPlugin.methods.ping({})).resolves.toEqual({ pong: true });
  });
});

describe("manifest validation", () => {
  it("accepts a valid Sailor manifest", () => {
    const result = validateManifest(validManifest);

    expect(result.valid).toBe(true);
    expect(result.manifest).toEqual(validManifest);
    expect(result.errors).toEqual([]);
  });

  it("rejects invalid manifest identity and method shape with readable paths", () => {
    const result = validateManifest({
      metadata: {
        id: "Bad Id",
        name: "Bad",
        description: "Bad plugin",
        category: "Utilities",
        author: "Sailor",
        version: "1",
      },
      methods: {
        ping: {
          metadata: {
            label: "Ping",
          },
          parameters: {
            type: "string",
          },
          responseSchema: {},
          ui: {},
        },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.manifest).toBeNull();
    expect(result.errors).toContain("metadata.id must match pattern ^[a-z0-9]+(-[a-z0-9]+)*$");
    expect(result.errors).toContain("metadata.version must match pattern ^\\d+\\.\\d+\\.\\d+$");
    expect(result.errors).toContain("methods.ping.metadata must have required property 'description'");
    expect(result.errors).toContain("methods.ping.parameters.type must be equal to one of the allowed values");
    expect(result.errors).toContain("methods.ping.responseSchema must have required property 'type'");
    expect(result.errors).toContain("methods.ping.ui must have required property 'component'");
  });
});
