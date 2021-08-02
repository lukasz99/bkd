#!/usr/bin/python3
import os
import sys
import argparse

from lxml import etree as ET

import logging
logging.basicConfig(level=logging.DEBUG)     # needs logging configured

#pymex_dir="/home/lukasz/git/pymex/pylib"
#if os.path.isdir( pymex_dir ):
#    print( "#pymex: using source library version" )
#    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )
import bkdpy as BK

parser = argparse.ArgumentParser( description='Ontology Tool' )

parser.add_argument('--ns', '-n', dest="ns", type=str,
                    required=False, default='taxid',
                    help='Term namespace (default: taxid).')

parser.add_argument('--taxon', '-t', dest="taxon", type=str,
                    required=False, default='9606',
                    help='Taxon identifier (ncbi).')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='get',
                    help='Mode.')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

args = parser.parse_args()

du = BK.DxfUtils('http://10.1.7.100:9999/bkd-server/services/soap?wsdl')

if args.mode in ["set", "mirror"]:

    tcl = BK.taxonrecord.TaxonRecord()
    
    txr = tcl.getRecord( args.taxon )
    sname = txr.root['taxon'][0]['sci-name']

    if 'common-name' in txr.root['taxon'][0]:
        cname = txr.root['taxon'][0]['common-name']
    else:
        cname = sname
        
    taxon = { "taxid": txr.root['taxon'][0]['taxid'],
              "sci-name": sname,
              "common-name": cname}
    
    znode = du.buildTaxonZnode( taxon )

    bc = BK.BkdClient(user="bkd", password="444bkd444")
    if args.mode == "set":
        zres = bc.setnode(znode, mode="add", debug=False)
    if args.mode == "mirror":
        zres = bc.setnode2(znode, mode="mirror", debug=False)
        
    print(ET.tostring(zres, pretty_print=True).decode() )
    
if args.mode == "get":

    print("AC:", args.taxon)
    
    bc = BK.BkdClient(user="bkd", password="444bkd444")
    zres = bc.getnode(args.ns, args.taxon )
    print(ET.tostring(zres, pretty_print=True).decode() )


