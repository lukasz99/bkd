#!/usr/bin/python3
import os
import sys
import argparse
import json

from lxml import etree as ET

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

#pymex_dir="/home/lukasz/git/pymex/pylib"
#if os.path.isdir( pymex_dir ):
#    print( "#pymex: using source library version" )
#    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )
import bkdpy as BK

parser = argparse.ArgumentParser( description='UniprotKB Tool' )

parser.add_argument('--ns', '-n', dest="ns", type=str,
                    required=False, default='upr',
                    help='Namespace (default: upr).')

parser.add_argument('--ac', '-a', dest="ac", type=str,
                    required=False, default='O00180',
                    help='Accession (default: O00180).')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='add',
                    help='Mode (default: add).')

parser.add_argument('--file', '-f', dest="file", type=str,
                    required=True, default='',
                    help='Report File.')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

args = parser.parse_args()

du = BK.DxfUtils('http://10.1.7.100:9999/bkd-server/services/soap?wsdl')

znode = du.buildUniprotZnode( ucr )


bc = BK.BkdClient(user="bkd", password="444bkd444")

if args.mode == "get":
        zres = bc.getnode("upr", args.upr, debug=False)
else:
        zres = bc.setnode(znode, mode=args.mode, debug=False)

print(ET.tostring(zres, pretty_print=True).decode() )
