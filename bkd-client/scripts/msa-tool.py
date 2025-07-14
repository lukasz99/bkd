#!/usr/bin/python3
import os
 
import sys
import argparse
import json
import re
import csv

from urllib.request import urlopen

import ssl

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

pymex_dir="/home/lukasz/git/pymex/pylib"

taxid = {"9606": 'human',
         "9598": 'chimpanzee',
         "9595": 'gorilla',
         "9597": 'bonobo',
         "9601": 'orangutan',
         "9544": 'rhesus',
         "10090":'mouse',
         "10116":'rat',
         "10141":'guinea pig',
         "9986": 'rabbit',
         "928":"pig",
         "9615":"dog",
         "9031":"chicken",
         "8364": 'xenopus',
         "7955": 'zebrafish'}

if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )

import pymex

upr_loc ={"local":"/mnt/mirrors/uniprotkb/records",
          "local7.100":"/mnt/zuniprot_records"}

upr_path = "/mnt/zuniprot_records"
panther_path = "/mnt/mirrors/panther/ortho"

purl = "http://www.pantherdb.org/services/oai/pantherdb/ortholog/matchortho"
purl += "?geneInputList=%%UPR%%&organism=%%TAXID%%&orthologType=all"

def acc2path( dir, acc ):
    
    lacc="0000000000" + acc
    rdir = dir;
    for d in range(5,1,-1):
        rdir += "/" + lacc[-3*d:-3*(d-1)]
    #print(rdir + "/" + acc + ".xml")
    return rdir + "/" + acc + ".xml"

#-H  "accept: application/json"

parser = argparse.ArgumentParser( description='UniprotKB Tool' )

parser.add_argument('--ulocation', '-ul', dest="uloc", type=str, 
                    required=False, default='local',
                    help='Uniprot record location: local/remote.')

parser.add_argument('--upr', '-u', dest="upr", type=str,
                    required=False, default='Q13936',
                    help='UniprotKB accession.')

parser.add_argument('--file', '-f', dest="file", type=str,
                    required=False, default='',
                    help='Input file.')

parser.add_argument('--out', '-o', dest="out", type=str,
                    required=False, default='',
                    help='Destination path.')

parser.add_argument('--taxid', '-t', dest="taxid", type=str,
                    required=False, default='9606',
                    help='UniprotKB accession.')

parser.add_argument('--pdb', '-p', dest="pdb", type=str,
                    required=False, default='',
                    help='pdb_chain:pdb_chain....')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

# SCRIPT STARTS HERE
#-------------------

args = parser.parse_args()
    
print(args.upr, args.taxid, args.file,args.pdb)


uprList = []

if len(args.file) > 0:

    with open(args.file, "r") as fh:
        for ln in fh:
            if ln.startswith('#'):
                continue        
            uprList.append( ln.split()[0:2])                  
else:
    uprList.append( (args.upr,args.upr))

for (id,upr) in uprList:

    ppath = panther_path + "/" + upr + ".json"

    if not os.path.exists( ppath ):    
        url = purl.replace("%%UPR%%",upr).replace("%%TAXID%%",args.taxid)
        print(upr, url)        
        rec = ""
        print("remote")
        for ln in urlopen(url):
            rec += ln.decode()

        with open(ppath, "w") as oh:
            oh.write(rec)

    olist=[upr]

    prec = ""
    
    with open(ppath, "r") as ih:
        for ln in ih:
            prec += ln
        
    res = json.loads(prec)["search"]["mapping"]["mapped"]

    #olist = []
    for r in res:
        if r["ortholog"] in ["LDO","O"]:
            olist.append(r["target_gene"].split("|")[2].split("=")[1])
        print(r)
     
    print("OLIST:", olist)
       
    with open("tmp.fasta","w") as th:

        for upr in olist:
            uloc = upr_loc[args.uloc]
            # build path to local file

            swpath = acc2path( uloc + "/swissprot", upr)
            trpath = acc2path( uloc + "/trembl", upr)
                        
            if os.path.isfile(swpath):
                
                ufile = swpath
            elif os.path.isfile(trpath):                
                ufile = trpath
            else:
                print( "ERROR: no uniprot file", upr )
                if 1== 1:  # len(cols) > 5:
                    #logh.write( "\t".join( ("", upr, rfs, "\n") ) ) # taxid, odip, oupr, "\n") ) )
                    pass
                else:
                    #logh.write( "\t".join( ("", upr, "\n") ) )
                    #logh.flush()
                    #os.fsync(logh)
                    continue

            print("UniprotKB record: " + ufile)        

            rec = pymex.uprot.Record().parseXml( ufile ) # parse uniprot record

            if rec.protein.host.taxid in taxid:
                print( "TAXID:", rec.protein.host.taxid )
                print( "FASTA",rec.protein.sequence )
        
            
                th.write( ">" + upr + ";" + rec.protein.host.name +";"+rec.protein.host.taxid + ";" + taxid[rec.protein.host.taxid]+ "\n" )
                th.write( rec.protein.sequence + "\n" )
    
    os.system(" mafft --auto tmp.fasta > " + args.out + id +".fasta")
    #sys.exit()    
