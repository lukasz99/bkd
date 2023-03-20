#!/usr/bin/python3

import requests
import json
import sys

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )

import bkdpy

gnd = bkdpy.GnomAD()

geneId = gnd.getGeneIdByName('CACNA1C')

print( "Gene Name:", 'CACNA1C' )
print( "Gene Id: ",geneId)
print("\n-----------\n")

gene = gnd.getGene(geneId)
gvar = gnd.getVariantsInGene( geneId )
vlst = gnd.getVarXref( gvar, debug=False )

for v in vlst:
    print(v)
