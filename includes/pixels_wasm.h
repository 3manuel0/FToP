#ifndef PIXELS_WASM_H
#define PIXELS_WASM_H



typedef unsigned char u8;
typedef char i8;
typedef int i32;
typedef unsigned int u32;

#define BUFF_SIZE 600 * 800 * 4
#define STR_SIZE 255

static u8 image_array[BUFF_SIZE];
static u8 file_array[BUFF_SIZE];
static u8 file_name[255];


void writeImageFromFIleToMemory(i32 size);
void writeFileFromImageToMemory( i32 size);
int printf(i8 * str, ...);
u8 * get_file_buffer_ptr(void);
u8 * get_image_buffer_ptr(void);
u8 * get_file_name_ptr(void);
void empty_buffers(void);
u8 str_len(i8 * str);


#endif