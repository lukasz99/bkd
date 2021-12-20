#!/usr/bin/python3
import os
import sys
import argparse
import json

from lxml import etree as ET

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

pymex_dir="../git/pymex/pylib"
if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

#sys.path.insert(0, "/home/sun/bkd/bkd-client/pylib" )
sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )

import pymex
import bkdpy as BKD

bkd_dest = {"dip0-local":"http://10.1.7.100:9999/dipdev0/services/soap?wsdl",
            "dip0-public":"htts://dip.mbi.ucla.edu/dipdev0/services/soap?wsdl",
            "dip2-local":"http://10.1.7.102:9999/dipdev2/services/soap?wsdl",
            "dip2-public":"htts://dip.mbi.ucla.edu/dipdev2/services/soap?wsdl",
            "cvdb0-local":"http://10.1.7.100:9999/cvdbdev0/services/soap?wsdl",
            "cvdb0-public":"htts://dip.mbi.ucla.edu/cvdbdev0/services/soap?wsdl",
            "cvdb2-local":"http://10.1.7.102:9999/cvdbdev2/services/soap?wsdl",
            "cvdb2-public":"htts://dip.mbi.ucla.edu/cvdbdev2/services/soap?wsdl"}

parser = argparse.ArgumentParser( description='Link Tool' )

parser.add_argument('--dip', '-di', dest="dip_ids", type=str,
                    required=False, default='',
                    help='DIP IDs for interacting proteins (Separated by spaces).')

parser.add_argument('--slocation', '-sl', dest="sloc", type=str,
                    required=False, default='cvdb0-local',
                    help='Server location.')

parser.add_argument('--ns', '-n', dest="ns", type=str,
                    required=False, default='',
                    help='Record namespace.')

parser.add_argument('--acc', '-a', dest="ac", type=str,
                    required=False, default='',
                    help='Record accession.')

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

    
def id2ac(id, dpre = "DIP-", dpost = "N"):
    return dpre+str(id)+dpost

def ac2id(ac):
    return int(''.join(c for c in ac if c.isdigit()))

args = parser.parse_args()

lzeep = BKD.LinkZeep(bkd_dest[args.sloc])

if args.mode == "get":
    zres = lzeep.getlink( args.ns, args.ac )
    
    if len(args.out)  > 0:
        if not args.out.endswith(".dxf"):
            args.out+= ".dxf"
                
        with open( args.out, "w" ) as of:
            of.write( ET.tostring( zres, pretty_print=True).decode() )
            of.write( "\n" )
    else:
        print(ET.tostring(zres, pretty_print=True).decode() )
        print()

elif args.mode == "set":
    if len(args.file) > 0: 
        if args.out.endswith(".dxf"):
            args.out = args.out.replace(".dxf","")            
        with open(args.out, "w") as logh:
            logh.write("#AC\tDIP\n")
            with open(args.file, "r") as fh:
                for ln in fh:
                    if  not ln.startswith("#"):
                        cols = ln.split('\t')
                        if len(cols) > 1:
                            dip_ids = [id2ac(ac2id(x)) for x in cols[1].split('|')]

                            if len( cols[0].strip() ) > 0:
                                ac = cols[0]
                                ns = "DIP"
                            else:
                                ac = ""
                                ns = ""

                            print( "DIP IDs: " + str(dip_ids))     

                            znode = lzeep.buildZnode(dip_ids, ns, ac) # build zeep request node
                            if type(znode) == list:
                                logh.write( "\t".join( (ac, " ".join(znode),"\n") ) )

                            zres = lzeep.setlink(znode, mode="add", debug=args.debug)
                            nsl = zres.xpath("//dxf:dataset/dxf:node/@ns",namespaces=lzeep.dxfns)
                            acl = zres.xpath("//dxf:dataset/dxf:node/@ac",namespaces=lzeep.dxfns)
                            
                            if ac == acl[0] or ac == "":
                                logh.write( "\t".join( (acl[0], "|".join(dip_ids),"\n") ) )
                            else:
                                logh.write( "\t".join( (":".join([ac,acl[0]]), "|".join(dip_ids),"\n") ) )
                        
    else:
        dip_ids = [id2ac(ac2id(x)) for x in args.dip_ids.split(',')]
        print("Building interaction node from the DIP IDS:", str(dip_ids))

        znode = lzeep.buildZnode(dip_ids, args.ns, args.ac) # build zeep request node
        
        if type(znode) == list:
            print("Unable to submit link")
            print("Invalid DIP IDs marked with ':*':", znode)
            if not args.debug:
                if len(args.out)  > 0:
                    if not args.out.endswith(".dxf"):
                        args.out+= ".dxf"

                    with open( args.out, "w" ) as of:
                        of.write( "|".join(znode) )
                        of.write( "\n" )
        else:
            zres = lzeep.setlink(znode, mode="add", debug=args.debug)
            acl = zres.xpath("//dxf:dataset/dxf:node/@ac",namespaces=lzeep.dxfns)

            print("Set link-node:", acl[0])

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
