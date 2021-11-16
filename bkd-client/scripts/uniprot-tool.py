#!/usr/bin/python3
import os
import sys
import argparse
import json
import re
import csv
import urllib.request
import ssl

from lxml import etree as ET

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

pymex_dir="/home/lukasz/git/pymex/pylib"
if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )

import pymex
import bkdpy as BKD

bkd_dest = {"dip0-local":"http://10.1.7.100:9999/dipdev0",
            "dip0-public":"https://dip.mbi.ucla.edu/dipdev0",
            "dip2-local":"http://10.1.7.102:9999/dipdev2",
            "dip2-public":"https://dip.mbi.ucla.edu/dipdev2",
            "cvdb0-local":"http://10.1.7.100:9999/cvdbdev0",
            "cvdb0-public":"https://dip.mbi.ucla.edu/cvdbdev0",
            "cvdb2-local":"http://10.1.7.102:9999/cvdbdev2",
            "cvdb2-public":"https://dip.mbi.ucla.edu/cvdbdev2"}

upr_loc ={"local":"/mnt/mirrors/uniprotkb/records"}


upr_path = "/mnt/mnt/mirrors/uniprotkb/records"

parser = argparse.ArgumentParser( description='UniprotKB Tool' )

parser.add_argument('--ulocation', '-ul', dest="uloc", type=str, 
                    required=False, default='local',
                    help='Uniprot record location: local/remote.')

parser.add_argument('--upr', '-u', dest="upr", type=str,
                    required=False, default='P60010',
                    help='UniprotKB accession.')

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

parser.add_argument('--annotation-file', '-af', dest="afile", type=str,
                    required=False, default='',
                    help='Annotation file.')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='get',
                    help='Mode.')

parser.add_argument('--setac', dest="setac", type=bool,
                    required=False, default=False,
                    help='Set accession')

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

    
def acc2path( dir, acc ):
    
    lacc="0000000000" + acc
    rdir = dir;
    for d in range(5,1,-1):
        rdir += "/" + lacc[-3*d:-3*(d-1)] 
    return rdir + "/" + acc + ".xml"

args = parser.parse_args()

uzeep = BKD.UniZeep( bkd_dest[args.sloc] )

if args.mode == "get":
    zres = uzeep.getnode( args.ns, args.ac )
    
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

    annot = {}
    
    if len(args.afile) > 0: 
        with open(args.afile, "r") as ah:
            areader = csv.DictReader(ah, delimiter='\t')
            for row in areader:
                arow = {}
                nkey=None
                for k in row.keys():
                    if k == 'key':
                        nkey=row[k]
                    else:
                        arow[k]=row[k]
                if nkey is not None: 
                    annot[nkey]=arow
    print(annot)
    
    if len(args.file) > 0: 
        if args.out.endswith(".dxf"):
            args.out = args.out.replace(".dxf","")            
        with open(args.out, "w") as logh:
            logh.write("#AC\tUPR\n")

            maxac = 0
            with open(args.file, "r") as fh:
                for ln in fh:
                    if  not ln.startswith("#"):
                        cols = ln.split('\t')
                        upr = cols[1].strip()

                        if len( cols[0].strip() ) > 0:
                            ac = int(re.sub("\D","",cols[0]))
                        else:
                            ac = 0
                        if ac > maxac:
                            maxac=ac
                            
            print( "Accession Max: " + str(maxac) )

            if maxac > 0 and args.setac:
                # set acc
                if uzeep.setidgen( maxac, "node") > 0:
                    sys.exit(1)
                
            with open(args.file, "r") as fh:
                for ln in fh:
                    if  not ln.startswith("#"):
                        cols = ln.split('\t')
                        upr = cols[1].strip()

                        if len( cols[0].strip() ) > 0:
                            ac = cols[0]
                        else:
                            ac = ""
                        
                        print( "Uniprot Accesion: " + upr)

                        uloc = upr_loc[args.uloc]

                        # build path to local file
        
                        swpath = acc2path( uloc + "/swissprot", upr)
                        trpath = acc2path( uloc + "/trembl", upr)
                        
                        
                        if os.path.isfile(swpath):
                            ufile = swpath
                        elif os.path.isfile(trpath):
                            ufile = trpath
                        else:
                            print( "ERROR: no uniprot file" )
        
                        print("UniprotKB record: " + ufile)        

                        
                        rec = pymex.uprot.Record().parseXml( ufile ) # parse uniprot record

                            
                        if len(ac) > 0 and len(args.ns) == 0:
                            ns  = re.sub("-?\d+\D","",ac)
                        else:
                            ns = args.ns
                            
                        znode = uzeep.buildZnode(rec, ns, ac) # build zeep request node

                        if upr in annot.keys():
                            cann = annot[upr]
                            if "label" in cann and cann["label"] is not None and len(cann["label"]) > 0:  
                                znode.label=annot[upr]["label"]
                                               
                        zres = uzeep.setnode(znode, mode="add", debug=args.debug)
                        nsl = zres.xpath("//dxf:dataset/dxf:node/@ns",namespaces=uzeep.dxfns)
                        acl = zres.xpath("//dxf:dataset/dxf:node/@ac",namespaces=uzeep.dxfns)
                                    
                        logh.write( "\t".join( (acl[0], upr,"\n") ) )
                        logh.flush()
                        os.fsync()
    else:

        uloc = upr_loc[args.uloc]

        # build path to local file
        
        swpath = acc2path( uloc + "/swissprot", args.upr)
        trpath = acc2path( uloc + "/trembl", args.upr)
                   
        if os.path.isfile(swpath):
            ufile = swpath
        elif os.path.isfile(trpath):
             ufile = trpath
        else:
            print( "ERROR: no uniprot file" )
        
        print("UniprotKB record: " + ufile)        
        
        rec = pymex.uprot.Record().parseXml( ufile ) # parse uniprot record

        print(json.dumps(rec.root,indent=3))

        #xx
        
        znode = uzeep.buildZnode(rec, args.ns, args.ac) # build zeep request node

        if args.debug:
            print("**")
            print(ET.tostring( znode, pretty_print=True).decode() )
            print("**")
        
        zres = uzeep.setnode(znode, mode=args.mode, debug=args.debug)
                
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
