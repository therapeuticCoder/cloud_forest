import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

const windowsDockerPath =
  "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe";
const dockerCommand =
  process.platform === "win32" && existsSync(windowsDockerPath)
    ? windowsDockerPath
    : "docker";
const currentPath = process.env.Path ?? process.env.PATH ?? "";
const dockerEnvironment =
  dockerCommand === windowsDockerPath
    ? {
        ...process.env,
        Path: `${dirname(windowsDockerPath)};${currentPath}`,
      }
    : process.env;

const result = spawnSync(dockerCommand, process.argv.slice(2), {
  env: dockerEnvironment,
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(`Docker could not start: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
