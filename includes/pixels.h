#ifndef PIXELS_H

#define PIXELS_H


typedef unsigned char u8;
typedef int i32;

typedef struct {
    u8 * data;
    i32 x;
    i32 y;
    i32 comp; 
} Image;


void writeImageToFile(char* file);
void writeFileToIamge(char* file, int c);

#endif