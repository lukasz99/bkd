#!/usr/bin/python3
import os
import sys
import argparse
import json
import re
import csv
import urllib.request
import ssl

from time import sleep
from lxml import etree as ET

import logging
logging.basicConfig(level=logging.WARN)     # needs logging configured

pymex_dir="/home/lukasz/git/pymex/pylib"
if os.path.isdir( pymex_dir ):
    print( "#pymex: using source library version" )
    sys.path.insert( 0, pymex_dir )

sys.path.insert(0, "/home/lukasz/git/bkd/bkd-client/pylib" )

import pymex
import bkdpy as BKD

bkd_dest = {
    "dip0-local":"http://10.1.7.100:9999/dipdev0",
    "dip0-public":"https://dip.mbi.ucla.edu/dipdev0",
    "dip2beta-local":"http://%%USER%%:%%PASS%%@10.1.8.211:8080/dip2beta",
    "dip2beta-public":"https://%%USER%%:%%PASS%%@dip.mbi.ucla.edu/dip2beta",
    "dip2-local":"http://10.1.7.102:9999/dipdev2",
    "dip2-public":"https://dip.mbi.ucla.edu/dipdev2",
    "cvdb-local":"http://10.1.8.201:8080/cvdb",
    "cvdb0-local":"http://10.1.7.100:9999/cvdbdev0",
    "cvdb0-public":"https://dip.mbi.ucla.edu/cvdbdev0",
    "cvdb2-local":"http://10.1.7.102:9999/cvdbdev2",
"cvdb2-public":"https://dip.mbi.ucla.edu/cvdbdev2" }

clinsig_map = {
    "Benign/Likely benign":"likely benign",
    "Likely benign":"likely benign",
    "Benign":"benign",
    "Conflicting interpretations of pathogenicity":"conflicting evidence",
    "Pathogenic/Likely pathogenic":"likely pathogenic",
    "Likely pathogenic":"likely pathogenic",
    "Uncertain significance":"uncertain",
    "Pathogenic":"pathogenic" }

upr_loc ={"local":"/mnt/mirrors/uniprotkb/records"}

upr_path = "/mnt/mnt/mirrors/uniprotkb/records"

parser = argparse.ArgumentParser( description='UniprotKB Tool' )

parser.add_argument('--ulocation', '-ul', dest="uloc", type=str, 
                    required=False, default='local',
                    help='Uniprot record location: local/remote.')

parser.add_argument('--upr', '-u', dest="upr", type=str,
                    required=False, default='Q13936',
                    help='UniprotKB accession.')

parser.add_argument('--slocation', '-sl', dest="sloc", type=str,
                    required=False, default='cvdb0-local',
                    help='Server location.')

parser.add_argument('--ns', '-n', dest="ns", type=str,
                    required=False, default='',
                    help='Record namespace.')

parser.add_argument('--acc', '-a', dest="ac", type=str,
                    required=False, default='',
                    help='Record accession.')

parser.add_argument('--file', '-f', dest="file", type=str,
                    required=False, default='',
                    help='Input file.')

parser.add_argument('--annotation-file', '-af', dest="afile", type=str,
                    required=False, default='',
                    help='Annotation file.')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                    required=False, default='get',
                    help='Mode.')

parser.add_argument('--setac', dest="setac", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Set accession')

parser.add_argument('--user', dest="user", type=str,
                    required=False, default='',
                    help='User (when needed)')

parser.add_argument('--pass', dest="password", type=str,
                    required=False, default='',
                    help='password (when needed)')

parser.add_argument('--out', '-o', dest="out", type=str,
                    required=False, default='',
                    help='Output file.')

parser.add_argument('--debug', '-d', dest="debug", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Debug option.')

parser.add_argument('--variant-map', '-vm', dest="vmap", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Variant mapping (default: False).')

parser.add_argument('--entrezgene', '-eg', dest="egene", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Fetch EntrezGene (default: False).')

parser.add_argument('--clinvar', '-cv', dest="clinvar", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Fetch ClinVars (default: False).')

parser.add_argument('--interpro', '-ip', dest="interpro", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Fetch InterPro record (default: False).')

parser.add_argument('--dbsnp', '-sn', dest="dbsnp", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Fetch dbSNP (default: False).')

parser.add_argument('--gnomad', '-gn', dest="gnomad", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Fetch gnomad (default: False).')

parser.add_argument('--splice-variants', '-sv', dest="splice", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Store splice variant-related information (default: False).')

parser.add_argument('--parse', dest="parse", type=str,
                    required=False, choices=['True','False'], default='False',
                    help='Parse/process incoming records.')


#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

def getRST(rec, upr):
    
    rsc = None
    trc = None
    if 'RefSeq' in rec.xref:
        rsl = rec.xref['RefSeq']
        #print("RSL", rsl)
        if len(rsl) == 1:
            rsc = rsl[0]['id']
            trc = None
            #print("\n!!!!\n")
            if 'property' in rsl[0]:
                for p in rsl[0]['property']:
                    if p['type'] == 'nucleotide sequence ID':
                        trc  =  p['value']                                           
        else:
            for rs in rsl:
                #print(rs)
                if 'molecule' in rs:
                    #print(rs, upr)
                    
                    if rs['molecule']['id'] == upr :  
                        #print(" -> ", rs)
                        if rsc is None or rsc[0] == 'X':
                            rsc = rs['id']
                            trc = None
                            
                            if 'property' in rs:
                                for p in rs['property']:
                                    if p['type'] == 'nucleotide sequence ID':
                                        trc = p['value']
                                                
                if rsc is None:
                    for rs in rsl:
                        #print(rs)
                        if 'molecule' in rs:
                            #print(rs, upr)
                            
                            if rs['molecule']['id'] == upr :  
                                #print(rs)
                                rsc = rs['id']
                                trc = None
                                if 'property' in rs:
                                    for p in rs['property']:
                                        if p['type'] == 'nucleotide sequence ID':
                                            trc = p['value']
                                            
    trStart = 0
    trStop = 0
    
    if trc != None:        
        rs = BKD.RefSeq().getrecord( trc )
        trStart = rs.getFeatureLstByKey("CDS")[0]["_location"].split("..")[0]
        trStop = rs.getFeatureLstByKey("CDS")[0]["_location"].split("..")[1]
        print( "@@@", trc, trStart,trStop)
    return ( rsc, trc, trStart, trStop )


def acc2path( dir, acc ):
                            
    lacc="0000000000" + acc
    rdir = dir;
    for d in range(5,1,-1):
        rdir += "/" + lacc[-3*d:-3*(d-1)] 
    return rdir + "/" + acc + ".xml"

def snpmap( rec, debug = False ): 

    if "variant" not in rec.feature:
        return
    
    for v in rec.feature["variant"]:        
        if debug == True:
            print("DEBUG: variant->",v)
        
        rp = []
                
        if "xref" in v:
            for x in v["xref"]:
                if debug == True:
                    print( "DEBUG: xref->", x)

                if x["type"] == "dbSNP":                    
                    rsid = re.sub( "rs","", x["id"] )
                    if debug == True:
                        print( "DEBUG: rsid->", x["id"])
                                                        
                    rp += BKD.RefSNP().getpos( rsid )
                    
            for nx in rp:
                v["xref"].append( { "type":nx["build"], "id": nx["pos"] } )
                if debug == True:
                    print( "DEBUG: map->", v["xref"][-1] ) 

def dbsnp( rec, query, debug='False'):

    flist = []
    snlist = BKD.RefSNP().getlist( query, debug )
    sleep(1)
    if debug == 'True':
        print( "DEBUG: dbsnp: snlist->", len(snlist) )
        sys.stdout.flush()
    i = 0 
    for rsid in snlist:  # go over dbSNP reports    
        #print("RSID:", rsid )
        i+=1
        if debug == 'True':
            print( "DEBUG: RSID:", rsid,i,"/",len(snlist),"query:" ,query)            
            sys.stdout.flush()
        try:
            cvrec = BKD.RefSNP().getrecord( rsid, debug )            
        except BaseException as err:
            print(err)
            sys.stdout.flush()
            sleep(5)
        
        if args.parse == 'True':
            cfeat = parSNP(cvrec, debug)  # parse single dbSNP
           
            for cf in cfeat:
                flist.append(cf)

    if debug == 'True':
        print("DEBUG:  feature count(total): ",len(flist))
    return flist
            
def parSNP( rec, debug='False'):

    flist = []  # features in one SNP report

    if debug == 'True':
        print("--------------------------------")
        print("DEBUG: parSNP:", json.dumps(rec, indent=3))
        print('DEBUG: parSNP: ID -> ', rec['refsnp_id'])
        print('DEBUG: parSNP: keys -> ', rec.keys())    
    
    if 'primary_snapshot_data' not in rec:
        return []   # merged to other record ?
    
    if debug  == 'True':
        print( 'DEBUG: parSNP: primary data -> ',
               rec['primary_snapshot_data'].keys() )
        
        print( 'DEBUG: parSNP: primary data -> ',
               rec['primary_snapshot_data']['variant_type'] )
    
    if len(rec['citations']) > 0:
        if debug =='True':
            print( 'DEBUG: citations...' )
        pass
    
    # location
    #---------

    pla = rec['primary_snapshot_data']['placements_with_allele']

    chloc = {}  #  chloc[<build>][<all#>]
    ploc = []    #  ploc[<refseq_id>][<all#>]
    mloc = []    #  mloc[<refseq_id>][<all#>]
    
    for p in pla:   # go over alleles

        all_loc = [] 
        pal_loc = [] 
        mal_loc = [] 
        
        if debug == 'True':
            print("DEBUG: parSNP -> allele:",json.dumps(p,indent=2))
        #----------------------------------------------------------------------- 
        # p['placement_annot']['seq_id_traits_by_assembly']
        #
        #[{ 'assembly_name': 'GRCh38.p13',
        #   'assembly_accession': 'GCF_000001405.39',
        #   'is_top_level': True,
        #   'is_alt': False,
        #   'is_patch': False,
        #   'is_chromosome': True}]
                
        tba =  p['placement_annot']['seq_id_traits_by_assembly']
        
        stype =['refseq_chromosome','refseq_prot','refseq_mrna']
        

        # allele placement annotation
        #----------------------------
        
        if p['placement_annot']['seq_type'] in stype:            
            for pa in p['alleles']:
                if debug == 'True':
                    print( "placing allele:", json.dumps(pa, indent=2))
                        
                #  p['alleles']
                #
                #[{'allele': {'spdi': {'seq_id': 'NC_000001.11',
                #                     'position': 201112274,
                #                     'deleted_sequence': 'T',
                #                     'inserted_sequence': 'T'}},
                #  'hgvs': 'NC_000001.11:g.201112275='},
                #{'allele': {'spdi': {'seq_id': 'NC_000001.11',
                #                     'position': 201112274,
                #                     'deleted_sequence': 'T',
                #                     'inserted_sequence': 'A'}},
                #                     'hgvs': 'NC_000001.11:g.201112275T>A'}]

                spdi = pa['allele']['spdi']
                
                al = {}
                
                if len(tba) > 0:
                    al["assembly"] = tba[0]['assembly_name']
                    al["version"] = tba[0]['assembly_accession']
                al["ac"] = spdi['seq_id']
                al["start"] = spdi['position']+1
                al["stop"] = spdi['position']+1
                
                al["spdi"] = ":".join( [str(al["ac"]),
                                        str(al["start"]-1),
                                        str(spdi['deleted_sequence']),
                                        str(spdi['inserted_sequence'])])
                
                if p['placement_annot']['seq_type'] == 'refseq_chromosome': 
                    all_loc.append(al)
                if p['placement_annot']['seq_type'] == 'refseq_prot': 
                    pal_loc.append(al)
                if p['placement_annot']['seq_type'] == 'refseq_mrna': 
                    mal_loc.append(al)
                                                    
        if 'refseq_prot' ==  p['placement_annot']['seq_type']:
            pass
        
        if 'refseq_mrna' ==  p['placement_annot']['seq_type']:
            pass
        
        if len(all_loc) > 0 and len(tba) > 0 :
            chloc[p['placement_annot']['seq_id_traits_by_assembly'][0]['assembly_name']] = all_loc
            
        if len(pal_loc) > 0:
            ploc += pal_loc
        if len(mal_loc) > 0:
            mloc += mal_loc
            
    if debug =='True':    
        print( "DEBUG: all_loc: " ,json.dumps( all_loc, indent=2 ) )
        print( "DEBUG: chloc: " ,json.dumps( chloc, indent=2 ) )
        print( "DEBUG: ploc: " ,json.dumps( ploc, indent=2 ) )
        print( "DEBUG: mloc: " ,json.dumps( mloc, indent=2 ) )
        
    # allele annotation
    #------------------
    
    aal = rec['primary_snapshot_data']['allele_annotations']
    
    aac = 0

    for aa in aal: # go over allele annotation
        if debug =='True':            
            print( "DEBUG: Allele #", json.dumps(aac,indent=2))

        featFlag = False
        
        #feat = {'allele':[]}
        call = {}
        
        call['name'] = ""
        call['type'] = "single nucleotide variant"
        call['ac'] = 'rs' + str(rec["refsnp_id"])
        call['ver'] = rec['last_update_build_id']
        call['clinsig'] = {}
        call["pchange"] = {}
        call['location'] = []
        call['plocation'] = []
        call["pchange"] = {}
        call["HGVS"] = []
        call["clinvar"] = []
        
        # clinical significance & VCV
        #----------------------------
        
        if debug =='True':            
            print("   clinical: ",len(aa['clinical']))
        if len(aa['clinical']) > 0:
            for c in aa['clinical']:
                #print("   clinical: ",c.keys())
                if debug =='True':            
                    print("   clinical: accession: ",c['accession_version'])
                    print("   clinical: accession: ",c['clinical_significances'])
                call.setdefault('clinical',{"ac":[],"sig":[]})
                call['clinical']['ac'].append(c['accession_version'])
                call['clinical']['sig']=c['clinical_significances']

                if 'measure_set_id' in c:
                    call["clinvar"].append( c['measure_set_id'] )
                   
                for cs in c['clinical_significances']:
                    call['clinsig'][cs]=1

        call['clinsig'] = list(call['clinsig'].keys())        

        if debug =='True':            
            print("   assembly: ", len(aa['assembly_annotation']))

        # assembly annotation
        #---------------------

        spdi = {}
        if len(aa['assembly_annotation']) > 0:  # allele assembly annotation
            asl = aa['assembly_annotation']
            for ass in asl:
                if debug =='True':            
                    print( "DEBUG:  parSNP ->  Assembly annotation: ",
                           json.dumps( ass, indent=2)) 
                gl = ass['genes']
                for g in gl:
                    if debug =='True':            
                        print("   gene: ", g.keys())
                        print("   gene: ", g['id'])
                        print("   gene: ", g['locus'])
                        print("   gene: ", g['name'])
                        print("   rnas: ", len(g['rnas']))
                        
                    for r in g['rnas']:        
                        if 'protein' in r and 'variant' in r['protein'] and 'spdi' in r['protein']['variant']:
                            if debug =='True':            
                                print(r['protein'])
                                print("   g.rnas.keys: ", r.keys())
                            cspdi = r['protein']['variant']['spdi']
                            if debug =='True':            
                                print( "   cspdi ", cspdi )
                                print( "   ", cspdi['position'], " : ",
                                       cspdi['deleted_sequence'], " -> ",
                                       cspdi['inserted_sequence'] ) 
                            pos = ":".join([ str(cspdi['position']+1),
                                             cspdi['deleted_sequence'],
                                             cspdi['inserted_sequence']])
                            if (cspdi['deleted_sequence'] != cspdi['inserted_sequence'] and
                                cspdi['inserted_sequence'] != '*' and
                                len(cspdi['deleted_sequence']) == 1 and
                                len(cspdi['inserted_sequence']) == 1):
                                call["pchange"]["".join( [ cspdi['deleted_sequence'],
                                                             str(cspdi['position']+1),
                                                             cspdi['inserted_sequence'] ] ) ] = 1
                                featFlag = True
                                call["type"]: "single nucleotide variant"
                                if debug =='True':            
                                    print("call", call)
                            
                            #spdi.setdefault(pos,{'count':0,'hgvs':[]})
                            #spdi[pos]['count'] += 1
                            #spdi[pos]['hgvs'].append(r['hgvs'])
                #print("   ",spdi)
                if debug =='True':            
                    print('anchor',rec['primary_snapshot_data']['anchor'])
                anchor = rec['primary_snapshot_data']['anchor']

                # build info
                #-----------
                
                for chl in chloc:
                    call['location'].append(chloc[chl][aac])
                if debug =='True':            
                    print("chl",chloc)

                ptmp = {}
                
                #for prl in ploc:
                #    ptmp[prl['ac']]=1
                    
                #call['plocation']=list(ptmp.keys())

        # HGVS
        #-----
        if debug =='True':
            print("@HGVS: ploc ", ploc)
            print("@HGVS: mloc ", mloc)

        ploc_uid = [] 
        
        for h in ploc:
            chgvs = {}
                        
            chgvs['ns'] = 'RefSeq' 
            chgvs['ac'] = re.sub( r'\.\d?$', '', h['ac'] ) 
            chgvs['ver'] = re.sub( r'^.*\.', '',h['ac'] )
            chgvs['pos'] = h['start']
            chgvs['spdi'] = h['spdi']
            
            huid =  chgvs['ac'] +":"+chgvs['ver'];
            if huid not in ploc_uid:                
                call['HGVS'].append(chgvs)
                ploc_uid.append(huid)
                
        # protein change
        #---------------
        
        call["pchange"] = list(call["pchange"].keys())

        #if len( call["pchange"]) > 1:
        #         call["pchange"] =  call["pchange"][0:1]

        if debug =='True':            
            print("pchange", call["pchange"])


        # XREFS: self -> refSNP
        #----------------------
        
        xref = call.setdefault('xref',[])
        #xrs = {'ns':'refSNP','ac':'rs'+rec['refsnp_id']}
        xrs = {'Type':'rs','ID':rec['refsnp_id'], "DB":"dbSNP"}
        xref.append(xrs)

        #
                        
        if debug == 'True':
            print("DEBUG:  call ->", json.dumps(call, indent=2))

        if featFlag:
            flist.append(call)
        aac+=1
    if debug =='True':            
        print("DEBUG: leaving parSNP\nFLIST:\n", json.dumps( flist, indent=3 ) )

    #if str(rec['refsnp_id'])  == '1943243889':
    #    
    #    sys.exit()
        
    return flist


def clinvar( rec, upr, debug='False'):
    
    cvlist = BKD.ClinVar().getlist( upr, debug )

    if debug == 'True':
        print( "DEBUG: clinvar: cvlist->",cvlist )

    cflist = []
        
    for cvid in cvlist:
        if debug == 'True':
            print("\nDEBUG: clinvar: ----")                
        cvrec = BKD.ClinVar().getrecord( cvid, debug )
        cfeat = {}
        #print( json.dumps( cvrec.root,indent=3 ) )
        print("ClinVar ID: " , cvid)
        cvar = cvrec.root["ClinVarResult-Set"]["VariationArchive"]

        cfeat['name']=cvar['VariationName']
        if debug  == 'True':
            print('DEBUG: clinvar: VariationName -> ',cvar['VariationName'])
            print('DEBUG: clinvar: VariationType -> ',cvar['VariationType'])
        
        if cvar['VariationType'] != 'single nucleotide variant':
            continue  # discard non-SNPs
        
        cfeat['type']=cvar['VariationType']
        
        cfeat['ac']=cvar['Accession']
        cfeat['ver']=cvar['Version']
        
        if 'IncludedRecord' in cvar:
            cvrecord = cvar['IncludedRecord']
        elif 'InterpretedRecord' in cvar:
            cvrecord = cvar['InterpretedRecord']
            
        sa = cvrecord['SimpleAllele']

        if debug  == 'True':
            print( 'DEBUG: clinvar: Accession -> ',cvar['Accession'])
            print( 'DEBUG: clinvar: AlleleID:',sa['AlleleID'])
            print( 'DEBUG: clinvar: VariationID:',sa[ 'VariationID'])

        if debug  == 'True':
            
            print('DEBUG: clinvar:  Name->', sa[ 'Name'])
            if 'CanonicalSPDI' in sa:
                print('DEBUG: clinvar:  CanonicalSPDI->', sa[ 'CanonicalSPDI'])
            else:
                print('DEBUG: clinvar:  CanonicalSPDI->', 'N/A')
            print('DEBUG: clinvar:  VariantType->', sa[ 'VariantType'])
            
            for g in sa[ 'Gene']:            
                for k in ['Symbol', 'FullName', 'GeneID', 'HGNC_ID','OMIM']:
                    if k in g:  
                        print('DEBUG: clinvar:   Gene('+k+')->', g[k])
        
           
                if 'Location' in g:
                    print('DEBUG: clinvar:  (**)Locaton(cyto)-> ', g['Location']['CytogeneticLocation'])
                else:
                    print('DEBUG: clinvar:  (**)Locaton(cyto)-> ', 'N/A')

        if 'cspdi' in sa:           # should go into approprite location
            cfeat['spdi'] = sa['cspdi']
                    
        if 'Location' in sa:
            loc = sa['Location']
            if 'SequenceLocation' in loc:
                for l in loc['SequenceLocation']:
                    cloc = cfeat.setdefault('location',[])
                    if debug == 'True':
                        print('DEBUG: clinvar: (**)Locaton(sa seq):')
                        print('DEBUG: clinvar:   -> ', l['Assembly'])
                        print('DEBUG: clinvar:   -> ', l['AssemblyAccessionVersion'])
                        print('DEBUG: clinvar:   -> ', l['Accession'])
                        print('DEBUG: clinvar:   -> ', l['start'])
                        print('DEBUG: clinvar:   -> ', l['stop'])

                    clocmap = { 'assembly':l['Assembly'],
                                'version':l['AssemblyAccessionVersion'],
                                'ac':l['Accession'],
                                'start':l['start'],'stop': l['stop'] }   
                        
                    if 'cspdi' in sa and l['Accession'] in sa['cspdi']:
                        # should go into approprite location
                        clocmap['spdi'] =  sa['cspdi']
             
                    #cloc.append( {'assembly':l['Assembly'],
                    #              'version':l['AssemblyAccessionVersion'],
                    #              'ac':l['Accession'],
                    #              'start':l['start'],'stop': l['stop']})
                    cloc.append(clocmap)
            
        if 'HGVS' in sa:
            
            cloc = cfeat.setdefault('HGVS',[])    
            for l in sa['HGVS']:
                if debug == 'True':
                    print("***",l)
                if "Type" in l and l["Type"] == "coding" and "ProteinExpression" in l:
                    pe = l['ProteinExpression']
                    if 'sequenceAccession' in pe and re.match( '^.P_\d+.\d+$', pe['sequenceAccession'] ) :
                        hgvc = { 'ac': pe['sequenceAccession'],
                                 'ns':' RefSeq',
                                 'ver': pe['sequenceVersion'],
                                 'pos': re.sub('\\D', '', pe['change']) }
                        cloc.append(hgvc)
                    
        for g in sa[ 'Gene']:   
            for l in g['Location']['SequenceLocation']:

                cloc = cfeat.setdefault('location',[])
                if debug  == 'True':
                    print('DEBUG: clinvar: (**)Locaton(gene seq):')
                    print('DEBUG: clinvar:   -> ', l['Assembly'])
                    print('DEBUG: clinvar:   -> ', l['AssemblyAccessionVersion'])
                    print('DEBUG: clinvar:   -> ', l['Accession'])
                    print('DEBUG: clinvar:   -> ', l['start'])
                    print('DEBUG: clinvar:   -> ', l['stop'])
                
                #cloc.append( {'assembly':l['Assembly'],
                #              'version':l['AssemblyAccessionVersion'],
                #              'ac':l['Accession'],
                #              'start':l['start'],'stop': l['stop']})

            #print(' HGVS -> ',sa[ 'HGVS'])
        #print(sa.keys())
        #print('Interpretations -> ',sa[ 'Interpretations'])
        
        if 'XRef' in sa:
            for x in sa[ 'XRef']:
                cxref = cfeat.setdefault('xref',[])
                cxref.append(x)
                if debug  == 'True':
                    print('DEBUG: clinvar: (**)XRef -> ',x)
        #print('ReviewStatus -> ',cvrecord['ReviewStatus'])
        #print('Interpretations-> ',cvrecord['Interpretations'])
        #print('SubmittedInterpretationList -> ',cvrecord['SubmittedInterpretationList'])
        #print(cvrecord['InterpretedVariationList'])

        if 'Interpretation' in cvrecord:
            ins = cvrecord['Interpretation']
            if len(ins) > 0 :                
                clinsig = ins[0]["Description"]
                if clinsig in clinsig_map:
                    clinsig = clinsig_map[clinsig]
                    if debug  == 'True':
                        print( "DEBUG: clinical significance:", len(ins), clinsig )

                cfeat['clinsig'] = clinsig

        if 'ProteinChange' in sa:
            if debug == 'True':
                print('DEBUG: clinvar: (**) ProteinChange -> ',sa[ 'ProteinChange'])
            cfeat['pchange']=sa[ 'ProteinChange']
            cflist.append(cfeat)
        else:
            if debug == 'True':
                print( "DEBUG: clinvar: ProteinChange: none" )
        if debug == 'True':    
            print("DEBUG: clinvar: ------")
            print("CFLIST:\n",json.dumps(cflist,indent=3))
        
    if debug == 'True':    
        print("CFLIST:\n",json.dumps(cflist,indent=3))
        pass

    if debug == 'True':

        print("####")
        print(cflist)
    
    return cflist

#-------------------------------------------------------------------------------
# SCRIPT STARTS HERE
#-------------------

args = parser.parse_args()

print("ARGS:", args)

debug = args.debug

srvUrl = bkd_dest[args.sloc]

srvUrl = srvUrl.replace( "%%USER%%", args.user)
srvUrl = srvUrl.replace( "%%PASS%%", args.password)

uzeep = BKD.UniZeep( srvUrl )


if args.mode == "get":
    zres = uzeep.getnode( args.ns, args.ac )
    
    if len(args.out)  > 0:
        if not args.out.endswith(".dxf"):
            args.out+= ".dxf"
                
        with open( args.out, "w" ) as of:
            of.write( ET.tostring( zres, pretty_print=True).decode() )
            of.write( "\n" )
    else:
        print(ET.tostring(zres, pretty_print=True).decode() )
        print()
        
elif args.mode == "set":
    
    annot = {}
    
    if len(args.afile) > 0: 
        with open(args.afile, "r") as ah:
            areader = csv.DictReader(ah, delimiter='\t')
            for row in areader:
                arow = {}
                nkey=None
                for k in row.keys():
                    if k == 'key':
                        nkey=row[k]
                    else:
                        arow[k]=row[k]
                if nkey is not None: 
                    annot[nkey]=arow
                print(arow)
    
    if len(args.file) > 0: 
        if args.out.endswith(".dxf"):
            args.out = args.out.replace(".dxf","")            
        with open(args.out, "w") as logh:
            logh.write("#AC\tUPR\tRFS\tTAXID\tODIP\tOUPR\n")

            maxac = 0
            with open(args.file, "r") as fh:
                for ln in fh:
                    if  not ln.startswith("#"):
                        cols = ln.split('\t')
                        upr = cols[1].strip()                   # uniprot

                        if len( cols[0].strip() ) > 0:
                            ac = int(re.sub("\D","",cols[0]))  # bkd accession
                        else:
                            ac = 0
                        if ac > maxac:
                            maxac=ac
            if debug == 'True':
                print( "Accession Max: " + str(maxac) )

            if maxac > 0 and args.setac:
                # set acc
                if uzeep.setidgen( maxac, "node") > 0:
                    sys.exit(1)
                
            with open(args.file, "r") as fh:
                for ln in fh:
                    if  not ln.startswith("#"):
                        cols = ln.strip().split('\t')
                        upr = cols[1].strip()
                        geneid = None
                     
                        #for maintaining columns in input file
                        if len(cols) > 5:
                            rfs = cols[2].strip()
                            taxid = cols[3].strip()
                            odip = cols[4].strip()
                            oupr = cols[5].strip()
                            geneid = cols[6].strip()   #GeneID
                            
                        if len( cols[0].strip() ) > 0:
                            ac = cols[0]
                        else:
                            ac = ""
                        if debug == 'True':
                            print(cols)
                            print( "Uniprot Accesion: " + upr)
                            print( "Gene ID: ", geneid)
                        
                        uloc = upr_loc[args.uloc]

                        # build path to local file
        
                        swpath = acc2path( uloc + "/swissprot", upr)
                        trpath = acc2path( uloc + "/trembl", upr)
                                                
                        if os.path.isfile(swpath):
                            ufile = swpath
                        elif os.path.isfile(trpath):
                            ufile = trpath
                        else:
                            print( "ERROR: no uniprot file", upr )
                            if len(cols) > 5:
                                logh.write( "\t".join( ("", upr, rfs,
                                                        taxid, odip,
                                                        oupr, "\n") ) )
                            else:
                                logh.write( "\t".join( ("", upr, "\n") ) )
                            logh.flush()
                            os.fsync(logh)
                            continue

                        print("UniprotKB record: " + ufile)        
                        
                        rec = pymex.uprot.Record().parseXml( ufile ) 
                        
                        #print(json.dumps(rec.root, indent=3))
                        #print()
                        #print()
                        #print()
                        if rec.comment is not None and "alternative products" in rec.comment:
                            if "isoform" in rec.comment["alternative products"][0]:
                                ilist = rec.comment["alternative products"][0]["isoform"]
                                for i in ilist:
                                    if debug == 'True':
                                        print(i)
                                    #print(rec.comment["alternative products"][0].keys())                    
                        
                        print( "UniprotKB:", rec.accession['primary'] )

                        # sequence variants
                        # -----------------
                        
                        seqvar = []

                           
                        # find canonical sequence/upr/rfs
                        #--------------------------------
                        canonical = { 'upr': None, 'RefSeq': None,
                                      'tRefSeq': None, 'trStart': None, 'trStop': None,
                                      'seq': None}
                        
                        # { 'type':'reference', 'upr': None, 'RefSeq': None, 'seq': None},
                        # { 'type':'canonical', 'upr': "AAA", 'RefSeq': "BBB", 'seq': "aaa"},
                        # { 'type':'mane', 'upr': None, 'RefSeq': None, 'seq': None} ] 
                        # { 'type':'alternate', 'upr': None, 'RefSeq': None, 'seq': None} ] 

                        # UniprotKB
                        #----------
                        
                        # annotation overdrive: 

                        if rec.accession['primary'] in annot:
                            if 'cupr' in annot[rec.accession['primary']]:
                                acupr = annot[rec.accession['primary']]['cupr']
                                if acupr is not None and len(acupr) > 0:
                                    canonical['upr'] = acupr.strip()
                            if 'crsq' in annot[rec.accession['primary']]:
                                acrsq = annot[rec.accession['primary']]['crsq']
                                if acrsq is not None and len(acrsq.strip()) > 0:
                                    canonical['RefSeq'] = acrsq.strip()
                        else:
                            print("Canonical: no annotation override")

                        if canonical['upr'] == None and rec.accession['canonical'] is not None:
                            canonical['upr'] = rec.accession['canonical']
                            print( 'Canonical UniprotKB(rec->ann ):', canonical['upr'] )

                        # canonical sequence
                        #-------------------
                        
                        if canonical['upr'] is not None:
                            #if canonical['upr'] != rec.accession['primary']:
                            #    print("sequence upload...", canonical['upr'])
                            if canonical['seq'] is None:
                                try:
                                    canonical['seq'] = rec.getSequence( canonical['upr'] )
                                except:
                                    print( "WARNING:",canonical['upr'] , " sequence not found")
                                    canonical['seq'] = ""
                        #print(canonical)
                        #sys.exit()

                        # canonical refseq
                        #-----------------
                        
                        if canonical['RefSeq'] is None:
                            rsc = None
                            trc = None
                            if 'RefSeq' in rec.xref:
                                rsl = rec.xref['RefSeq']
                                if debug == 'True':
                                    print("RSL", rsl)
                                if len(rsl) == 1:
                                    rsc = rsl[0]['id']
                                    trc = None                                    
                                    if 'property' in rsl[0]:
                                        for p in rsl[0]['property']:
                                            if p['type'] == 'nucleotide sequence ID':
                                                trc  =  p['value']                                           
                                else:
                                    for rs in rsl:
                                        #print(rs)
                                        if 'molecule' in rs:
                                            #print(rs, upr)
                                            
                                            if rs['molecule']['id'] == canonical['upr'] :  
                                                #print(" -> ", rs)
                                                if rsc is None or rsc[0] == 'X':
                                                    rsc = rs['id']
                                                    trc = None
                                                    
                                                    if 'property' in rs:
                                                        for p in rs['property']:
                                                            if p['type'] == 'nucleotide sequence ID':
                                                                trc = p['value']
                                                                                                                    
                                    if rsc is None:
                                        for rs in rsl:
                                            if debug == 'True':
                                                print(rs)
                                            if 'molecule' in rs:
                                                #print(rs, upr)
                                                
                                                if rs['molecule']['id'] == rec.accession['canonical'] :  
                                                    #print(rs)
                                                    rsc = rs['id']
                                                    trc = None
                                                    if 'property' in rs:
                                                        for p in rs['property']:
                                                            if p['type'] == 'nucleotide sequence ID':
                                                                trc = p['value']

                                                    
                            canonical['RefSeq'] = rsc
                            canonical['tRefSeq'] = trc
                            
                            if trc != None:
                                trStart = 0
                                trStop = 0
                                rs = BKD.RefSeq().getrecord( canonical['tRefSeq'] )
                                trStart = rs.getFeatureLstByKey("CDS")[0]["_location"].split("..")[0]
                                trStop = rs.getFeatureLstByKey("CDS")[0]["_location"].split("..")[1]
                                print( "@@@", canonical['tRefSeq'], trStart, trStop )                                    
                                canonical['trStart'] = trStart
                                canonical['trStop'] = trStop
                            else:
                                canonical['trStart'] = None                   
                                canonical['trStop'] = None                   
                          
                        if canonical['upr'] is not None or canonical['RefSeq'] is not None:
                             
                            seqvar.append({ 'type':'canonical',
                                            'upr': canonical['upr'],
                                            'RefSeq': canonical['RefSeq'],
                                            'tRefSeq': canonical['tRefSeq'],
                                            'trStart': canonical['trStart'],
                                            'trStop': canonical['trStop'],
                                            'seq': canonical['seq'] } )
                        if debug == 'True':                                                                                                                        
                            print( 'Canonical UniprotKB(rec):', rec.accession['canonical'] )
                            print( 'Canonical UniprotKB(can):', canonical )
                            print( 'Canonical UniprotKB(sqv):', seqvar )
                        
                        # find MANE
                        #----------

                        maneSeqId = None
                        mane = { 'upr': None, 'RefSeq': None,
                                 'tRefSeq': None , 'trStart': None, 'trStop': None,
                                 'seq': None }

                        msl = []
                        if 'MANE-Select' in rec.root['uniprot']['entry'][0]['_xref']:
                            for ms in rec.root['uniprot']['entry'][0]['_xref']['MANE-Select']:
                                msl.append( ms )
                        if debug == 'True':
                            print( "MANE list length:", len( msl) );
                                
                        for ms in msl:
                            if debug == 'True':
                                print()
                                print('MSL:', ms)
                            for k in ms.keys():
                                if debug == 'True':
                                    print('MSL: ', k, ' -> ',ms[k])
                                if 'molecule' == k:
                                    if debug == 'True':
                                        print('MSL:  molecule ',ms[k]['id'])  
                                    maneSeqId = ms[k]['id']
                                if 'property' == k:
                                    for p in ms[k]:
                                        if debug == 'True':
                                            print('MSL:   ',p)  
                                        if p['type'] == 'RefSeq protein sequence ID':
                                            mane['RefSeq']=p['value']
                                        if p['type'] == 'RefSeq nucleotide sequence ID':
                                            mane['tRefSeq']=p['value']
                                            
                                    
                        if len(msl) > 0 and maneSeqId == None:
                            maneSeqId = rec.accession['primary'] +'-1'

                        mane['upr'] = maneSeqId

                        if maneSeqId is not None:
                            mane['seq'] = rec.getSequence( maneSeqId )
                        if debug == 'True':
                            print('MSL:  maneSeqId',maneSeqId,"\nMSL:")
                            print('MSL:  sequence',  mane['seq'] )   

                        if maneSeqId is not None:
                            
                            if mane['tRefSeq'] != None:
                                trStart = 0
                                trStop = 0
                                rs = BKD.RefSeq().getrecord( mane['tRefSeq'] )
                                trStart = rs.getFeatureLstByKey("CDS")[0]["_location"].split("..")[0]
                                trStop = rs.getFeatureLstByKey("CDS")[0]["_location"].split("..")[1]
                                print( "@@@",mane['tRefSeq'],trStart,trStop )
                                mane['trStart'] = trStart
                                mane['trStop'] = trStop
                            else:                                                         
                                mane['trStart'] = None                   
                                mane['trStop'] = None                   
                            
                            seqvar.append({ 'type':'mane',
                                            'upr': mane['upr'],
                                            'RefSeq': mane['RefSeq'],
                                            'tRefSeq': mane['tRefSeq'],
                                            'trStart': mane['trStart'],
                                            'trStop': mane['trStop'], 
                                            'seq': mane['seq'] } )

                        #print(mane)
                        if debug == 'True':
                            print( rec.root['uniprot']['entry'][0].keys())
                        

                        # uniprot variants
                        # ----------------

                        msaskip =  False
                        
                        if rec.comment is not None and "alternative products" in rec.comment:
                            if "isoform" in rec.comment["alternative products"][0]:
                                ilist = rec.comment["alternative products"][0]["isoform"]
                                for i in ilist:
                                    if debug == 'True':
                                        print(i)
                                    sform = { 'type':'alternate',
                                              'upr': i["id"]["value"],
                                              'RefSeq': None,
                                              'seq': None}


                                    if sform['seq'] is None:
                                        try:
                                            sform['seq'] = rec.getSequence( sform['upr'] )
                                        except:
                                            print("WARNING: can not retrive ->",  sform['upr'])
                                            msaskip = True
                                    if debug == 'True':
                                        print( "\nSFORM:",sform['upr'] )     
                                    ( sform['RefSeq'], sform['tRefSeq'], sform['trStart'], sform['trStop'] ) = getRST( rec, sform['upr'] )
                                    print("@@@", sform)
                                        
                                    seqvar.append(sform)
                                    print("alt(sqv)", seqvar)
                                    #print(rec.comment["alternative products"][0].keys())

                        if not msaskip:
                        
                            # generate sequence variant msa
                            #------------------------------

                            th = open("tmp.fasta","w")
                            for s in seqvar:
                                #>Q13698;Homo sapiens;9606;human
                                #print(ln.strip())
                                #print(ln.strip().split("_")[0],end="")
                                #print(";"+";".join([cols[1], cols[3],cols[0]]))
                            
                                if s['type'] == 'alternate':
                                    seqid = s['upr']
                                else:
                                    seqid= s['type']
                                
                                if s['RefSeq'] is not None:
                                    prfs = s['RefSeq']
                                else:
                                    prfs = ""
                                if s['tRefSeq'] is not None:
                                    trfs = s['tRefSeq']
                                else:
                                    trfs = ''
                                
                                header = ";".join( ( seqid, s['upr'], prfs, trfs ) )
                                th.write( ">" + header + "\n" )
                                th.write( s['seq']+"\n")                
                                        
                            th.close()
                            os.system(" mafft --auto tmp.fasta > bkd-server/src/main/webapp/msa-iso/mafft.tmp.fasta")

                        
                        # query/process interpro

                        ipro = []
                    
                        if  args.interpro =="True":

                            # get/parse interpro record
                            
                            iprec = pymex.interpro.Record().getRecord(  rec.accession['primary'] ) 
                            ipro.append( iprec )

                        
                        # query/process entrezgene
                        #-------------------------
                        
                        eglist = []
                        
                        if  args.egene =="True":
                            if 'GeneID' in rec.xref:
                                for gid in rec.xref['GeneID']:
                                    if debug == 'True':
                                        print( gid['id'] )
                                    
                                    # get/parse entrez gene record
                            
                                    egrec = pymex.egene.Record().getRecord( gid['id'] ) 
                                    eglist.append( egrec )
                                    geneid = None
                            else:
                                if geneid != None:
                                    rec.xref['GeneID'] = [geneid]
                                
                                    egrec = pymex.egene.Record().getRecord( geneid ) 
                                    eglist.append( egrec )
                                    #print(egrec.toJson())
                                
                        
                        if len(ac) > 0 and len(args.ns) == 0:
                            ns  = re.sub("-?\d+\D","",ac)
                        else:
                            ns = args.ns
                            
                        if args.vmap == 'True':  
                            snpmap( rec, debug=args.debug )
                           
                        # query/process clinvar
                        #----------------------
                        
                        if args.clinvar == 'True':
                            refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == 'GeneID']
                            if len(refList) > 0:                
                                cvquery=refList[0]['id']+'[GeneID]'
                            elif geneid != None:
                                cvquery = geneid
                            else:
                                print( 'ClinVar Query:', cvquery )
                                cvquery = None

                            if cvquery != None:
                                print( 'ClinVar Query:', cvquery )
                                cvflist = clinvar(None, cvquery, args.debug)
                            else:
                                print( 'WARNING: ClinVar Query: gene id missing' )
                                cvflist = []
                        else:
                            cvflist = []
                        if debug == 'True':
                            print("###")
                        
                        #print(json.dumps(cvflist, indent=3)) 
                        #sys.exit()
                        
                        # query/process dbsnp
                        #--------------------

                        if args.dbsnp == 'True':
                            print( "dbSNP(processing):" )
                            refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == 'GeneID']

                            if len(refList) > 0:                
                                snquery=refList[0]['id']+'[GeneID]'
                            elif geneid != None:
                                snquery = geneid
                            else:
                                print( 'dbSNP Query:', snquery )
                                snquery = None

                            if snquery != None:
                                print( 'dbSNP Query:', snquery )                                                           
                                snlist = dbsnp(None, snquery, args.debug)
                            else:
                                print( 'WARNING: dbSNP Query: gene id missing' )
                                snflist = []
                            print( "dbSNP(processing): DONE" )
                        else:
                            snlist = []
                        
                        #print( json.dumps(rec.root, indent=3) )
                        
                        # query/process gnomad
                        #---------------------

                        gnxreflst = []
        
                        if args.gnomad == 'True':
                            print( "Gnomad(processing):" )
                            print( "Gene(upr):", rec.gene["name"]["primary"] )

                            gnd = BKD.GnomAD()
                            geneId = gnd.getGeneIdByName(rec.gene["name"]["primary"])
                            gene = gnd.getGene(geneId)
                            #print( "Gene:", gene )
                            print( "Gene(gnomad):", geneId )   # add as xref
                            gvar = gnd.getVariantsInGene(geneId)
                            gnxreflst = gnd.getVarXref( gvar, debug=False )            
                            print( "Gnomad(processing): DONE" )
                        
                        # build zeep/dxf
                        #---------------
                        
                        znode = uzeep.buildZnode( rec, ns, ac, geneid,
                                                  cvflist, snlist,
                                                  eglist, gnxreflst,
                                                  seqvar = seqvar,
                                                  alst ={"ipro": ipro, "clinvar":cvflist, "snp": snlist }
                        ) # build zeep request node
                        
                        if upr in annot.keys():
                            cann = annot[upr]
                            if "label" in cann and cann["label"] is not None and len(cann["label"]) > 0:  
                                print( "ANN(label):",znode.label , "->", annot[upr]["label"])
                                znode.label=annot[upr]["label"]
                                print( "ANN(label):",znode.label)


                       
                        if args.debug == 'True':
                            zres = uzeep.setnode(znode, mode="add", debug=True)
                        else:
                            zres = uzeep.setnode(znode, mode="add", debug=False)
                        if zres is not None:
                            nsl = zres.xpath("//dxf:dataset/dxf:node/@ns",namespaces=uzeep.dxfns)
                            acl = zres.xpath("//dxf:dataset/dxf:node/@ac",namespaces=uzeep.dxfns)
                            print( 'NS:', nsl[0], ' AC:',acl[0] );

                            # rename MSA file(s)
                            #-------------------
                            try:
                                os.rename( "bkd-server/src/main/webapp/msa-iso/mafft.tmp.fasta",
                                           "bkd-server/src/main/webapp/msa-iso/" + acl[0] + ".fasta")
                            except:
                                print( " WARNING: msa file missing")
                                
                            if len(cols) == 6:
                                logh.write( "\t".join( (acl[0], upr, rfs, taxid, odip, oupr,"\n") ) )
                            else:
                                logh.write( "\t".join( (acl[0], upr, "\n") ) )
                                logh.flush()
                                os.fsync(logh)                           
    else:
              
        uloc = upr_loc[args.uloc]

        # build path to local file
        
        swpath = acc2path( uloc + "/swissprot", args.upr)
        trpath = acc2path( uloc + "/trembl", args.upr)
                   
        if os.path.isfile(swpath):
            ufile = swpath
        elif os.path.isfile(trpath):
             ufile = trpath
        else:
            print( "ERROR: no uniprot file" )
        
        print("UniprotKB record: " + ufile)        
        
        rec = pymex.uprot.Record().parseXml( ufile ) # parse uniprot record

        refList = rec.root["uniprot"]["entry"][0]["dbReference"]
        
        if args.vmap == 'True':
            snpmap( rec, debug=args.debug )

        
        # query/process entrezgene
        #-------------------------
            
        eglist = []
                        
        if args.egene =="True":
            for gid in rec.xref['GeneID']:
                print( gid['id'] )
                    
                # get/parse entrez gene record
                    
                egrec = pymex.egene.Record().getRecord( gid['id'] ) 
                eglist.append( egrec )
                    

        # query/process clinvar
        #----------------------

        cvflist = []

        cvhash = {}
        
        if args.clinvar == 'True':
            refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == 'GeneID']
            if len(refList) > 0:                
                cvquery=refList[0]['id']+'[GeneID]'
            else:
                cvquery = args.upr
            print( 'ClinVar Query:', cvquery )

            cvflist = clinvar(None, cvquery, args.debug)
            
            for cv in cvflist:
                cvhash[ cv['ac'] ] = cv 
            
                    
        # query/process dbsnp
        #--------------------

        snlist = []
        snhash = {}
        
        if args.dbsnp == 'True':
            
            refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == 'GeneID']
            if len(refList) > 0:                
                snquery=refList[0]['id']+'[GeneID]'
            else:
                snquery = args.upr
            print( 'dbSNP Query:', snquery )
                        
            snlist = dbsnp(None, snquery, False) # args.debug)
            
            print( 'dbSNP Query: result length: ', len(snlist))

            for sn in snlist:
                for x in sn['xref']:
                    if x['DB'] == 'dbSNP':
                        snhash[x['Type'] + x['ID']] = sn
               
                        
        #print(snhash.keys())

        
        # query/process gnomad
        #---------------------

        gnxreflst = []
        
        if args.gnomad == 'True':
            print("gnomad")
            
            print(rec.gene["name"]["primary"])

            gnd = BKD.GnomAD()
            geneId = gnd.getGeneIdByName(rec.gene["name"]["primary"])
            gene = gnd.getGene(geneId)
            print(gene)

            print( "Gnomad:", geneId )   # add as xref
            gvar = gnd.getVariantsInGene(geneId)
            gnxreflst = gnd.getVarXref( gvar, debug=True )            
            
            if 1==0:
                for gv in gvar["variants"]:
                    if 'missense' in gv['consequence']:
                        print("XXX",gv['variant_id'],gv['consequence'],gv['rsids'])

                        for rs in gv['rsids']:
                            if rs in snhash.keys():
                                snhash[rs]['xref'].append({'gnomad':gv['variant_id']})
                                print(snhash[rs])
                            else:
                                print('dbSNP miss')
                                try:
                                    cvrec = BKD.RefSNP().getrecord( rs.replace('rs',''), True )
                                    print(cvrec)
                                except BaseException as err:
                                    print(err)
                                    sys.stdout.flush()
                                    sleep(5)
                                
                                if args.parse == 'True':
                                    cfeat = parSNP(cvrec, args.debug == 'True')
                                
                                    #for cf in cfeat:
                                    #    flist.append(cf)

                                
                                    #sys.exit()
                                          
        #sys.exit()

            
        # build zeep/dxf request
        #-----------------------
        
        znode = uzeep.buildZnode( rec, args.ns, args.ac, cvflist, snlist, eglist, gnxrefList = gnxreflst ) # build zeep request node
                
        if args.debug == 'False':                             
            print(json.dumps(rec.root,indent=3))
        
        if args.debug == 'True':
            print("**")
            print( ET.tostring( uzeep._zclient.create_message( uzeep._zclient.service,
                                                               'setNode',
                                                               dataset= znode,
                                                               mode="add"),
                                pretty_print=True ).decode()  )
            
            print("**")
        #sys.exit()
        
        print("!!!!!!")

        if args.debug == 'False':
            zres = uzeep.setnode(znode, mode=args.mode, debug=False)
        else:
            #zres = uzeep.setnode(znode, mode=args.mode, debug=True)
            pass
        
        #zres = uzeep.setnode(znode, mode=args.mode, debug=True)
                
        if args.debug == 'False':
            if len(args.out)  > 0:
                if not args.out.endswith(".dxf"):
                    args.out+= ".dxf"

                with open( args.out, "w" ) as of:
                    of.write( ET.tostring(zres, pretty_print=True).decode() )
                    of.write( "\n" )
        else:
            #print(ET.tostring(zres, pretty_print=True).decode() )
            print()
