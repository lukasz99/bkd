#!/usr/bin/python3

import os
import sys
import argparse
import json
import re
import csv
import urllib.request
import ssl

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

pymex_dir="/home/lukasz/git/pymex/pylib"
if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

import pymex

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )
import bkdpy as BKD


url="https://mutalyzer.nl/services/?wsdl"


parser = argparse.ArgumentParser( description='Mutilyzer Tool' )

parser.add_argument('--operation', '-op', dest="op", type=str, 
                    required=False, default='map',
                    help='Operation (info, check, map)[default: map].')

parser.add_argument('--build', '-b', dest="build", type=str,
                    required=False, default='hg19',
                    help='Genome build (hg18,hg19,hg38) [default: hg19].')

parser.add_argument('--variant', '-v', dest="variant", type=str,
                    required=False, default='c.274G>T',
                    help='Variant [default: c.274G>T].')

parser.add_argument('--transcript', '-t', dest="transcript", type=str,
                    required=False, default='NM_003002.3',
                    help='Transcript [default: NM_003002.3].')

args = parser.parse_args() 

mzeep = BKD.MutZeep()



if "info" == args.op:
    res= mzeep.info()

elif "check" == args.op:
    res = mzeep.checkSyntax( args.variant )

elif "map" == args.op:

    if args.variant.startswith('p.'):
        ppos= re.sub(r'[^0-9]*','',args.variant)
        print( 3*int(ppos)-2 )
        vpos= 'c.'+str(3*int(ppos)-2) +"A>A"
    else:
        vpos = args.variant

    
    mres = mzeep.mappingInfo( args.build, args.transcript, vpos )
    cres = mzeep.mapTranscriptToChromosomes( args.transcript )
    print("Query Result")
    chromosome = cres.result['TranscriptInChromosome']['chromosome'] 
    position = mres.result['start_g'] 
    cpos= chromosome+":g."+position

    cvar= re.sub(r'^[^0-9]*[0-9]*','',vpos)
    
    print(args.transcript+":"+args.variant + " -> " + cpos+cvar)








