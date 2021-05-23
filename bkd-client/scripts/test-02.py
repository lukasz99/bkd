#!/usr/bin/python3

import os
import sys
import argparse

print(sys.path)
sys.path.append( "./pylib/bkdpy" )

pymex_dir="/home/lukasz/git/pymex/pylib"
if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

import pymex
import zeep
import json
from lxml import etree as ET

import bkdpy
import unirecord as UP

up = UP.UniRecord()
up.parseXml("P04637.xml")

#print(up.toJson())    

sys.exit()
entry = up.root["uniprot"]["entry"][0]

rname = entry["name"]
accl =  entry["accession"]
pname = entry["protein"]["name"]
taxon = entry["organism"]

aprod =[]
comment = entry["comment"]
for  c in comment:
    if c["type"] == "alternative products":
        aprod.append(c)

def buildBkdNode(name,organism,refdb,refacc,ntype):
    znode = None
    

    return znode
    
# 


        
#print(json.dumps(aprod, indent=2))
        
#bkc = BC.BkdClient()
#
#print(bkc.getnode("bkd", "bkd-1234N", detail='default', format='dxf14'))






