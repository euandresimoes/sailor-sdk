export type PluginAuthType = "oauth2" | "api_key" | "none";

export interface CredentialField {
  type: "string" | "number" | "boolean";
  inputType: "text" | "password" | "number" | "textarea" | "url" | "email";
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
}

export type CredentialSchema = Record<string, CredentialField>;

export interface OAuth2Tokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  raw?: Record<string, unknown>;
}

export interface OAuth2Provider {
  type: "oauth2";
  credentialSchema: CredentialSchema;
  scopes: string[];
  ui?: {
    oauthCallbackInstructions?: string;
    buttonText?: string;
    buttonIcon?: string;
  };
  getAuthUrl(credentials: Record<string, string>, redirectUri: string): string | Promise<string>;
  exchangeCode(
    code: string,
    credentials: Record<string, string>,
    redirectUri: string,
  ): Promise<OAuth2Tokens>;
  testConnection?(tokens: OAuth2Tokens, credentials: Record<string, string>): Promise<boolean>;
  revokeTokens?(tokens: OAuth2Tokens, credentials: Record<string, string>): Promise<void>;
  refreshTokens?(tokens: OAuth2Tokens, credentials: Record<string, string>): Promise<OAuth2Tokens>;
}

export interface ApiKeyProvider {
  type: "api_key";
  credentialSchema: CredentialSchema;
  testConnection?(credentials: Record<string, string>): Promise<boolean>;
}

export interface NoAuthProvider {
  type: "none";
  credentialSchema?: CredentialSchema;
}

export type CredentialProvider = OAuth2Provider | ApiKeyProvider | NoAuthProvider;

export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  author: string;
  version: string;
  repository?: string;
  utility?: boolean;
  style?: {
    icon?: string;
    iconColor?: string;
    bgColor?: string;
    borderColor?: string;
  };
}

export interface DynamicOptionsConfig {
  method: string;
  labelPath: string;
  valuePath: string;
  dependsOn?: string[];
}

export interface VisibleIfConfig {
  field: string;
  operator: "equals" | "not_equals" | "in" | "contains";
  value: unknown;
}

export type JSONSchemaTypeName =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface JSONSchemaProperty {
  type?: JSONSchemaTypeName | JSONSchemaTypeName[];
  description?: string;
  default?: unknown;
  enum?: unknown[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | JSONSchemaProperty;
  items?: JSONSchemaProperty;
  minItems?: number;
  maxItems?: number;
  "x-input-type"?:
    | "text"
    | "password"
    | "number"
    | "url"
    | "email"
    | "file"
    | "files"
    | "textarea"
    | "select"
    | "multiselect"
    | "toggle"
    | "datetime"
    | "code"
    | "json";
  "x-label"?: string;
  "x-sailor-display"?: "file" | "folder" | "media" | "text" | "generic";
  "x-sailor-icon"?: string;
  "x-dynamic-options"?: DynamicOptionsConfig;
  "x-visible-if"?: VisibleIfConfig;
}

export interface JSONSchemaObject {
  type: "object";
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface JSONSchemaResponse {
  type: "object" | "array";
  "x-sailor-display"?: "file" | "folder" | "media" | "text" | "generic";
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  items?: JSONSchemaProperty & {
    type?: JSONSchemaTypeName | JSONSchemaTypeName[];
    properties?: Record<string, JSONSchemaProperty>;
  };
}

export interface PluginMethodUI {
  component: "table" | "card" | "text" | "generic";
  download?: {
    field: string;
    fileName: string;
    mimeType: string;
  };
  actions?: Array<{
    label: string;
    action: string;
    parameters: Record<string, string>;
    visibleIf?: {
      field: string;
      equals: unknown;
    };
  }>;
}

export interface PluginMethodManifest {
  metadata: {
    label: string;
    description: string;
  };
  parameters: JSONSchemaObject;
  responseSchema: JSONSchemaResponse;
  ui: PluginMethodUI;
}

export interface PluginTriggerManifest {
  metadata: {
    label: string;
    description: string;
  };
  parameters?: JSONSchemaObject;
}

export interface PluginManifest {
  metadata: PluginMetadata;
  methods: Record<string, PluginMethodManifest>;
  triggers?: Record<string, PluginTriggerManifest>;
}

export interface PluginContext {
  credentials: Record<string, string>;
  tokens?: OAuth2Tokens;
}

export interface TriggerRegistrationContext {
  webhookUrl: string;
  credentials: Record<string, string>;
  tokens?: OAuth2Tokens;
  params: Record<string, unknown>;
  workflowId: string;
}

export interface PluginTriggerHooks {
  setup(context: TriggerRegistrationContext): Promise<void>;
  teardown(context: TriggerRegistrationContext): Promise<void>;
}

export interface PluginExecutionLifecycle {
  onExecutionEnd?(
    executionId: string,
    status: "success" | "failed" | "cancelled",
  ): Promise<void>;
}

export interface SailorPlugin {
  id: string;
  manifest: PluginManifest;
  auth: CredentialProvider;
  methods: Record<string, (params: any, context?: PluginContext) => Promise<any>>;
  triggers?: Record<string, PluginTriggerHooks>;
  executionLifecycle?: PluginExecutionLifecycle;
}

export type PluginStatus = "not_configured" | "configured" | "connected" | "error";

export interface PluginStatusResponse {
  status: PluginStatus;
  auth_type: PluginAuthType;
  credential_schema: CredentialSchema | null;
  credentials: Record<string, string> | null;
  oauth_ui?: {
    oauthCallbackInstructions?: string;
    buttonText?: string;
    buttonIcon?: string;
  };
  oauth_redirect_uri?: string;
  error?: string;
}
