#!/usr/bin/python3

import requests
import json

geneid="ENSG00000250479"

url = "https://gnomad.broadinstitute.org/api/"


head_src = { "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin" }

sdta = {"query": "query GeneSearch($query: String!, $referenceGenome: ReferenceGenomeId!) { " +
        "gene_search(query: $query, reference_genome: $referenceGenome) { ensembl_id symbol }}",
        "variables": { "query": "CACNA1S",
                       "referenceGenome":"GRCh37" } }

res_src = requests.post(url, headers = head_src, data = json.dumps(sdta) )

ens_id= json.loads(res_src.text)['data']['gene_search'][0]['ensembl_id']

print(ens_id)

geneid = ens_id

head = {'Accept':'application/json',
        'Referer':'https://gnomad.broadinstitute.org/',
        'Content-Type':'application/json',
        'Origin':'https://gnomad.broadinstitute.org',
        'DNT':'1',
        'Alt-Used':'gnomad.broadinstitute.org',
        'Connection':'keep-alive',
        'Sec-Fetch-Dest':'empty',
        'Sec-Fetch-Mode':'cors',
        'Sec-Fetch-Site':'same-origin'
        }

query_ret = '''
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

pdta = {"query": "query Gene($geneId: String, $geneSymbol: String, $referenceGenome: ReferenceGenomeId!) { " +
        "gene(gene_id: $geneId, gene_symbol: $geneSymbol, reference_genome: $referenceGenome) { " + query_ret + " }}",
        "variables": {"geneId": geneid,
                      "referenceGenome":"GRCh37",
                      "shortTandemRepeatDatasetId":"gnomad_r3",
                      "includeShortTandemRepeats":False
                      },
        #"operationName":"Gene"
        }

x = requests.post(url, headers = head, data = json.dumps(pdta) )

#print(json.dumps(json.loads(x.text),indent=2) )

query_ret2 = '''
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

pdta2 = { "query": "query VariantsInGene($geneId: String!, $datasetId: DatasetId!, $referenceGenome: ReferenceGenomeId!) { " +
          "gene(gene_id: $geneId, reference_genome: $referenceGenome ) {" + query_ret2 + " }}",
          "variables": {
              "geneId": geneid,
              "referenceGenome": "GRCh37",
              "datasetId": "gnomad_r2_1"
          }
}

x2 = requests.post(url, headers = head, data = json.dumps(pdta2) )
print(json.dumps(json.loads(x2.text),indent=2) )


gene = json.loads(x2.text)['data']['gene']

print(gene.keys())
print(gene['gene_id'], gene['reference_genome'])

for cv in gene['clinvar_variants']:
    if 'missense' in cv['major_consequence']:
        print(cv)
        print(cv['variant_id']) 
    else:
        print( cv['major_consequence'] )

for cv in gene['variants']:
    if 'missense' in cv['consequence'] or 'framesh' in cv['consequence']:
        print(cv)
        print(cv['variant_id'])
    else:
        print( cv['consequence'] )


#query GnomadVariant($variantId: String!, $datasetId: DatasetId!,
#                    $referenceGenome: ReferenceGenomeId!, $includeLocalAncestry: Boolean!,
#                    $includeLiftoverAsSource: Boolean!, $includeLiftoverAsTarget: Boolean!) {


query_var_ret3 ='''variant_id reference_genome chrom pos ref alt caid  
'''
query_cv_ret3 ='''clinical_significance clinvar_variation_id gold_stars last_evaluated review_status
  submissions { clinical_significance conditions { name medgen_id }
                last_evaluated review_status submitter_name
              }
'''

pdta3 = { "query": "query GnomadVariant($variantId: String!, $datasetId: DatasetId!, " + 
          "$referenceGenome: ReferenceGenomeId!, " +
          ") {" +
          "variant(variantId: $variantId, dataset: $datasetId) {" + query_var_ret3 + " }" +
          "clinvar_variant(variant_id: $variantId, reference_genome: $referenceGenome) {" + query_cv_ret3 + " } " +
          "}",
          "variables": {
              "datasetId":"gnomad_r2_1",
               "includeLocalAncestry":False,
               "includeLiftoverAsSource":False,
               "includeLiftoverAsTarget":False,
               "referenceGenome":"GRCh37",
               "variantId":"22-24108297-C-T"
          }
}

x3 = requests.post(url, headers = head, data = json.dumps(pdta3) )
print(x3.text)
#print(json.dumps(json.loads(x3.text),indent=2) )

variant = json.loads(x3.text)['data']['variant']
print(variant)
