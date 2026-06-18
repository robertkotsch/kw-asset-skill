import { createWriteStream } from "fs";
import { resolve } from "path";
import archiver from "archiver";

// Output to root to avoid recursive zipping of dist/ folder
const output = createWriteStream(resolve("asset.zip"));
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`asset.zip created (${archive.pointer()} bytes)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);
archive.directory("dist/", false);
archive.finalize();
