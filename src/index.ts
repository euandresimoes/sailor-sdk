import type { PluginManifest, SailorPlugin } from "./types.js";

export * from "./types.js";
export { manifestSchema } from "./manifest-schema.js";
export { validateManifest, type ManifestValidationResult } from "./validation.js";

export function defineManifest<const TManifest extends PluginManifest>(
  manifest: TManifest,
): TManifest {
  return manifest;
}

export function definePlugin<const TPlugin extends SailorPlugin>(plugin: TPlugin): TPlugin {
  return plugin;
}
