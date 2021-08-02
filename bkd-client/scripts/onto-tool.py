#!/usr/bin/python3
import os
import sys
import argparse

from lxml import etree as ET

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

print(sys.path)
#pymex_dir="/home/lukasz/git/pymex/pylib"
#if os.path.isdir( pymex_dir ):
#    print( "#pymex: using source library version" )
#    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )
print(sys.path)
import bkdpy as BK

import obonet

parser = argparse.ArgumentParser( description='Ontology Loader' )
parser.add_argument('--ontology', '-o',  dest="ontology", type=str,
                    required=False, default = "mi.obo",
                    help='Ontology file (obo format).')

parser.add_argument('--ns', '-n', dest="ns", type=str,
                    required=False, default='psi-mi',
                    help='Term namespace.')

parser.add_argument('--term', '-t', dest="term", type=str,
                    required=False, default='MI:0001',
                    help='Term identifier.')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='get',
                    help='Mode.')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

args = parser.parse_args()

du = BK.DxfUtils('http://10.1.7.100:9999/bkd-server/services/soap?wsdl')

if args.mode == "set":

    ont = obonet.read_obo(args.ontology)

    term = ont.nodes[args.term]
    term['ac']=args.term

    print("AC:", args.term)
    print("Name:", term['name'])
    print("Def:", term['def'])
    print("IsA:", term['is_a'])

    znode = du.buildCvTermZnode( term )

    bc = BK.BkdClient(user="bkd", password="444bkd444")
    zres = bc.setnode(znode, mode="add", debug=False)
    print(zres)
    
if args.mode == "get":

    print("AC:", args.term)
    
    bc = BK.BkdClient(user="bkd", password="444bkd444")
    zres = bc.getnode(args.ns, args.term )
    print(ET.tostring(zres, pretty_print=True).decode() )


