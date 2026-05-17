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
    },
  },
} as const;

describe("SDK plugin contracts", () => {
  it("returns the same typed manifest from defineManifest", () => {
    const manifest = defineManifest(validManifest);

    expect(manifest.metadata.id).toBe("external-demo");
    expect(manifest.methods.ping.responseSchema.type).toBe("object");
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

  it("accepts plugin methods with specific parameter types", async () => {
    const methods = {
      async ping(params: { message: string }) {
        return { echo: params.message };
      },
    };

    const plugin: SailorPlugin = {
      id: "external-demo",
      manifest: validManifest,
      auth: { type: "none" },
      methods,
    };

    await expect(plugin.methods.ping({ message: "hello" })).resolves.toEqual({ echo: "hello" });
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
  });

  it("rejects legacy method ui metadata", () => {
    const result = validateManifest({
      ...validManifest,
      methods: {
        ping: {
          ...validManifest.methods.ping,
          ui: {
            component: "card",
            actions: [],
          },
        },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("methods.ping must NOT have additional property 'ui'");
  });

  it("rejects legacy x-sailor-display response metadata", () => {
    const result = validateManifest({
      ...validManifest,
      methods: {
        ping: {
          ...validManifest.methods.ping,
          responseSchema: {
            type: "object",
            "x-sailor-display": "generic",
          },
        },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("methods.ping.responseSchema must NOT have additional property 'x-sailor-display'");
  });
});
