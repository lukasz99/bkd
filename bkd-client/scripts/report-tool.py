#!/usr/bin/python3
import os
import sys
import argparse
import json
import re
import csv

from lxml import etree as ET

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

#pymex_dir="/home/lukasz/git/pymex/pylib"
#if os.path.isdir( pymex_dir ):
#    print( "#pymex: using source library version" )
#    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )
import bkdpy as BKD

bkd_dest = { "cvdb0-local":"http://10.1.7.100:9999/cvdbdev0/services/soap?wsdl",
             "cvdb0-public":"https://dip.mbi.ucla.edu/cvdbdev0/services/soap?wsdl",
             "cvdb2-local":"http://10.1.7.102:9999/cvdbdev2/services/soap?wsdl",
             "cvdb2-public":"https://dip.mbi.ucla.edu/cvdbdev2/services/soap?wsdl",
             "cvdb":"https://dip.mbi.ucla.edu/cvdb/services/soap?wsdl" }

parser = argparse.ArgumentParser( description='Report Tool' )

parser.add_argument('--slocation', '-sl', dest="sloc", type=str,
                    required=False, default='cvdb0-local',
                    help='Server location.')

parser.add_argument('--ns', '-n', dest="ns", type=str,
                    required=False, default='CVDB',
                    help='Namespace (default: CVDB).')

parser.add_argument('--ac', '-a', dest="ac", type=str,
                    required=False, default='CVDB2R',
                    help='Accession (default: CVDB2R).')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='get',
                    help='Mode (default: add).')

parser.add_argument('--file', '-f', dest="file", type=str,
                    required=False, default='',
                    help='Report File.')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

args = parser.parse_args()

du = BKD.DxfUtils( bkd_dest[args.sloc] )

bc = BKD.BkdClient(user="bkd", password="444bkd444")

if args.mode == "get":
    zres = bc.getnode( args.ns, args.ac, debug=False )
else:
    #zres = bc.setnode(znode, mode=args.mode, debug=False)
    pass

print(ET.tostring(zres, pretty_print=True).decode() )
