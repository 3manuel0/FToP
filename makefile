# Makefile for pixels.c

CC = gcc
CFLAGS = -Wall -std=c99#-Werror
LDFLAGS = -lm

TARGET = pixels
SRC = pixels.c

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC) $(LDFLAGS)

clean:
	rm -f $(TARGET)
