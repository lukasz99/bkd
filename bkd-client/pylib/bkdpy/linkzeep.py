import sys
import os

from lxml import etree as ET

from requests import Session
from requests.auth import HTTPBasicAuth

from zeep import Client as zClient, Settings as zSettings
from zeep.transports import Transport
from zeep import xsd


from urllib.request import urlopen
from time import sleep

import bkdpy as BKD
import json
import re

class LinkZeep(BKD.BkdZeep):

    # expected prefixes/namespaces
    #
    # xsd: http://www.w3.org/2001/XMLSchema
    # ns0: http://mbi.ucla.edu/bkd/services/soap
    # ns1: http://dip.doe-mbi.ucla.edu/services/dxf20

    def __init__( self, zeepWsdlUrl, debug=False ):
        super().__init__(zeepWsdlUrl)
    
        
    def initiateNode(self, ns = "", ac = ""):
        #zdxf = zclient.type_factory("ns1")
        zdxf = self._dxfactory
        
        ntype = zdxf.typeDefType( ns= "dxf", ac="dxf:0004",
                          typeDef = xsd.SkipValue,
                          name="link" )

        znode = zdxf.nodeType(ns="",
                              ac="",
                              type=ntype, 
                              id=1,
                              label="",
                              name=xsd.SkipValue,
                              xrefList = xsd.SkipValue,
                              attrList = xsd.SkipValue,
                              featureList = xsd.SkipValue,
                              partList = {'part':[]})
    
        return znode
    
    def appendParticipants(self, dip_ids, znode):
        '''
        dip_ids are converted into a set
        '''
        zdxf = self._dxfactory
        dip_ids = set(dip_ids)
        print(dip_ids)
        
        for i, dip_id in enumerate(dip_ids):
            upr_node = self.getnode(ns = "DIP", ac = dip_id)        
            ptype = zdxf.typeDefType( ns= "dxf", ac="dxf:0010",
                                      typeDef = xsd.SkipValue,
                                      name="linked-node" )

            ntype = zdxf.typeDefType( ns= "dxf", ac="dxf:0003",
                                      typeDef = xsd.SkipValue,
                                      name="protein" )

            pnode = zdxf.nodeType(ns=upr_node[0].attrib["ns"],
                          ac=upr_node[0].attrib["ac"],
                          type=ntype, 
                          id=1,
                          label=upr_node[0][1].text,
                          name=xsd.SkipValue,
                          xrefList = {"xref":[]},
                          attrList = xsd.SkipValue,
                          featureList = xsd.SkipValue)            
            
            for xref in upr_node.xpath("m:node/m:xrefList/m:xref",
                                       namespaces={"m":"http://dip.doe-mbi.ucla.edu/services/dxf20"}):
                if xref.xpath("@type")[0] == "produced-by":
                    zxref = zdxf.xrefType( type = xref.attrib['type'],
                                           typeNs = xref.attrib['typeNs'],
                                           typeAc = xref.attrib['typeAc'],
                                           node = xsd.SkipValue,
                                           ns = xref.attrib['ns'], ac = xref.attrib['ac'])
                    pnode.xrefList["xref"].append(zxref)
                    break
                    
            for xref in upr_node.xpath("//m:attr/m:xrefList/m:xref",
                                       namespaces={"m":"http://dip.doe-mbi.ucla.edu/services/dxf20"}):
                if xref.xpath("@type")[0] == "describes" and xref.xpath("@ns")[0] == "upr":
                    zxref = zdxf.xrefType( type = "identical-to",
                                           typeNs = "dxf",
                                           typeAc = "dxf:0009",
                                           node = xsd.SkipValue,
                                           ns = "upr", ac = xref.attrib["ac"])
                    pnode.xrefList["xref"].append(zxref)
                    break
                                
            zpart = zdxf.partType(type = ptype,
                                  node = pnode, 
                                  xrefList = xsd.SkipValue, 
                                  attrList = xsd.SkipValue, 
                                  featureList = xsd.SkipValue, 
                                  name = "", 
                                  id = i+1)
            znode.partList['part'].append(zpart)
            
    def buildZnode(self, dip_ids, ns, ac):

        znode  = self.initiateNode( ns = ns, ac = ac )

        self.appendParticipants(dip_ids, znode)
        
        return znode
