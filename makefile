# Makefile for pixels.c

CC = gcc
CC_WASM=clang
CFLAGS = -Wall -std=c99#-Werror
LDFLAGS = -lm
CFLAGS_WASM=--target=wasm32 --no-standard-libraries -I./include -DPLATFORM_WEB
LDFLAGS_WASM=-Wl,--export-all -Wl,--no-entry -Wl,--allow-undefined

TARGET = pixels
SRC = pixels.c

TARGET_WASM = pixels.wasm
SRC_WASM = pixels_wasm.c

all: native wasm

native: pixels.c
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC) $(LDFLAGS)

wasm: pixels_wasm.c
	$(CC_WASM) $(CFLAGS_WASM) $(LDFLAGS_WASM) -o $(TARGET_WASM) $(SRC_WASM)

clean:
	rm -f pixels_native pixels.wasm
