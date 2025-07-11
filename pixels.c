// #ifndef PLATFORM_WEB
#include <bits/types/FILE.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdio.h>
#include <string.h>
#include "includes/pixels.h"
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "includes/stb_image.h"
#include "includes/stb_image_write.h"
// #endif



int main(int argc, char**argV){
    if(argc > 2){
        printf("use 1 argument\n");
        getchar();
        exit(EXIT_FAILURE);
    }
    printf("%s\n", argV[1]);
    // FILE* fp = fopen(argV[1], "rb");
    printf("reading File....\n");
    int c = 0;
    do{
        c++;
    }while(argV[1][c] != '.' && argV[1][c] != '\0');
    
    printf("writing File....\n");
    if(strcmp(&argV[1][c], ".png") != 0 && argV[1][c] == '.'){
        printf("file detected \n");
        writeFileToIamge(argV[1], c);
    }else if(strcmp(&argV[1][c], ".png") == 0){
        printf("png file detected \n");
        writeImageToFile(argV[1]);
    }else {
        printf("wrong format only png for images or txt for text files \n");
        printf("Press enter to continue...");
        getchar();
        exit(EXIT_FAILURE);
    }
    printf("All done\n");
    printf("Press enter to continue...");
    getchar();
    return 0;
}

void writeFileToIamge(char* file, int c){

    FILE* fp = fopen(file, "rb");
    if (NULL == fp) {
        printf("file can't be opened, or doesn't exist\n");
        exit(1);
    }
    printf("%s length=%zu\n", &file[c], strlen(&file[c]));
    
    size_t bytes = 0;

    char ch;

    fseek(fp, 0, SEEK_END);
    
    bytes = ftell(fp);

    rewind(fp);

    printf("%zu\n", bytes);

    // allocate the size of the file in the pointer a
    char extLength = strlen(&file[c]);
    if(bytes + extLength + 200 > 800 * 600 * 4){
        exit(EXIT_FAILURE);
        printf("FILE is bigger than %f megabytes", (800.0 *600 *4) / (1024 * 1024));
    }
    unsigned char *a = malloc(800 * 600 * 4);
    // if allocation worked
    if (a == NULL) {
        printf("Memory allocation error.\n");
        printf("Press enter to continue...");
        getchar();
        exit(1);
    }

    size_t count =  extLength+1; 
    for(int i = 0; i <= extLength - 1; i++){
        a[i] = file[(c + 1)+i];
        printf("%c %d\t", file[(c + 1)+i], file[(c + 1)+i]);
    }

    printf("\nftell = %zu %c%c%c%d\n", ftell(fp), a[0], a[1],a[2],a[3]);

    int j;
    char * int_bytes = (char *)(&bytes);

    for(int i = 0; i < 4; i++){
        a[extLength + i] = int_bytes[i];
        printf("%d %ld\n", int_bytes[i], bytes);
    }

    for(int i = 0; i < 10; i++){
        printf("bytes = %d %c\n", a[i], a[i]);
    }

    printf("ext_len: %d\n", extLength);
    for (size_t i = extLength + 4; i < (800 * 600 * 4) - 200; i++) {
        ch = fgetc(fp);
        a[i] = ch;
        if(j >= bytes ){
            rewind(fp);
            j = 0;
        }
        j++;
    }

    
    fclose(fp); 
    stbi_write_png("output.png", 800,600, 4, a, 0);
    free(a);
    printf("File done\n");
}

void writeImageToFile(char* fileName){
    Image img = {0};
    img.data = stbi_load(fileName, &img.x, &img.y, &img.comp, 4);
    int byte_len;
    char file_name[255] = "output.";
    int i = 0;
    while (img.data[i]) {
        file_name[7 + i] = img.data[i];
        i++;
    }
    for(int i = 0; i < 10; i++)
        printf("%c", img.data[i]);
    file_name[7+i] = 0;
    int len = strlen((char *)img.data);
    memcpy(&byte_len, img.data + len + 1, sizeof(int));
    printf("x = %d, y = %d, comp = %d \n", img.x, img.y, img.comp);
    printf("%s strlen = %d\n", img.data, len);
    printf("%d\n",byte_len);
    FILE * fp = fopen(file_name, "wb");
    for(int i = 0; i < 10; i++){
        printf("%c %d\n", img.data[i], img.data[i]);
    }
    fwrite(&img.data[len + 1 + 4], 1, byte_len, fp);
    fclose(fp);
    stbi_image_free(img.data);
}
