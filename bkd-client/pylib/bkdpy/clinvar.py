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

class ClinVar():
 
    def __init__( self, mode='dev', debug=False ):
        
        self.mode = mode
        self._debug = debug    

        self._clvmirror = '/mnt/mirrors/clinvar/records'
        self._esearch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?'
        self._efetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?'

        self._clurl = self._esearch+'db=clinvar&term=%%ID%%&retmax=5000'
        #self._clurl = self._esearch+'db=clinvar&term=%%ID%%+AND+single_gene%20[prop]&retmax=5000'
        self._cvurl = self._efetch+'db=clinvar&rettype=vcv&id=%%ID%%'
        self._cvidt = "VCV000000000"
        
        if self._debug:        
            print('DEBUG: clinvar: ', self.rsurl)
            print('DEBUG: clinvar: ', self.rsmirror)
            print("DEBUG: clinvar: __init__ DONE")                   
                       
    @property
    def clurl(self):
        return self._clurl

    @property
    def cvurl(self):
        return self._cvurl

    def getfpath( self, cvid ):

        cdir = self._clvmirror
        cvid = "0"*12+ str(cvid)
        cvid = cvid[-12:]
        for i in range(0,9,3):
            cdir +=  "/" +cvid[i:i+3]
            if not os.path.isdir(cdir):
                os.mkdir(cdir) 

        fpath = cdir + "/VCV" + cvid + ".xml"
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
        else:
            return rec

    def getlocal( self, cvid, debug = 'False' ):

        fpath = self.getfpath( cvid )

        if debug == 'True':
            print( "DEBUG: clinvar: getrecord(local) ->",fpath)
            sys.stdout.flush()
             
        if os.path.isfile( fpath ):
            return pymex.clinvar.Record().parseXml( fpath )
            
        return None
        
    def getremote( self, cvid, debug = False ):
        time.sleep(2.0)

        myurl = self._cvurl.replace( '%%ID%%', self._cvidt[:-len(str(cvid))]+str(cvid) )
        print("DEBUG: clinvar: getrecord(remote) ->", myurl)
        sys.stdout.flush()

        if debug:
            print( "DEBUG: clinvar: getrecord(remote) ->", myurl)    
            sys.stdout.flush()
            
        ntry = 4
        while ntry > 0:
            try:                
                with open( self.getfpath( cvid ), "w" ) as lf:
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
            
        return pymex.clinvar.Record().parseXml( self.getfpath( cvid ) )
        
        
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
