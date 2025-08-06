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
const fileInput = document.getElementById("file");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const textArea = document.getElementById("text");
const showCanvasBtn = document.getElementById("show-canvas");
const showDetailsBtn = document.getElementById("show-details");
// const printableExtensions = ["c", "html", "txt", "java", "json", "svg"];
const width = 800;
const height = 600;
textArea.style.width = width + "px";
textArea.style.height = height + "px";

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
    printf: (str_ptr, args_ptrs) => {
      const buffer = wasm.instance.exports.memory.buffer;
      const str = get_str(str_ptr);
      let args = [];
      let argsIndex = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === "%") {
          switch (str[i + 1]) {
            case "f":
              args.push(new Float64Array(buffer, args_ptrs + argsIndex, 1)[0]);
              argsIndex += 8;
              break;
            case "d":
              args.push(new Int32Array(buffer, args_ptrs + argsIndex, 1)[0]);
              argsIndex += 4;
              break;
            case "u":
              args.push(new Uint32Array(buffer, args_ptrs + argsIndex, 1)[0]);
              argsIndex += 4;
              break;
            case "s":
              const str_ptr = new Uint32Array(
                buffer,
                args_ptrs + argsIndex,
                1
              )[0];
              args.push(get_str(str_ptr));
              argsIndex += 4;
              break;
            case "i":
              args.push(new Int32Array(buffer, args_ptrs + argsIndex, 1)[0]);
              argsIndex += 4;
              break;
          }
        }
      }
      console.log(str, args);
      // console.log(get_str(args_ptrs), new Uint32Array(buffer, args_ptrs, 1));
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
    writeImageFromFIleToMemory,
  } = w.instance.exports;

  // const pointers to arrays
  const file_buffer_ptr = get_file_buffer_ptr();
  const image__buffer_ptr = get_image_buffer_ptr();
  const file_name_ptr = get_file_name_ptr();
  fileInput.addEventListener("change", (event) => {
    // get file from input
    let file = event.target.files[0];
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(file.name);
    const wasmMemoryView = new Uint8Array(buffer);
    wasmMemoryView.set(uint8Array, file_name_ptr);
    console.log(get_str(file_name_ptr), file.size);
    writeImageFromFIleToMemory(file.size);
    console.log(new Uint8Array(buffer, file_buffer_ptr, 500));
  });
  //const file_buffer = new Uint8Array(buffer, file_buffer_ptr, BUFF_SIZE);
  //const image_buffer = new Uint8Array(buffer, image__buffer_ptr, BUFF_SIZE);
  // empty_buffers();
  console.log(file_name_ptr);
  console.log(buffer);
  // console.log(get_str(file_name_ptr));
});
