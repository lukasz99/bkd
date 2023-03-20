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

bkd_dest = {"dip0-local":"http://10.1.7.100:9999/dipdev0",
            "dip0-public":"https://dip.mbi.ucla.edu/dipdev0",
            "dip2beta-local":"http://%%USER%%:%%PASS%%@10.1.8.211:8080/dip2beta",
            "dip2beta-public":"https://%%USER%%:%%PASS%%@dip.mbi.ucla.edu/dip2beta",
            "dip2-local":"http://10.1.7.102:9999/dipdev2",
            "dip2-public":"https://dip.mbi.ucla.edu/dipdev2",
            "cvdb-local":"http://10.1.8.201:8080/cvdb",
            "cvdb0-local":"http://10.1.7.100:9999/cvdbdev0",
            "cvdb0-public":"https://dip.mbi.ucla.edu/cvdbdev0",
            "cvdb2-local":"http://10.1.7.102:9999/cvdbdev2",
            "cvdb2-public":"https://dip.mbi.ucla.edu/cvdbdev2"}

clinsig_map = {"Benign/Likely benign":"likely benign",
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

parser.add_argument('--refSNP', '-rs',  dest="rs", type=str,
                    required=False, default='',
                    help='dbSNP accession.')

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

parser.add_argument('--setac', dest="setac", type=bool,
                    required=False, default=False,
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

parser.add_argument('--debug', '-d', dest="debug", type=bool,
                    required=False, default=False,
                    help='Debug option.')

parser.add_argument('--parse', dest="parse", type=bool,
                    required=False, default=False,
                    help='Parse/process incoming records.')

parser.add_argument('--variant-map', '-vm', dest="vmap", type=bool,
                    required=False, default=False,
                    help='Variant mapping (default: False).')

parser.add_argument('--clinvar', '-cv', dest="clinvar", type=bool,
                    required=False, default=False,
                    help='Fetch ClinVars (default: False).')

parser.add_argument('--dbsnp', '-sn', dest="dbsnp", type=bool,
                    required=False, default=False,
                    help='Fetch dbSNP (default: False).')

#spyder hack: add '-i' option only if present (as added by spyder)

if '-i' in sys.argv:
    parser.add_argument('-i',  dest="i", type=str,
                        required=False, default=None)

    
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

        if debug:
            print("DEBUG: variant->",v)

        rp = []
                
        if "xref" in v:
            for x in v["xref"]:
                if debug:
                    print( "DEBUG: xref->", x)

                if x["type"] == "dbSNP":                    
                    rsid = re.sub( "rs","", x["id"] )
                    if debug:
                        print( "DEBUG: rsid->", x["id"])
                                                        
                    rp += BKD.RefSNP().getpos( rsid )
                    
            for nx in rp:
                v["xref"].append( { "type":nx["build"], "id": nx["pos"] } )
                if debug:
                    print( "DEBUG: map->", v["xref"][-1] ) 

                    
def dbsnp( rec, query, debug=False):
    
    snlist = BKD.RefSNP().getlist( query, debug )
    sleep(1)
    if debug:
        print( "DEBUG: dbsnp: snlist->", len(snlist) )
        sys.stdout.flush()
    i = 0 
    for rsid in snlist:
        i+=1
        if debug:
            print("DEBUG: ",i,"/",len(snlist),"query:" ,query, " dbsnp: ----")
            sys.stdout.flush()
        try:
            cvrec = BKD.RefSNP().getrecord( rsid, debug )
        except BaseException as err:
            print(err)
            sys.stdout.flush()
            sleep(5)
            
        if args.parse:
            cfeat = parSNP(cvrec, debug)
            print(cfeat)
        #sys.exit()
        
def parSNP( rec, debug=False):
    
    feat = {'allele':[]}

    if debug:
        print('DEBUG: parSNP:  keys -> ', rec.keys())    
        print('DEBUG: parSNP: ID -> ', rec['refsnp_id'])
        print('DEBUG: parSNP: primary data -> ', rec['primary_snapshot_data'].keys()    )
        print('DEBUG: parSNP: primary data -> ', rec['primary_snapshot_data']['variant_type']    )
        #print('DEBUG: parSNP: allele annotations-> ', rec['primary_snapshot_data']['allele_annotations']    )
        
    feat['ver'] = rec ['last_update_build_id']
    
    if len(rec['citations']) > 0:
        print('citations...')
        pass

    aal = rec['primary_snapshot_data']['allele_annotations']

    for aa in aal: # go over alleles
        
        call = {}
        feat['allele'].append(call)
        print("\n\nallele:\n  ",aa.keys())
        print("   clinical: ",len(aa['clinical']))
        if len(aa['clinical']) > 0:
               for c in aa['clinical']:
                   #print("   clinical: ",c.keys())
                   print("   clinical: accession: ",c['accession_version'])
                   print("   clinical: accession: ",c['clinical_significances'])
                   call.setdefault('clinical',{"ac":[],"sig":[]})
                   call['clinical']['ac'].append(c['accession_version'])
                   call['clinical']['sig']=c['clinical_significances']

        #print("  ",aa['assembly_annotation'])
        print("   ass: ", len(aa['assembly_annotation']))
        spdi = {}
        if len(aa['assembly_annotation']) > 0:
            asl = aa['assembly_annotation']
            for ass in asl:                
                print("   ass: ", ass.keys())
                gl = ass['genes']
                print("   gene: ", len(gl))
                
                for g in gl:
                    print("   gene: ", g.keys())
                    print("   gene: ", g['id'])
                    print("   gene: ", g['locus'])
                    print("   gene: ", g['name'])
                    print("   rnas: ", len(g['rnas']))
                    for r in g['rnas']:
                        cspdi = r['protein']['variant']['spdi'] 
                        #print( "   ", spdi )
                        #print( "   ", spdi['position'], " : ",
                        #       spdi['deleted_sequence'], " -> ",
                        #       spdi['inserted_sequence'] ) 
                        pos = ":".join([ str(cspdi['position']+1),
                                         cspdi['deleted_sequence'],
                                         cspdi['inserted_sequence']])
                        #print("   ",pos)
                        spdi.setdefault(pos,{'count':0,'hgvs':[]})
                        spdi[pos]['count'] += 1
                        spdi[pos]['hgvs'].append(r['hgvs'])
                #print("   ",spdi)
        call['spdi']=spdi 
        #print("  gene: ",a['genes'][0]['id']," : ", a['genes'][0]['locus'])
        
    xref = feat.setdefault('xref',[])
    xrs = {'ns':'refSNP','ac':'rs'+rec['refsnp_id']}
    xref.append(xrs)

    if debug:

        print("\nDebug: features:",)
        print("Debug: Ver:",feat["ver"])
        print("Debug: Xrf",feat["xref"])
        for a in feat["allele"]:
            print("Debug:  allele:", a)

    #feat['type']=cvar['VariationType']
        
    #feat['ac']=cvar['Accession']
            
    return feat
           
def clinvar( rec, upr, debug=False):
    
    cvlist = BKD.ClinVar().getlist( upr, debug )

    if debug:
        print( "DEBUG: clinvar: cvlist->",cvlist )

    cflist = []
        
    for cvid in cvlist:
        if debug:
            print("\nDEBUG: clinvar: ----")                
        cvrec = BKD.ClinVar().getrecord( cvid, debug )
        cfeat = {}
                 
        cvar = cvrec.root["ClinVarResult-Set"]["VariationArchive"]

        cfeat['name']=cvar['VariationName']
        if debug:
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

        if debug:
            print( 'DEBUG: clinvar: Accession -> ',cvar['Accession'])
            print( 'DEBUG: clinvar: AlleleID:',sa['AlleleID'])
            print( 'DEBUG: clinvar: VariationID:',sa[ 'VariationID'])

        if debug:

            print('DEBUG: clinvar:  Name->', sa[ 'Name'])
            if 'SPDI' in sa:
                print('DEBUG: clinvar:  SPDI->', sa[ 'SPDI'])
            else:
                print('DEBUG: clinvar:  SPDI->', 'N/A')
            print('DEBUG: clinvar:  VariantType->', sa[ 'VariantType'])
            
            for g in sa[ 'Gene']:            
                for k in ['Symbol', 'FullName', 'GeneID', 'HGNC_ID','OMIM']:
                    if k in g:  
                        print('DEBUG: clinvar:   Gene('+k+')->', g[k])
        
           
                if 'Location' in g:
                    print('DEBUG: clinvar:  (**)Locaton(cyto)-> ', g['Location']['CytogeneticLocation'])
                else:
                    print('DEBUG: clinvar:  (**)Locaton(cyto)-> ', 'N/A')


        if 'cspdi' in sa:
            cfeat['cspdi'] = sa['cspdi']
                    
        if 'Location' in sa:
            loc = sa['Location']
            if 'SequenceLocation' in loc:
                for l in loc['SequenceLocation']:
                    cloc = cfeat.setdefault('location',[])
                    if debug:
                        print('DEBUG: clinvar: (**)Locaton(sa seq):')
                        print('DEBUG: clinvar:   -> ', l['Assembly'])
                        print('DEBUG: clinvar:   -> ', l['AssemblyAccessionVersion'])
                        print('DEBUG: clinvar:   -> ', l['Accession'])
                        print('DEBUG: clinvar:   -> ', l['start'])
                        print('DEBUG: clinvar:   -> ', l['stop'])
                    cloc.append( {'assembly':l['Assembly'],
                                  'version':l['AssemblyAccessionVersion'],
                                  'ac':l['Accession'],
                                  'start':l['start'],'stop': l['stop']})
                    
        for g in sa[ 'Gene']:   
            for l in g['Location']['SequenceLocation']:

                cloc = cfeat.setdefault('location',[])
                if debug:
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
                if debug:
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
                    print("DEBUG: clinical significance:", len(ins), clinsig )

                cfeat['clinsig'] = clinsig
                    
        if 'ProteinChange' in sa:
            if debug:
                print('DEBUG: clinvar: (**) ProteinChange -> ',sa[ 'ProteinChange'])
            cfeat['pchange']=sa[ 'ProteinChange']
            cflist.append(cfeat)
        else:
            if debug:
                print( "DEBUG: clinvar: ProteinChange: none" )
        if debug:    
            print("DEBUG: clinvar: ------")

           
    if debug:    
        #print(json.dumps(cflist,indent=3))
        pass
    
    return cflist


# ------------------------------------------------------------------------------

args = parser.parse_args()

srvUrl = bkd_dest[args.sloc]

srvUrl = srvUrl.replace( "%%USER%%", args.user)
srvUrl = srvUrl.replace( "%%PASS%%", args.password)

uzeep = BKD.UniZeep( srvUrl )

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
        
if args.vmap:
    snpmap( rec, debug=args.debug )

cvflist = []

if args.clinvar:
    refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == 'GeneID']
    if len(refList) > 0:                
        cvquery=refList[0]['id']+'[GeneID]'
    else:
        cvquery = args.upr
    print( 'ClinVar Query:', cvquery )

    cvflist = clinvar(None, cvquery, args.debug)

if args.dbsnp:
    
    refList = [dbref for dbref in rec.root["uniprot"]["entry"][0]["dbReference"] if dbref["type"] == 'GeneID']

    if len(args.file) > 0:
        with open(args.file, "r") as fh:
            for ln in fh:
                if  not ln.startswith("#"):
                    cols = ln.split('\t')
                    upr = cols[1].strip()
                    print(ln.strip())
                    sys.stdout.flush()
                    snquery=upr;
                    snlist = dbsnp(None, snquery, args.debug)
        sys.exit()
    elif len(refList) > 0:                
        snquery=refList[0]['id']+'[GeneID]'
    else:
        snquery = args.upr
    print( 'dbSNP Query:', snquery )

    snlist = dbsnp(None, snquery, args.debug)


if len(args.rs ) > 0:
    print( args.rs )
    cvrec = BKD.RefSNP().getrecord( args.rs, args.debug )
    cfeat = parSNP(cvrec, args.debug)

for cv in cvflist:
    print(cv)
#sys.exit()    

znode = uzeep.buildZnode( rec, args.ns, args.ac, cvflist ) # build zeep request node
        

if args.debug:
    print("Debug: json.dump:")
    #print(json.dumps(rec.root,indent=3))
    
if args.debug:
    print("**")
    print( ET.tostring(uzeep._zclient.create_message(uzeep._zclient.service,'setNode', dataset= znode, mode="add"), pretty_print=True ).decode()  )
    print("**")
sys.exit()

zres = uzeep.setnode(znode, mode=args.mode, debug=args.debug)
#zres = uzeep.setnode(znode, mode=args.mode, debug=True)
                
if not args.debug:
    if len(args.out)  > 0:
        if not args.out.endswith(".dxf"):
            args.out+= ".dxf"

        with open( args.out, "w" ) as of:
            of.write( ET.tostring(zres, pretty_print=True).decode() )
            of.write( "\n" )
else:
    print(ET.tostring(zres, pretty_print=True).decode() )
    print()
