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
      let f_str = "";
      let args = [];
      let argsIndex = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === "%") {
          switch (str[i + 1]) {
            case "f":
              let float = new Float64Array(buffer, args_ptrs + argsIndex, 1)[0];
              args.push(float);
              f_str += float;
              argsIndex += 8;
              i += 2;
              break;
            case "d":
              let int = new Int32Array(buffer, args_ptrs + argsIndex, 1)[0];
              args.push(int);
              f_str += int;
              argsIndex += 4;
              i += 2;
              break;
            case "u":
              let uint = new Uint32Array(buffer, args_ptrs + argsIndex, 1)[0];
              args.push(uint);
              f_str += uint;
              argsIndex += 4;
              i += 2;
              break;
            case "s":
              const str_ptr = new Uint32Array(
                buffer,
                args_ptrs + argsIndex,
                1
              )[0];
              let str = get_str(str_ptr);
              args.push(str);
              f_str += str;
              argsIndex += 4;
              i += 2;
              break;
            case "i":
              let iint = new Int32Array(buffer, args_ptrs + argsIndex, 1)[0];
              args.push(iint);
              f_str += iint;
              argsIndex += 4;
              i += 2;
              break;
          }
        }
        if (str[i] != undefined) f_str += str[i];
      }
      console.log(f_str);
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
  const image_buffer_ptr = get_image_buffer_ptr();
  const file_name_ptr = get_file_name_ptr();
  fileInput.addEventListener("change", (event) => {
    // get file from input
    let file = event.target.files[0];
    if (file) {
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(file.name);
      const wasmMemoryView = new Uint8Array(buffer);
      wasmMemoryView.set(uint8Array, file_name_ptr);
      let reader = new FileReader();
      // reader loaded successfully
      reader.onload = (e) => {
        result = e.target.result;
        const resultBytes = new Uint8Array(result);
        console.log(resultBytes);
        wasmMemoryView.set(resultBytes, file_buffer_ptr);
        writeImageFromFIleToMemory(file.size);
        console.log(new Uint8Array(buffer, image_buffer_ptr, BUFF_SIZE));
        createCanvas(new Uint8Array(buffer, image_buffer_ptr, BUFF_SIZE));
        // Download button onclick
        document.getElementById("dwn").onclick = () => {
          pngData = UPNG.encode(
            [new Uint8Array(buffer, image_buffer_ptr, BUFF_SIZE)],
            width,
            height,
            0
          );

          var blob = new Blob([pngData]);
          const url = URL.createObjectURL(blob);
          // Trigger download
          const link = document.createElement("a");
          link.href = url;
          link.download = "output." + "png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        };
        /* check if file is bigger than ~ 1.9mb -> 800*600*4
         minus 40bytes for extension and length */
      };
      reader.onerror = (e) => {
        console.log("Error : " + e.type);
      };
      reader.readAsArrayBuffer(file);
    }
  });
  //const file_buffer = new Uint8Array(buffer, file_buffer_ptr, BUFF_SIZE);
  //const image_buffer = new Uint8Array(buffer, image__buffer_ptr, BUFF_SIZE);
  // empty_buffers();
  // console.log(file_name_ptr);
  console.log(buffer);
  // console.log(get_str(file_name_ptr));
});

const createCanvas = (data) => {
  console.log(data);
  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  ctx.putImageData(imageData, 0, 0);
  // let bytes = new Uint8ClampedArray(width * height * 4);
  // console.log(bytes);
  // for (let i = 0; i < bytes.length; i++) {
  //   if (i < fileData.length) {
  //     // fill empty raw image bytes with file data(it could be duplicated a lot of times)
  //     bytes[i] = fileData[i];
  //   } else {
  //     // filling the rest of the empty bytes with a gary color
  //     bytes[i] = 50;
  //   }
  // }
  // // encode as PNG with UPNG
  // pngData = UPNG.encode([bytes.buffer], width, height, 0);
  // let imageData = new ImageData(bytes, width, height);
  showCanvas();
  // ctx.putImageData(imageData, 0, 0);
};

// show canvas
const showCanvas = () => {
  canvas.style.display = "block";
  textArea.style.display = "none";
};

// show textArea div
const showDetails = () => {
  canvas.style.display = "none";
  textArea.style.display = "block";
};

// bind buttons to functions
showCanvasBtn.onclick = () => showCanvas();
showDetailsBtn.onclick = () => showDetails();

showDetails();
