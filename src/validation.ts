import AjvModule, { type ErrorObject } from "ajv";
import addFormatsModule from "ajv-formats";
import { manifestSchema } from "./manifest-schema.js";
import type { PluginManifest } from "./types.js";

export type ManifestValidationResult =
  | {
      valid: true;
      manifest: PluginManifest;
      errors: [];
    }
  | {
      valid: false;
      manifest: null;
      errors: string[];
    };

const AjvCtor = AjvModule as unknown as {
  new (options?: Record<string, unknown>): InstanceType<any>;
};
const addFormats = addFormatsModule as unknown as (ajv: InstanceType<any>) => void;

const ajv = new AjvCtor({
  allErrors: true,
  strict: false,
});

addFormats(ajv);

const validate = ajv.compile(manifestSchema);

function formatPath(error: ErrorObject): string {
  const instancePath = error.instancePath.replace(/^\//, "").replace(/\//g, ".");

  if (error.keyword === "required" && typeof error.params.missingProperty === "string") {
    return instancePath ? `${instancePath}` : "root";
  }

  return instancePath || "root";
}

function formatError(error: ErrorObject): string {
  const path = formatPath(error);

  if (error.keyword === "required" && typeof error.params.missingProperty === "string") {
    return `${path} must have required property '${error.params.missingProperty}'`;
  }

  if (error.keyword === "pattern" && typeof error.params.pattern === "string") {
    return `${path} must match pattern ${error.params.pattern}`;
  }

  if (error.keyword === "const") {
    return `${path} must be equal to one of the allowed values`;
  }

  if (
    error.keyword === "additionalProperties" &&
    typeof error.params.additionalProperty === "string"
  ) {
    return `${path} must NOT have additional property '${error.params.additionalProperty}'`;
  }

  return `${path} ${error.message ?? "is invalid"}`;
}

export function validateManifest(manifest: unknown): ManifestValidationResult {
  if (validate(manifest)) {
    return {
      valid: true,
      manifest: manifest as PluginManifest,
      errors: [],
    };
  }

  return {
    valid: false,
    manifest: null,
    errors: (validate.errors ?? []).map(formatError),
  };
}
