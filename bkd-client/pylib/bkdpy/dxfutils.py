
import sys

from lxml import etree as ET

from requests import Session
from requests.auth import HTTPBasicAuth

from zeep import Client as zClient, Settings as zSettings
from zeep.transports import Transport

class DxfUtils():

    print("DxfUtils: imported")

    # expected prefixes/namespaces
    #
    # xsd: http://www.w3.org/2001/XMLSchema
    # ns0: http://mbi.ucla.edu/bkd/services/soap
    # ns1: http://dip.doe-mbi.ucla.edu/services/dxf15

    def __init__( self, wsdlUrl, debug=False ):
        self.wsdlUrl = wsdlUrl
        self.debug = debug
        self._zsettings = zSettings( strict=False, xml_huge_tree=True,
                                     raw_response=True )

        self._zsession = Session()
        self._zsession.varify = False
        # self._zsession.auth = HTTPBasicAuth(self.user, self.password)

        self._zclient = zClient(self.wsdlUrl,
                                settings=self._zsettings,
                                transport=Transport(session=self._zsession))
        
        self._dxfactory = self._zclient.type_factory('ns1')
        self._ssfactory = self._zclient.type_factory('ns0')
        
        if self.debug:
            print(self.zclient)
            print("\nDONE: __init__") 
        
    @property
    def zdxf(self):
        return self._dxfactory
        
    def buildznode( self, node, cid = 1 ):
       
        # ntp - node type: dxf:0003  - protein 
        #                  dxf:0053  - rna(transcript) 
        #                  dxf:0025    gene
        # rns - reference namespace  eg. uni
        # rac - reference accession  eg. P60010-1 
       
        # name  - actin
        # label - Act1
        # taxon - 4932

        #<ns2:node ac="$ns" ns="$rac" id="1">
        # <ns2:type name="protein" ac="dxf:0003" ns="dxf"/>
        # <ns2:label>$label</ns2:label>
        # <ns2:name>$name</ns2:name>
        # <ns2:xrefList>
        #  <ns2:xref type="produced-by" typeAc="dxf:0007" typeNs="dxf" ac="$taxon" ns="taxid"/>
        # </ns2:xrefList>
        #</ns2:node>       

        #print(node)
        
        ntype = self.getTypeDefType( node["type"] )
        print( ntype )
        znode = self.zdxf.nodeType( ns=node["rns"], ac=node["rac"], type=ntype, id=1,
                                    label=node["label"], name=node["name"],
                                    xrefList = {'xref':[]})
        
        txref = self.zdxf.xrefType( typeNs = "dxf", typeAc ="dxf:0007",
                                    type = "produced-by",
                                    ns = "taxid", ac = node["taxid"] )

        znode.xrefList.xref.append(txref)


        if "xref" in node:
            for x in node["xref"]:                
                cxref = self.zdxf.xrefType( type = x["type"],
                                            typeNs = x["typeNs"],
                                            typeAc = x["typeAc"],
                                            ns = x["ns"],
                                            ac = x["ac"] )
                if "target" in x:
                    tgt = x["target"]
                    tgtType = self.getTypeDefType( tgt["type"] )
                    tgtNs = tgt["ns"]
                    tgtAc = tgt["ac"]
                    tgtName = tgt["name"]
                    tgtLabel = tgt["label"]
                    tnode = self.zdxf.nodeType( ns = tgtNs,
                                                ac = tgtAc,
                                                type = tgtType,
                                                id = 1,
                                                label = tgtLabel,
                                                name = tgtName )
                    # add tnode to cxref
                    cxref.node = tnode
                    
                # add xcref to node xrefs
                znode.xrefList.xref.append(cxref)
                
        if "sequence" in node:
            if znode.attrList is None:
                znode.attrList = {'attr':[]}
                
            cattr = self.zdxf.attrType( name = "sequence", ns="dxf",ac ="dxf:0000",
                                        value = node["sequence"] )
            znode.attrList["attr"].append( cattr )
        
        if "comment" in node:
            if znode.attrList is None:
                znode.attrList = {'attr':[]}
                
            cattr = self.zdxf.attrType( name = "comment", ns="dxf",ac ="dxf:0000",
                                        value = node["comment"] )
            znode.attrList["attr"].append( cattr )
            
        if "source" in node:
            src = node["source"]
            if znode.attrList is None:
                znode.attrList = {'attr':[]}

            if src["type"] in ["online-resource"]:
                stype = self.getTypeDefType( "online-record" )
            else:
                stype = self.getTypeDefType( src["type"] )

            snode = self.zdxf.nodeType( id=1, ns=src["ns"], ac=src["ac"],
                                        type= stype,                     
                                        label=src["label"], name=src["name"],
                                        attrList = {'attr':[]})

            if "url" in src:
                url = self.zdxf.attrType( name = "url", ns="dxf",ac ="dxf:0000",
                                          value = src["url"] )
                snode.attrList["attr"].append( url )
                
            if "orcid" in src:
                orcid = self.zdxf.attrType( name = "orcid", ns="dxf",ac ="dxf:0000",
                                            value = src["orcid"] )
                snode.attrList["attr"].append( orcid )
                
            if "pmid" in src:
                pmid = self.zdxf.attrType( name = "pmid", ns="dxf",ac ="dxf:0000",
                                            value = src["pmid"] )
                snode.attrList["attr"].append( orcid )
                
                
            cattr = self.zdxf.attrType( name = "source", ns="dxf",ac ="dxf:0000",
                                        type = self.getTypeDefType( src["type"] ),
                                        node = snode )
            znode.attrList["attr"].append( cattr )
            

                
            
        zdts = self.zdxf.datasetType([znode])
        zdts['level']= "1"
        zdts['version']= "5"

       
        return zdts
   
    def getTypeDefType( self,tname ):

        ntype = None 
        if tname.lower() in ["protein"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0003",
                                           name="protein" )
        elif tname.lower() in ["transcript","rna"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0053",
                                           name="rna" )
        elif tname.lower() in ["gene","dna"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0025",
                                           name="gene" )
        elif tname.lower() in ["organism","taxon"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0017",
                                           name="organism" )

        elif tname.lower() in ["produced-by"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0007",
                                           name="produced-by" )

        elif tname.lower() in ["identical-to"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0009",
                                           name="identical-to" )
        elif tname.lower() in ["online-resource"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0054",
                                           name="online-resource" )
        elif tname.lower() in ["published-resource"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0055",
                                           name="published-resource" )
        elif tname.lower() in ["person"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0056",
                                           name="person" )
        elif tname.lower() in ["online-record"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0057",
                                           name="online-record" )
        return ntype
            
