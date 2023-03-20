#!/usr/bin/python3
import os
 
import sys
import argparse
import json
import re
import csv
from os.path import exists

listfl="hg38_multiz100way.txt"

parser = argparse.ArgumentParser( description='UniprotKB Tool' )

parser.add_argument('--ulocation', '-ul', dest="uloc", type=str, 
                    required=False, default='local',
                    help='Uniprot record location: local/remote.')

parser.add_argument('--upr', '-u', dest="upr", type=str,
                    required=False, default='Q13936',
                    help='UniprotKB accession.')

parser.add_argument('--file', '-f', dest="file", type=str,
                    required=False, default='',
                    help='Input file.')

parser.add_argument('--out', '-o', dest="out", type=str,
                    required=False, default='',
                    help='Destination path.')

parser.add_argument('--taxid', '-t', dest="taxid", type=str,
                    required=False, default='9606',
                    help='UniprotKB accession.')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

spd = {}

with open(listfl,"r") as lh:
    for ln in lh:
        if ln.startswith("*"):
            lc = ln[1:].strip().split("/")
            lc0 = lc[0].split('\t')
            lc1 = lc[1].split()
            #print(lc0,lc1)
            sp = [lc0[0].strip(),lc0[1].strip(),lc1[0].strip(), lc1[1].strip()]
            spd[sp[2]]=sp

print("Selected species")
for k in spd:
    print( k,spd[k])

args = parser.parse_args()
    
print(args.upr, args.taxid, args.file)

uprList = []

if len(args.file) > 0:

    with open(args.file, "r") as fh:
        for ln in fh:
            if ln.startswith('#'):
                continue        
            uprList.append( ln.split()[0:2])                  
else:
    uprList.append( (args.upr,args.upr))

for (id,upr) in uprList:

    print(id, upr)

    msaf = "test/" + id + ".fasta"

    if not exists(msaf):
        print(id, ": missing")
        continue

    print(id, ": processing")
    
    with open(msaf,"r") as mf:
        flag = False
        th = open("tmp.fasta","w")
        for ln in mf:
            if ln.startswith(">"):
                tag = ln.strip().split("_")[1]           
                if tag in spd.keys():
                    cols= spd[tag]
                    #>Q13698;Homo sapiens;9606;human
                    #print(ln.strip())
                    #print(ln.strip().split("_")[0],end="")
                    #print(";"+";".join([cols[1], cols[3],cols[0]]))
                    flag =True

                    th.write( ln.strip().split("_")[0] )
                    th.write( ";"+";".join([cols[1], cols[3],cols[0]]) + "\n" )

            else:
                if flag:
                    #print(ln.strip().replace("-",""))
                    th.write(ln.strip().replace("-","").replace("Z","")+"\n")                
                    flag = False

        th.close()
    os.system(" mafft --auto tmp.fasta > bkd-server/src/main/webapp/msa/" + id + ".fasta")
    
