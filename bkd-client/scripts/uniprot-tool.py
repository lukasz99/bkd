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

parser.add_argument('--upr', '-u', dest="upr", type=str,
                    required=False, default='P60010',
                    help='UniprotKB accession.')

parser.add_argument('--file', '-f', dest="file", type=str,
                    required=False, default='',
                    help='Input file.')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='get',
                    help='Mode.')

parser.add_argument('--out', '-o', dest="out", type=str,
                    required=False, default='',
                    help='Output file.')

parser.add_argument('--debug', '-d', dest="debug", type=bool,
                    required=False, default=False,
                    help='Debug option.')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

args = parser.parse_args()

#print(json.dumps(ucr.root,indent=1))

du = BK.DxfUtils('http://10.1.7.100:9999/cvdbdev0/services/soap?wsdl')
bc = BK.BkdClient(user="bkd", password="444bkd444")

if args.mode == "get":
        zres = bc.getnode("upr", args.upr, debug=args.debug)
        if len(args.out)  > 0:
            if not args.out.endswith(".dxf"):
                args.out+= ".dxf"
                
            with open( args.out, "w" ) as of:
                of.write( ET.tostring( zres, pretty_print=True).decode() )
                of.write( "\n" )
        else:
            print(ET.tostring(zres, pretty_print=True).decode() )
            print()
else:
    if len(args.file) > 0:

        if args.out.endswith(".dxf"):
            args.out = args.out.replace(".dxf","")            
        
        with open(args.file, "r") as fh:
            for ln in fh:
                if  not ln.startswith("#"):
                    cols = ln.split('\t')
                    upr = cols[0]
                    print( "Uniprot Accesion: " + upr)

                    ucl = BK.unirecord.UniRecord()
                    ucr = ucl.getRecord(upr)

                    znode = du.buildUniprotZnode( ucr )
                    zres = bc.setnode(znode, mode=args.mode, debug=args.debug)

                    if len(args.out)  > 0:                
                        with open( args.out + "-" + upr+".dxf", "w" ) as of:
                            of.write( ET.tostring( zres, pretty_print=True).decode() )
                            of.write( "\n" )
                    else:
                        #print(ET.tostring(zres, pretty_print=True).decode() )
                        print() 
    else:
        ucl = BK.unirecord.UniRecord()
        ucr = ucl.getRecord(args.upr)   
        znode = du.buildUniprotZnode( ucr )
        zres = bc.setnode(znode, mode=args.mode, debug=args.debug)
                
        if not args.debug:
            if len(args.out)  > 0:
                if not args.out.endswith(".dxf"):
                    args.out+= ".dxf"

                with open( args.out, "w" ) as of:
                    of.write( ET.tostring(zres, pretty_print=True).decode() )
                    of.write( "\n" )
        else:
            print(ET.tostring(zres, pretty_print=True).decode() )
            print()
