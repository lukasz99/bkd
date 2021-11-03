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

#spyder hack: add '-i' option only if present (as added by spyder)

du = BK.DxfUtils('http://10.1.7.100:9999/cvdbdev0/services/soap?wsdl')
bc = BK.BkdClient(user="bkd", password="444bkd444")

zlink = du.buildLinkZnode( ns="CVDB", ac="CVDB4E",
                           vlist=[{"ns":"CVDB","ac":"CVDB12P"},
                                  {"ns":"CVDB","ac":"CVDB35P"},
                                  {"ns":"CVDB","ac":"CVDB45P"}] )

zres = bc.setlink(zlink, mode="add", debug=False)
#zres = bc.getlinks(zlink, debug=False)
#zres = bc.getlink("", "", debug=False)

print("**")
print(ET.tostring(zres, pretty_print=True).decode() )
print()
