import re

def id2ac(id, dpre = "DIP-", dpost = "N"):
    return dpre+str(id)+dpost

def ac2id(ac):
    return int(''.join(c for c in ac if c.isdigit()))

def mySortKey(e):
    return int(re.sub('[^0-9]','',e))

def generateEdgeDicts ( edges_file_path, nodeMaps ):

    ( odip2dip, upr2dip, oupr2upr, rfs2dip, dip2taxid ) = nodeMaps    
    
    nlst2edge = {}
    with open( edges_file_path, "r") as edges_file:  
        for ln in edges_file:
            if ln.startswith("#"):
                continue
            col=ln.strip().split('\t')
        
            kcol = col[0].split('|')
            nkcl =[]
            for kc in kcol:
                if kc in odip2dip:
                    nkcl.append(odip2dip[kc])
                else:
                     nkcl.append('XXX')  # retired node ?
            col[0] =  '|'.join(nkcl)
                
            key=re.sub('[^|0-9]*','',col[0])
            nlst2edge[key]=col[1]
            
    return nlst2edge
        
def generateNodeDicts( nodes_file_path ):
    odip2dip = {}
    upr2dip = {}
    oupr2upr = {}
    rfs2dip = {}
    dip2taxid = {}
        
    with open(nodes_file_path, "r") as nodes_file:
        for ln in nodes_file:
            if  not ln.startswith("#"):
                #cols = [0]AC [1]UPR [2]RFS [3]TAXID [4]ODIP [5]OUPR
                cols = ln.split('\t') 
                if len(cols) > 1:
                    if len(cols[0].strip()) > 0:
                        dip_id = id2ac(ac2id(cols[0].strip()))
                        if dip_id not in dip2taxid.keys():
                            dip2taxid[dip_id] = cols[3].strip()
                        else:
                            if cols[3].strip() not in dip2taxid[dip_id].split(":"):
                                dip2taxid[dip_id] = ":".join([dip2taxid[dip_id], cols[3].strip()])
                        
                        if len(cols[4].strip()) > 0:
                            for odip_id in [id2ac(ac2id(x)) for x in cols[4].strip().split(':')]:
                                if odip_id not in odip2dip.keys():
                                    odip2dip[odip_id] = dip_id
                                else:
                                    if dip_id not in odip2dip[odip_id].split(":"):
                                        odip2dip[odip_id] = ":".join([odip2dip[odip_id], dip_id])
                        
                        if len(cols[1].strip()) > 0:
                            upr_id = cols[1].strip()
                            if upr_id not in upr2dip.keys():
                                upr2dip[upr_id] = dip_id
                            else:
                                if dip_id not in upr2dip[upr_id].split(':'):
                                    upr2dip[upr_id] = ":".join([upr2dip[upr_id], dip_id])
                                    
                            if len(cols[5].strip()) > 0:
                                for oupr_id in cols[5].strip().split(':'):
                                    if oupr_id not in oupr2upr.keys():
                                        oupr2upr[oupr_id] = upr_id
                                    else:
                                        if upr_id not in oupr2upr[oupr_id].split(":"):
                                            oupr2upr[oupr_id] = ":".join([oupr2upr[oupr_id], upr_id])
                        
                        if len(cols[2].strip()) > 0:
                            for rfs_id in cols[2].strip().split(':'):
                                if rfs_id not in rfs2dip.keys():
                                    rfs2dip[rfs_id] = dip_id
                                else:
                                    if dip_id not in rfs2dip[rfs_id].split(':'):
                                        rfs2dip[rfs_id] = ":".join([rfs2dip[rfs_id], dip_id])

    return ( odip2dip, upr2dip, oupr2upr, rfs2dip, dip2taxid )
               
def processMif( spmid, year, rec, maps, nlst2edge, out, error_log):
    
    ( odip2dip, upr2dip, oupr2upr, rfs2dip, dip2taxid ) = maps
    
    for interaction in rec.interactions:
        
        part_dip_ids = []
        invalid_interaction = False
        dropped_participant = False
        pubmed_id = interaction.experiment.bibref.primaryRef.ac
        imex_id = interaction.imexid
        if str(spmid) != str(pubmed_id):
            print("FILENAME ERROR:", year, spmid, pubmed_id)
        try:

            for participant in interaction.participants:

                # skip non-proteins and ancillary proteins
                if participant.interactor.type.label != 'protein' or ancillary' in [exprole['names']['fullName'] for exprole in participant._exprole]:
                    dropped_participant = True
                else:
                    upr_ids = []
                    dip_ids = []
                    rfs_ids = []

                    taxid = participant.interactor.host.taxid
                    for xref in participant.interactor.xrefs:
                        if xref.db == 'uniprotkb' and xref.refType == 'identity':
                            if xref.ac.find('-PRO') > -1:
                                upr_ids.append(xref.ac)
                            else:
                                upr_ids.append(xref.ac.split('-')[0])
                        elif xref.db == 'refseq':
                            rfs_ids.append(xref.ac)
                        elif xref.db == 'dip':
                            dip_ids.append(id2ac(ac2id(xref.ac)))

                    mapped_ids = set()
                    for odip_id in dip_ids:
                        if odip_id in dip2taxid.keys():
                            mapped_ids.add(odip_id)
                        else:
                            if odip_id not in odip2dip.keys():
                                mapped_ids.add(odip_id+"*")
                            else:
                                for mapped_id in odip2dip[odip_id].split(":"):
                                    mapped_ids.add(mapped_id)
                    for oupr_id in upr_ids:
                        if oupr_id in upr2dip.keys():
                            mapped_ids.add(upr2dip[oupr_id])
                        else:
                            if oupr_id in oupr2upr.keys():
                                for upr_id in oupr2upr[oupr_id].split(":"):
                                    mapped_ids.add(upr2dip[upr_id])

                    for rfs_id in rfs_ids:
                        if rfs_id in rfs2dip.keys():
                            for mapped_id in rfs2dip[rfs_id].split(":"):
                                mapped_ids.add(mapped_id)

                    if len(mapped_ids) != 1:
                        part_dip_ids.append(":".join(mapped_ids))
                        invalid_interaction = True
                    else:
                        for mapped_id in mapped_ids:
                            if "*" in mapped_id:
                                part_dip_ids.append(":".join(mapped_ids))
                                invalid_interaction = True
                            else:
                                if dip2taxid[mapped_id] == taxid:
                                    part_dip_ids.append(mapped_id)
                                else:
                                    part_dip_ids.append(mapped_id+"(TAXIDERROR)")
                                    invalid_interaction = True

            # find old edge id
            #-----------------

            nlist = list()
            for n in part_dip_ids:       
                nlist.append(re.sub('[^0-9]*','',n))

            nlist.sort( key=mySortKey )

            key='|'.join(nlist)

            if key in nlst2edge:
                edgeid = nlst2edge[key]
            else:
                edgeid = ''

            #Interaction_DIP\tParticipant_DIP\tPubMed\tIMEx\tYear

            rec_line = "\t".join( ( edgeid, '|'.join( part_dip_ids ),
                                    pubmed_id, imex_id, year  ) ) 
            
            #if there is only one participant, check if stoichiometry is >= 2
            
            if len(part_dip_ids) == 1:
                if type(participant.stoich[0]) != str: #stoich is (0,0)
                    if participant.stoich[0] < 2:
                        invalid_interaction = True
                elif:
                    int(participant.stoich[0].split("'")[3]) < 2:
                        invalid_interaction = True
            
            if invalid_interaction:
                error_log.write( "INVALID EDGE:" + "\t" + rec_line + "\n" )
            else:                
                out.write( rec_line + '\n' )

        except Exception as e: 
            err_line =  "\t".join( (str(spmid), str(interaction),
                                    str(imex_id), str(year) ) )
            
            error_log.write(  "PARSE EXCEPTION:" + "\t" + err_line )
            isIntRef = False
            for participant in interaction._participant:
                if 'interactionRef' in participant.keys():
                    isIntRef = True
        
            if isIntRef:
                error_log.write('\tinteractionRef\n')
            else:
                error_log.write('\tNA\n')


        
