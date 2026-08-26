import Type, { type Static } from "typebox";
import Compile from "typebox/compile";

const apiConfigSchema = Type.Object(
  {
    host: Type.String({ minLength: 1 }),
    port: Type.Integer({ minimum: 0, maximum: 65_535 }),
  },
  { additionalProperties: false },
);

export type ApiConfig = Static<typeof apiConfigSchema>;

const configValidator = Compile(apiConfigSchema);

export function parseApiConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ApiConfig {
  const rawPort = environment.API_PORT ?? "3001";
  const config = {
    host: environment.API_HOST ?? "127.0.0.1",
    port: Number(rawPort),
  };

  if (!configValidator.Check(config) || !/^\d+$/.test(rawPort)) {
    const issues = [...configValidator.Errors(config)]
      .map((issue) => issue.message)
      .join("; ");
    const details = issues || "API_PORT must be a base-10 integer";

    throw new Error(`Invalid API configuration: ${details}`);
  }

  return config;
}
