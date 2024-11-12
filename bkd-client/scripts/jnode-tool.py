#!/usr/bin/python3
import os
import sys
import argparse
import json

from lxml import etree as ET

pymex_dir="/home/lukasz/git/pymex/pylib"
if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )
print(sys.path)

import bkdpy as BK

parser = argparse.ArgumentParser( description='JNode Tool' )

parser.add_argument('--file', '-f', dest="file", type=str,
                    required=False, default='',
                    help='Input file.')

parser.add_argument('--ns', '-n', dest="ns", type=str,
                    required=False, default='',
                    help='Record namespace.')

parser.add_argument('--acc', '-a', dest="ac", type=str,
                    required=False, default='',
                    help='Record accession.')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='mirror',
                    help='Submission mode.')

parser.add_argument('--out', '-o', dest="out", type=str,
                    required=False, default='',
                    help='Output file.')

parser.add_argument('--debug', '-d', dest="debug", type=bool,
                    required=False, default=False,
                    help='Debug option.')

args = parser.parse_args()

bc = BK.BkdClient()
du = BK.DxfUtils('http://10.1.7.200:9999/cvdbdev0/services/soap?wsdl')

with open(args.file,"r") as fh:
    node = json.load(fh)


print(node)

print(du)

znode = du.buildSimpleZnode(node)

print("ZNODE",znode)

zres = bc.setnode(znode, mode=args.mode, debug=False)
#zres = bc.setnode(znode, mode="", debug=False)
