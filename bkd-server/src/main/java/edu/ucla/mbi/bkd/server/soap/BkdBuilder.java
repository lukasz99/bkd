package edu.ucla.mbi.bkd.server.soap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

import edu.ucla.mbi.dxf15.*;
import edu.ucla.mbi.bkd.store.*;
            
public class BkdBuilder {
    
    private static final Logger log
        = LoggerFactory.getLogger( BkdBuilder.class );

    BkdRecordManager recordManager;

    public void setRecordManager( BkdRecordManager manager ){
        this.recordManager = manager;
    }
    /**
    public Experiment buildExperiment( NodeType expt ){
        
        Experiment nExpt = new edu.ucla.mbi.dip.database.imxdip.Experiment();
                    
        log.info( "building experiment" );
                    
        String dipAc = "";   // DIP-1234X
        String imexAc = "";  // IM-1234-1
        String pmidSrc = ""; // source pmid
        String imexSrc = ""; // IM-1234 (source imex)
        int iac = 0;
        
        if( expt.getXrefList() != null ){
            List<XrefType> xrefList = expt.getXrefList().getXref(); 
            for( XrefType xref : xrefList ){
                
                if( "identical-to".equalsIgnoreCase(xref.getType())){
                    
                    //<xref ns="dip" ac="DIP-1234X"
                    //      typeNs="dxf" typeAc="dxf:0009" type="described-by"/>
                    if( "dip".equalsIgnoreCase(xref.getNs()) &&
                        ! "".equals(xref.getAc()) ){
                        dipAc = xref.getAc();                               
                    }

                    //<xref ns="imex" ac="IM-1234-1"
                    //      typeNs="dxf" typeAc="dxf:0009" type="identical-to"/>                    
                    if( "imex".equalsIgnoreCase(xref.getNs()) &&
                        ! "".equals(xref.getAc())){
                        imexAc = xref.getAc();                         
                    }
                    continue;
                }
                
                if( "described-by".equalsIgnoreCase(xref.getType())){
                    
                    //<xref ns="PubMed" ac="9832501"
                    //      typeNs="dxf" typeAc="dxf:0014" type="described-by"/>
                    if( "pubmed".equalsIgnoreCase(xref.getNs())){
                        pmidSrc = xref.getAc();
                    }
                    
                    //<xref ns="dip" ac="DIP-653S"
                    //      typeNs="dxf" typeAc="dxf:0014" type="described-by"/>
                    if( "dip".equalsIgnoreCase(xref.getNs())  ){
                        Type xtp = new Type( "dxf", "dxf:0014","described-by" );
                        ExptXref x = new ExptXref( xref.getNs(), xref.getAc(),
                                                   xtp );
                        nExpt.addXref(x);                        
                    }
                    
                    continue;
                }
                
                if( "supports".equalsIgnoreCase( xref.getType() )){
                    
                    Type xtp = new Type( "dxf", "dxf:0013","supports" );                         
                    ExptXref x =  new ExptXref( xref.getNs(), xref.getAc(),
                                                xtp );
                    nExpt.addXref(x);
                    continue;
                }
                
                //<xref ns="dip" ac="MI:0465"
                //      typeNs="dxf" typeAc="dxf:0040" type="published-by"/>                
                if( "published-by".equalsIgnoreCase( xref.getType() )){
                    
                    Type xtp = new Type( "dxf", "dxf:0040","published-by" );
                    ExptXref x =  new ExptXref( xref.getNs(), xref.getAc(),
                                                xtp );
                    nExpt.addXref(x);
                    continue;
                }

                //<xref ns="dip" ac="MI:0465"
                //      typeNs="dxf" typeAc="dxf:0055" type="curated-by"/>
                if( "curated-by".equalsIgnoreCase( xref.getType() )){
                    
                    log.info( "XREF: " +  xref);
                    
                    Type xtp = new Type( "dxf", "dxf:0055","curated-by" );
                    ExptXref x =  new ExptXref( xref.getNs(), xref.getAc(),
                                                xtp );
                    nExpt.addXref(x);

                    
                    Type pxtp = new Type( "dxf", "dxf:0009","identical-to" );
                    ProdXref pxref = new ProdXref( xref.getNs(), xref.getAc(),
                                                   pxtp );
                    Producer prod = new Producer();
                    prod.addXref( pxref );
                    nExpt.addProd( prod );
                    
                    continue;
                }                
            }
        }

        // node atrribute overrides xref dip source (drops xref)
        //------------------------------------------------------
        
        if( "dip".equalsIgnoreCase( expt.getNs() ) ){
            dipAc = expt.getAc();
        }

        if( ! "".equals( dipAc ) ){
            try{                        
                String nac = dipAc.replaceAll("[DIP\\-X]", "" );
                log.debug( "SAC: " + nac);
                iac = Integer.parseInt( nac );
            } catch( Exception ex ){
                
            }
        }
        log.info( "DIP IAC: " + iac);
        
        if( iac > 0){    
            nExpt.setDipId( iac );
        }
        
        // node atrribute overrides xref imex source (drops xref)
        //-------------------------------------------------------
        if( ! "".equals( imexAc ) ){
            
            if( "imex".equalsIgnoreCase( expt.getNs()) ){
                imexAc = expt.getAc();
                nExpt.setImexId( imexAc );
            }
        }
        
        log.info( "DIP AC=" + dipAc + " IMEX AC=" + imexAc); 
        log.info( "SRC IMEX=" + imexSrc + " PMID=" + pmidSrc); 
        
        if( imexSrc.length() > 0 || pmidSrc.length() > 0 ){
            Source expSrc = new Source();
            expSrc.setPmid(pmidSrc);
            expSrc.setImexId(imexSrc);
            nExpt.setSource(expSrc);
        } else {
            return null;
        }
        
        // experiment method
        //------------------
        CvTerm emth = new CvTerm();
        
        // experiment host
        //----------------
        Taxon ehost =  new Taxon();
        
        // experiment result
        //------------------
        CvTerm eres = new CvTerm();
        
        if( expt.getAttrList() != null ){
            List<AttrType> attrList = expt.getAttrList().getAttr(); 
            for( AttrType attr : attrList ){
                
                // result: demonstrated interaction type
                
                if( ("dip:0001".equalsIgnoreCase( attr.getAc() ) ||
                     "mi:0190".equalsIgnoreCase( attr.getAc() )) &&
                    attr.getValue() != null ){
                    eres.setNs( attr.getValue().getNs() );
                    eres.setAc( attr.getValue().getAc() );
                    eres.setName( attr.getValue().getValue() );
                    log.info( "EXPRES=" + eres);
                    
                    nExpt.setExptResult( eres );
                }

                // method: interaction detection method
                
                if( ( "mi:0001".equalsIgnoreCase( attr.getAc() ) ||
                      "mi:0001".equalsIgnoreCase( attr.getAc() ) )
                    && attr.getValue() != null ){
                    
                    emth.setNs( attr.getValue().getNs() );
                    emth.setAc( attr.getValue().getAc() );
                    emth.setName( attr.getValue().getValue() );
                    log.info( "EXPMTH=" + emth);
                    
                    nExpt.setExptMeth( emth );                               
                }
                
                // experiment host: 
                
                if( ( "dxf:0017".equalsIgnoreCase( attr.getAc() ) ||
                      "dxf:0017".equalsIgnoreCase( attr.getAc() ) )
                    && attr.getValue() != null ){
                    
                    String stx = attr.getValue().getAc();
                    int itx = 0;
                    if( stx != null && stx.length() > 0){
                        itx = Integer.parseInt(stx);
                    }
                    if( "taxid".equalsIgnoreCase( attr.getValue().getNs()) ){
                        ehost.setTaxid( itx );
                        ehost.setSciName(attr.getValue().getValue());
                        nExpt.setExptHost( ehost );
                        
                        log.info( "SRC HOST=" + ehost);
                    }
                }
            }
        }
        
        // parts (proteins)
        //-----------------
        
        // collect a set of unique dip node accessions
        
        List<String> partAcList = new ArrayList<String>();
        
        if( expt.getPartList() != null ){
            List<NodeType.PartList.Part> partList
                = expt.getPartList().getPart(); 
            for( NodeType.PartList.Part part : partList ){
                
                NodeType node = part.getNode();
                TypeDefType ntp = node.getType();
                
                if( "protein".equalsIgnoreCase(ntp.getName()) ||
                    "peptide".equalsIgnoreCase(ntp.getName()) ){
                    
                    String partNs = node.getNs();
                    String partAc = node.getAc();
                    
                    if( ! "dip".equalsIgnoreCase(partNs) ||
                        partAc == null || partAc.length() == 0 ){
                        log.info("UNKNOWN PART: NS=" + partNs + " AC=" + partAc );
                        return null;
                    }
                    
                    if(! partAcList.contains(partAc)){
                        partAcList.add(partAc);
                    }
                }
            }
        }                    
        
        // test/add known parts
        //---------------------
        
        for( String ac: partAcList ){
            edu.ucla.mbi.dip.database.imxdip.Node iNode =
                recordManager.getNodeByAccession( ac );
            if( iNode != null ){
                log.info("NODE: " + iNode.toString() );
                
                nExpt.getNodeSet().add(iNode);
            } else {
                
                // unknown part
                //-------------
                
                log.info( "NODE: Unknown:  ac="  + ac );
                return null;
            }
        }
        
        return nExpt;
    }
    
    public Evidence buildEvidence( NodeType evid ){

        Evidence nEvid = new edu.ucla.mbi.dip.database.imxdip.Evidence();
                    
        log.info( "building evidence" );

        String dipAc = "";   // DIP-1234V
        int iac = 0;
                    
        if( "dip".equalsIgnoreCase( evid.getNs()) ){
            dipAc = evid.getAc();
            
            try{                        
                String nac = dipAc.replaceAll("[DIP\\-V]", "");
                log.debug( "SAC: " + nac);
                iac = Integer.parseInt( nac );
            } catch(Exception ex){
                //
            }
        }
        log.info( "DIP IAC: " + iac);
        
        if( iac > 0){    
            nEvid.setDipId( iac );
        }
       
        // evidence method & result
        //-------------------------

        CvTerm emth = new CvTerm();
        CvTerm eres = new CvTerm();
        
        if( evid.getAttrList() != null ){
            List<AttrType> attrList = evid.getAttrList().getAttr(); 
            for( AttrType attr : attrList ){
                
                // result
                
                if( ("dxf:0065".equalsIgnoreCase( attr.getAc() ) ||
                     "result".equalsIgnoreCase( attr.getName() )) &&
                    attr.getValue() != null ){
                    eres.setNs( attr.getValue().getNs() );
                    eres.setAc( attr.getValue().getAc() );
                    eres.setName( attr.getValue().getValue() );
                    log.info( "EXPRES=" + eres);
                    
                    nEvid.setEvidResult( eres );
                }

                // method
                
                if( ( "dxf:0064".equalsIgnoreCase( attr.getAc() ) ||
                      "method".equalsIgnoreCase( attr.getName() ) )
                    && attr.getValue() != null ){
                    
                    emth.setNs( attr.getValue().getNs() );
                    emth.setAc( attr.getValue().getAc() );
                    emth.setName( attr.getValue().getValue() );
                    log.info( "EXPMTH=" + emth);
                    
                    nEvid.setEvidMeth( emth );                               
                }
            }
        }    



        //EvidXref( String ns, String ac,
        //          String type, String typeNs, String typeAcc )


        //if( "dip".equalsIgnoreCase(xref.getNs())  ){
        //    Type xtp = new Type( "dxf", "dxf:0014","described-by" );
        //    ExptXref x = new ExptXref( xref.getNs(), xref.getAc(),
        //                               xtp );
        //    nExpt.addXref(x);                        
        //}

        
        if( evid.getXrefList() != null ){
            List<XrefType> xrefList = evid.getXrefList().getXref(); 
            for( XrefType xref : xrefList ){

                log.info( "  xref " + xref);
                log.info( "   ns " + xref.getNs());
                log.info( "   ac " + xref.getAc());
                log.info( "   typeNs " + xref.getTypeNs());
                log.info( "   typeAc " + xref.getTypeAc());
                log.info( "   typexref " + xref.getType());
                
                if("supports".equalsIgnoreCase(xref.getType()) ||
                   "dxf:0013".equalsIgnoreCase(xref.getTypeAc() ) ){
                    Type xtp = new Type( "dxf", "dxf:0013","supports" );
                    EvidXref x = new EvidXref( xref.getNs(), xref.getAc(),
                                               xtp );
                    nEvid.addXref(x);                        
                    
                }
            }
        }    

        
        // parts (experiments)
        //-------------------

        // collect a set of unique dip experiment accessions

        log.info( "PARTS:");
        List<String> partAcList = new ArrayList<String>();
        
        if( evid.getPartList() != null ){
            List<NodeType.PartList.Part> partList
                = evid.getPartList().getPart(); 
            for( NodeType.PartList.Part part : partList ){
                
                NodeType node = part.getNode();
                TypeDefType ntp = node.getType();

                log.info( "  EXPT: " + node.getAc() );
                
                if( "experiment".equalsIgnoreCase(ntp.getName()) ||
                    "experiment".equalsIgnoreCase(ntp.getName()) ){
                    
                    String partNs = node.getNs();
                    String partAc = node.getAc();
                    
                    if( ! "dip".equalsIgnoreCase(partNs) ||
                        partAc == null || partAc.length() == 0 ){
                        log.info("UNKNOWN PART: NS=" + partNs + " AC=" + partAc );
                        return null;
                    }
                    
                    if(! partAcList.contains(partAc)){
                        partAcList.add(partAc);
                    }
                }
            }
        }                    
        
        // test/add known parts
        //---------------------
        
        for( String ac: partAcList ){
            edu.ucla.mbi.dip.database.imxdip.Experiment iExpt =
                recordManager.getExperiment( ac );
            if( iExpt != null){
                log.info("EXPT: " + iExpt.toString());
                
                nEvid.getExptSet().add(iExpt);
            } else {
                
                // unknown part
                //-------------
                
                log.info("EXPT: Unknown:  ac="  + ac );
                return null;
            }
        }
        log.info("EXPT COUNT: " + nEvid.getExptSet().size());
        
        
        return nEvid;
    }
    
    public Edge buildEdge( NodeType edge ){
        
        Edge nEdge = new edu.ucla.mbi.dip.database.imxdip.Edge();
                    
        log.info( "building edge" );
                
        String dipAc = "";   // DIP-1234E
        String imexAc = "";  
        String imexSrc = ""; 
        String pmidSrc = ""; 
        
        int iac = 0;
        if( "dip".equalsIgnoreCase( edge.getNs()) ){
            dipAc = edge.getAc();
                    
            try{                        
                String nac = dipAc.replaceAll("[DIP\\-E]", "");
                log.debug( "SAC: " + nac);
                iac = Integer.parseInt( nac );
            } catch(Exception ex){
                
            }
        }
        log.info( "DIP IAC: " + iac);
                
        if( iac > 0){    
            nEdge.setDipId( iac );
        }
        
        if( edge.getXrefList() != null ){
            List<XrefType> xrefList = edge.getXrefList().getXref(); 
            for( XrefType xref : xrefList ){
                if( "identical-to".equalsIgnoreCase(xref.getType())){
                    
                    if( "dip".equalsIgnoreCase(xref.getNs()) &&
                        ! "".equals(xref.getAc())){
                        dipAc = xref.getAc();
                        continue;
                    }
                    if( "imex".equalsIgnoreCase(xref.getNs()) &&
                        ! "".equals(xref.getAc())){
                        imexAc = xref.getAc();
                        continue;
                    }
                }
                
                if( "described-by".equalsIgnoreCase(xref.getType())){
                    
                    if( "pubmed".equalsIgnoreCase(xref.getNs())){
                        pmidSrc = xref.getAc();
                        continue;
                    }
                    if( "imex".equalsIgnoreCase(xref.getNs())){
                        imexSrc = xref.getAc();
                        continue;
                    }
                }

                nEdge.addXref(new EdgeXref(xref.getNs(),
                                           xref.getAc(),
                                           xref.getType(),
                                           xref.getTypeNs(),
                                           xref.getTypeAc()));
            }
        }
        
        log.info( "EDGE PARTS (VERTICES):");
        List<String> partAcList = new ArrayList<String>();

        if( edge.getPartList() != null ){           
            List<NodeType.PartList.Part> partList
                = edge.getPartList().getPart();
            
            for( NodeType.PartList.Part part : partList ){
                
                NodeType node = part.getNode();
                TypeDefType ntp = node.getType();

                log.info( "  NODE: " + node.getAc() );
                
                if( "protein".equalsIgnoreCase(ntp.getName()) ||
                    "peptide".equalsIgnoreCase(ntp.getName()) ){
                    
                    String partNs = node.getNs();
                    String partAc = node.getAc();
                    
                    if( ! "dip".equalsIgnoreCase(partNs) ||
                        partAc == null || partAc.length() == 0 ){
                        log.info("UNKNOWN PART: NS=" + partNs + " AC=" + partAc );
                        return null;
                    }
                    
                    if(! partAcList.contains(partAc)){
                        partAcList.add(partAc);
                    }
                }
            }
        }                    
        
        // test/add known parts
        //---------------------
        
        for( String ac: partAcList ){

            log.info( "  NODE AC: " + ac );
            
            edu.ucla.mbi.dip.database.imxdip.Node iNode =
                recordManager.getNodeByAccession( ac );
            
            log.info( "  iNODE: " + iNode );
            
            if( iNode != null){
                log.info("NODE/VERTEX: " + iNode.toString());
                
                nEdge.getNodeSet().add(iNode);
            } else {
                
                // unknown part
                //-------------
                
                log.info("NODE/VERTEX: Unknown:  ac="  + ac );
                return null;
            }
        }

        // attributes
        //-----------

        CvTerm etype = new CvTerm();
        
        if( edge.getAttrList() != null ){
            List<AttrType> attrList = edge.getAttrList().getAttr(); 
            for( AttrType attr : attrList ){
                
                // edge type
                //----------
                
                if( ("dip:0001".equalsIgnoreCase( attr.getAc() ) ||
                     "link-type".equalsIgnoreCase( attr.getName() )) &&
                    attr.getValue() != null ){
                    
                    etype.setNs( attr.getValue().getNs() );
                    etype.setAc( attr.getValue().getAc() );
                    etype.setName( attr.getValue().getValue() );
                    log.info( "EDGE TYPE=" + etype);
                    
                    nEdge.setEdgeType( etype);
                }
            }
        }              
        return nEdge;        
    }
        
    public Source buildSource( NodeType src ){

        log.info( "building source" );
        
        edu.ucla.mbi.dip.database.imxdip.Source iSource =
            new edu.ucla.mbi.dip.database.imxdip.Source();
        
       // Note: test type here 
                                       
        //<xref ns="nlmid" ac="0370623" typeNs="dxf" typeAc="dxf:0040" type="published-by"/>
        //<xref ns="issn" ac="0006-2960" typeNs="dxf" typeAc="dxf:0040" type="published-by"/>
        //<xref ns="pubmed" ac="2866798" typeNs="dxf" typeAc="dxf:0009" type="identical-to"/>
        //<xref ns="doi" ac="10.1021/bi00345a007" typeNs="dxf" typeAc="dxf:0009" type="identical-to"/>

        String nlmid = "";
        String issn = "";
        String pmid = "";
        String doi = "";
        String dip = "";
        String imex = "";
        
        if( "pubmed".equalsIgnoreCase(src.getNs()) ){
            pmid = src.getAc();
        }
        
        if( "dip".equalsIgnoreCase(src.getNs()) ){
            dip = src.getAc();
        }
        
        if( src.getXrefList() != null ){
            List<XrefType> xrefList = src.getXrefList().getXref(); 
            for( XrefType xref : xrefList ){
                
                if( "nlmid".equalsIgnoreCase(xref.getNs()) ){
                    nlmid = xref.getAc();
                    continue;
                }
                
                if( "issn".equalsIgnoreCase(xref.getNs()) ){
                    issn = xref.getAc();
                    continue;
                }
                
                if( "doi".equalsIgnoreCase(xref.getNs()) ){
                    doi = xref.getAc();
                    continue;                                                                
                }
                
                if( "dip".equalsIgnoreCase(xref.getNs()) ){
                    dip = xref.getAc();                               
                }
                
                if( "pubmed".equalsIgnoreCase(xref.getNs())
                    && pmid.length() == 0 ){
                    pmid = xref.getAc();                               
                }

                if( "imex".equalsIgnoreCase(xref.getNs())
                    && imex.length() == 0 ){
                    imex = xref.getAc();                               
                }
            }
        }
        
        //<attr ns="dip" ac="dip:0004" name="title"><value>...
        //<attr ns="dip" ac="dip:0010" name="authors"><value>...
        //<attr ns="dip" ac="dip:0009" name="journal-title"><value>...
        //<attr ns="dip" ac="dip:0011" name="volume"><value>...
        //<attr ns="dip" ac="dip:0012" name="issue"><value>...
        //<attr ns="dip" ac="dip:0015" name="pages"><value>...
        //<attr ns="dip" ac="dip:0013" name="year"><value>...
        //<attr ns="dxf" ac="dxf:0043" name="publication-date"><value>...
        //<attr ns="dip" ac="dip:0014" name="abstract"><value>...
        
        String title = "";
        String authors = "";
        String journalTitle = "";
        String volume = "";
        String issue = "";
        String pages = "";
        String year = "";
        String pubDate = "";
        String abstr = "";
        
        if( src.getAttrList() != null ){
            List<AttrType> attrList = src.getAttrList().getAttr(); 
            for( AttrType attr : attrList ){
                
                if( "dip:0004".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    title = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0010".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    authors = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0009".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    journalTitle = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0011".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    volume = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0012".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    issue = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0015".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    pages = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0013".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    year = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0043".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    pubDate = attr.getValue().getValue();
                    continue;
                }
                
                if( "dip:0014".equalsIgnoreCase( attr.getAc() ) &&
                    attr.getValue() != null ){
                    abstr = attr.getValue().getValue();
                    continue;
                }                            
            }
        }
        
        int iac = 0;
        try{
            if( dip != null && dip.length() > 0 ){                        
                String nac = dip.replaceAll("[DIP\\-S]", "");
                log.info( "SAC: " + nac);
                iac = Integer.parseInt( nac );
            }
        } catch(Exception ex){
            ex.printStackTrace();
        }
        
        log.info( "IAC: " + iac);
        
        if( iac > 0){    
            iSource.setDipId(iac);
        }
        iSource.setPmid( pmid);
        iSource.setImexId( imex );
        iSource.setDoi( doi);
        iSource.setNlmid( nlmid );
        iSource.setIssn( issn );
        iSource.setTitle( title );
        iSource.setAuthors( authors );
        iSource.setJournal( journalTitle );
        iSource.setVolume( volume );
        iSource.setIssue( issue );
        iSource.setPage( pages );
        iSource.setYear( year );                   
        iSource.setAbstract( abstr );
        
        return iSource;
    }

    **/

}
