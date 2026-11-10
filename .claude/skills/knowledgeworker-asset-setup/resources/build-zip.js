import { createWriteStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pipeline } from "node:stream/promises";
import yazl from "yazl";

// Inspect the tree before opening output; missing builds must fail.
async function collect(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const name = prefix + entry.name;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push({ name: name + "/" });
      files.push(...await collect(path, name + "/"));
    } else if (entry.isFile()) {
      files.push({ name, path });
    } else {
      throw new Error(`Unsupported entry in dist (symlink or special file): ${name}`);
    }
  }
  return files;
}

const files = await collect(resolve("dist"));
const zip = new yazl.ZipFile();
// Keep output outside dist to avoid recursively archiving the ZIP itself.
const completed = pipeline(zip.outputStream, createWriteStream(resolve("asset.zip")));
zip.on("error", (error) => zip.outputStream.destroy(error));
for (const file of files) {
  if (file.path) zip.addFile(file.path, file.name, { compressionLevel: 9 });
  else zip.addEmptyDirectory(file.name);
}
zip.end();
await completed;
console.log("asset.zip created");
