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
 
        self._dbtypes = {"EMBL":{ "xns":"EMBL", "name":"encoded-by", "ns":"dxf", "ac":"dxf:0022"},
                         "GeneID":{"xns":"GeneID","name":"encoded-by", "ns":"dxf", "ac":"dxf:0022"},
                         "HGNC":{"xns":"HGNC","name":"encoded-by", "ns":"dxf", "ac":"dxf:0022"},                         
                         "RefSeq":{"xns":"RefSeq","name":"has-instance", "ns":"dxf", "ac":"dxf:0084"},
                         "PDB":{"xns":"PDB","name":"has-structure", "ns":"dxf", "ac":"dxf:0081"},
                         "DIP":{"xns":"DIP","name":"has-links", "ns":"dxf", "ac":"dxf:0082"},
                         "IntAct":{"xns":"IntAct","name":"has-links", "ns":"dxf", "ac":"dxf:0082"},
                         "MIM":{"xns":"MIM","name":"described-by", "ns":"dxf", "ac":"dxf:0014"},
                         "MIM-gene":{"xns":"MIM","name":"encoded-by", "ns":"dxf", "ac":"dxf:0022"},
                         "MIM-phenotype":{"xns":"MIM","name":"has-phenotype", "ns":"dxf", "ac":"dxf:0077"} }

        self._clinsig = {"risk factor":{"ac":"dxf:0122","name":"risk factor","ns":"dxf"},
                         "risk-factor":{"ac":"dxf:0122","name":"risk factor","ns":"dxf"},
                         "benign/likely benign; risk factor":{"ac":"dxf:0122","name":"risk factor","ns":"dxf"},
                         "Benign/Likely benign; risk factor":{"ac":"dxf:0122","name":"risk factor","ns":"dxf"},
                         "uncertain":{"ac":"dxf:0123","name":"uncertain","ns":"dxf"},
                         "uncertain-significance":{"ac":"dxf:0123","name":"uncertain","ns":"dxf"},
                         "conflicting evidence":{"ac":"dxf:0124","name":"conflicting evidence","ns":"dxf"},
                         "conflicting-interpretations-of-pathogenicity":{"ac":"dxf:0124","name":"conflicting evidence","ns":"dxf"},
                         'Conflicting interpretations of pathogenicity, risk factor':{"ac":"dxf:0124","name":"conflicting evidence","ns":"dxf"},
                         "likely pathogenic":{"ac":"dxf:0125","name":"likely pathogenic","ns":"dxf"},
                         "likely-pathogenic":{"ac":"dxf:0125","name":"likely pathogenic","ns":"dxf"},
                         "pathogenic-likely-pathogenic":{"ac":"dxf:0125","name":"likely pathogenic","ns":"dxf"},
                         "pathogenic":{"ac":"dxf:0126","name":"pathogenic","ns":"dxf"},
                         "likely benign":{"ac":"dxf:0127","name":"likely benign","ns":"dxf"},
                         "likely-benign":{"ac":"dxf:0127","name":"likely benign","ns":"dxf"},
                         "benign-likely-benign":{"ac":"dxf:0127","name":"likely benign","ns":"dxf"},
                         "benign":{"ac":"dxf:0128","name":"benign","ns":"dxf"},
                         "drug response":{"ac":"dxf:0129","name":"drug response","ns":"dxf"},
                         "drug-response":{"ac":"dxf:0129","name":"drug response","ns":"dxf"},
                         "protective":{"ac":"dxf:0131","name":"pritective","ns":"dxf"},
                         "unspecified":{"ac":"dxf:0130","name":"unspecified","ns":"dxf"},
                         "no interpretation for the single variant":{"ac":"dxf:0130","name":"unspecified","ns":"dxf"},                         
                         "not provided":{"ac":"dxf:0130","name":"unspecified","ns":"dxf"},
                         "not-provided":{"ac":"dxf:0130","name":"unspecified","ns":"dxf"} }
        
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

        self._znode = zdxf.nodeType(ns=ns,
                                    ac=ac,
                                    type=ntype, 
                                    id=1,
                                    label=rec.protein.label,
                                    name=rec.protein.name,
                                    xrefList = {"xref":[] },
                                    attrList = {"attr":[] },
                                    featureList = {"feature":[] })    
        return self._znode
    
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
                        if dbReference["type"] == "UniProtKB":
                            ns = "upr"
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

                
    def appendDbReferences(self, rec, znode, geneid = None ):
        #print("gid:",geneid)
        #xxx
        zdxf = self._dxfactory
            
        isoforms = set([])

        for refType in self._dbtypes:
            #LS: nore - needs fixing 
            refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == refType]

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

                    if refType == "RefSeq":
                        if "molecule" in ref.keys():
                            isoforms.add(ref["molecule"]["id"])
                        else:
                            #skips RefSeq entries that are not for isoforms if more than one
                            continue                    

                    if refType.startswith("MIM"):
                        
                        if 'property' in ref and len(ref['property']) > 0:
                            for p in ref['property']:
                                if p['type'] == 'type' and p['value'] == 'gene':
                                    refType = 'MIM-gene'
                                if p['type'] == 'type' and p['value'] == 'phenotype':
                                    refType = 'MIM-phenotype'

                                    
                    zxref = zdxf.xrefType( type = self._dbtypes[refType]["name"],
                                           typeNs = self._dbtypes[refType]["ns"],
                                           typeAc = self._dbtypes[refType]["ac"],
                                           node = xsd.SkipValue,
                                           ns = self._dbtypes[refType]["xns"], ac = ref["id"])
                    
                    znode.xrefList["xref"].append( zxref )

        for isoform in isoforms:
            zxref = zdxf.xrefType( type = self._dbtypes["RefSeq"]["name"],
                                   typeNs = self._dbtypes["RefSeq"]["ns"],
                                   typeAc = self._dbtypes["RefSeq"]["ac"],
                                   node = xsd.SkipValue,
                                   ns = "upr", ac = isoform)

            znode.xrefList["xref"].append( zxref )

        if geneid != None: 
            zxref = zdxf.xrefType( type = self._dbtypes['GeneID']["name"],
                                   typeNs = self._dbtypes['GeneID']["ns"],
                                   typeAc = self._dbtypes['GeneID']["ac"],
                                   node = xsd.SkipValue,
                                   ns = self._dbtypes['GeneID']["xns"], ac = geneid )
                    
            znode.xrefList["xref"].append( zxref )

    def appendSequence( self, rec, seqvar, znode ):

        zdxf = self._dxfactory

        # default sequence
        #-----------------
        
        zattr = zdxf.attrType(value = rec.protein.sequence,
                              name="sequence", ns="dxf", ac="dxf:0071",
                              attrList = xsd.SkipValue)
        znode.attrList["attr"].append( zattr )


        # sequence variants
        #------------------

        if seqvar is None or len(seqvar) == 0:
            return
        
        for csv in seqvar:
            print("CSV",csv)
            if csv['seq'] is not None:
                svseq = "".join(csv['seq'].split())  # remove whitespace
                if len(svseq) > 0:
                    zattr = None
                    if csv['type'] == 'canonical':
                        zattr = zdxf.attrType( value = csv['seq'],
                                               name="canonical-sequence",
                                               ns="dxf", ac="dxf:0134",
                                               attrList = xsd.SkipValue,
                                               xrefList = {"xref":[]})
                        
                    if csv['type'] == 'mane':
                        zattr = zdxf.attrType( value = csv['seq'],
                                               name="mane-sequence",
                                               ns="dxf", ac="dxf:0135",
                                               attrList = xsd.SkipValue,
                                               xrefList = {"xref":[]})
                        
                    if csv['type'] == 'alternate':
                        zattr = zdxf.attrType( value = csv['seq'],
                                               name="alternate-sequence",
                                               ns="dxf", ac="dxf:0138",
                                               attrList = xsd.SkipValue,
                                               xrefList = {"xref":[]})
                
                    if zattr is not None:    
                        for k in  ['upr','RefSeq','tRefSeq']:
                            if k in csv and csv[k] is not None:
                                if k == 'tRefSeq':
                                    csxupr = zdxf.xrefType( type = "translated-from",
                                                            typeNs = "dxf",
                                                            typeAc = "dxf:0080",
                                                            node = xsd.SkipValue,
                                                            ns = 'RefSeq',
                                                            ac = csv[k])
                                else:
                                    csxupr = zdxf.xrefType( type = "identical-to",
                                                            typeNs = "dxf",
                                                            typeAc = "dxf:0009",
                                                            node = xsd.SkipValue,
                                                            ns = k,
                                                            ac = csv[k])
                                zattr.xrefList['xref'].append( csxupr )
                    
                    znode.attrList["attr"].append( zattr )
        
        return
        
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
                        #zlocation.attrList["attr"].append(zattr)
                        zfeature.attrList["attr"].append(zattr)
                            
                    self.appendIsoforms(rec, ff, zfeature)
                    
                    if "xref" in ff._feature:
                        for xref in ff._feature["xref"]:
                            
                            xrefns = xref["type"]
                            if xrefns.startswith("GRCh"):
                                xType = "located-at"
                                xTypeAc = "dxf:0113"
                            else:
                                xType = "identical-to"
                                xTypeAc = "dxf:0009"
                            
                            zdxf = self._dxfactory        
                            zxref = zdxf.xrefType( type = xType,
                                                   typeNs = "dxf",
                                                   typeAc = xTypeAc,
                                                   node = xsd.SkipValue,
                                                   ns = xrefns, ac=xref["id"])

                            zfeature.xrefList["xref"].append( zxref )
                            
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
                
        print("Unhandled Feature Types: ", unhandled_types)


        
    # dnDNP features
    #---------------
    
    def appendDsnFeature( self, dsn, rsc, debug = False ):        
        print( '\nappendDsnFeature:\n') # json.dumps(dsn, indent=3) )
        
        zdxf = self._dxfactory
        
        featureType = zdxf.typeDefType(ns= "psi-mi",
                                       ac= "MI:1241",
                                       typeDef = xsd.SkipValue,
                                       name="variant")

        zfeature = zdxf.featureType(type = featureType,
                                    label = "", 
                                    locationList = {"location":[] },
                                    xrefList = {"xref":[]},
                                    attrList = {"attr":[]} )

        print(dsn["pchange"])
        pos=re.sub("\D","",dsn["pchange"][0])
        rseq=re.sub("\D\d+","",dsn["pchange"][0])

        #pos = None
        
        #for h in vcv['HGVS']:
        #    if h['ac']+"."+h['ver'] in rsc: # == rsc:
        #        pos = h['pos']

        #print(rsc)
        #print(pos)
        
        #sys.exit()
        
        if pos == None or rseq == None:
            print("WARNINIG:", dsn['ac']+"."+dsn['ver'],":non-canonical feature location only")
            return

        print(dsn['ac']+"."+dsn['ver'] +' rseq:',rseq)
        
        if rseq == None or rseq not in [ 'A','C','D','E','F','G','H','I','K','L',
                                         'M','N','P','Q','R','S','T','V','W','Y' ]:
            print("WARNINIG: ", rseq," : not a missense location")
            return
        
        zlocation = zdxf.locationType(begin = pos,
                                      end = pos,
                                      attrList = {"attr":[]}) 
                        
        zattr = zdxf.attrType( value = rseq,
                               name = "resulting sequence",
                               ns = "psi-mi",
                               ac = "MI:1308",
                               attrList = xsd.SkipValue)

        zlocation.attrList["attr"].append(zattr)                     
        zfeature.locationList["location"].append(zlocation)


        # data source  
        #------------
        
        zattr = zdxf.attrType( value = "",
                               name = "data-source",
                               ns = "dxf",
                               ac = "dxf:0016",
                               attrList = xsd.SkipValue)

        zattr.value['ns']='dbsnp'
        zattr.value['ac']=  "rs" + dsn['ac']+"." + dsn['ver']        
        zattr.value['type']='database-record'
        zattr.value['typeNs']='dxf'
        zattr.value['typeAc']='dxf:0057'
        
        zfeature.attrList["attr"].append(zattr)

        
        # clinical significance
        #----------------------
        
        if 'clinsig' not in dsn or len(dsn['clinsig']) == 0:
            dsn['clinsig'] = ['unspecified']

        for cs in dsn["clinsig"]:
            #print(cs)
            clinsig = cs

            print("*****", clinsig)
            
            pattr = zdxf.attrType( value = self._clinsig[clinsig]["name"],
                                   name = "clinical-significance",
                                   ns = "dxf",
                                   ac = "dxf:0121",
                                   attrList = xsd.SkipValue)

            pattr.value['ns']= self._clinsig[clinsig]["ns"]
            pattr.value['ac']= self._clinsig[clinsig]["ac"]
        
            zfeature.attrList["attr"].append(pattr)

        if len(dsn["clinsig"]) > 1:
            pass # print out warning ? 
        
        
        # build location
        #---------------
        
        for loc in dsn['location']:
                        
            if loc["assembly"].startswith("GRCh"):
                xTp = "located-at"
                xTpNs = "dxf"
                xTpAc = "dxf:0113"
            else:
                xTp = "identical-to"
                xTpNs = "dxf"
                xTpAc = "dxf:0009"
                            
            
            zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                   type = xTp, node = xsd.SkipValue,
                                   ns = loc["assembly"],
                                   ac = loc["ac"] +':'+str(loc["start"]) )
            zfeature.xrefList["xref"].append( zxref )

            if 'spdi' in loc:
                #<ns1:xref ns="cspdi" ac="NC_000001.11:201047595:C:T" typeNs="dxf" typeAc="dxf:0009" type="identical-to"/>
                csref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
                                       type = "identical-to", node = xsd.SkipValue,
                                       ns = "spdi",
                                       ac = loc['spdi'] )
                zfeature.xrefList["xref"].append( csref )
         
        # cspdi
        #------
        
        #if 'cspdi' in dsn:

        #    csref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
        #                           type = "identical-to", node = xsd.SkipValue,
        #                           ns = "cspdi",
        #                           ac = dsn['cspdi'] )
        #    zfeature.xrefList["xref"].append( csref )


        # xrefs
        #------
            
        if 'xref' in dsn:
            for x in dsn['xref']:
                if x["DB"] == "dbSNP":
                    xNs = "dbSNP"
                    xAc = x["Type"]+x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "OMIM":
                    xNs = "MIM"
                    xAc = x["ID"]
                    xTp = "variant"
                    xTpNs = "psi-mi"
                    xTpAc = "MI:1241"
                elif x["DB"] == "ClinGen":
                    xNs = x["DB"]
                    xAc = x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "Genetic Testing Registry (GTR)":
                    xNs = "GTR"
                    xAc = x["ID"]
                    xTp = "related-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0018"                    
                elif x["DB"] == "UniProtKB":
                    if "#VAR_" in x["ID"]:
                        (uprAc,uprVar) = x["ID"].split("#")
                        
                        xNs = "uprv"
                        xAc = uprVar
                        xTp = "identical-to"
                        xTpNs = "dxf"
                        xTpAc = "dxf:0009"
                                       
                        zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                               type = xTp, node= xsd.SkipValue,
                                               ns = xNs, ac = xAc)
            
                        zfeature.xrefList["xref"].append( zxref )
                        
                    else:
                        uprAc = x["ID"]

                    xNs = "upr"
                    xAc = uprAc
                    xTp = "describes"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0024"                    
                else:
                    xNs = x["DB"]
                    xAc = x["ID"]
                    xTp = "related-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0018"

                
                zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                       type = xTp, node= xsd.SkipValue,
                                       ns = xNs, ac = xAc)
            
                zfeature.xrefList["xref"].append( zxref )
                
        # clinvar xref
        # ------------

        for cv in dsn["clinvar"]: 
            pass   # !!!!!!!!!!!!!!!!!!  add as above



                
        # skip empty lists
        #------------------
        
        if len(zlocation.attrList["attr"]) == 0:                    
            zlocation.attrList = xsd.SkipValue

        if len(zfeature.xrefList["xref"]) == 0:                    
            zfeature.xrefList = xsd.SkipValue
                        
        if len(zfeature.attrList["attr"]) == 0:                    
            zfeature.attrList = xsd.SkipValue

        self._znode.featureList["feature"].append( zfeature )



    # VCV feature 
    #------------

    def appendVcvFeature( self, vcv, rsc, gnxrefList, seqvar, debug = False ):        
        print( '\nappendVcvFeature:\n', json.dumps(vcv, indent=3) )
        #print(gnxrefList)
        print("RSC::",rsc)
        print("seqvar::",seqvar)
    
        cgref = None
        gnref = None
        
        for xref in gnxrefList:
            if xref['vcv'] == vcv['ac']:
                print("!!!!")
                cgref = xref['caid'] 
                gnref = xref['gnid']
                print( cgref,gnref)

                
                        
        zdxf = self._dxfactory
        
        #featureType = zdxf.typeDefType(ns= "psi-mi",
        #                               ac= "MI:1241",
        #                               typeDef = xsd.SkipValue,
        #                               name="variant")

        #zfeature = zdxf.featureType(type = featureType,
        #                            label = "", 
        #                            locationList = {"location":[] },
        #                            xrefList = {"xref":[]},
        #                            attrList = {"attr":[]} )

        
        print( "canonical refseq:", rsc)

        pos = None
        print(vcv)
        #if 'HGVS' in vcv:
        for h in vcv['HGVS']:
            print('HGVS ',h['ac'] + "." + h['ver'], h['pos'])
            if h['ac'] + "." + h['ver'] in rsc: # == rsc:
                pos = h['pos']

            varOK = False
            for csv in seqvar:
                print(' try', csv['upr'],csv['RefSeq'])

                if h['ac'] + "." + h['ver'] == csv['RefSeq']:
                    print( ' seqvar match')
                    vpos = h['pos']
 
                    rseq=None
                    for r in vcv["pchange"]:
                        if r[1:-1] == vpos:
                            rseq = r[-1:]
        
                    print(' vpos:', vpos,'rseq: ' , rseq)
                    if vpos == None or rseq == None:
                        print(" WARNINIG:", vcv['ac']+"."+vcv['ver'],":non-canonical feature location only")
                        break

                    if rseq == None or rseq not in [ 'A','C','D','E','F','G','H','I','K','L',
                                                     'M','N','P','Q','R','S','T','V','W','Y' ]:
                        print(" WARNINIG: ", rseq," : not a missense location")
                        break

                    # variant ok: matching sequence varaint and is a missense
                    varOK = True

                    zfeature = self.buildVcvFeature( vcv, gnref, cgref,
                                                     'RefSeq',
                                                     h['ac'] + "." + h['ver'],
                                                     vpos, rseq)
                
            print(" varOK:", varOK,"\n\n")
                
        print("POS:",pos)

        rseq=None
        for r in vcv["pchange"]:
            if r[1:-1] == pos:
                rseq = r[-1:]

        
        print('pos:', pos,'rseq: ' , rseq)
        if pos == None or rseq == None:
            print("WARNINIG:", vcv['ac']+"."+vcv['ver'],":non-canonical feature location only")
            return

        if rseq == None or rseq not in [ 'A','C','D','E','F','G','H','I','K','L',
                                         'M','N','P','Q','R','S','T','V','W','Y' ]:
            print("WARNINIG: ", rseq," : not a missense location")
            return
        
        print("LOCATION OK")
        
        zlocation = None        
        zlocation = zdxf.locationType(begin = pos,
                                      end = pos,
                                      attrList = {"attr":[]}) 
                        
        zattr = zdxf.attrType( value = rseq,
                               name = "resulting sequence",
                               ns = "psi-mi",
                               ac = "MI:1308",
                               attrList = xsd.SkipValue)

        zlocation.attrList["attr"].append(zattr)                     
        zfeature.locationList["location"].append(zlocation)

        
        #<attr name="source" ns="dxf" ac="dxf:0016">
        #  <value ns="upr" ac="Q15582.209" type="dbrecord" typeNs="dxf" typeAc="dxf:0057"/>
        #</attr>

        # data source
        #------------
                                    
        zattr = zdxf.attrType( value = "",
                               name = "data-source",
                               ns = "dxf",
                               ac = "dxf:0016",
                               attrList = xsd.SkipValue)

        zattr.value['ns']='ClinVar'
        zattr.value['ac']=  vcv['ac']+"." + vcv['ver']        
        zattr.value['type']='database-record'
        zattr.value['typeNs']='dxf'
        zattr.value['typeAc']='dxf:0057'
        
        zfeature.attrList["attr"].append(zattr)

        # clinical significance
        #----------------------
        
        if 'clinsig' in vcv:
            clinsig = vcv["clinsig"]
        else:
            clinsig = 'unspecified'
            
        pattr = zdxf.attrType( value = self._clinsig[clinsig]["name"],
                               name = "clinical-significance",
                               ns = "dxf",
                               ac = "dxf:0121",
                               attrList = xsd.SkipValue)

        pattr.value['ns']= self._clinsig[clinsig]["ns"]
        pattr.value['ac']= self._clinsig[clinsig]["ac"]
        
        zfeature.attrList["attr"].append(pattr)
                
        for loc in vcv['location']:
                        
            if loc["assembly"].startswith("GRCh"):
                xTp = "located-at"
                xTpNs = "dxf"
                xTpAc = "dxf:0113"
            else:
                xTp = "identical-to"
                xTpNs = "dxf"
                xTpAc = "dxf:0009"
                            
            
            zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                   type = xTp, node = xsd.SkipValue,
                                   ns = loc["assembly"],
                                   ac = loc["ac"] +':'+loc["start"] )
            zfeature.xrefList["xref"].append( zxref )

            if 'spdi' in loc:
                csref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
                                       type = "identical-to", node = xsd.SkipValue,
                                       ns = "spdi",
                                       ac = loc['spdi'] )
                zfeature.xrefList["xref"].append( csref )
            
        # cspdi
        #------
        
        if 'cspdi' in vcv:

            csref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
                                   type = "identical-to", node = xsd.SkipValue,
                                   ns = "cspdi",
                                   ac = vcv['cspdi'] )
            zfeature.xrefList["xref"].append( csref )


        # xrefs
        #------

        print("GNR:", gnref, ":",cgref)
        
        if gnref is not None:
            xNs = "gnomad"
            xAc = gnref
            xTp = "identical-to"
            xTpNs = "dxf"
            xTpAc = "dxf:0009"
            
            zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                   type = xTp, node= xsd.SkipValue,
                                   ns = xNs, ac = xAc)
            
            zfeature.xrefList["xref"].append( zxref )
            #sys.exit()
            
        if cgref is not None:
            xNs = "clingen"
            xAc = cgref
            xTp = "identical-to"
            xTpNs = "dxf"
            xTpAc = "dxf:0009"
            
            zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                   type = xTp, node= xsd.SkipValue,
                                   ns = xNs, ac = xAc)
            
            zfeature.xrefList["xref"].append( zxref )
            #sys.exit()
                        
        if 'xref' in vcv:
            for x in vcv['xref']:
                if x["DB"] == "dbSNP":          # <----  dbsnp (rs?)
                    xNs = "dbSNP"
                    xAc = x["Type"]+x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "ClinVar":      # <----  clinvar (rs?)
                    xNs = "ClinVar"
                    xAc = x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "OMIM":
                    xNs = "MIM"
                    xAc = x["ID"]
                    xTp = "variant"
                    xTpNs = "psi-mi"
                    xTpAc = "MI:1241"
                elif x["DB"] == "ClinGen":
                    xNs = x["DB"]
                    xAc = x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "Genetic Testing Registry (GTR)":
                    xNs = "GTR"
                    xAc = x["ID"]
                    xTp = "related-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0018"                    
                elif x["DB"] == "UniProtKB":
                    if "#VAR_" in x["ID"]:
                        (uprAc,uprVar) = x["ID"].split("#")
                        
                        xNs = "uprv"
                        xAc = uprVar
                        xTp = "identical-to"
                        xTpNs = "dxf"
                        xTpAc = "dxf:0009"
                                       
                        zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                               type = xTp, node= xsd.SkipValue,
                                               ns = xNs, ac = xAc)
            
                        zfeature.xrefList["xref"].append( zxref )
                        
                    else:
                        uprAc = x["ID"]

                    xNs = "upr"
                    xAc = uprAc
                    xTp = "describes"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0024"

                else:
                    xNs = x["DB"]
                    xAc = x["ID"]
                    xTp = "related-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0018"

                
                zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                       type = xTp, node= xsd.SkipValue,
                                       ns = xNs, ac = xAc)
            
                zfeature.xrefList["xref"].append( zxref )

        # !!!!!!!!!!!!!!!  need to add clinvar (CVCV xref) here 
                
        zvcvxref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
                                  type = "identical-to", node= xsd.SkipValue,
                                  ns = "clinvar", ac = vcv['ac']+"." + vcv['ver'])

        zfeature.xrefList["xref"].append( zvcvxref )

                       
        if zlocation != None and len(zlocation.attrList["attr"]) == 0:                    
            zlocation.attrList = xsd.SkipValue

        if len(zfeature.xrefList["xref"]) == 0:                    
            zfeature.xrefList = xsd.SkipValue
                        
        if len(zfeature.attrList["attr"]) == 0:                    
            zfeature.attrList = xsd.SkipValue
        #print("--->")    
        #print(zfeature)
        #print("<---",type(self._znode.featureList),)
        self._znode.featureList["feature"].append( zfeature )           
        yyy
        return


    
    def buildVcvFeature(self, vcv, gnref, cgref, tgtns, tgtac, tgtpos, rseq ):

        print( " BuildVcvFeature",  tgtac, tgtpos, tgtpos, rseq )
        
        zdxf = self._dxfactory
        
        featureType = zdxf.typeDefType(ns= "psi-mi",
                                       ac= "MI:1241",
                                       typeDef = xsd.SkipValue,
                                       name="variant")

        vcvf = zdxf.featureType( type = featureType,
                                 label = "", 
                                 locationList = {"location":[] },
                                 xrefList = {"xref":[]},
                                 attrList = {"attr":[]} )
    
        zloc = zdxf.locationType(begin = tgtpos,
                                 end = tgtpos,
                                 attrList = {"attr":[]}) 
        
        zatt = zdxf.attrType( value = rseq,
                               name = "resulting sequence",
                               ns = "psi-mi",
                               ac = "MI:1308",
                               attrList = xsd.SkipValue)

        zloc.attrList["attr"].append(zatt)                     
        vcvf.locationList["location"].append(zloc)

        # data source
        #------------
                                    
        zatt = zdxf.attrType( value = "",
                              name = "data-source",
                              ns = "dxf",
                              ac = "dxf:0016",
                              attrList = xsd.SkipValue)

        zatt.value['ns'] = 'ClinVar'
        zatt.value['ac'] =  vcv['ac']+"." + vcv['ver']        
        zatt.value['type'] = 'database-record'
        zatt.value['typeNs'] = 'dxf'
        zatt.value['typeAc'] = 'dxf:0057'
        
        vcvf.attrList["attr"].append( zatt )

        # clinical significance
        #----------------------
        
        if 'clinsig' in vcv:
            clinsig = vcv["clinsig"]
        else:
            clinsig = 'unspecified'
            
        pattr = zdxf.attrType( value = self._clinsig[clinsig]["name"],
                               name = "clinical-significance",
                               ns = "dxf",
                               ac = "dxf:0121",
                               attrList = xsd.SkipValue)

        pattr.value['ns']= self._clinsig[clinsig]["ns"]
        pattr.value['ac']= self._clinsig[clinsig]["ac"]
        
        vcvf.attrList["attr"].append(pattr)
                
        for loc in vcv['location']:             
            if loc["assembly"].startswith("GRCh"):
                xTp = "located-at"
                xTpNs = "dxf"
                xTpAc = "dxf:0113"
            else:
                xTp = "identical-to"
                xTpNs = "dxf"
                xTpAc = "dxf:0009"
                
            zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                   type = xTp, node = xsd.SkipValue,
                                   ns = loc["assembly"],
                                   ac = loc["ac"] +':'+loc["start"] )
            vcvf.xrefList["xref"].append( zxref )

            if 'spdi' in loc:
                csref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
                                       type = "identical-to", node = xsd.SkipValue,
                                       ns = "spdi",
                                       ac = loc['spdi'] )
                vcvf.xrefList["xref"].append( csref )
            
        # cspdi
        #------
        
        if 'cspdi' in vcv:

            csref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
                                   type = "identical-to", node = xsd.SkipValue,
                                   ns = "cspdi",
                                   ac = vcv['cspdi'] )
            vcvf.xrefList["xref"].append( csref )


        # xrefs
        #------

        # target sequence variant: tgtns, tgtac
        #--------------------------------------

        zxref = zdxf.xrefType( typeNs = 'dxf', typeAc = 'dxf:0024',
                               type = 'describes', node= xsd.SkipValue,
                               ns = tgtns, ac = tgtac)
            
        vcvf.xrefList["xref"].append( zxref )

        # gnomad (if present)
        #--------------------
        
        print("  GNR:", gnref, ":",cgref)
        
        if gnref is not None:
            xNs = "gnomad"
            xAc = gnref
            xTp = "identical-to"
            xTpNs = "dxf"
            xTpAc = "dxf:0009"
            
            zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                   type = xTp, node= xsd.SkipValue,
                                   ns = xNs, ac = xAc)
            
            vcvf.xrefList["xref"].append( zxref )
            #sys.exit()

        # clingen (if present)
        #---------------------
            
        if cgref is not None:
            xNs = "clingen"
            xAc = cgref
            xTp = "identical-to"
            xTpNs = "dxf"
            xTpAc = "dxf:0009"
            
            zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                   type = xTp, node= xsd.SkipValue,
                                   ns = xNs, ac = xAc)
            
            vcvf.xrefList["xref"].append( zxref )
            #sys.exit()
                        
        if 'xref' in vcv:
            for x in vcv['xref']:
                if x["DB"] == "dbSNP":          # <----  dbsnp (rs?)
                    xNs = "dbSNP"
                    xAc = x["Type"]+x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "ClinVar":      # <----  clinvar (rs?)
                    xNs = "ClinVar"
                    xAc = x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "OMIM":
                    xNs = "MIM"
                    xAc = x["ID"]
                    xTp = "variant"
                    xTpNs = "psi-mi"
                    xTpAc = "MI:1241"
                elif x["DB"] == "ClinGen":
                    xNs = x["DB"]
                    xAc = x["ID"]
                    xTp = "identical-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0009"
                elif x["DB"] == "Genetic Testing Registry (GTR)":
                    xNs = "GTR"
                    xAc = x["ID"]
                    xTp = "related-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0018"                    
                elif x["DB"] == "UniProtKB":
                    if "#VAR_" in x["ID"]:
                        (uprAc,uprVar) = x["ID"].split("#")
                        
                        xNs = "uprv"
                        xAc = uprVar
                        xTp = "identical-to"
                        xTpNs = "dxf"
                        xTpAc = "dxf:0009"
                                       
                        zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                               type = xTp, node= xsd.SkipValue,
                                               ns = xNs, ac = xAc)
            
                        vcvf.xrefList["xref"].append( zxref )
                        
                    else:
                        uprAc = x["ID"]

                    xNs = "upr"
                    xAc = uprAc
                    xTp = "describes"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0024"

                else:
                    xNs = x["DB"]
                    xAc = x["ID"]
                    xTp = "related-to"
                    xTpNs = "dxf"
                    xTpAc = "dxf:0018"

                
                zxref = zdxf.xrefType( typeNs = xTpNs, typeAc = xTpAc,
                                       type = xTp, node= xsd.SkipValue,
                                       ns = xNs, ac = xAc)
            
                vcvf.xrefList["xref"].append( zxref )

        # !!!!!!!!!!!!!!!  need to add clinvar (CVCV xref) here 
                
        zvcvxref = zdxf.xrefType( typeNs = "dxf", typeAc = "dxf:0009",
                                  type = "identical-to", node= xsd.SkipValue,
                                  ns = "clinvar", ac = vcv['ac']+"." + vcv['ver'])



        
        vcvf.xrefList["xref"].append( zvcvxref )
               
        if zloc != None and len(zloc.attrList["attr"]) == 0:                    
            zloc.attrList = xsd.SkipValue

        if len(vcvf.xrefList["xref"]) == 0:                    
            vcvf.xrefList = xsd.SkipValue
                        
        if len(vcvf.attrList["attr"]) == 0:                    
            vcvf.attrList = xsd.SkipValue
        
        return vcvf


    
    def appendEgeneInfo( self, rec, eg, znode, debug = False ):

        zdxf = self._dxfactory
        if debug:
            print( '\nappendEgeneInfo:\n', eg.toJson() )

        if 'synonym' in eg.root['egene']['gene']:
            if debug:
                print("Synonyms(gene):", eg.root['egene']['gene']['synonym'])
            
            for s in eg.root['egene']['gene']['synonym']:
                sflag = True
                                            
                for alias in rec.protein.alias:
                    if alias.type == "gene name synonym":
                        if s == str(alias):
                            sflag = False

                if sflag:                    
                    zattr = zdxf.attrType(value = str( s ),
                                          name = "gene-synonym",
                                          ns="dxf",ac ="dxf:0103",
                                          attrList = xsd.SkipValue)
                    znode.attrList["attr"].append( zattr )
                    
            
        if 'xref' in eg.root['egene']['gene']:
            if debug:
                print("Xref(gene):", eg.root['egene']['gene']['xref'])

                     
            for x in eg.root['egene']['gene']['xref']:            
                skip = False

                # test for duplicates (same ns & ac)                
                for y in rec.xref:
                    if y == x['ns'] :
                        for z in rec.xref[y]:
                            if z['id'] == x['ac']:                                
                                skip = True                                
                    
                if not skip:        
                           
                    ns = x['ns']
                    ac = x['ac']
                    xtpn = None
                    xtpns = None
                    xtpac = None
                    
                    if ns == 'MIM':
                        xtpn = "described-by"
                        xtpns = "dxf"
                        xtpac = "dxf:0014"
                    elif ns == 'HGNC':
                        xtpn = "described-by"
                        xtpns = "dxf"
                        xtpac = "dxf:0014"
                    elif ns == 'AllianceGenome':
                        xtpn = "described-by"
                        xtpns = "dxf"
                        xtpac = "dxf:0014"

                    if xtpac is not None:                                        
                        zxref = zdxf.xrefType( type = xtpn,
                                               typeNs = xtpns,
                                               typeAc = xtpac,
                                               node = xsd.SkipValue,
                                               ns = ns, ac = ac)

                        znode.xrefList["xref"].append( zxref )
                         
        if 'locus' in eg.root['egene']['gene']:
            if debug:
                print("Strand(gene):", eg.root['egene']['locus']['segment']['strand'])
                        
            zdxf = self._dxfactory
        
            zattr = zdxf.attrType(value = eg.root['egene']['locus']['segment']['strand'],
                                  name = "strand",
                                  ns="dxf",ac ="dxf:0131",
                                  attrList = xsd.SkipValue)

            znode.attrList["attr"].append( zattr )

    def appendCanonical( self, rec, seqvar, znode ):

        zdxf = self._dxfactory
        
        
        print("buildZnode: appendCanonical", seqvar)
        if seqvar is None or len(seqvar) == 0 :
            return
        
        for c in seqvar:

            xtpn = None
            
            if c['type'] == 'canonical':                    
                xtpn = "has-canonical-instance"
                xtpns = "dxf"
                xtpac = "dxf:0133"

            if c['type'] == 'mane':                    
                xtpn = "has-mane-instance"
                xtpns = "dxf"
                xtpac = "dxf:0133"

            if xtpn is not None:
                
                for rt in ['rsq','upr']:
                    if  rt in c and c[rt] is not None:
                        ns = rt
                        ac = c[rt]

                        zxref = zdxf.xrefType( type = xtpn,
                                               typeNs = xtpns,
                                               typeAc = xtpac,
                                               node = xsd.SkipValue,
                                               ns = ns, ac = ac)
                
                        znode.xrefList["xref"].append( zxref )
                        
            else:
                # reference sequence
                pass
                           
        return
            
            
    def buildZnode(self, rec, ns, ac, geneid = None,
                   vcvList = [],
                   dsnList = [],
                   egList =[],
                   gnxrefList = [],
                   seqvar = [],
                   debug = False ):  # rec: pymex.uprot.record
        
        self._znode = self.initiateNode( rec, ns = ns, ac = ac )
        print("XXXX",seqvar)
        
        if debug:
            print( "DEBUG(buildZnode):" )
            #print(json.dumps(rec.root, indent = 4))
            #print( json.dumps(gnxrefList, indent = 4 )
            print( "DEBUG(buildZnode): DONE" )
        #xxx
        canonical = None
            
        for c in seqvar:
            #print("CCC",c)
            if c['type'] == 'canonical':
                canonical = c 
        print("CANON",canonical)
               
        if 'RefSeq' in canonical and canonical['RefSeq'] is not None:
            rsc = [canonical['RefSeq']]
        else:
            rsc = [] 
        
        print("upr ac:", rec.accession['primary'])
        print(canonical)
        print("canonical(rec):", rec.accession['canonical'])
        
        if len(rsc) == 0: 
            if 'RefSeq' in rec.xref:
                rsl = rec.xref['RefSeq']

                if len(rsl) == 1:
                    rsc.append(rsl[0]['id'])
                else:
                    for rs in rsl:
                        if 'molecule' in rs:
                            if rs['molecule']['id'] == rec.accession['canonical']:
                                print(rs)
                                rsc.append(rs['id'])
                            
        if len(rsc) == 0 and "RefSeq" in canonical:
            rsc.append(canonical["RefSeq"])

        #print(canonical, rsc)
                    
        self.appendAccessions(rec, self._znode)

        self.appendCanonical(rec, seqvar, self._znode)

        self.appendGeneName(rec, self._znode)
        
        self.appendSynonyms(rec, self._znode)
        
        self.appendTaxon(rec, self._znode)
        
        self.appendComments(rec, self._znode)
        
        self.appendSequence(rec, seqvar, self._znode)
                 
        self.appendDbReferences(rec, self._znode , geneid)
        
        self.appendFeatures(rec, self._znode)

        for vcv in vcvList:
            self.appendVcvFeature( vcv, rsc, gnxrefList, seqvar, debug=debug )
            
        #print(dsnList)
        
        for dsn in dsnList:
            self.appendDsnFeature( dsn, rsc, debug=debug )

            
        for egene in egList:
            self.appendEgeneInfo( rec, egene, self._znode, debug=debug )

        if len( self._znode.featureList["feature"] ) == 0:        
            self._znode.featureList = xsd.SkipValue
            
        return self._znode
