
import sys

from lxml import etree as ET

from requests import Session
from requests.auth import HTTPBasicAuth

from zeep import Client as zClient, Settings as zSettings
from zeep.transports import Transport
from zeep import xsd

import bkdpy as BK
import json
import re

class DxfUtils():
    
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

        self._attmap = { "function":{"ns":"dxf","ac":"dxf:0104","name":"function"},
                         "subcellular location":{"ns":"dxf","ac":"dxf:0106","name":"subcellular-location"},
                         "tissue specificity":{"ns":"dxf","ac":"dxf:0107","name":"tissue-specificity"},
                         "activity regulation":{"ns":"dxf","ac":"dxf:0109","name":"activity-regulation"} }

        
        if self.debug:
            print(self.zclient)
            print("\nDONE: __init__") 

        self.mi = BK.cvlib.MI()

               
    @property
    def zdxf(self):
        return self._dxfactory

    def buildTaxonZnode( self, taxon, cid = 1, wrap = True ):

        #<node id="1" ns="taxid"" ac="9606">
        #  <type ns="dxf" name="taxon" ac="dxf:0017"/>
        #  <label>Homo sapiens</label>
        #  <name>Human</name>
        # </node>
        
        ntype = self.getTypeDefType( "taxon" )
        
        znode = self.zdxf.nodeType( ns="taxid", ac=taxon['taxid'], type=ntype, id=1,
                                    label=taxon['sci-name'],
                                    name=taxon['common-name'])        
        
        # wrap into dataset
        if wrap:
            zdts = self.zdxf.datasetType([znode])
            zdts['level']= "2"
            zdts['version']= "0"
            
            return zdts
        return znode
          
    def buildCvTermZnode( self, term, cid = 1, wrap = True ):
  
        #<node id="1" ns="mi" ac="MI:0496">
        #   <type ns="dxf" name="cv-term" ac="dxf:0030"/>
        #   <label>bait</label>
        #   <xrefList>
        #     <xref ns="mi" ac="MI:0914" type="is-a" typeNs="dxf" typeAc="dxf:0034"/>
        #  </xrefList> 
        #   <attributeList>
        #    <attribute name="definition" ns="dxf" ac="dxf:0032">
        #      <value>
        #         Molecule experimentally treated to capture its interacting partners.
        #      </value>
        #    <attribute>  
        #   </attributeList>
        #</node>


        ntype = self.getTypeDefType( "cv-term" )
        
        znode = self.zdxf.nodeType( ns="psi-mi", ac=term['ac'], type=ntype, id=1,
                                    label=term['name'])        

        if 'def' in term:
            if znode.attrList is None:
                    znode.attrList = {'attr':[]}

            tdef = term['def'].strip().replace('\"','').replace('\n',' ');

            dattr = self.zdxf.attrType( name = "definition", value = tdef,
                                        ns ="dxf", ac="dxf:0032" )                                    
            znode.attrList.attr.append(dattr)
            
        if 'is_a' in term :
            if znode.xrefList is None:
                    znode.xrefList = {'xref':[]}
            for isa in term['is_a']:            
                txref = self.zdxf.xrefType( typeNs = "dxf", typeAc ="dxf:0030",
                                            type = "is-a",
                                            node = xsd.SkipValue,
                                            ns = "mi", ac = isa )            
                znode.xrefList.xref.append(txref)


        # wrap into dataset
        if wrap:
            zdts = self.zdxf.datasetType([znode])
            zdts['level']= "2"
            zdts['version']= "0"
            
            return zdts
        return znode
    
    def buildLinkZnode( self, ns="", ac="", vlist = [], cid = 1 ):

        ntype = self.getTypeDefType( "link" )        
        znode = self.zdxf.nodeType( ns=ns, ac=ac, type=ntype, id=1,
                                    label="", name="",
                                    featureList = None,
                                    xrefList = None,
                                    attrList = None,
                                    partList = {'part':[]}
        )

        for v in vlist:
            vns = v["ns"]
            vac = v["ac"]
            vtype = self.getTypeDefType( "linked-node" )
            vptype = self.getTypeDefType( "protein" )

            vpnode = self.zdxf.nodeType( ns=vns, ac=vac, type=vptype, id=1,
                                         label="", name="",
                                         featureList = None,
                                         xrefList = None,
                                         attrList = None,
                                         partList = None )

            znode.partList.part.append( {"type": vtype,
                                         "node": vpnode,
                                         "xrefList": None,
                                         "attrList": None,
                                         "featureList": None,
                                         "name": "", "id": 1})

                    
        zdts = self.zdxf.datasetType([znode])
        zdts['level']= "2"
        zdts['version']= "0"
        
        return zdts

    
    def buildUniprotZnode( self, node, ns="", ac="", cid = 1 ):
       
        # ntp - node type: dxf:0003  - protein 
        #                  dxf:0053  - rna(transcript) 
        #                  dxf:0025    gene
        # rns - reference namespace  eg. uni
        # rac - reference accession  eg. P60010-1 
       
        # name  - actin
        # label - Act1
        # taxon - 4932

        #<node ac="$ns" ns="$rac" id="1">
        # <type name="protein" ac="dxf:0003" ns="dxf"/>
        # <label>$label</label>
        # <name>$name</name>
        # <attrList>
        #  <attr name="data-source" ns="dxf" ac="dxf:0016">
        #   <value ns="upr" ac="Q15582.209" type="database-record" typeNs="dxf" typeAc="dxf:0057"/>
        #  </attr>
        #  <attr ns="dxf" ac="dxf:0031" name="synonym">   
        #     <value>alias</value>              -> alias
        #  </attr>
        #  <attr ns="dxf" ac="dxf:0102" name="gene-name">
        #     <value>gene(primary)</value>      -> alias
        #  </attr>
        #  <attr ns="dxf" ac="dxf:0103" name="gene-synonym">
        #     <value>gene(secondary)</value>    -> alias
        #  </attr>        
        # </attrList>
        # <xrefList>
        #  <xref type="produced-by" typeNs="dxf" typeAc="dxf:0007" ns="taxid"   ac="$taxon"/>
        #  <xref type="encoded-by"  typeNs="dxf" typeAc="dxf:0022" ns="refseq"  ac="NM_000000.1"/>
        #  <xref type="encoded-by"  typeNs="dxf" typeAc="dxf:0022" ns="ensembl" ac="NM_000000.1"/>
        #  <xref type="encoded-by"  typeNs="dxf" typeAc="dxf:0022" ns="embl"    ac="NM_000000.1"/>
        #  <xref type="encoded-by"  typeNs="dxf" typeAc="dxf:0022" ns="embl"    ac="NM_000000.1"/>
        # </xrefList>
        #</node>
        
        print(type(node))
        ntype = self.getTypeDefType( "protein" )

        ent = node.root["uniprot"]["entry"][0] 
        
        print( ent["accession"][0] ) # ac

        print( ent["organism"]["dbReference"][0]["id"] ) # taxid 
        print( ent["organism"]["name"][0]["value"] ) # sci name 
        print( ent["organism"]["name"][1]["value"] ) # common name                
        
        print( ent["protein"]["name"][0]["value"] ) # name   1,2,3,... aliases        
        print( ent["gene"]["name"][0]["value"] ) # gene   1,2,3,.. aliases
                        
        version=ent['version']
        #if len(ns) > 0:
        #    nns = ns
        #else:
        #    nns = "upr"
        #if len(ac) > 0:
        #    nac = ac
        #else:
        #    nac = ent["accession"][0]

        nns = "upr"
        nac = ent["accession"][0]
            
        nlabel = ent["gene"]["name"][0]["value"]+ " protein"
        nname = ent["protein"]["name"][0]["value"]
        ntaxid = ent["organism"]["dbReference"][0]["id"]
        ntxlabel = ent["organism"]["name"][0]["value"]
        ntxname = ent["organism"]["name"][1]["value"]
        print("L:",ntxlabel,"N:",ntxname)
        #xx
        znode = self.zdxf.nodeType( ns=ns, ac=ac, type=ntype, id=1,
                                    label=nlabel, name=nname,
                                    featureList = None,
                                    xrefList = {'xref':[]},
                                    attrList = {'attr':[]} )

        idxref = self.zdxf.xrefType( type = "identical-to",
                                     typeNs = "dxf",
                                     typeAc = "dxf:0009",
                                     node = xsd.SkipValue,
                                     ns = nns,
                                     ac = nac )
        znode.xrefList.xref.append(idxref)
        
        #  <attr name="data-source" ns="dxf" ac="dxf:0016">
        #   <value ns="upr" ac="Q15582.209"
        #          type="database-record" typeNs="dxf" typeAc="dxf:0057"/>
        #  </attr>
 
        sattr = self.zdxf.attrType( name = "data-source", value='',ns ="dxf", ac="dxf:0016" )
        sattr.value['ns']='upr'
        sattr.value['ac']= '.'.join( [nac, version] )
        sattr.value['type']='database-record'
        sattr.value['typeNs']='dxf'
        sattr.value['typeAc']='dxf:0057'

        znode.attrList['attr'].append( sattr )
        
        ntxtype = self.getTypeDefType( "taxon" )
        
        txnode = self.zdxf.nodeType( ns="taxid", ac=ntaxid, type=ntxtype, id=1,
                                     label=ntxlabel, name=ntxname)        
        
        txref = self.zdxf.xrefType( typeNs = "dxf", typeAc ="dxf:0007",
                                    type = "produced-by",
                                    node = txnode,
                                    ns = "taxid", ac = ntaxid )

        znode.xrefList.xref.append(txref)
        
        nxref = ent['dbReference']

        xtp ={}
        #for x in nxref:
        #    ctp = x["type"]
        #    xtp.setdefault(x["type"],[]).append(x)
        #
        #for xk in xtp:
        #    print(xk, len(xtp[xk])
    
        ursq =""
        ursqFlag = True

        if 'dbReference' in ent:
            for x in ent["dbReference"]:

                print("XXX",x)
                
                xns = x["type"]
                xac = x["id"] 
                xtns = "dxf"
                xtac = self.mi.getByName(xns.lower())               

                if xtac is not None:
                    xtac = xtac.id
                else:
                    xtac = "!" + xns.lower()
                #print("ns:", xns.lower(), "ac:", xac)
                #print("tns:", xtns.lower(), "tac:", xtac)
                #print("--")

                xtpd = { "EMBL"  : {"type":"encoded-by", "ns":"dxf", "ac":"dxf:0022"},
                         "RefSeq": {"type":"has-instance", "ns":"dxf", "ac":"dxf:0084"},
                         "PDB": {"type":"has-structure", "ns":"dxf", "ac":"dxf:0081"},
                         "DIP": {"type":"has-links", "ns":"dxf", "ac":"dxf:0082"},
                         "IntAct": {"type":"has-links", "ns":"dxf", "ac":"dxf:0082"},
                         "MIM": {"type":"has-phenotype", "ns":"dxf", "ac":"dxf:0077"} }

                #if xns.lower() in 
                
                if xns.lower() in ['embl','refseq','upr','pdb','dip','intact','mim']:                     

                    if xns.lower() not in ['refseq']:
                    
                        cxref = self.zdxf.xrefType( type = xtpd[xns]['type'],
                                                    typeNs = xtpd[xns]['ns'],
                                                    typeAc = xtpd[xns]['ac'],
                                                    node = xsd.SkipValue,
                                                    ns = xns,
                                                    ac = xac )
                    else:
                        # if  molecule -> flag -> false
                        # if urfq nonempty -> false
                        if ursq != "":
                            ursqflag = False
                        if "molecule" in x:
                            ursqflag = False
                        ursq = xac
                                              
                        #if "target" in x:
                    #    tgt = x["target"]
                    #    tgtType = self.getTypeDefType( tgt["type"] )
                    #    tgtNs = tgt["ns"]
                    #    tgtAc = tgt["ac"]
                    #    tgtName = tgt["name"]
                    #    tgtLabel = tgt["label"]
                    #    tnode = self.zdxf.nodeType( ns = tgtNs,
                    #                                ac = tgtAc,
                    #                                type = tgtType,
                    #                                id = 1,
                    #                                label = tgtLabel,
                    #                                name = tgtName )
                    #    # add tnode to cxref
                    #    cxref.node = tnode
                    
                    # add xcref to node xrefs
                    znode.xrefList.xref.append(cxref)

        if ursqFlag and len(ursq) > 0:
            print("UNIQUE RefSeq: " + ursq)
            rsqxref = self.zdxf.xrefType( type = "identical-to",
                                        typeNs = "dxf",
                                        typeAc = "dxf:0009",
                                        node = xsd.SkipValue,
                                        ns = "rsq",
                                        ac = ursq )
            znode.xrefList.xref.append(rsqxref)
                    
        if 'sequence' in ent:
            #if znode.attrList is None:
            #    znode.attrList = {'attr':[]}

            sequence = ent['sequence']['value']
                      
            cattr = self.zdxf.attrType( name = "sequence", value = sequence, ns ="dxf", ac="dxf:0071" )
            znode.attrList['attr'].append( cattr )

            #cattr = self.zdxf.attrType( name = "sequence", value = sequence, ns ="dxf", ac="dxf:0072" )
            #znode.attrList.attr.append( cattr )
        
        if ent['protein']:
            for n in ent['protein']['name']:
                            
                if znode.attrList is None:
                    znode.attrList = {'attr':[]}
                cattr = self.zdxf.attrType( name = "synonym", value = n['value'], ns ="dxf", ac="dxf:0031" )                
                znode.attrList['attr'].append( cattr )
                
                
        if ent['gene']:
            for g in ent['gene']['name']:
                if g['type'] == 'primary':                
                    if znode.attrList is None:
                        znode.attrList = {'attr':[]}
                    cattr = self.zdxf.attrType( name = "gene-name", value = g['value'], ns ="dxf", ac="dxf:0102" )
                    znode.attrList['attr'].append( cattr )

                if g['type'] == 'synonym':                    
                    if znode.attrList is None:
                        znode.attrList = {'attr':[]}
                    cattr = self.zdxf.attrType( name = "gene-synonym", value = g['value'], ns ="dxf", ac="dxf:0103" )
                    znode.attrList['attr'].append( cattr )
                                
        if "source" in ent:
            src = ent["source"]
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
            znode.attrList.attr.append( cattr )
                            

        print("--comment--------------------")

        if "comment" in ent:
            for ccm in ent['comment']:
                
                #if znode.attrList is None:
                #    znode.attrList = {'attr':[]}
                #print(ccm.keys())

                isoform = '';

                if "molecule" in ccm and ccm["molecule"]["value"].startswith("Isoform "):
                   print(" Molecule: ",ccm["molecule"])
                   isoform = ccm["molecule"]["value"].replace("Isoform ","")
                   print("  Isoform: ", isoform)
                if "type" in ccm:
                    print(" Type: ",ccm["type"])
                if "text" in ccm:
                    print(" Text:", ccm["text"]["value"])
                    if  "evidence"  in ccm["text"].keys():                   
                        print("  Evidence", ccm["text"]["evidence"]    )

                    print(ccm["type"])

                    if ccm["type"] in self._attmap:

                        print( "!!! ",ccm["type"] )

                        ctp = self._attmap[ccm["type"]]
                    
                        if len(isoform) >0:
                            ifref = self.zdxf.xrefType( type = "describes",
                                                        typeNs = "dxf", typeAc = "dxf:0024",
                                                        node = xsd.SkipValue,
                                                        ns = "upr", ac = nac + "-" + isoform )
                        else:
                            ifref = self.zdxf.xrefType( type = "describes",
                                                        typeNs = "dxf", typeAc = "dxf:0024",
                                                        node = xsd.SkipValue,
                                                        ns = "upr", ac = nac )

                            
                        cattr = self.zdxf.attrType( value = ccm["text"]["value"],
                                                    name =  ctp["name"],
                                                    ns=ctp["ns"], ac = ctp["ac"],
                                                    xrefList = { "xref": [ifref] } )
                                                        
                        znode.attrList['attr'].append( cattr )
                        
                print("----")    
                #comment = ent["comment"]['value']                
                #cattr = self.zdxf.attrType( value = comment, name = "comment", ns="dxf",ac ="dxf:0000" )
                #znode.attrList['attr'].append( cattr )



            
        print("--feature--------------------XX")
        for c in ent["feature"]:
            
            if c["type"] in ["sequence variant","mutagenesis site","disease"]:
                #print("C" + str(c))
                feature = {"evidence":[]}
                
                feature["type"] = c["type"]
                if "description" in c:
                    feature["description"] = c["description"]
                else:
                    feature["description"] =""
                    
                if "evidence" in c:
                
                    ev = c["evidence"].split()
                
                    for cev in ev:
                        #print("cev:", cev)
                        
                        #for cref in ent["reference"]:
                        #    if cref["key"] == cev:
                        #        if cref["citation"]["type"] == "journal article":
                        #            for cdbr in cref["citation"]["dbReference"]:
                        #                if cdbr["type"]== "PubMed":                                    
                        #                    cevd["pmid"] = cdbr["id"]
                        #                if cdbr["type"]== "DOI":                                        
                        #                    cevd["doi"] = cdbr["id"]
                        #        elif cref["citation"]["type"] == "submission":                                
                        #            cevd["db"] = cref["citation"]["db"]

                        for cevid in ent["evidence"]:
                            if cevid["key"] == cev:
                                cevd={}
                                #print(cevid)
                                cevd['typeNs'] = 'eco'
                                cevd['typeAc'] = cevid['type']

                                if 'dbReference' in cevid['source']:
                                    cevd['ns']='pubmed'
                                    cevd['ac']=cevid['source']['dbReference'][0]['id']
                        
                                feature["evidence"].append(cevd)     
                
                #print(" ",c["location"])
                feature["location"] = c["location"]
                if "original" in c:
                    #print("   original",c["original"]["value"])
                    feature["original"] = c["original"]["value"]
                if "variation" in c:
                    #print("   variation",c["variation"]["value"])
                    feature["variation"] = c["variation"]["value"]
                print(json.dumps(feature, indent=1))

                # build feature(s)
                
                if "evidence" in feature and len(feature["evidence"]) ==  0:

                    fzeep = self.zdxf.featureType( xrefList = xsd.SkipValue,
                                                   attrList = xsd.SkipValue,
                                                   locationList = xsd.SkipValue,
                                                   type = xsd.SkipValue,
                                                   label="",
                                                   name=xsd.SkipValue )
                    
                    if "dbSNP" in feature["description"]:
                        m = re.search(r'dbSNP:(rs\d+)', feature["description"])
                        dbsnp = m.group(1)
                        
                        evm = self.zdxf.attrType( name = "evidence-method",
                                                  ns="dxf",ac ="dxf:0052",
                                                  value = "" )
                        evm.value["ns"]="eco"
                        evm.value["ac"]=" ECO:0000313"
                                                                   
                        evr = self.zdxf.xrefType( typeNs = "dxf", typeAc ="dxf:0014",
                                                  type = "described-by",
                                                  node = xsd.SkipValue,
                                                  ns = "dbsnp",
                                                  ac = dbsnp )
                    else:
                        
                        evm = self.zdxf.attrType( name = "evidence-method",
                                                  ns="dxf",ac ="dxf:0052",
                                                  value = "" )
                        evm.value["ns"]="eco"
                        evm.value["ac"]="ECO:0000035"
                                            
                        evr = self.zdxf.xrefType( typeNs = "dxf", typeAc ="dxf:0014",
                                                  type = "described-by",
                                                  node = xsd.SkipValue,
                                                  ns = "swp",
                                                  ac = ent["accession"][0] +'.'+ ent['version'] )

                    fzeep = self.featAnnotate( fzeep, feature, {"evmeth": evm, "evref": evr})
                    
                    if znode.featureList is None:
                        znode.featureList = {"feature":[]}
                    znode.featureList["feature"].append(fzeep)
            
                else:
                    
                    for cev in feature["evidence"]:

                        fzeep = self.zdxf.featureType( xrefList = xsd.SkipValue,
                                                       attrList = xsd.SkipValue,
                                                       locationList = xsd.SkipValue,
                                                       type = xsd.SkipValue,
                                                       label="",
                                                       name=xsd.SkipValue )
                        
                        evm = self.zdxf.attrType( name = "evidence-method",
                                                   ns="dxf",ac ="dxf:0052",
                                                   value = "" )
                        evm.value["ns"]="eco"
                        evm.value["ac"]=cev["typeAc"]
                        
                        if "ac" in cev:
                            evr = self.zdxf.xrefType( typeNs = "dxf", typeAc ="dxf:0014",
                                                      type = "described-by",
                                                      node = xsd.SkipValue,
                                                      ns = "pmid", ac = cev["ac"] )
                        else:
                            evr = self.zdxf.xrefType( typeNs = "dxf", typeAc ="dxf:0014",
                                                      type = "described-by",
                                                      node = xsd.SkipValue,
                                                      ns = "swp",
                                                      ac = ent["accession"][0] +'.'+ ent['version'] )
                            
                        fzeep = self.featAnnotate( fzeep, feature, {"evmeth": evm, "evref": evr})
                        
                        if znode.featureList is None:
                            znode.featureList = {"feature":[]}
                        znode.featureList["feature"].append(fzeep)

                     
                    
        zdts = self.zdxf.datasetType([znode])
        zdts['level']= "2"
        zdts['version']= "0"
        
        return zdts


    def featAnnotate( self, fzeep, feature, fevid ):

        if feature["type"] in ["sequence variant"]:
            ftype = self.zdxf.typeDefType( ns= "psi-mi", ac="mi:1241",
                                           typeDef = xsd.SkipValue,
                                           name="variant" )
                    
        elif feature["type"] in ["mutagenesis site"]:
            ftype = self.zdxf.typeDefType( ns= "psi-mi", ac="mi:0118",
                                           typeDef = xsd.SkipValue,
                                           name="mutation" )                    
        fzeep.type = ftype 

        if "description" in feature:
            
            if fzeep.attrList is None or fzeep.attrList == xsd.SkipValue:
                fzeep.attrList = {"attr":[]}

            fdes = feature["description"]
            if "dbSNP:rs" in fdes:
                m = re.search(r'(.+?)(; )?dbSNP:(rs\d+)', fdes)
                fdes = m.group(1) +'.'
                if len(fdes) <5:
                    fdes = feature["description"]
            else:
                fdes = feature["description"]
                    
            dattr = self.zdxf.attrType( name = "description", value = fdes,
                                        ns ="dxf", ac="dxf:0089" )
            
            fzeep.attrList['attr'].append(dattr)               
                    
        if "location" in feature:
            if fzeep.locationList is None or fzeep.locationList == xsd.SkipValue:
                fzeep.locationList = {"location":[]}

            #print("location:", feature["location"])
            if "begin" in feature["location"]:
                print("begin:", feature["location"]["begin"]["position"])
                lbeg = feature["location"]["begin"]["position"] 
            if "end" in feature["location"]:
                print("end:", feature["location"]["end"]["position"])
                lend=feature["location"]["end"]["position"]
            if "position" in feature["location"]:
                print("begin(*):", feature["location"]["position"]["position"])
                print("end(*):", feature["location"]["position"]["position"])
                lbeg = feature["location"]["position"]["position"]
                lend = feature["location"]["position"]["position"]
            print("=============>")

            print("lbeg", lbeg, "lend",lend)
                
            loczeep = self.zdxf.locationType( begin = lbeg,  end = lend,
                                              attrList = xsd.SkipValue )
            fzeep.locationList['location'].append(loczeep)
                
            if "variation" in feature:
                print(feature["variation"])
                if loczeep.attrList == None or loczeep.attrList == xsd.SkipValue:
                    loczeep.attrList = {"attr":[]}
                        
                rseq = self.zdxf.attrType( name = "resulting sequence",
                                           ns="psi-mi",ac ="mi:1308",
                                           value = feature["variation"] )
                            
                loczeep.attrList["attr"].append(rseq)
      
            print("<=============")                                       
            
            if fevid is not None:
                if fzeep.attrList == None or fzeep.attrList == xsd.SkipValue:
                    fzeep.attrList = {"attr":[]}
                if fzeep.xrefList == None or fzeep.xrefList == xsd.SkipValue:
                    fzeep.xrefList = {"xref":[]}


                fzeep.attrList["attr"].append(fevid["evmeth"])
                fzeep.xrefList["xref"].append(fevid["evref"])
                
        return fzeep
        
    
    def getTypeDefType( self,tname ):

        ntype = None 
        if tname.lower() in ["protein"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0003",
                                           typeDef = xsd.SkipValue,
                                           name="protein" )
        elif tname.lower() in ["transcript","rna"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0053",
                                           typeDef = xsd.SkipValue,
                                           name="rna" )
        elif tname.lower() in ["gene","dna"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0025",
                                           typeDef = xsd.SkipValue,
                                           name="gene" )
        elif tname.lower() in ["organism","taxon"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0017",
                                           typeDef = xsd.SkipValue,
                                           name="organism" )

        elif tname.lower() in ["produced-by"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0007",
                                           typeDef = xsd.SkipValue,
                                           name="produced-by" )

        elif tname.lower() in ["identical-to"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0009",
                                           typeDef = xsd.SkipValue,
                                           name="identical-to" )
        elif tname.lower() in ["online-resource"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0054",
                                           typeDef = xsd.SkipValue,
                                           name="online-resource" )
        elif tname.lower() in ["published-resource"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0055",
                                           typeDef = xsd.SkipValue,
                                           name="published-resource" )
        elif tname.lower() in ["person"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0056",
                                           typeDef = xsd.SkipValue,
                                           name="person" )
        elif tname.lower() in ["database-record"]:
            ntype = self.zdxf.typeDefType( ns= "dxf", ac="dxf:0057",
                                           typeDef = xsd.SkipValue,
                                           name="database-record" )
        elif tname.lower() in ["cv-term"]:
            ntype = self.zdxf.typeDefType( ns="dxf", ac="dxf:0030",
                                           typeDef = xsd.SkipValue,
                                           name="cv-term" )

        elif tname.lower() in ["link"]:
            ntype = self.zdxf.typeDefType( ns="dxf", ac="dxf:0004",
                                           typeDef = xsd.SkipValue,
                                           name="link" )
        elif tname.lower() in ["linked-node"]:
            ntype = self.zdxf.typeDefType( ns="dxf", ac="dxf:0010",
                                           typeDef = xsd.SkipValue,
                                           name="linked-node" )
            
        return ntype
            
print("DxfUtils: import")
