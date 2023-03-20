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

bkd_dest = { "cvdb0-local":"http://10.1.7.100:9999/cvdbdev0",
             "cvdb0-public":"https://dip.mbi.ucla.edu/cvdbdev0",
             "cvdb2-local":"http://10.1.7.102:9999/cvdbdev2",
             "cvdb2-public":"https://dip.mbi.ucla.edu/cvdbdev2",
             "cvdb":"https://dip.mbi.ucla.edu/cvdb/services" }

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

parser.add_argument('--user', dest="user", type=str,
                    required=False, default='',
                    help='User (when needed)')

parser.add_argument('--pass', dest="password", type=str,
                    required=False, default='',
                    help='password (when needed)')


parser.add_argument('--debug', '-D', dest="debug", type=str,
                    required=False, default='False',
                    choices=['True','False'],
                    help='Debug flag.')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

    
# SCRIPT STARTS HERE
#-------------------

args = parser.parse_args()

print("ARGS:", args)

debug = args.debug

srvUrl = bkd_dest[args.sloc]

srvUrl = srvUrl.replace( "%%USER%%", args.user)
srvUrl = srvUrl.replace( "%%PASS%%", args.password)

rzeep = BKD.ReportZeep( srvUrl )
#du = BKD.DxfUtils( bkd_dest[args.sloc] )

if args.mode == "get":
    zrep = rzeep.getnode( args.ns, args.ac, debug=False )
    print(ET.tostring(zrep, pretty_print=True).decode() )

else:
    if args.mode != "set":
        sys.exit()

    with open( args.file,"r") as ifh:
        jrep = json.load( ifh )
        
    if args.debug == 'True':
        print( json.dumps( jrep,indent=3 ) )
        
    zrep =  rzeep.buildZreport( jrep = jrep, debug = args.debug )
    zres = rzeep.setnode( zrep, mode=args.mode, debug = False )


