#include "includes/pixels_wasm.h"

u8 * get_file_buffer_ptr(void){
    return file_array;
}

u8 * get_image_buffer_ptr(void){
    return image_array;
}

u8 * get_file_name_ptr(void){
    return file_name;
}

void empty_buffers(void){
    for(i32 i = 0; i < BUFF_SIZE; i++ ){
        image_array[i] = 0;
        file_array[i] = 0;
        if(i < 255) file_name[i] = 0;
    }
}


void writeImageToMemory(u8 * file_array, i32 size, u8 * file_name){
    for(i32 i = 0; i < size; i++){
        file_array[i] = 255;
    }
}

