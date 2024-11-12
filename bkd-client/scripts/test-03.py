#!/usr/bin/python3
import os
import sys
import argparse

from lxml import etree as ET

print(sys.path)
pymex_dir="/home/lukasz/git/pymex/pylib"
if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )
print(sys.path)
    

import bkdpy as BK

bc = BK.BkdClient()
du = BK.DxfUtils('http://10.1.7.200:9999/cvdbdev0/services/soap?wsdl')

node = { "type":"protein","name":"actin","label":"Act1",
         "alias":["actin","","actin1"],
         "rns":"upr","rac":"P60010","taxid":"4932",
         "xref":[{"ns":"rsq","ac":"NM_001179927.1",
                  "type":"produced-by","typeNs":"dxf","typeAc":"dxf:0007",
                  "target":{"type":"rna","name":"","label":"",
                             "ns":"rsq","ac":"NM_001179927.1"}},
                 
                 {"ns":"taxid","ac":"4932",
                  "type":"produced-by","typeNs":"dxf","typeAc":"dxf:0007",
                  "target":{"type":"organism","name":"S cerevisiae","label":"yeast",
                             "ns":"taxid","ac":"4932"}},
                   
                 {"ns":"geneid","ac":"850504",
                  "type":"produced-by","typeNs":"dxf","typeAc":"dxf:0007",
                  "target":{"type":"gene","name":"","label":"",
                            "ns":"geneid","ac":"850504"}},
                 
                 {"ns":"rsq","ac":"NP_116614.1",
                  "type":"identical-to","typeNs":"dxf","typeAc":"dxf:0009",
                  "target":{"type":"gene","name":"","label":"",
                            "ns":"rsq","ac":"NP_116614.1"}},
                 {"ns":"upr","ac":"P60010.111",
                  "type":"identical-to","typeNs":"dxf","typeAc":"dxf:0009",
                  "target":{"type":"gene","name":"","label":"",
                            "ns":"upr","ac":"P60010.111"}}],
         "sequence":"MDSEVAALVIDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGIMVGMGQKDSYVGDEAQSKRGILTLRYPIEHGIVTNWDDMEKIWHHTFYNELRVAPEEHPVLLTEAPMNPKSNREKMTQIMFETFNVPAFYVSIQAVLSLYSSGRTTGIVLDSGDGVTHVVPIYAGFSLPHAILRIDLAGRDLTDYLMKILSERGYSFSTTAEREIVRDIKEKLCYVALDFEQEMQTAAQSSSIEKSYELPDGQVITIGNERFRAPEALFHPSVLGLESAGIDQTTYNSIMKCDVDVRKELYGNIVMSGGTTMFPGIAERMQKEITALAPSSMKVKIIAPPERKYSVWIGGSILASLTTFQQMWISKQEYDESGPSIVHHKCF",
         "comment":"my comment",
         "source":{"type":"online-resource","name":"UniprotKB:60010.178","label":"UniprotKB","ns":"upr","ac":"P60010.178","url":"https://uniprot.org/uniprot/P60010"}}



print(du)

znode = du.buildznode(node)

print("ZNODE",znode)

#zres = bc.setnode(znode, mode="add", debug=True)
#zres = bc.setnode(znode, mode="add", debug=False)
