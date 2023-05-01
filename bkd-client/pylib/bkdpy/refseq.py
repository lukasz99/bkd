from http.client import HTTPSConnection, HTTPResponse
import json
import re
import os
import sys
import time

from urllib.request import urlopen

import ssl

from requests import Session
from requests.auth import HTTPBasicAuth

from zeep import Client as zClient, Settings as zSettings
from zeep import xsd
from zeep.transports import Transport


from lxml import etree as ET

import pymex
import bkdpy as BKD

print("RefSeq: imported")

class RefSeq():
 
    def __init__( self, mode='dev', debug=False ):
        print("bkdpy.RefSeq: init")
        self.mode = mode
        self._debug = debug    

        self._mirror = '/mnt/mirrors/refseq/records'
        self._esearch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?'
        self._efetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?'

        self._purl = self._efetch+'db=protein&rettype=xml&id=%%ID%%'
        self._nurl = self._efetch+'db=nuccore&rettype=xml&id=%%ID%%'
        

        #https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&rettype=xml&id=NM_005183.3  
        #https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&rettype=xml&id=NP_005537.3

        if self._debug:        
            print('DEBUG: refseq: ', self.url)
            print('DEBUG: refseq: ', self.mirror)
            print("DEBUG: refseq: __init__ DONE")                   
                       
    @property
    def purl(self):
        return self._purl

    @property
    def nurl(self):
        return self._nurl

    def getfpath( self, cvid ):

        cdir = self._mirror
        for i in range(0,len(cvid),3):
            cdir +=  "/" +cvid[i:i+3]
            if not os.path.isdir(cdir):
                os.mkdir(cdir) 

        fpath = cdir + "/" + cvid + ".xml"
        return fpath
            

    def getlist( self, id, debug = 'False' ):
        if debug == 'True':
            print("DEBUG: clinvar: getlist->", id)

        myurl = self._clurl.replace( '%%ID%%', id )

        if debug == 'True':
            print("DEBUG: clinvar: getlist: url ->", myurl)

        try:
            mydom = ET.parse(urlopen(myurl))
            idl = mydom.xpath("//IdList/Id/text()")
            return idl
        except:        
            return []
        
    def getrecord( self, cvid, debug = 'False' ):
        
        rec = self.getlocal( cvid, debug = debug )
        if rec is None:
            return self.getremote( cvid, debug = debug )
        
        return rec

    def getlocal( self, rsid, debug = 'True' ):
        
        fpath = self.getfpath( rsid )
        
        if debug == 'True':
            print( "DEBUG: refseq: getrecord(local) ->",fpath)
            sys.stdout.flush()
            
        if os.path.isfile( fpath ):
            rec = pymex.refseq.Record().parseXml( open( fpath ) )
            return rec
        
        return None
        
    def getremote( self, rsid, debug = False ):
        time.sleep(2.0)

        if rsid[1] == "P":
            myurl = self._purl.replace( '%%ID%%', rsid )
        else:
            myurl = self._nurl.replace( '%%ID%%', rsid )
        print("DEBUG: refseq: getrecord(remote) ->", myurl)
        
        if debug:
            print( "DEBUG: refseq: getrecord(remote) ->", myurl)    
            sys.stdout.flush()
            
        ntry = 4
        while ntry > 0:
            try:                
                with open( self.getfpath( rsid ), "w" ) as lf:
                    for ln in urlopen(myurl):
                        lf.write(ln.decode())
                ntry = -10
            except:
                ntry -=1
                print("sleeping...",(3-ntry)*(3*ntry)*5)
                sys.stdout.flush()
                time.sleep((3-ntry)*(3*ntry))

        if ntry == 0:
            print("failed: ", myurl)
            sys.exit()
        
        return pymex.refseq.Record().parseXml( self.getfpath( rsid ) )
