import { spawn } from "node:child_process";
import { watch } from "node:fs";

const schemaPath = "lib/db/schema.ts";
let pushing = false;
let queued = false;
let timer;

function push() {
  if (pushing) {
    queued = true;
    return;
  }

  pushing = true;
  const child = spawn("npm run db:push", { shell: true, stdio: "inherit" });

  child.on("exit", () => {
    pushing = false;
    if (queued) {
      queued = false;
      push();
    }
  });
}

push();

watch(schemaPath, () => {
  clearTimeout(timer);
  timer = setTimeout(push, 300);
});

console.log(`Watching ${schemaPath}; pushing schema changes to DB.`);
