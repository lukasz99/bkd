#!/usr/bin/python3

import os
import sys

pkg_dir = os.path.dirname( os.path.realpath(__file__) )
bkd_dir = os.path.join( pkg_dir, '..','pylib' )

sys.path.insert( 0,"/home/lukasz/git/pymex/pylib")

if os.path.isdir( bkd_dir ):
    print("#zeepUniprot: using source library version")
    sys.path.insert(0,bkd_dir)

import argparse
import json

# uniprot records repo

uniprot_path = "/home/sun/scripts/xml_files/uniprot"
nodes_path = "/home/sun/scripts/config/nodes2020-03-14.tab"

#from unirecord import UniRecord
import pymex
import bkdpy as BKD

from lxml import etree as ET

import logging

# needs logging configured (WARN, DEBUG)
logging.basicConfig(level=logging.WARN)     

from http.client import HTTPSConnection, HTTPResponse
from requests import Session

from zeep import Client as zClient, Settings as zSettings
from zeep.transports import Transport
from zeep import xsd

from urllib.request import urlopen
from time import sleep

def dipAccession( nodes_path, upr_id ):
    '''returns DIP ns, ac for Uniprot ID'''
    ac_dict = {}
    with open(nodes_path, "r") as f:
        line = f.readline()
        line_split = line.split('\t')
        ac_dict[line_split[1]] = line_split[0]
        while line:
            line = f.readline()
            line_split = line.split('\t')
            if len(line_split) > 1:
                ac_dict[line_split[1]] = line_split[0]
            else:
                print(line)
    if upr_id in ac_dict.keys():
        return "DIP", ac_dict[upr_id]
    else:
        return "", ""
    
parser = argparse.ArgumentParser(description='Submit Protein Node to DIP from Uniprot ID')
parser.add_argument('--uniprot_id', '-u', dest='upr_id', type=str, help='Uniprot Accession ID', default = 'P60010')
#parser.add_argument('-ns', dest='ns', type=str, help='DIP namespace', default = '')
#parser.add_argument('-ac', dest='ac', type=str, help='DIP accession', default = '')

args = parser.parse_args()

#####################
#####################
#####################

upr_id = args.upr_id
ns,ac = dipAccession(nodes_path, upr_id)

print(ns,ac)

#rec = pymex.uprot.Record().parseXml(uniprot_path + "/" + upr_id[:-4]+'/'+upr_id+".xml")

ufile = os.path.join(uniprot_path, upr_id[:-4], upr_id+".xml")
rec = pymex.uprot.Record().parseXml( ufile )

service_url = "https://dip.mbi.ucla.edu/dipdev0/services/soap?wsdl"

urec = BKD.UniZeep(service_url)

znode = urec.buildZnode(rec, ns, ac)

print(urec)

#zsettings = zSettings(strict=False, xml_huge_tree=True)

# needed to verify ssl certificate

#zsession = Session()
#zsession.verify = "mbi.ucla.edu.verchain"

#zclient = zClient( url, settings=zsettings,
#                   transport=Transport(session=zsession))


#################
#################
#################


dataset = urec.dxfactory.datasetType([znode])

#res = zclient.service.setNode( dataset, mode="add" )

res = urec.zclient.service.setNode( dataset, mode="add" )
