#!/usr/bin/python3

import sys

if len(sys.argv) != 3:
    sys.exit()

count1 = 0
with open(sys.argv[1],"r") as fh:    
    for ln in fh:
        count1 += 1
        print(ln, end="")

count2 = 0
with open(sys.argv[2],"r") as fh:

    for ln in fh:
        count2 += 1
        if count2 <= count1:
            pass
        elif count2 == count1+1:
            print("#",ln,end="")
        else:
            print(ln,end="")
