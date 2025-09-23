# FToP

⚠️ **Note:This project isn't finished yet — I'm still working on it to fix bugs and things might break or change.**

A fun project in C and then compile it to wasm to use with js.

# Languages used:

<div>
<img height="60" src="https://raw.githubusercontent.com/3manuel0/3manuel0/refs/heads/assets/C.svg" />
<img height="60" src="https://raw.githubusercontent.com/3manuel0/3manuel0/refs/heads/assets/WebAssembly.svg" />
<img height="60" src="https://raw.githubusercontent.com/3manuel0/3manuel0/refs/heads/assets/Javascript.svg" />
</div>

### Libraries used:

I used [`stb_image`](https://github.com/nothings/stb/blob/master/stb_image.h) and [`stb_image_write`](https://github.com/nothings/stb/blob/master/stb_image_write.h) to parse and read PNG file, mainly to avoid implementing zlib myself.  
They're part of the [stb](https://github.com/nothings/stb) collection — just simple, single-header libraries that do exactly what you need without getting in the way.  
Really appreciated how easy they made things.

## Licenses

### stb (Sean Barrett)

This project includes stb headers (e.g. `stb_image.h`)  
Licensed under public domain or MIT.

### pako.js

[pako](https://github.com/nodeca/pako) is licensed under the MIT License.

### UPNG.js

[UPNG.js](https://github.com/photopea/UPNG.js) is licensed under the MIT License.
