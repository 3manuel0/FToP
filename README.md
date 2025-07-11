# FToP

⚠️ **Note:** This project isn’t finished yet — I’m still working on it to fix bugs and things might break or change.

A fun project that I started in C and later rewrote in JavaScript as [`file_to_png`](https://github.com/3manuel0/file_to_png), before going back and rewriting it in C again after improving my C language skills.

# Languages used:

<div>
<img height="60" src="https://raw.githubusercontent.com/3manuel0/3manuel0/refs/heads/assets/C.svg" />
</div>

### Libraries used:

I used [`stb_image`](https://github.com/nothings/stb/blob/master/stb_image.h) and [`stb_image_write`](https://github.com/nothings/stb/blob/master/stb_image_write.h) to parse and read PNG images, mainly to avoid implementing zlib myself.  
They’re part of the [stb](https://github.com/nothings/stb) collection — just simple, single-header libraries that do exactly what you need without getting in the way.  
Really appreciated how easy they made things.
