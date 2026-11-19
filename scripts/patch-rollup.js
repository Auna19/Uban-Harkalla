import fs from 'fs';
import path from 'path';

const nativeJsPath = path.resolve('node_modules/rollup/dist/native.js');
if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (!content.includes("@rollup/wasm-node")) {
    content = content.replace(
      "if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {\n\t\t\tthrow error;\n\t\t}",
      "if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {\n\t\t\ttry { return require('@rollup/wasm-node'); } catch(_) {}\n\t\t\tthrow error;\n\t\t}"
    );
    fs.writeFileSync(nativeJsPath, content, 'utf8');
    console.log('Patched rollup native.js for WASM fallback.');
  }
}
