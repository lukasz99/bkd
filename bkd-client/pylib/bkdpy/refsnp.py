from http.client import HTTPSConnection, HTTPResponse
import json
import re
import os
import sys

from time import sleep
from urllib.request import urlopen

import urllib.parse

import ssl

from requests import Session
from requests.auth import HTTPBasicAuth

from zeep import Client as zClient, Settings as zSettings
from zeep import xsd
from zeep.transports import Transport


from lxml import etree as ET

import pymex
import bkdpy as BKD

class RefSNP():
 
    def __init__( self, mode='dev', debug=False ):
        
        self.mode = mode
        self._debug = debug    

        self._rsmirror = '/mnt/mirrors/refsnp/records'
        self._rsurl = 'https://api.ncbi.nlm.nih.gov/variation/v0/beta/refsnp/%%ID%%'

        self._esearch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?'
        self._efetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?'
       
        self._rsquery = 'db=snp&term=%%ID%%+AND+missense_variant+AND+coding_sequence_variant&retmax=5000'
            
        if self._debug:        
            print("\nDONE: __init__") 
                  
        if self._debug:
            print(self.rsurl)
            print(self.rsmirror)

    @property
    def rsurl(self):
        return self._rsurl


    def getfpath( self, rs ):

        cdir = self._rsmirror
        rs = "0"*12+ str(rs)
        rs = rs[-12:]
        for i in range(0,9,3):
            cdir +=  "/" +rs[i:i+3]
            if not os.path.isdir(cdir):
                os.mkdir(cdir) 

        fpath = cdir + "/rs" + rs + ".json"
        return fpath
        
    def getlist( self, id, debug = False ):
        if debug:
            print("DEBUG: refsnp: getlist->", id)
            sys.stdout.flush()
        myurl = self._rsquery.replace( '%%ID%%', id )
        myurl = self._esearch + myurl
        if debug:
            print("DEBUG: refsnp: getlist: url ->", myurl)
            sys.stdout.flush()
        try:
            mydom = ET.parse(urlopen(myurl))        
            idl = mydom.xpath("//IdList/Id/text()")
            return idl
        except:        
            return []

    def getlocal( self, rs ):

        rec = None

        fpath = self.getfpath( rs )
                
        if os.path.isfile( fpath ):
            with open( fpath, "r") as lf:
                for ln in lf:
                    rec = json.loads( ln )

        return rec

    
    def getremote( self, rs ):
        #print("RefSNP: get report")
        url = self._rsurl.replace('%%ID%%',rs)
        print("refsnp: getremote ->", url)
        sys.stdout.flush()
        rec = {}

        with open( self.getfpath( rs ), "w" ) as lf:
            for ln in urlopen(url):
                lf.write(ln.decode())
                rec = json.loads(ln)
        
        return rec


    def getrecord( self, rs, debug=False, delay=1 ):
        rec = self.getlocal( rs )
        
        if rec is None:
            rec = self.getremote( rs )
            sleep(delay)
        return rec
        
    def getpos( self, rs ):

        rec = self.getlocal( rs )
        
        if rec is None:
            rec = self.getremote( rs )
    
        res =[]

        if 'primary_snapshot_data' not in rec:
            return res
            
        for p in rec["primary_snapshot_data"]["placements_with_allele"]:
            if p["seq_id"].startswith("NC_"):
                chromosome = p["seq_id"]
                build = p["placement_annot"]["seq_id_traits_by_assembly"][0]["assembly_name"]
                position = str( p["alleles"][0]["allele"]["spdi"]["position"] )

                res.append({"build":build,"pos":":".join( (chromosome,position ) )})

        return res
