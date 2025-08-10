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
    printf("extension= %s %d", ext, size);
    for(offset = 0; offset < strlen; offset++){
        image_array[offset] = ext[offset];
    }
    printf("offset = %d", size);
    image_array[offset] = 0;
    offset++;
    u8 * size_in_bytes = (u8 *) &size; 
    for(i32 i = 0; i < 4; i++){
        image_array[offset] = size_in_bytes[i];
        printf("byte = %d", size_in_bytes[i]);
        offset++;
    } 
    u32 j = 0;
    for(u32 i = offset; i < BUFF_SIZE; i++){
        image_array[i] = file_array[j];
        if(j >= size){
            j = 0;
        }
        j++;
    }
}

i32 writeFileFromImageToMemory(){
    // TODO : finish this
    u32 i = 0;
    while(image_array[i]){
        file_name[i] = image_array[i];
        printf("%d ext_char %d", i, file_name[i]);
        i++;
    }
    file_name[i] = 0;
    i++;
    u32 file_size = *(u32 *)(image_array + i );
    i += 4;
    printf("%d", file_size);

    for(u32 j = 1; j < file_size; j++){
        file_array[j] = image_array[i];
        i++;
    }
    return file_size;
}




u32 str_len(i8 * str){
    u32 len = 0;
    while(str[len])len++;
    return len;
}

