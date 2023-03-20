from http.client import HTTPSConnection, HTTPResponse
import json
import re
import os
import sys
import time

import requests

class GnomAD():
 
    def __init__( self, mode='dev', debug=False ):
        
        self.mode = mode
        self._debug = debug    

        self._gnmirror = '/mnt/mirrors/gnomad/records'
        
        self.url = "https://gnomad.broadinstitute.org/api/"

        self.head_src = { "Accept": "*/*",
                          "Accept-Language": "en-US,en;q=0.5",
                          "Content-Type": "application/json",
                          "Sec-Fetch-Dest": "empty",
                          "Sec-Fetch-Mode": "cors",
                          "Sec-Fetch-Site": "same-origin" }

        self.dta_src = {"query": "query GeneSearch($query: String!, $referenceGenome: ReferenceGenomeId!) { " +
                        "gene_search(query: $query, reference_genome: $referenceGenome) { ensembl_id symbol }}",
                        "variables": { "query": "",
                                       "referenceGenome": "GRCh37" } }
        
        self.head_gene = {'Accept':'application/json',
                          'Referer':'https://gnomad.broadinstitute.org/',
                          'Content-Type':'application/json',
                          'Origin':'https://gnomad.broadinstitute.org',
                          'DNT':'1',
                          'Alt-Used':'gnomad.broadinstitute.org',
                          'Connection':'keep-alive',
                          'Sec-Fetch-Dest':'empty',
                          'Sec-Fetch-Mode':'cors',
                          'Sec-Fetch-Site':'same-origin' }

        self.query_gene = '''
reference_genome
gene_id
gene_version
symbol
gencode_symbol
name
canonical_transcript_id 
mane_select_transcript {
 ensembl_id
 ensembl_version
 refseq_id
 refseq_version
}
hgnc_id
ncbi_id
omim_id
chrom
start
stop
strand
exons {
 feature_type
 start
 stop
}
flags
gnomad_constraint {
 exp_lof
 exp_mis
 exp_syn
 obs_lof
 obs_mis
 obs_syn
 oe_lof
 oe_lof_lower
 oe_lof_upper
 oe_mis
 oe_mis_lower
 oe_mis_upper
 oe_syn
 oe_syn_lower
 oe_syn_upper
 lof_z
 mis_z
 syn_z
 pLI
 flags
}
exac_constraint {
 exp_syn
 obs_syn
 syn_z
 exp_mis
 obs_mis
 mis_z
 exp_lof
 obs_lof
 lof_z
 pLI
}
'''

        self.dta_gene = {"query": "query Gene($geneId: String, $geneSymbol: String, $referenceGenome: ReferenceGenomeId!) { " +
                         "gene(gene_id: $geneId, gene_symbol: $geneSymbol, reference_genome: $referenceGenome) { " + self.query_gene + " }}",
                         "variables": {"geneId": "",
                                       "referenceGenome":"GRCh37",
                                       "shortTandemRepeatDatasetId":"gnomad_r3",
                                       "includeShortTandemRepeats":False
                         } }


        


        self.query_variants = '''
clinvar_variants {
 clinical_significance
 clinvar_variation_id
 
 gnomad {
    exome { ac an filters }
    genome { ac an filters }
 }
 gold_stars hgvsc hgvsp in_gnomad  major_consequence
 pos review_status transcript_id  variant_id
}
variants(dataset: $datasetId) {
  consequence flags hgvs hgvsc hgvsp lof lof_filter lof_flags
  pos rsids transcript_id transcript_version variant_id
  exome { ac ac_hemi ac_hom an af filters
          populations {id ac  an  ac_hemi  ac_hom }
  }
}
reference_genome
gene_id 
'''

        self.dta_variants = { "query": "query VariantsInGene($geneId: String!, $datasetId: DatasetId!, $referenceGenome: ReferenceGenomeId!) { " +
          "gene(gene_id: $geneId, reference_genome: $referenceGenome ) {" + self.query_variants + " }}",
          "variables": {
              "geneId": "",
              "referenceGenome": "GRCh37",
              "datasetId": "gnomad_r2_1"
          }
}


        self.query_gnovar_var ='''variant_id reference_genome chrom pos ref alt caid  
'''
        self.query_gnovar_cv ='''clinical_significance clinvar_variation_id gold_stars last_evaluated review_status
submissions { clinical_significance conditions { name medgen_id }
                last_evaluated review_status submitter_name
              }
'''

        self.dta_gnovar = { "query": "query GnomadVariant($variantId: String!, $datasetId: DatasetId!, " + 
                            "$referenceGenome: ReferenceGenomeId!, " +
                            ") {" +
                            "variant(variantId: $variantId, dataset: $datasetId) {" + self.query_gnovar_var + " }" +
                            "clinvar_variant(variant_id: $variantId, reference_genome: $referenceGenome) {" + self.query_gnovar_cv + " } " +
                            "}",
                            "variables": {
                                "datasetId":"gnomad_r2_1",
                                "includeLocalAncestry":False,
                                "includeLiftoverAsSource":False,
                                "includeLiftoverAsTarget":False,
                                "referenceGenome":"GRCh37",
                                "variantId":""
                            } }
    
    def getGeneIdByName( self, id, debug = False ):    
        
        self.dta_src["variables"]["query"] = id 
        
        res_src = requests.post( self.url, headers = self.head_src, data = json.dumps(self.dta_src) )

        return json.loads(res_src.text)['data']['gene_search'][0]['ensembl_id']
        
    def getGene( self, id, debug = False ):    
        time.sleep(2);
        self.dta_gene["variables"]["geneId"] = id
        print("GONMAD URL:", self.url)
        res_gene = requests.post( self.url, headers = self.head_gene, data = json.dumps(self.dta_gene) )

        return json.loads(res_gene.text)['data']['gene']

    def getVariantsInGene( self, id, debug = False ):
        time.sleep(2);
        self.dta_variants["variables"]["geneId"] = id
        res_variants = requests.post( self.url,
                                      headers = self.head_src,
                                      data = json.dumps(self.dta_variants) )
        return json.loads(res_variants.text)['data']['gene']

    def getfpath( self, gnid ):

        cdir = self._gnmirror
        fpath = cdir + "/var/" + gnid[:5]

        if not os.path.isdir(fpath):
                os.mkdir(fpath) 
                
        return cdir + "/var/" + gnid[:5] +"/" + gnid + ".json"

    def getlocal( self, gnid, debug = False ):

        fpath = self.getfpath( gnid )
        rec = None
        
        if debug:
            print( "DEBUG: gnomad: getrecord(local) ->",fpath)
            
        if os.path.isfile( fpath ):
            with open(fpath,"r") as gh:
                rec = json.load( gh)
                
        return rec
    
    def getGnomadVariant( self, gnid, debug = False, throttle = 4 ):

        rec = self.getlocal( gnid, debug )
        
        if rec is not None:
            return rec
            
        time.sleep( throttle )   # throttle
        
        self.dta_gnovar["variables"]["variantId"] = gnid
        res_gnovar = requests.post( self.url, headers = self.head_src,
                                    data = json.dumps( self.dta_gnovar ) )
        print(res_gnovar.text)

        rec = json.loads(res_gnovar.text)["data"]

        print(self.getfpath( gnid ))
        
        with open( self.getfpath( gnid ), "w" ) as lf:            
            lf.write( json.dumps( rec ) )

        sys.stdout.flush()    
        return rec        


    def getVarXref( self, gvar, debug = True, dmax = 10 ):


        max = -1 
        
        if debug:
            # clinvar variants
            print("ClinVar count:", len(gvar["clinvar_variants"]))

            # other variants
            print("Variant vount:",len(gvar["variants"]))
        
            max = dmax
            print("\n\nclinvar variants")
            
        vlist = []

        cmax = max
        
        for cv in gvar["clinvar_variants"]:
            if 'missense' in cv['major_consequence']:

                if debug:
                    print( "Missense Variant:", cv['variant_id'] )
                     
                cv0 = self.getGnomadVariant(cv['variant_id'])

                if cv0["variant"] is not None:                    
                    caid= cv0["variant"]["caid"]
                else:
                    caid = ""
            
                if cv0["clinvar_variant"] is not None:
                    vcv="VCV000000000"[:-len(cv0["clinvar_variant"]['clinvar_variation_id'])] + cv0["clinvar_variant"]['clinvar_variation_id']
                else:
                    vcv=""
                    
                variant = { "gnid":cv['variant_id'],
                            "phenotype":cv['major_consequence'],
                            "vcv":vcv,
                            "caid":caid,
                            "rsid":[] }
                
                vlist.append(variant)
            
                cmax -= 1
                if cmax == 0:
                    break

        if debug:
            print("\n\nclinvar variants: DONE")
            print("gnomad variants\n\n\n")
            
        cmax = max

        for gv in gvar["variants"]:
            if 'missense' in gv['consequence']:

                gv0 = self.getGnomadVariant(gv['variant_id'])
        
                if gv0["variant"] is not None:
                    caid = gv0["variant"]["caid"]
                else:
                    caid = ""
            
                variant = { "gnid":gv['variant_id'],
                            "phenotype":gv['consequence'],
                            "vcv":"",
                            "caid":caid,
                            "rsid":gv['rsids'] }

                vlist.append(variant)
        
                cmax -= 1
                if cmax == 0:
                    break
        if debug:
            print("gnomad variants: DONE") 

        return vlist

