export const manifestSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://sailor.auvexis.com/schemas/plugin-manifest.schema.json",
  title: "SailorPluginManifest",
  description: "Validates a Sailor plugin manifest.json file.",
  type: "object",
  required: ["metadata", "methods"],
  additionalProperties: false,
  properties: {
    metadata: {
      type: "object",
      required: ["id", "name", "description", "author", "category", "version"],
      additionalProperties: false,
      properties: {
        id: {
          type: "string",
          pattern: "^[a-z0-9]+(-[a-z0-9]+)*$",
        },
        name: { type: "string" },
        description: { type: "string" },
        icon: { type: "string" },
        iconLight: { type: "string" },
        iconDark: { type: "string" },
        category: { type: "string" },
        author: { type: "string" },
        version: {
          type: "string",
          pattern: "^\\d+\\.\\d+\\.\\d+$",
        },
        repository: { type: "string" },
        utility: { type: "boolean" },
        style: {
          type: "object",
          properties: {
            icon: { type: "string" },
            iconColor: { type: "string" },
            bgColor: { type: "string" },
            borderColor: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
    methods: {
      type: "object",
      minProperties: 1,
      additionalProperties: {
        $ref: "#/$defs/MethodDefinition",
      },
    },
    triggers: {
      type: "object",
      additionalProperties: {
        $ref: "#/$defs/TriggerDefinition",
      },
    },
  },
  $defs: {
    MethodDefinition: {
      type: "object",
      required: ["metadata", "parameters", "responseSchema"],
      additionalProperties: false,
      properties: {
        metadata: {
          type: "object",
          required: ["label", "description"],
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            description: { type: "string" },
          },
        },
        parameters: {
          $ref: "#/$defs/JSONSchemaObject",
        },
        responseSchema: {
          $ref: "#/$defs/JSONSchemaResponse",
        },
      },
    },
    TriggerDefinition: {
      type: "object",
      required: ["metadata"],
      additionalProperties: false,
      properties: {
        metadata: {
          type: "object",
          required: ["label", "description"],
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            description: { type: "string" },
          },
        },
        parameters: {
          $ref: "#/$defs/JSONSchemaObject",
        },
      },
    },
    JSONSchemaObject: {
      type: "object",
      required: ["type"],
      properties: {
        type: { const: "object" },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#/$defs/JSONSchemaProperty" },
        },
        required: {
          type: "array",
          items: { type: "string" },
        },
        additionalProperties: { type: "boolean" },
      },
    },
    JSONSchemaResponse: {
      type: "object",
      required: ["type"],
      additionalProperties: false,
      properties: {
        type: { enum: ["object", "array"] },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#/$defs/JSONSchemaProperty" },
        },
        required: {
          type: "array",
          items: { type: "string" },
        },
        items: { $ref: "#/$defs/JSONSchemaProperty" },
      },
    },
    JSONSchemaProperty: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: {
          anyOf: [
            { $ref: "#/$defs/JSONSchemaTypeName" },
            {
              type: "array",
              minItems: 1,
              items: { $ref: "#/$defs/JSONSchemaTypeName" },
            },
          ],
        },
        description: { type: "string" },
        default: {},
        enum: { type: "array" },
        format: { type: "string" },
        minimum: { type: "number" },
        maximum: { type: "number" },
        minLength: { type: "integer" },
        maxLength: { type: "integer" },
        pattern: { type: "string" },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#/$defs/JSONSchemaProperty" },
        },
        required: {
          type: "array",
          items: { type: "string" },
        },
        additionalProperties: {
          anyOf: [{ type: "boolean" }, { $ref: "#/$defs/JSONSchemaProperty" }],
        },
        items: { $ref: "#/$defs/JSONSchemaProperty" },
        minItems: { type: "integer" },
        maxItems: { type: "integer" },
        "x-input-type": {
          enum: [
            "text",
            "password",
            "number",
            "url",
            "email",
            "file",
            "files",
            "textarea",
            "select",
            "multiselect",
            "toggle",
            "datetime",
            "code",
            "json",
          ],
        },
        "x-label": { type: "string" },
        "x-sailor-icon": { type: "string" },
        "x-dynamic-options": {
          type: "object",
          required: ["method", "labelPath", "valuePath"],
          additionalProperties: false,
          properties: {
            method: { type: "string" },
            labelPath: { type: "string" },
            valuePath: { type: "string" },
            dependsOn: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        "x-visible-if": {
          type: "object",
          required: ["field", "operator", "value"],
          additionalProperties: false,
          properties: {
            field: { type: "string" },
            operator: {
              enum: ["equals", "not_equals", "in", "contains"],
            },
            value: {},
          },
        },
      },
    },
    JSONSchemaTypeName: {
      type: "string",
      enum: ["string", "number", "integer", "boolean", "object", "array", "null"],
    },
  },
} as const;
