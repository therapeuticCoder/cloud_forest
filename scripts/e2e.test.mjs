import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  prepareE2eBoundary,
  runBrowserSuite,
  runE2e,
  terminateProcessTree,
} from "./e2e.mjs";

test("E2E preparation calls only the guarded test database commands", () => {
  const commands = [];

  prepareE2eBoundary((command) => commands.push(command));

  assert.deepEqual(commands, [
    "db:test:prepare",
    "db:migrate:test",
    "db:status:test",
    "db:inspect:test",
  ]);
});

test("E2E preparation stops immediately when a child command fails", () => {
  const commands = [];

  assert.throws(
    () =>
      prepareE2eBoundary((command) => {
        commands.push(command);
        if (command === "db:migrate:test") {
          throw new Error("fictional migration failure");
        }
      }),
    /fictional migration failure/,
  );

  assert.deepEqual(commands, ["db:test:prepare", "db:migrate:test"]);
});

function createChildProcess() {
  const child = new EventEmitter();
  child.pid = 42;
  child.killedWith = [];
  child.kill = (signal) => child.killedWith.push(signal);
  return child;
}

test("E2E runs the browser only after every guarded database command", async () => {
  const events = [];

  await runE2e({
    runCommand: (command) => events.push(command),
    browserSuiteOptions: {
      spawnProcess: () => {
        events.push("browser");
        const child = createChildProcess();
        queueMicrotask(() => child.emit("exit", 0, null));
        return child;
      },
      signals: new EventEmitter(),
    },
  });

  assert.deepEqual(events, [
    "db:test:prepare",
    "db:migrate:test",
    "db:status:test",
    "db:inspect:test",
    "browser",
  ]);
});

test("browser runner receives the current isolated environment and arguments", async () => {
  const environment = {
    TEST_DATABASE_URL: "postgresql://test:test@localhost/cloud_forest_test",
  };
  let invocation;

  await runBrowserSuite({
    arguments_: ["--", "--update-snapshots"],
    environment,
    spawnProcess: (command, arguments_, options) => {
      invocation = { command, arguments_, options };
      const child = createChildProcess();
      queueMicrotask(() => child.emit("exit", 0, null));
      return child;
    },
    signals: new EventEmitter(),
  });

  assert.equal(invocation.command, process.execPath);
  assert.deepEqual(invocation.arguments_.slice(-2), [
    "test",
    "--update-snapshots",
  ]);
  assert.equal(invocation.arguments_.includes("--"), false);
  assert.equal(invocation.options.env, environment);
  assert.equal(invocation.options.shell, false);
  assert.equal(invocation.options.detached, false);
});

test("browser failure is reported with its exit code", async () => {
  await assert.rejects(
    runBrowserSuite({
      spawnProcess: () => {
        const child = createChildProcess();
        queueMicrotask(() => child.emit("exit", 7, null));
        return child;
      },
      signals: new EventEmitter(),
    }),
    /exited with code 7/,
  );
});

test("interruptions terminate the runner tree and a second signal forces it", async () => {
  const signals = new EventEmitter();
  const child = createChildProcess();
  const terminations = [];
  const completion = runBrowserSuite({
    spawnProcess: () => child,
    signals,
    terminateTree: (_child, signal) => terminations.push(signal),
  });

  signals.emit("SIGINT");
  signals.emit("SIGTERM");
  child.emit("exit", null, "SIGINT");

  await assert.rejects(completion, /exited with signal SIGINT/);
  assert.deepEqual(terminations, ["SIGINT", "SIGKILL"]);
  assert.equal(signals.listenerCount("SIGINT"), 0);
  assert.equal(signals.listenerCount("SIGTERM"), 0);
});

test("browser timeout terminates the complete runner tree", async () => {
  const child = createChildProcess();
  const terminations = [];
  const completion = runBrowserSuite({
    browserTimeoutMilliseconds: 1,
    spawnProcess: () => child,
    signals: new EventEmitter(),
    terminateTree: (_child, signal) => {
      terminations.push(signal);
      child.emit("exit", null, signal);
    },
  });

  await assert.rejects(completion, /exited with signal SIGKILL/);
  assert.deepEqual(terminations, ["SIGKILL"]);
});

test("Windows process cleanup targets the runner PID and descendants", () => {
  let invocation;
  const child = createChildProcess();

  terminateProcessTree(
    child,
    "SIGINT",
    (command, arguments_, options) => {
      invocation = { command, arguments_, options };
    },
    "win32",
  );

  assert.deepEqual(invocation, {
    command: "taskkill",
    arguments_: ["/PID", "42", "/T", "/F"],
    options: { stdio: "inherit", windowsHide: true },
  });
  assert.deepEqual(child.killedWith, []);
});

test("POSIX runner owns and terminates a dedicated process group", async () => {
  const child = createChildProcess();
  let invocation;

  await runBrowserSuite({
    platform: "linux",
    spawnProcess: (command, arguments_, options) => {
      invocation = { command, arguments_, options };
      queueMicrotask(() => child.emit("exit", 0, null));
      return child;
    },
    signals: new EventEmitter(),
  });

  assert.equal(invocation.options.detached, true);

  let killedGroup;
  terminateProcessTree(
    child,
    "SIGKILL",
    () => assert.fail("taskkill must not run on POSIX"),
    "linux",
    (processId, signal) => {
      killedGroup = { processId, signal };
    },
  );

  assert.deepEqual(killedGroup, { processId: -42, signal: "SIGKILL" });
  assert.deepEqual(child.killedWith, []);
});
