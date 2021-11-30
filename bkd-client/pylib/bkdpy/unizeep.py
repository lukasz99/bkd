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

        self.debug = debug

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
        
        #self._ftypes={"mutagenesis site":{"name":"mutation","ns":"psi-mi","ac":"MI:0118"},
        #              "glycosylation site":{"name":"glycolysated residue","ns":"psi-mod","ac":"MOD:00693"}
        #}

        self._ftypes={"mutation":{"name":"mutation","ns":"psi-mi","ac":"MI:0118"},
                      "variant":{"name":"variant","ns":"psi-mi","ac":"MI:1241"}
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
                    print( "Unrecognized alias type:", alias.type)


    def appendIsoforms(self, rec, element, zelement ):
        '''generates splice xrefList'''

        zdxf = self._dxfactory
        #print("isoform",type(element))
        upr_id = rec.accession["primary"]
        if element.molecule is not None:
            if (element.molecule.split(" ")[0] == "Isoform"):
                #print(element.molecule)
                for isoform_num in element.molecule.split(" ")[1:]:
                    
                    zxref = zdxf.xrefType( type = "describes",
                                           typeNs = "dxf",
                                           typeAc = "dxf:0024",
                                           node = xsd.SkipValue,
                                           ns = "upr", ac = upr_id + "-" + element.molecule.split(" ")[1])
                    zelement.xrefList["xref"].append(zxref)
                    
            else:
                #print(upr_id + "\t" + "Molecule NOT Isoform: " + element.molecule)
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


    def appendEvidence(self, rec, feat, zelement ):   # element == feature ?
        if self.debug:
            print("EV", feat.evidence)

        zdxf = self._dxfactory

        for ev in feat.evidence:
            if self.debug:
                print("      EV:" , type(ev.type), ev.type)

            if ev.type in self._eco_label_dict.keys():
                eco_label = self._eco_label_dict[ev.type]
            else:
                eco_id = ev.type.replace(":","_")                
                eco_file = urlopen(self._eco_url%eco_id).read()
                sleep(1)
                eco_text = eco_file.decode("utf-8")
                eco_json = json.loads(eco_text)
                eco_label = eco_json["_embedded"]["terms"][0]["label"]
                self._eco_label_dict[ev.type] = eco_label
                
                if os.access(self._eco_path, os.W_OK):
                    # only when allowed to write
                    json_object = json.dumps(self._eco_label_dict, indent = 4)                
                    with open(self._eco_path, "w") as outfile:
                        outfile.write(json_object)                         

            evs=ev.source
            if evs is not None:
                if self.debug:
                    print("      EVS: ns=",evs["ns"], " ac=", evs["ac"])
                    
                if evs["ns"] == "UniprotKB":
                    ns = "upr"
                else:
                    ns = evs["ns"]
                    
                zxref = zdxf.xrefType( type = eco_label,
                                       typeNs = "eco",
                                       typeAc = ev.type,
                                       node = xsd.SkipValue,
                                       ns = ns,
                                       ac = ev.source["ac"])
                zelement.xrefList["xref"].append(zxref)
               
            else:
                zxref = zdxf.xrefType( type = eco_label,
                                       typeNs = "eco",
                                       typeAc = ev.type,
                                       node = xsd.SkipValue,
                                       ns = "upr",
                                       ac = rec.accession["primary"])
                zelement.xrefList["xref"].append(zxref)
                        
        return
        
        #if "_evidence" in element._feature.keys():
        #    print(" ***",element._feature["_evidence"])
        #print(element._feature)
        

        evidence_dict = rec.root["uniprot"]["entry"][0]["evidence"]
        #print("XXX:",element.evidence)

        #for evidence_key in element["evidence"]:
        #    print("evid:", evidence_key, ":")
        #    evidence = evidence_dict[evidence_key]
        
        for ev in element.evidence:
            #print("EV type",ev.type, ev.source)
            #print("EV source", ev.source)
            #print("EV",zelement)

            if ev.type in self._eco_label_dict.keys():
                eco_label = self._eco_label_dict[ev.type]
            else:
                eco_id = ev.type.replace(":","_")
                #print("New ECO id", eco_id)
                eco_file = urlopen(self._eco_url%eco_id).read()
                sleep(1)
                eco_text = eco_file.decode("utf-8")
                eco_json = json.loads(eco_text)
                eco_label = eco_json["_embedded"]["terms"][0]["label"]
                self._eco_label_dict[ev.type] = eco_label

                if os.access(self._eco_path, os.W_OK):
                    # only when allowed to write
                    json_object = json.dumps(self._eco_label_dict, indent = 4)                
                    with open(self._eco_path, "w") as outfile:
                        outfile.write(json_object)                         
            
        
            #if ev.source is not None:
            #    
            #   if ev.source["ns"] == "UniprotKB":
            #       ns = "uprot"
            #   else:
            #       ns = ev.source["ns"]
            #       
            #   zxref = zdxf.xrefType( type = eco_label,
            #                          typeNs = "eco",
            #                          typeAc = ev.type,
            #                          node = xsd.SkipValue,
            #                          ns = ns,
            #                          ac = ev.source["ac"])
            #   zelement.xrefList["xref"].append(zxref)
            #else:
            #    zxref = zdxf.xrefType( type = eco_label,
            #                           typeNs = "eco",
            #                           typeAc = ev.type,
            #                           node = xsd.SkipValue,
            #                           ns = "",
            #                           ac = "")
            #    zelement.xrefList["xref"].append(zxref)
            

            
        
        return
        
        for evidence in element["_evidence"]:

            if evidence["type"] in self._eco_label_dict.keys():
                eco_label = self._eco_label_dict[evidence["type"]]
            else:
                eco_id = evidence["type"].replace(":","_")
                #print("New ECO id", eco_id)
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

        if rec.comment is None:
            return
        
        #print(rec.comm.keys())
        for comment_type in rec.comm.values():
            #print("\nCTYP:",comment_type)

            for comment in comment_type:
                #print(comment)
                #print("TEXT:", comment.text)
                #print("MOLE:", comment.molecule)
                #print("TYPE:", comment.type)
                #print("EVID:", comment.evidence)

                if comment.type in self._ctypes.keys():
                   val = comment.text
                   nme = self._ctypes[comment.type]["name"]
                   #print( "***", val, nme )
                   
                   zattr = zdxf.attrType(value = comment.text,
                                         name = self._ctypes[comment.type]["name"],
                                         ns=self._ctypes[comment.type]["ns"],
                                         ac =self._ctypes[comment.type]["ac"], 
                                         attrList = xsd.SkipValue, 
                                         xrefList = {"xref":[]})

                   self.appendIsoforms( rec, comment, zattr )
                   self.appendEvidence( rec, comment, zattr )
                   znode.attrList["attr"].append(zattr)
                else:
                    pass
                    #print(rec.accession["primary"]+"\tComment Type (skipped): " + comment.type )
                    #return -1
                

        return

                
    def appendDbReferences(self, rec, znode ):

        zdxf = self._dxfactory
            
        isoforms = set([])

        for refType in self._dbtypes:
            #LS: nore - needs fixing 
            refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == refType]

            #print(rec.xref)
            #refList = [dbref for dbref in rec.xref if dbref["type"] == refType]
            
            if refType == "RefSeq" and len(refList) == 1 and "molecule" not in refList[0].keys():
                zxref = zdxf.xrefType( type = "identical-to",
                                       typeNs = "dxf",
                                       typeAc = "dxf:0009",
                                       node = xsd.SkipValue,
                                       ns = refType, ac = refList[0]["id"])
                
                znode.xrefList["xref"].append( zxref )

            else:
                for ref in refList:
                    #print("REF:",ref)
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
                                           ns = refType, ac = ref["id"])
                    
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
        if self.debug:
            print("\nFEATURES(append)\n--------")
        zdxf = self._dxfactory
    
        unhandled_types = set([])
               
        for fname in rec.feat:        
            if fname in self._ftypes.keys():            
                for ff in rec.feat[fname]:
                    featureType = zdxf.typeDefType(ns= self._ftypes[fname]["ns"], 
                                                   ac=self._ftypes[fname]["ac"],
                                                   typeDef = xsd.SkipValue,
                                                   name=self._ftypes[fname]["name"])

                    zfeature = zdxf.featureType(type = featureType,
                                                label = fname, #TODO: filler for now
                                                locationList = {"location":[] },
                                                xrefList = {"xref":[]},
                                                attrList = {"attr":[]} )

                    for r in ff.ranges:
                        zlocation = zdxf.locationType(begin = r.begPosition[0],
                                                      end = r.endPosition[0],
                                                      attrList = {"attr":[]}) 
                        
                        if r.newSequence is not None:                        
                            zattr = zdxf.attrType( value = r.newSequence,
                                                   name = "resulting sequence",
                                                   ns = "psi-mi",
                                                   ac = "MI:1308",
                                                   attrList = xsd.SkipValue)
                            zlocation.attrList["attr"].append(zattr)
                     
                        zfeature.locationList["location"].append(zlocation)
                    
                    for a in ff.attrs:                        
                        zattr = zdxf.attrType( value = a.value,
                                               name = a.name,
                                               ns = "dxf",
                                               ac = a.nameAc,
                                               attrList = xsd.SkipValue)
                        zlocation.attrList["attr"].append(zattr)
                            
                    self.appendIsoforms(rec, ff, zfeature)

                    if self.debug:
                        print("FF:", type(ff))
                        if "evidence" in dir(ff):
                            if len(ff.evidence) > 0:
                                print( "FF-EV:",ff._feature["_evidence"])

                    self.appendEvidence(rec, ff, zfeature)
                        
                    if len(zlocation.attrList["attr"]) == 0:                    
                        zlocation.attrList = xsd.SkipValue

                    if len(zfeature.xrefList["xref"]) == 0:                    
                        zfeature.xrefList = xsd.SkipValue
                        
                    if len(zfeature.attrList["attr"]) == 0:                    
                        zfeature.attrList = xsd.SkipValue
                                            
                    znode.featureList["feature"].append( zfeature )           
        
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
