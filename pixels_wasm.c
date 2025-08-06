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

void writeImageFromFIleToMemory(i32 size){
    u8 * ext = file_name;
    while(*ext){
        if(*ext == '.'){
            break;
        }
        ext++;
    }
    if(*ext == 0) return;
    ext++;
    u8 strlen = str_len((i8 *)ext);
    u32 offset;
    printf("extension= %s %d", ext, strlen);
    for(offset = 0; offset < strlen; offset++){
        file_array[offset] = ext[offset];
    }
    printf("offset = %d", size);
    file_array[offset] = 0;
    offset++;
    u8 * size_in_bytes = (u8 *) &size; 
    for(i32 i = 0; i < 4; i++){
        file_array[offset] = size_in_bytes[i];
        printf("byte = %d", size_in_bytes[i]);
        offset++;
    } 
    for(; offset < BUFF_SIZE; offset++){
        file_array[offset] = 255;
    }
}

u8 str_len(i8 * str){
    u8 len = 0;
    while(str[len])len++;
    return len;
}

