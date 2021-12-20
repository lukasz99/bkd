from http.client import HTTPSConnection, HTTPResponse
import json
import re
import urllib.request
import ssl

from requests import Session
from requests.auth import HTTPBasicAuth

from zeep import Client as zClient, Settings as zSettings
from zeep import xsd
from zeep.transports import Transport


from lxml import etree as ET

import pymex
import bkdpy as BKD

class MutZeep():
 
    def __init__( self, mode='dev', debug=False ):

        self.dxfns = { 'dxf': 'http://dip.doe-mbi.ucla.edu/services/dxf20' }
        self.mode = mode
        self._debug = debug    
        
        self._zeepWsdlUrl = "https://mutalyzer.nl/services/?wsdl"
    
        self._zsettings = zSettings( strict=False,
                                     xml_huge_tree=True,
                                     raw_response=True )

        self._zsession = Session()        
        self._zsession.verify = False

        self._zclient = zClient(self._zeepWsdlUrl,
                               settings=self._zsettings,
                               transport=Transport(session=self._zsession))
        
        self._dxfactory = self._zclient.type_factory('ns1')
        self._ssfactory = self._zclient.type_factory('ns0')
        
        if self._debug:
            print(self._zclient)
            print("\nDONE: __init__") 
                  
        if self._debug:
            print(self.wsdlurl)


    @property    
    def zclient(self):
        return self._zclient

    @property    
    def dxfactory(self):
        return self._dxfactory
            
    @property
    def ssfactory(self):
        return self._ssfactory

    def info( self ):
        print("MutClinet: mapTranscriptToChromosomes")
        client = self._zclient
        
        try:
            with client.settings(raw_response=True):
                node = self._zclient.service.info()
                tree = ET.fromstring( node.text.encode() )
                payload=tree.xpath("s:Body/*",namespaces={"s":"http://schemas.xmlsoap.org/soap/envelope/"})
                
                mrec = pymex.mutilyzer.Record()                
                mrec.parseXmlTree( payload[0] )      
                
        except Exception as e:
             print( e )
             return None

        return mrec
    
    def checkSyntax( self, variant, detail='default', format='dxf20', debug = False ):
        print("MutClinet: checkSyntax")
        client = self._zclient                 
        try:
            with client.settings(raw_response=True):
                node = self._zclient.service.checkSyntax(variant)
                tree = ET.fromstring(node.text.encode())
                print(ET.tostring(tree, pretty_print=True).decode() )
                  
            #dset = tree.xpath('//dxf:dataset',namespaces = self.dxfns )
            #if dset:
            #    return dset[0]
        except Exception as e:
             print( e )
        return None

    
    def mappingInfo( self, build, transcript, variant, detail='default', format='dxf20', debug = False ):
        print("MutClinet: mappingInfo")
        client = self._zclient                 
        try:
            with client.settings(raw_response=True):
                node = self._zclient.service.mappingInfo(LOVD_ver='', build=build,accNo=transcript, variant=variant)
                tree = ET.fromstring( node.text.encode() )
                payload=tree.xpath("s:Body/*",namespaces={"s":"http://schemas.xmlsoap.org/soap/envelope/"})
                
                mrec = pymex.mutilyzer.Record()                
                mrec.parseXmlTree( payload[0] )      
                
        except Exception as e:
             print( e )
             return None

        return mrec
    
    def mapTranscriptToChromosomes(self, transcript, detail='default', format='dxf20', debug = False ):
        print("MutClinet: mapTranscriptToChromosomes")
        client = self._zclient                 
        try:
            with client.settings(raw_response=True):
                node = self._zclient.service.mapTranscriptToChromosomes( transcript=transcript )
                tree = ET.fromstring( node.text.encode() )
                payload=tree.xpath("s:Body/*",namespaces={"s":"http://schemas.xmlsoap.org/soap/envelope/"})
                
                mrec = pymex.mutilyzer.Record()                
                mrec.parseXmlTree( payload[0] )      
                
        except Exception as e:
             print( e )
             return None

        return mrec
        
