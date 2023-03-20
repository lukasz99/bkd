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

class ReportZeep(BKD.BkdZeep):

    # expected prefixes/namespaces
    #
    # xsd: http://www.w3.org/2001/XMLSchema
    # ns0: http://mbi.ucla.edu/bkd/services/soap
    # ns1: http://dip.doe-mbi.ucla.edu/services/dxf20

    def __init__( self, zeepWsdlUrl, debug='False' ):
        super().__init__(zeepWsdlUrl)

        self.debug = debug

    #---------------------------------------------------------------------------
    
    def buildZreport(self,
                     jrep = None,   # from json
                     debug = 'False' ):  
        
        if jrep == None:
            return None
        
        if 'ns' in jrep:
            ns = jrep['ns']
        else:
            ns = ""

        if 'ac' in jrep:
            ac = jrep['ac']            
        else:
            ac = ""
            
        self._znode = self.initiateNode( jrep, ns = ns, ac = ac )
        
        self.addTarget(jrep)
        self.addAttrs(jrep)

        if len( self._znode.attrList['attr'] ) == 0:
            self._znode.attrList = xsd.SkipValue

        if len( self._znode.xrefList['xref'] ) == 0:
            self._znode.xrefList = xsd.SkipValue
            
        if len( self._znode.featureList['feature'] ) == 0:
            self._znode.featureList = xsd.SkipValue
        
        
        if debug == 'True':
            print( "DEBUG(buildZreport):" )

            zdtsnode = self._dxfactory.datasetType( [self._znode] )
            print( ET.tostring( self._zclient.create_message( self._zclient.service,
                                                              'setNode',
                                                              dataset= zdtsnode,
                                                              mode="add"),
                                pretty_print=True ).decode()  )
            
            print( "DEBUG(buildZreport): DONE" )
                        
        return self._znode
            
    def initiateNode(self, jrep, ns = "", ac = ""):
        
        zdxf = self._dxfactory        
        ntype = zdxf.typeDefType( ns = jrep['type']['ns'],
                                  ac = jrep['type']['ac'],
                                  typeDef = xsd.SkipValue,
                                  name = jrep['type']['name'] )
        if 'name' in jrep:
            name =  jrep['name']
        else:
            name = xsd.SkipValue
            
        if 'label' in jrep:
            label = jrep['label']
        else:
            label = jrep['type']['name']
            
        self._znode = zdxf.nodeType( ns=ns,
                                     ac=ac,
                                     type=ntype, 
                                     id=1,
                                     label = label,
                                     name = name,              
                                     xrefList = { "xref":[] },
                                     attrList ={ "attr":[] }, 
                                     featureList = {"feature":[] })
        
        return self._znode
    
    def addTarget(self, jrep):

        #<xrefList>
        #  <xref ns="upr" ac="O00180" type="describes" typeAc="DXF:0024" typeNs="dxf">
        #    <node>
        #      <type ns="dxf" name="report-target" ac="dxf:0000"/>
        #      <label></label>           
        #      <featureList>
        #        <feature>
        #          <type ns="mi" name="mutation" ac="MI:0118"/>   <!-- mutation -->
        #          <label>p.[Val113Ile]
        #          <locationList>
        #            <location>
        #              <begin>113</begin>
        #              <end>113</end>
        #              <attrlist>
        #                <attr name="resulting sequence" ns="mi" ac="MI:1308">
        #                  <value>I</value>
        #                </attr>
        #              </attrList>
        #            <location>
        #          </locationList>
        #          <xrefList>
        #             <xref ns="upr" ac="O00180-1" type="variant" typeAc="dxf:0024" typeNs="dxf"> 
        #          <xrefList>
        #        </feature>
        #      </featureList>
        #    </node>
        #  </xref>
        #  <xref ns="dbSNP" ac="rs:757933370" type="mutation" typeAc="MI:0118" typeNs="mi"/>
        #  <xref ns="pubmed" ac="16636649" type="described-by" typeAc="dxf" typeNs="dxf:0014"/>
        #</xrefList>    
        

        if 'target' not in jrep:
            return

        jtgt = jrep['target']
        
        zdxf = self._dxfactory

        tgtp = zdxf.typeDefType( ns = "dxf",
                                 ac = "dxf:0000",
                                 typeDef = xsd.SkipValue,
                                 name = 'report-target' )
        
        tnode = zdxf.nodeType( type=tgtp, 
                               id=1,
                               ns="",
                               ac="",
                               label = 'report-target',
                               xrefList = {"xref":[] },
                               attrList = {"attr":[] },
                               featureList = {"feature":[] })

        jft = jtgt['feature']
        
        tftp = zdxf.typeDefType( ns = jft["type"]["ns"],
                                 ac = jft["type"]["ac"],
                                 typeDef = xsd.SkipValue,
                                 name=jft["type"]["name"])
        
        zfeature = zdxf.featureType(type = tftp,
                                    label = jft['label'], 
                                    locationList = {"location":[] },
                                    xrefList = {"xref":[]},
                                    attrList = {"attr":[]} )


        if 'vseq' in jft:
                        
            vxref = zdxf.xrefType( type = "describes",
                                   typeNs = "dxf",
                                   typeAc = "dxf:0024",
                                   node = xsd.SkipValue,
                                   ns = 'upr', ac =jft['vseq'])

            zfeature.xrefList['xref'].append( vxref )
        
        for r in jft['range']:
            if 'pos' in r:
                rbeg = r['pos']
                rend = r['pos']
            else:
                rbeg = r['from']
                rend = r['to']
            if 'sequence' in r:
                rseq = r['sequence']
            else:
                rseq = None
                
            zloc = zdxf.locationType( begin = rbeg,
                                      end = rend,
                                      attrList = {"attr":[]})
            
            if rseq is not None:
                zla = zdxf.attrType( value = rseq,
                                     name = "resulting sequence",
                                     ns = "psi-mi",
                                     ac = "MI:1308",
                                     attrList = xsd.SkipValue)
                zloc.attrList["attr"].append(zla)
                
                zfeature.locationList["location"].append( zloc )
        
        if len( zfeature.xrefList['xref']) == 0:
            zfeature.xrefList = xsd.SkipValue

        if len( zfeature.attrList['attr']) == 0:
            zfeature.attrList = xsd.SkipValue
    
        tnode.featureList['feature'].append( zfeature );

        if len( tnode.xrefList['xref']) == 0:
            tnode.xrefList = xsd.SkipValue

        if len( tnode.attrList['attr']) == 0:
            tnode.attrList = xsd.SkipValue
            
        txref = zdxf.xrefType( type = "describes",
                               typeNs = "dxf",
                               typeAc = "dxf:0024",
                               node = tnode,
                               ns = jtgt['ns'], ac =jtgt['ac'])
         
        self._znode.xrefList["xref"].append( txref )
        
        
    def addAttrs( self, jrep ):
        
        zdxf = self._dxfactory

        source = False
        
        if 'attr' in jrep:
            for a in jrep['attr']:

                if a['name'] == 'data-source':
                    source = True
                
                za = zdxf.attrType( value = a['value'],
                                    name = a['name'],
                                    ns=a['ns'],ac = a['ac'],
                                    attrList = xsd.SkipValue)

                self._znode.attrList["attr"].append( za )
                
        if 'comments' in jrep:
            comment = jrep['comments']
            
            zcattr = zdxf.attrType( value = comment,
                                    name = "comment",
                                    ns="dxf",ac ="dxf:0087",
                                    attrList = xsd.SkipValue)
            
            self._znode.attrList["attr"].append( zcattr )
            
        if 'dataset' in jrep:
            dts = jrep['dataset']
            
            zcattr = zdxf.attrType( value = dts,
                                    name = "dataset",
                                    ns="dxf",ac ="dxf:0000",
                                    attrList = xsd.SkipValue)
            
            self._znode.attrList["attr"].append( zcattr )
            


        if not source: 
            
            # (missing) data source
            #----------------------

            
            zsattr = zdxf.attrType( value = "",
                                    name = "data-source",
                                    ns = "dxf",
                                    ac = "dxf:0016",
                                    attrList = xsd.SkipValue)
        
            zsattr.value['ns'] = jrep['ns']
            zsattr.value['ac'] = jrep['ac']
            zsattr.value['type'] = 'database-record'
            zsattr.value['typeNs'] = 'dxf'
            zsattr.value['typeAc'] = 'dxf:0057'
            
            self._znode.attrList["attr"].append( zsattr )

            
        

    
