// thanks to Tsoding(Alexey Kutepov) for this proxy
function make_environment(env) {
  return new Proxy(env, {
    get(target, prop, receiver) {
      if (env[prop] !== undefined) {
        return env[prop].bind(env);
      }
      return (...args) => {
        throw new Error(`NOT IMPLEMENTED: ${prop} ${args}`);
      };
    },
  });
}

let wasm;
// getting Cstring length in memory
const str_len = (mem, str_ptr) => {
  let len = 0;
  while (mem[str_ptr] != 0) {
    len++;
    str_ptr++;
  }
  return len;
};

// getting a Cstring from wasm memory
const get_str = (str_ptr) => {
  const buffer = wasm.instance.exports.memory.buffer;
  const mem = new Uint8Array(buffer);
  const len = str_len(mem, str_ptr);
  const str_bytes = new Uint8Array(buffer, str_ptr, len);
  return new TextDecoder().decode(str_bytes);
};

// Instintiating webassembly
WebAssembly.instantiateStreaming(fetch("pixels.wasm"), {
  env: make_environment({
    writeImageToFileWasm: (img_ptr, str_ptr, num) => {
      const buffer = wasm.instance.exports.memory.buffer;
      const [img_array_ptr, x, y, comp] = new Uint32Array(buffer, img_ptr, 4);
      const img_array = new Uint8Array(buffer, img_array_ptr, 600 * 800 * 4);
      console.log(img_ptr, img_array_ptr, x, y, comp);
      console.log(img_array);
    },
  }),
}).then((w) => {
  wasm = w;
  const buffer = wasm.instance.exports.memory.buffer;
  const BUFF_SIZE = 600 * 800 * 4;
  const STR_SIZE = 255;

  // getting these functions from wasm
  const {
    empty_buffers,
    get_file_name_ptr,
    get_file_buffer_ptr,
    get_image_buffer_ptr,
    writeImageToMemory,
  } = w.instance.exports;

  // const pointers to arrays
  const file_buffer_ptr = get_file_buffer_ptr();
  const image__buffer_ptr = get_image_buffer_ptr();
  const file_name_ptr = get_file_name_ptr();

  writeImageToMemory(file_buffer_ptr, BUFF_SIZE, 0);
  console.log(new Uint8Array(buffer, file_buffer_ptr, 600 * 800 * 4));
  empty_buffers();
  console.log(new Uint8Array(buffer, file_buffer_ptr, 600 * 800 * 4));
});
