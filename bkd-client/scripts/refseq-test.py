#!/usr/bin/python3
import os
import sys
import argparse
import json
import re
import csv
import urllib.request
import ssl

from time import sleep
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
                                            
print("Get RefSeq", "NM_005183.3")
rs = BKD.RefSeq().getrecord( "NM_005183.3" )
print( "locus:", rs.locus)
#print( "sequence:", rs.sequence)
print( "primaryAc:", rs.primaryAc)

print( "\nCDS:",rs.getFeatureLstByKey("CDS")[0] )
print( "Offset:",rs.getFeatureLstByKey("CDS")[0]["_location"].split("..")[0] )




