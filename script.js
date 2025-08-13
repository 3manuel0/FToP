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
              let float = new Float32Array(buffer, args_ptrs + argsIndex, 1)[0];
              args.push(float);
              f_str += float;
              argsIndex += 4;
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
            case "p":
              let ptr = args_ptrs + argsIndex;
              args.push(ptr);
              f_str += ptr;
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
  const wasmMemoryView = new Uint8Array(buffer);
  const BUFF_SIZE = 600 * 800 * 4;
  const STR_SIZE = 255;

  // getting these functions from wasm
  const {
    empty_buffers,
    get_file_name_ptr,
    get_file_buffer_ptr,
    get_image_buffer_ptr,
    writeImageFromFIleToMemory,
    writeFileFromImageToMemory,
  } = w.instance.exports;

  // const pointers to arrays
  const file_buffer_ptr = get_file_buffer_ptr();
  const image_buffer_ptr = get_image_buffer_ptr();
  const file_name_ptr = get_file_name_ptr();
  fileInput.addEventListener("change", (event) => {
    // get file from input
    let file = event.target.files[0];
    empty_buffers();
    if (file) {
      const file_ext = file.name.split(".")[1];
      const size = file.size;
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      // reader loaded successfully
      reader.onload = (e) => {
        result = e.target.result;
        if (size > BUFF_SIZE - 500) {
          textArea.innerHTML = `<p style="color:red; font-weight:bold;">file size is bigger than what is allowed: ${
            BUFF_SIZE - 500
          }bytes</p>`;
          showDetails();
          console.log("file too big");
        } else {
          if (file_ext != "png") {
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(file.name);
            wasmMemoryView.set(uint8Array, file_name_ptr);
            console.log(file_ext);
            const resultBytes = new Uint8Array(result);
            wasmMemoryView.set(resultBytes, file_buffer_ptr);
            writeImageFromFIleToMemory(size);
            createCanvas(new Uint8Array(buffer, image_buffer_ptr, BUFF_SIZE));
            document.getElementById("dwn").innerHTML = "Download PNG";
            // Download button onclick
            document.getElementById("dwn").onclick = () => {
              Download_img(
                UPNG.encode(
                  [new Uint8Array(buffer, image_buffer_ptr, BUFF_SIZE)],
                  width,
                  height,
                  0
                )
              );
            };
          } else {
            const img = UPNG.decode(result);
            const img_data = new Uint8Array(UPNG.toRGBA8(img)[0]);
            wasmMemoryView.set(img_data, image_buffer_ptr);
            const text_buffer = new Uint8Array(buffer, file_name_ptr, STR_SIZE);
            const file_size = writeFileFromImageToMemory();
            if (file_size == 0) {
              textArea.innerHTML = `<p style="color:red; font-weight:bold;">INVALID SIGNATURE ERROR01: size=0</p>`;
            } else {
              const out_ext = get_str(file_name_ptr);
              const file_buffer = new Uint8Array(
                buffer,
                file_buffer_ptr,
                file_size
              );
              const blob = new Blob([file_buffer]);
              document.getElementById("dwn").onclick = () => {
                Download_file(blob, out_ext);
              };
              document.getElementById("dwn").innerText =
                "Download ." + out_ext + " file";
              textArea.innerHTML =
                `<p style="font-weight:bold;">file extension : ${out_ext}</p>` +
                `<p style="font-weight:bold;">file size : ${file_size} bytes</p>` +
                `<p style="font-weight:bold;">Click on Download to Download the output file</p>`;
              showDetails;
              console.log(text_buffer);
            }
          }
        }
        reader.onerror = (e) => {
          console.log("Error : " + e.type);
        };
      };
    }
  });
  //const file_buffer = new Uint8Array(buffer, file_buffer_ptr, BUFF_SIZE);
  //const image_buffer = new Uint8Array(buffer, image__buffer_ptr, BUFF_SIZE);
  // empty_buffers();
  console.log(buffer);
  // console.log(get_str(file_name_ptr));
});

const createCanvas = (data) => {
  console.log(data);
  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  ctx.putImageData(imageData, 0, 0);
  showCanvas();
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

const Download_img = (data) => {
  pngData = data;
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

const Download_file = (blob, ext) => {
  const url = URL.createObjectURL(blob);
  // Trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = "output." + ext;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
// bind buttons to functions
showCanvasBtn.onclick = () => showCanvas();
showDetailsBtn.onclick = () => showDetails();

showDetails();
