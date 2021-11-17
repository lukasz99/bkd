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

class UniZeep(BKD.BkdZeep):

    # expected prefixes/namespaces
    #
    # xsd: http://www.w3.org/2001/XMLSchema
    # ns0: http://mbi.ucla.edu/bkd/services/soap
    # ns1: http://dip.doe-mbi.ucla.edu/services/dxf20

    def __init__( self, zeepWsdlUrl, debug=False ):
        super().__init__(zeepWsdlUrl)

        self._eco_file="ECO_label_dict.json"
        self._eco_url = "https://www.ebi.ac.uk/ols/api/ontologies/eco/terms?iri=http://purl.obolibrary.org/obo/%s"
        self._ctypes = {"function":{"name":"function", "ns":"dxf", "ac":"dxf:0104"},
                        #"subcellular location":{"name":"subcellular-location", "ns":"dxf", "ac":"dxf:0106"},
                        "tissue specificity":{"name":"tissue-specificity", "ns":"dxf", "ac":"dxf:0107"},
                        "activity regulation":{"name":"activity-regulation", "ns":"dxf", "ac":"dxf:0109"},
        }
 
        self._dbtypes = {"EMBL":{"name":"encoded-by", "ns":"dxf", "ac":"dxf:0022"},
                         "RefSeq":{"name":"has-instance", "ns":"dxf", "ac":"dxf:0084"},
                         "PDB":{"name":"has-structure", "ns":"dxf", "ac":"dxf:0081"},
                         "DIP":{"name":"has-links", "ns":"dxf", "ac":"dxf:0082"},
                         "IntAct":{"name":"has-links", "ns":"dxf", "ac":"dxf:0082"},
                         "MIM":{"name":"has-phenotype", "ns":"dxf", "ac":"dxf:0077"}}
        
        self._ftypes={"mutagenesis site":{"name":"mutation","ns":"psi-mi","ac":"MI:0118"},
                      "glycosylation site":{"name":"glycolysated residue","ns":"psi-mod","ac":"MOD:00693"}
        }

        mypath = os.path.realpath(__file__)
        self._eco_path = os.path.join(os.path.split(mypath)[0], self._eco_file )
        
        try:        
            with open(self._eco_path, "r") as openfile:
                self._eco_label_dict = json.load(openfile)
        except Exception:
            self._eco_label_dict = {}
    
        
    def initiateNode(self, rec, ns = "", ac = ""):

        zdxf = self._dxfactory        
        ntype = zdxf.typeDefType( ns= "dxf", ac="dxf:0003",
                                  typeDef = xsd.SkipValue,
                                  name="protein" )

        znode = zdxf.nodeType(ns=ns,
                              ac=ac,
                              type=ntype, 
                              id=1,
                              label=rec.protein.label,
                              name=rec.protein.name,
                              xrefList = {"xref":[] },
                              attrList = {"attr":[] },
                              featureList = {"feature":[] })    
        return znode
    
    def appendAccessions(self, rec, znode ):

        zdxf = self._dxfactory        
        zxref = zdxf.xrefType( type = "identical-to",
                               typeNs = "dxf",
                               typeAc = "dxf:0009",
                               node = xsd.SkipValue,
                               ns = "upr", ac = rec.accession["primary"])

        znode.xrefList["xref"].append( zxref )

        version = rec.version
        #version = rec.root['uniprot']['entry'][0]['version'] #LS: replaced
        #print("ver:",version, rec.version)  #LS
        #print(rec.acc.primary, "::", rec.acc.secondary) #LS
    
        zattr = zdxf.attrType( name = "data-source", value='',
                               ns ="dxf", ac="dxf:0016" )
        zattr.value['ns']='upr'
        #zattr.value['ac']= '.'.join( [rec.accession["primary"], version] ) #LS: replaced
        zattr.value['ac']= '.'.join( [rec.acc.primary, rec.version])        
        zattr.value['type']='database-record'
        zattr.value['typeNs']='dxf'
        zattr.value['typeAc']='dxf:0057'
    
        znode.attrList["attr"].append(zattr)

        if "secondary" in rec.accession.keys():
            for alt_id in rec.accession["secondary"]:
                zxref = zdxf.xrefType( type = "replaces",
                                       typeNs = "dxf",
                                       typeAc = "dxf:0036",
                                       node = xsd.SkipValue,
                                       ns = "upr", ac = alt_id)
                
                znode.xrefList["xref"].append( zxref )

    def appendGeneName( self, rec, znode ):

        if rec.protein.gene is not None:
            zdxf = self._dxfactory
        
            zattr = zdxf.attrType(value = rec.protein.gene,
                                  name = "gene-name",
                                  ns="dxf",ac ="dxf:0102",
                                  attrList = xsd.SkipValue)

            znode.attrList["attr"].append( zattr )


    def appendSynonyms( self, rec, znode ):

        zdxf = self._dxfactory
        
        for alias in rec.protein.alias:
    
            if alias.type == "protein name synonym":
                zattr = zdxf.attrType(value = str(alias),
                                      name = "synonym",
                                      ns="dxf",
                                      ac ="dxf:0031",
                                      attrList = xsd.SkipValue)
                znode.attrList["attr"].append( zattr )
            
            elif alias.type == "gene name synonym":
                zattr = zdxf.attrType(value = str(alias),
                                      name = "gene-synonym",
                                      ns="dxf",ac ="dxf:0103",
                                      attrList = xsd.SkipValue)
                znode.attrList["attr"].append( zattr )
            else:
                if alias.type != "gene name":
                    print( "Uncertain how to handle alias of type: "
                           + alias.type)


    def appendIsoforms(self, rec, element, zelement ):
        '''generates splice xrefList'''

        zdxf = self._dxfactory
        
        upr_id = rec.accession["primary"]
        if "molecule" in element.keys():
            if (element["molecule"]["value"].split(" ")[0] == "Isoform"):
                for isoform_num in element["molecule"]["value"].split(" ")[0][1:]:
                    zxref = zdxf.xrefType( type = "describes",
                                           typeNs = "dxf",
                                           typeAc = "dxf:0024",
                                           node = xsd.SkipValue,
                                           ns = "upr", ac = upr_id + "-" + element["molecule"]["value"].split(" ")[1])
                    zelement.xrefList["xref"].append(zxref)
            else:
                print(upr_id + "\t" + "Molecule NOT Isoform: " + element["molecule"]["value"])
                zxref = zdxf.xrefType( type = "describes",
                                       typeNs = "dxf",
                                       typeAc = "dxf:0024",
                                       node = xsd.SkipValue,
                                       ns = "upr", ac = upr_id)
                zelement.xrefList["xref"].append(zxref)
        else:
            zxref = zdxf.xrefType( type = "describes",
                                   typeNs = "dxf",
                                   typeAc = "dxf:0024",
                                   node = xsd.SkipValue,
                                   ns = "upr", ac = upr_id)
            zelement.xrefList["xref"].append(zxref)


    def appendEvidence(self, rec, element, zelement ):   # element == feature ?
 
        zdxf = self._dxfactory
        if "evidence" not in element:
            return        
        
        evidence_dict = rec.root["uniprot"]["entry"][0]["evidence"]
        #print("XXX:",element.evidence)

        #for evidence_key in element["evidence"]:
        #    print("evid:", evidence_key, ":")
        #    evidence = evidence_dict[evidence_key]

        for evidence in element["_evidence"]:

            if evidence["type"] in self._eco_label_dict.keys():
                eco_label = self._eco_label_dict[evidence["type"]]
            else:
                eco_id = evidence["type"].replace(":","_")
                print("New ECO id", eco_id)
                eco_file = urlopen(self._eco_url%eco_id).read()
                sleep(1)
                eco_text = eco_file.decode("utf-8")
                eco_json = json.loads(eco_text)
                eco_label = eco_json["_embedded"]["terms"][0]["label"]
                self._eco_label_dict[evidence["type"]] = eco_label

                if os.access(self._eco_path, os.W_OK):
                    # only when allowed to write
                    json_object = json.dumps(self._eco_label_dict, indent = 4)                
                    with open(self._eco_path, "w") as outfile:
                        outfile.write(json_object)                         
                
            if "source" in evidence.keys():
                if "dbReference" in evidence["source"].keys():
                    for dbReference in evidence["source"]["dbReference"]:
                        if dbReference["type"] == "UniprotKB":
                            ns = "uprot"
                        else:
                            ns = dbReference["type"]
                        zxref = zdxf.xrefType( type = eco_label,
                                               typeNs = "eco",
                                               typeAc = evidence["type"],
                                               node = xsd.SkipValue,
                                               ns = ns,
                                               ac = dbReference["id"])
                        zelement.xrefList["xref"].append(zxref)
            else:
                zxref = zdxf.xrefType( type = eco_label,
                                       typeNs = "eco",
                                       typeAc = evidence["type"],
                                       node = xsd.SkipValue,
                                       ns = "",
                                       ac = "")
                zelement.xrefList["xref"].append(zxref)
    
        

    def appendComments(self, rec, znode, print_new_types = True):

        zdxf = self._dxfactory

        #LS: need
        # comment.type.ns
        # comment.type.ac
        # comment.type.name
        # comment.text

        # comment.molecule

        print(rec.comm.keys())
        for comment_type in rec.comm.values():
            for comment in comment_type:
                #print("TEXT:", comment.text)
                #print("EVID:", comment.molecule)
                pass
            
        for comment_type in rec.comment.values():            
            for comment in comment_type:
                #print(type(comment))
                if comment["type"] in self._ctypes.keys():
                    zattr = zdxf.attrType(value = comment["text"]["value"],
                                          name = self._ctypes[comment["type"]]["name"],
                                          ns=self._ctypes[comment["type"]]["ns"],
                                          ac =self._ctypes[comment["type"]]["ac"], 
                                          attrList = xsd.SkipValue, 
                                          xrefList = {"xref":[]})
                    self.appendIsoforms( rec, comment, zattr )
                else:
                    print(rec.accession["primary"]+"\tComment Type: "+comment["type"])
                    return -1
                znode.attrList["attr"].append(zattr)

                
    def appendDbReferences(self, rec, znode ):

        zdxf = self._dxfactory
            
        isoforms = set([])

        for refType in self._dbtypes:
            refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == refType]
            if refType == "RefSeq" and len(refList) == 1 and "molecule" not in refList[0].keys():
                zxref = zdxf.xrefType( type = "identical-to",
                                       typeNs = "dxf",
                                       typeAc = "dxf:0009",
                                       node = xsd.SkipValue,
                                       ns = refType, ac = refList[0]["id"])
                
                znode.xrefList["xref"].append( zxref )

            else:
                for ref in refList:
                    if refType == "RefSeq":
                        if "molecule" in ref.keys():
                            isoforms.add(ref["molecule"]["id"])
                        else:
                            #skips RefSeq entries that are not for isoforms if more than one
                            continue

                    zxref = zdxf.xrefType( type = self._dbtypes[refType]["name"],
                                           typeNs = self._dbtypes[refType]["ns"],
                                           typeAc = self._dbtypes[refType]["ac"],
                                           node = xsd.SkipValue,
                                           ns = refType, ac = refList[0]["id"])
                    
                    znode.xrefList["xref"].append( zxref )

        for isoform in isoforms:
            zxref = zdxf.xrefType( type = self._dbtypes["RefSeq"]["name"],
                                   typeNs = self._dbtypes["RefSeq"]["ns"],
                                   typeAc = self._dbtypes["RefSeq"]["ac"],
                                   node = xsd.SkipValue,
                                   ns = "upr", ac = isoform)

            znode.xrefList["xref"].append( zxref )


    def appendSequence(self, rec, znode ):

        zdxf = self._dxfactory
        
        zattr = zdxf.attrType(value = rec.protein.sequence,
                              name="sequence", ns="dxf", ac="dxf:0071",
                              attrList = xsd.SkipValue)
        znode.attrList["attr"].append( zattr )

        
    def appendTaxon(self, rec, znode ):
        
        zdxf = self._dxfactory

        taxon_ntype = zdxf.typeDefType(ns= "dxf", ac="dxf:0017",
                                       typeDef = xsd.SkipValue,
                                       name="taxon" )

        taxon_node = zdxf.nodeType(ns="taxid", 
                                   ac=rec.protein.host.taxid,
                                   type=taxon_ntype,
                                   id=1,
                                   label=rec.protein.host.label,
                                   name=rec.protein.host.name,
                                   xrefList = xsd.SkipValue,
                                   attrList = xsd.SkipValue)
        
        zxref_taxon = zdxf.xrefType( type = "produced-by",
                                     typeNs = "dxf",
                                     typeAc = "dxf:0007",
                                     node = taxon_node,
                                     ns = "taxid",
                                     ac = rec.protein.host.taxid)

        znode.xrefList["xref"].append( zxref_taxon )


    def appendFeatures(self, rec, znode ):

        zdxf = self._dxfactory
    
        unhandled_types = set([])

        if "feature" not in rec.root["uniprot"]["entry"][0]:
            znode.featureList = xsd.SkipValue
            return
        
        for feature in rec.root["uniprot"]["entry"][0]["feature"]:
            if feature["type"] in self._ftypes.keys():
                featureType = zdxf.typeDefType(ns= self._ftypes[feature["type"]]["ns"], 
                                               ac=self._ftypes[feature["type"]]["ac"],
                                               typeDef = xsd.SkipValue,
                                               name=self._ftypes[feature["type"]]["name"])

                zfeature = zdxf.featureType(type = featureType,
                                            label = feature["type"], #TODO: filler for now
                                            locationList = {"location":[] },
                                            xrefList = {"xref":[]},
                                            attrList = {"attr":[]} )

                self.appendIsoforms(rec, feature, zfeature)
                self.appendEvidence(rec, feature, zfeature)

                if "position" in feature["location"].keys():
                    zlocation = zdxf.locationType(begin = feature["location"]["position"]["position"],
                                                  end = feature["location"]["position"]["position"],
                                                  attrList = {"attr":[]}) 
                else:
                    zlocation = zdxf.locationType(begin = feature["location"]["begin"]["position"],
                                                  end = feature["location"]["end"]["position"],
                                                  attrList = {"attr":[]})

                if "variation" in feature.keys():
                    for variation in feature["variation"]:
                        zattr = zdxf.attrType(value = variation,
                                              name = "resulting sequence",
                                              ns = "psi-mi",
                                              ac = "MI:1308",
                                              attrList = xsd.SkipValue)
                        zlocation.attrList["attr"].append(zattr)
                else:
                    zlocation.attrList = xsd.SkipValue

                if "decription" in feature.keys():
                    zattr = zdxf.attrType(value = feature["description"],
                                          name = "description",
                                          ns = "dxf",
                                          ac = "dxf:0089",
                                          attrList = xsd.SkipValue)
                
                    zfeature.attrList["attr"].append(zattr)

                else:
                    zfeature.attrList = xsd.SkipValue

                zfeature.locationList["location"].append(zlocation)

                znode.featureList["feature"].append( zfeature )
            else:
                unhandled_types.add(feature["type"])
    
        if len( znode.featureList["feature"] ) == 0:
            znode.featureList = xsd.SkipValue
        
        print("Unhandled Feature Types: ", unhandled_types)


    def buildZnode(self, rec, ns, ac):  # rec: pymex.uprot.record
                
        znode  = self.initiateNode( rec, ns = ns, ac = ac )

        self.appendAccessions(rec, znode)

        self.appendGeneName(rec, znode)
        
        self.appendSynonyms(rec, znode)
        
        self.appendTaxon(rec, znode)
        
        self.appendComments(rec, znode)
        
        self.appendSequence(rec, znode)
    
        self.appendDbReferences(rec, znode)
        
        self.appendFeatures(rec, znode)
        
        return znode
