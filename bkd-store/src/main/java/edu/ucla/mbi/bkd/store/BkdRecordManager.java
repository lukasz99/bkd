package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.store.dao.*;

public class BkdRecordManager {
    
    public BkdRecordManager() {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "RecordManager: creating manager" );
    }
    
    public void initialize(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "RecordManager: initializing" );
    }
    
    public void cleanup(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "RecordManager: cleanup called" );
    }

    // BKD Config

    BkdConfig bkdconf;
    
    public void setBkdConfig( BkdConfig config ){
        this.bkdconf = config;
    }

    public BkdConfig getBkdConfig(){
        return this.bkdconf;
    }

    // DaoContext

    BkdDaoContext daoContext;
    
    public void setDaoContext( BkdDaoContext daoContext ){
        this.daoContext = daoContext;
    }

    public BkdDaoContext getDaoContext(){
        return this.daoContext;
    }
    
    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    // Node management
    //----------------
    
    public Node getNode( String acc ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node -> ac=" + acc );
        
        //try{
        Node node = daoContext.getNodeDao().getByAcc( acc );            
        return node;
        //} catch( Exception ex ) {
        //log.error(ex);
        //return null;
        //}
    }

    public Node getNode( int id ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node -> nac(int)=" + id );
        
        try{
            Node node = daoContext.getNodeDao().getByNac( id );            
            return node;
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }

    public Node getNode( String ns, String acc ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node -> ns=" + ns + "  ac=" + acc );

        try{
            if( bkdconf.getPrefix().equalsIgnoreCase( ns ) ){
                return daoContext.getNodeDao().getByAcc( acc );            
            } else {
                return daoContext.getNodeDao().getById( ns, acc );            
            }            
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }

    public Node addNode( Node node ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add node -> node=" + node.toString() );

        if( node.getNacc() == 0 ){ 
            int nid = daoContext.getIdGenDao().getNextId( Node.generator() );
            node.setNacc( nid );	    
        }

        node.setPrefix( bkdconf.getPrefix() );
        
        
        try{

            // cvtype - persist if needed
            //---------------------------
            
            CvTerm ncvtype = daoContext
                .getCvTermDao().getByAccession( node.getCvType().getAc() );
            
            if( ncvtype == null ){
                ncvtype = daoContext
                    .getCvTermDao().updateCvTerm( node.getCvType() );
            }
            node.setCvType( ncvtype );
	    

            // taxon 
            //------
            
            Taxon ntaxon = daoContext
                .getTaxonDao().getByTaxid( node.getTaxon().getTaxid() );

            if( ntaxon == null ){
                ntaxon = daoContext
                    .getTaxonDao().updateTaxon( node.getTaxon() );
            }
            node.setTaxon( ntaxon );
            
            node = daoContext.getNodeDao().updateNode( node );

            log.info(" Node updated:" + node.getNacc());

        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }

        try{
            
            // xrefs - persist xrefs and components if needed
            //-----------------------------------------------           
            
            for( NodeXref x: node.getXrefs() ){
                
                x.setNode( node );
                
                log.info(" (*) xref: " + x );
                log.info(" cvac" + x.getCvType().getAc());
		
                // persist components if needed
                //  - cvtype
		
                CvTerm xcvtype = daoContext
                    .getCvTermDao().getByAccession( x.getCvType().getAc() );

                log.info(" xcvtype(old): " + xcvtype );
                    
                if( xcvtype == null ){
                    xcvtype = daoContext
                        .getCvTermDao().updateCvTerm( x.getCvType() );
                }
                log.info("xcvtype: " + xcvtype);
                x.setCvType(xcvtype);
		
                log.info(" cvt updated");
                log.info(" source name: " + x.getSource().getName() );
                log.info(" source cvt: " + x.getSource().getCvType() );

                // - source
                Source xsource = null; // daoContext

                //    .getSourceDao().getByName( x.getSource().getName() );
                //
                
                log.info(" source: " + x.getSource().toString());
			 
                if( xsource == null ){
	   		    
                    CvTerm scvtype = daoContext
                        .getCvTermDao().getByAccession( x.getSource().getCvType().getAc() );
                    
                    if( scvtype == null ){
                        scvtype = daoContext
                            .getCvTermDao().updateCvTerm( x.getSource().getCvType() );
                    }
                    log.info("scvtype: " + scvtype);
                    x.getSource().setCvType( scvtype );
				    
                    xsource = daoContext
                        .getSourceDao().updateSource( x.getSource() );
                }
                log.info(" source: " + xsource);
                
                x.setSource( xsource );
                
                log.info(" source updated");
                
                daoContext.getXrefDao().updateXref( x );
                
                log.info(" (*) xref updated");
                
            }

        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }

        
        log.info(" XREFs: updated");

        try{

        
            // features - persist fetures (and components if neeed)
            //-----------------------------------------------------
            
            log.info(" FEATUREs: update");

            for( NodeFeat feat: node.getFeats() ){
                log.info("(*) feature" + feat.toString() );

                feat.setNode(node);

                // source
                
                Source fsource = null;
                if( fsource == null ){

                    CvTerm scvtype = daoContext
                        .getCvTermDao().getByAccession( feat.getSource().getCvType().getAc() );

                    if( scvtype == null ){
                        scvtype = daoContext
                            .getCvTermDao().updateCvTerm( feat.getSource().getCvType() );
                    }
                    log.info("scvtype: " + scvtype);
                    feat.getSource().setCvType( scvtype );

                    fsource = daoContext
                        .getSourceDao().updateSource( feat.getSource() );
                }
                log.info(" feature source: " + fsource);

                feat.setSource( fsource );

                log.info(" feature source updated");

                // feature type
                
                CvTerm fcvtype = daoContext
                    .getCvTermDao().getByAccession( feat.getCvType().getAc() );
                
                if( fcvtype == null ){
                    fcvtype = daoContext
                        .getCvTermDao().updateCvTerm( feat.getCvType() );
                    
                }
                log.info("fcvtype: " + fcvtype);
                feat.setCvType( fcvtype );			   
               
                // persist feature
                
                daoContext.getFeatureDao().updateFeature( feat );
                
                // xrefs
                //------

                log.info("Feature XREFs: update ");
                if( feat.getXrefs() != null ){
                    for( FeatureXref x: feat.getXrefs()){
                        CvTerm xcvtype = daoContext
                            .getCvTermDao().getByAccession( x.getCvType().getAc() );
                        
                        if( xcvtype == null ){
                            xcvtype = daoContext
                                .getCvTermDao().updateCvTerm( x.getCvType() );
                            log.info("Feature XREF: " + xcvtype );
                        }
                        x.setCvType( xcvtype );                    
                        x.setFeature( feat );                    
                        daoContext.getXrefDao().updateXref( x );                                    
                    }
                    log.info("Feature XREFs: update DONE");
                    
                    // Ranges
                    //-------
                    
                    for(Range range: feat.getRanges() ){
                        
                        range.setFeature(feat);
                        
                        if(range.getCvStart() == null){                        
                            CvTerm cdef =
                                daoContext.getCvTermDao().getByName("unspecified");                        
                            range.setCvStart(cdef);
                        }
                        
                        if(range.getCvStop() == null){
                            CvTerm cdef =
                                daoContext.getCvTermDao().getByName("unspecified");                        
                            range.setCvStop(cdef);
                        }
                        daoContext.getRangeDao().updateRange( range );
                    }                                        
                }
            }

            
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }

        log.info(" FEATs: done");
        
        try{
            
        
            // attributes - persist attribute (and components)
            //------------------------------------------------

            log.info(" ATTRIBUTEs: update");

            if( node.getAttrs() != null ){
                for( NodeAttr attr: node.getAttrs() ){
                    log.info("(*) attr" + attr.toString() );

                    attr.setNode(node);

                    // attribute type 
                    //---------------
                    
                    CvTerm acvtype = daoContext
                        .getCvTermDao().getByAccession( attr.getCvType().getAc() );
                    
                    if( acvtype == null ){
                        acvtype = daoContext
                            .getCvTermDao().updateCvTerm( attr.getCvType() );                    
                    }
                    
                    log.info("acvtype: " + acvtype);
                    attr.setCvType( acvtype );
                    
                    // attribute source
                    //------------------
                    
                    Source asource = null;                 
                    log.info(" asource: " + attr.getSource().toString());
                    
                    if(  attr.getSource() != null ){
                        
                        CvTerm ascvtype = daoContext
                            .getCvTermDao().getByAccession( attr.getSource().getCvType().getAc() );
                        
                        if( ascvtype == null ){
                            ascvtype = daoContext
                                .getCvTermDao().updateCvTerm( attr.getSource().getCvType() );
                        }
                        log.info("ascvtype: " + ascvtype);
                        attr.getSource().setCvType( ascvtype );
                        
                        asource = daoContext
                            .getSourceDao().updateSource( attr.getSource() );
                    }
                    log.info(" attr source: " + asource);
                    
                    attr.setSource( asource );
                    
                    log.info(" attr source updated");
                    
                    attr = (NodeAttr) daoContext.getAttributeDao().updateAttribute( attr );

                    try{

                        // attribute xrefs
                        //----------------

                        log.info("Attribute XREFs: update ");
                        if( attr.getXrefs() != null ){
                            for( AttrXref x: attr.getXrefs()){
                                CvTerm xcvtype = daoContext
                                    .getCvTermDao().getByAccession( x.getCvType().getAc() );
                                
                                if( xcvtype == null ){
                                    xcvtype = daoContext
                                        .getCvTermDao().updateCvTerm( x.getCvType() );
                                    log.info("Attribute XREF: " + xcvtype );
                                }
                                x.setCvType( xcvtype );                    
                                x.setAttr( attr );
                                x.setSource(asource);
                                daoContext.getXrefDao().updateXref( x );                                    
                            }
                            log.info("Attr XREFs: update DONE");
                        }
                    }catch( Exception ex ) {
                        log.error(ex);
                    }
                }
            }

        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }

        log.info(" ATTRs: done");
        
        try{
            
            // aliases - persist alias (and components)
            //-----------------------------------------

            log.info(" ALIASes: update");

            if( node.getAlias() != null){
                for( NodeAlias alias: node.getAlias() ){
                    log.info("(*) alias" + alias.toString() );
                    
                    alias.setNode(node);
                    
                    CvTerm acvtype = daoContext
                        .getCvTermDao().getByAccession( alias.getCvType().getAc() );
                    
                    if( acvtype == null ){
                        acvtype = daoContext
                            .getCvTermDao().updateCvTerm( alias.getCvType() );
                        
                    }
                    log.info("acvtype: " + acvtype);
                    alias.setCvType( acvtype );
                    
                    daoContext.getAliasDao().updateAlias(alias);
                    
                }
            }
            
            return node;
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }

    //---------------------------------------------------------------------
    // Source management
    //------------------
    /**
    public DipSource getSource( String accession ) {
        
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( " get node -> ac=" + accession );
        
        try{
            DipSource source = sourceDao.getByAccession( accession );            
            return source;
        } catch( Exception ex ) {
            return null;
        }
    }
    **/
    //---------------------------------------------------------------------
    // Evidence management
    //--------------------
    /**
    public DipEvidence getEvidence( String accession ) {
        
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( " get evid -> ac=" + accession );
        
        try{
            DipEvidence evid = evidenceDao.getByAccession( accession );            
            return evid;
        } catch( Exception ex ) {
            return null;
        }
    }
    **/

    //---------------------------------------------------------------------
    // Edge management
    //----------------
    
    public Edge getEdge( String accession ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get edge -> ac=" + accession );
        
        try{
            Edge edge = daoContext.getEdgeDao().getByAcc( accession );            
            return edge;
        } catch( Exception ex ) {
            return null;
        }
    }

    public Edge getEdge( Set<String> acset ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get edge(by node ac set)"  );
        
        try{
            Edge nedge = daoContext.getEdgeDao().getByNodeAccSet( acset );
            return nedge;
        } catch( Exception ex ) {
            return null;
        }
    }

    public Edge addEdge( Edge edge ){

        InteractionEdge iedge = (InteractionEdge) edge;
        
        edge.setPrefix( bkdconf.getPrefix() );
        
        if( iedge.getNacc() == 0 ){ 
            int eid = daoContext.getIdGenDao().getNextId( InteractionEdge.generator() );
            iedge.setNacc( eid );	    
        }
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add edge -> " + iedge );

        try{
            Edge nedge = daoContext.getEdgeDao().addEdge(  iedge );            
            return nedge;
        } catch( Exception ex ) {
            return null;
        }
    }

    
    //---------------------------------------------------------------------
    // Taxon management
    //-----------------

    public Taxon getTaxon( String ns, String ac ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get taxon -> ns=" + ns + " ac=" + ac );

        if( "taxid".equalsIgnoreCase( ns ) ){
            int itax = Integer.parseInt( ac );            
            return this.getTaxon( itax );
            
        }
        return null; 
    }
    
    public Taxon getTaxon( int taxid ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get taxon -> taxid=" + taxid );
        
        try{
            Taxon taxon = daoContext.getTaxonDao().getByTaxid( taxid );
            log.info( " found taxon -> id=" + taxon );
            
            return taxon;
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }

    public Taxon addTaxon( Taxon taxon ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add taxon -> " + taxon.toString() );
        
        try{
                      
            Taxon otax = daoContext.getTaxonDao().getByTaxid( taxon.getTaxid() );

            if( otax != null ){
                otax.setSciName( taxon.getSciName() );
                otax.setComName( taxon.getComName() );
                otax = daoContext.getTaxonDao().updateTaxon( otax );            
                return otax; 
            } else {
                taxon = daoContext.getTaxonDao().updateTaxon( taxon );            
                return taxon;
            }
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }
    
    // CvTerm management
    //------------------

    public CvTerm getCvTerm( String ns, String acc ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get cv term -> acc=" + acc );
        
        try{
            CvTerm term = daoContext.getCvTermDao().getByAccession( acc );
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    public CvTerm getCvTerm( String acc ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get cv term -> acc=" + acc );
        
        try{
            CvTerm term = daoContext.getCvTermDao().getByAccession( acc );
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    public CvTerm addCvTerm( CvTerm term ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add cvterm -> " + term.toString() );
        
        try{
            CvTerm oterm = daoContext.getCvTermDao().getByAccession( term.getAc() );
            
            if( oterm != null ){
                oterm.setName( term.getName() );
                oterm.setDefinition( term.getDefinition() );
                term = daoContext.getCvTermDao().updateCvTerm( oterm );            
            } else {
                term = daoContext.getCvTermDao().updateCvTerm( term );
            }
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    // xref management

    /**
    public CvTerm getXref( String acc ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get cv term -> acc=" + acc );
        
        try{
            CvTerm term = daoContext.getCvTermDao().getByAccession( acc );
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }
    **/
    
    public Xref addXref( Xref xref ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add xref -> " + xref.toString() );
        
        try{
            xref = daoContext.getXrefDao().updateXref( xref );            
            return xref;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }
    
    //--------------------------------------------------------------------------
    //Report Management
    //-----------------

    public Report getReport( String ns, String ac ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getReport -> ns=" + ns + " ac=" + ac );
        
        Report report =  daoContext.getReportDao().getById( ns, ac );
        return report;
    }

    public Report getReport( String acc ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getReport ->  acc=" + acc );
        
        Report report =  daoContext.getReportDao().getById( "", acc );
        return report;
    }

    public Report getReport( int id ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get report -> id(int)=" + id );
        
        try{
            Report report = daoContext.getReportDao().getByNac( id );            
            return report;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }


    
    public FeatureReport getNewFeatureReport( String tgtNs, String tgtAc ){
        return getNewFeatureReport(tgtNs,tgtAc, null );
    }
    
    public FeatureReport getNewFeatureReport( String tgtNs, String tgtAc, String rtype ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getNewFeatureReport -> tgt=" + tgtAc );
        log.info( " getNewFeatureReport -> tns=" + tgtNs + " nat ns="+ bkdconf.getPrefix());
        
        Node tnode;

        if( bkdconf.getPrefix().equalsIgnoreCase(tgtNs) ){
            tnode = daoContext.getNodeDao().getByAcc( tgtAc );
        } else {
            tnode = daoContext.getNodeDao().getById( tgtNs, tgtAc );
        }

        log.info( " getNewFeatureReport -> tnode=" + tnode );
        
        FeatureReport report = new FeatureReport();
        report.setPrefix( bkdconf.getPrefix() );
        
        NodeFeat nfeat = new NodeFeat();
        nfeat.setNode( tnode );
        report.setFeature( nfeat );

        if( rtype != null ){
            CvTerm tcv = daoContext.getCvTermDao().getByAccession( rtype );
            report.setCvType(tcv);
        }
            
        return report;
    }
    
    public  Map<String, Object> getReportMap( String ns, String ac ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getReportMap -> ns=" + ns + " ac=" + ac );
        
        if( "upr".equalsIgnoreCase(ns) ){  

            ProteinNode pn = (ProteinNode) daoContext.getNodeDao().getById( ns, ac );

            FeatureReport protRep = new FeatureReport();
            NodeFeat nfeat = new NodeFeat();
            nfeat.setNode(pn);
            protRep.setFeature(nfeat);

          
            Map<String, Object> map = new HashMap<String,Object>();
            
            if( protRep == null ) return map;
        
            map.put( "report", protRep);
               
            //Map<String,Map<String,String>>
            
            map.put( "report-value", protRep.getJvalMap() );
                        
            return map;            
            
        } else {
            
            Report rep = this.getReport( ns, ac );

                   
            Map<String, Object> map = new HashMap<String,Object>();

            if( rep == null ) return map;
        
            map.put( "report", rep);
               
            //Map<String,Map<String,String>> rval = ;
            
            map.put( "report-value", rep.getJvalMap() );
                        
            return map;
        }
    }
    
    public Report addReport( Report report) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "addReport -> report=" + report.toString() );
        log.info( "addReport -> Jval= " + report.getJval() ); 
        
        if( report.getNacc() == 0 ){ 
            int rid = daoContext.getIdGenDao().getNextId( Report.generator() );
            report.setPrefix( bkdconf.getPrefix() );
            report.setNacc( rid );            
        }
        
        if( report instanceof NodeReport){
            log.info( "addReport -> NodeReport here...");
            log.info(((NodeReport) report).getNode()); // node must preexist !!!
            
        } else if( report instanceof FeatureReport){

            log.info( "addReport -> FeatureReport here...");
            log.info(((FeatureReport) report).getFeature());  // feature is new !!! 
            
            // commit feature here
            //--------------------
            
            log.info( ((NodeFeat) ((FeatureReport) report).getFeature()).getNode() );

            // feature cv type: commit if needed
            //----------------------------------
            
            CvTerm fcvt = ((FeatureReport) report).getFeature().getCvType();
            fcvt = daoContext.getCvTermDao().getByAccession(fcvt.getAc());
            if( fcvt == null ){
                fcvt = daoContext.getCvTermDao()
                    .updateCvTerm( ((FeatureReport) report).getFeature().getCvType() );
            }
            ((FeatureReport) report).getFeature().setCvType(fcvt);
            
            // feature source type/source: commit
            //-----------------------------------
            
            Source fsrc = ((FeatureReport) report).getFeature().getSource();
            log.info("fsrc= " + fsrc); 

            // source cv type
            //----------------
            
            CvTerm scvt = fsrc.getCvType();
            log.info("fsrc.type= " + scvt);
            
            scvt = daoContext.getCvTermDao().getByAccession( scvt.getAc() );
            if( scvt == null ){
                scvt = daoContext.getCvTermDao()
                    .updateCvTerm( fsrc.getCvType() );
            }
            
            fsrc.setCvType(scvt);            
                        
            // source
            //-------
                       
            fsrc = daoContext.getSourceDao().updateSource( fsrc );
            ((FeatureReport) report).getFeature().setSource( fsrc );          

            // feature: node
            //--------------
            
            Node rnode = ((NodeFeat) ((FeatureReport) report).getFeature()).getNode();
            log.info("feature node:" + rnode);
            log.info("feature node: ns=" + rnode.getNs() + "ac=" + rnode.getAc());

            Node testNode = null;
            
            if( bkdconf.getPrefix().equalsIgnoreCase( rnode.getNs() ) ){                                        
                testNode = (Node) daoContext.getNodeDao().getByAcc( rnode.getAc() );
            } else { 
                testNode = (Node) daoContext.getNodeDao().getById( rnode.getNs(),
                                                                   rnode.getAc() );
            }
            
            log.info("feature node(test):" + testNode);  // node must exist
            ((NodeFeat) ((FeatureReport) report).getFeature()).setNode( testNode );

            Feature rfeature = ((FeatureReport) report).getFeature();
            rfeature = daoContext.getFeatureDao().updateFeature( rfeature );
            
            ((FeatureReport) report).setFeature( rfeature );
            
            for(Range r: rfeature.getRanges() ){
                log.info("R: "+r);

                r.setFeature( rfeature );
                
                if(r.getCvStart() == null){                        
                    CvTerm cdef =
                        daoContext.getCvTermDao().getByName("unspecified");                        
                    r.setCvStart(cdef);
                }

                if(r.getCvStop() == null){
                    CvTerm cdef =
                        daoContext.getCvTermDao().getByName("unspecified");                        
                    r.setCvStop(cdef);
                }
                daoContext.getRangeDao().updateRange(r);                                   
            }

            // feature xrefs
            //--------------
            
            for( FeatureXref x: rfeature.getXrefs()){
                log.info(x);
                
                CvTerm xcvtype = daoContext
                    .getCvTermDao().getByAccession( x.getCvType().getAc() );
                    
                if( xcvtype == null ){
                    xcvtype = daoContext
                        .getCvTermDao().updateCvTerm( x.getCvType() );
                    log.info("Feature XREF: " + xcvtype );
                }
                x.setCvType( xcvtype );                    
                x.setFeature( rfeature );
                x.setSource(fsrc);
                daoContext.getXrefDao().updateXref( x );                                    
            }
            log.info("Feature XREFs: update DONE");
                                                    
        }
            
        // cvtype - persist if needed
        //---------------------------
            
        CvTerm rcvtype = daoContext
            .getCvTermDao().getByAccession( report.getCvType().getAc() );
            
        if( rcvtype == null ){
            rcvtype = daoContext
                .getCvTermDao().updateCvTerm( report.getCvType() );
        }
        report.setCvType( rcvtype );

        // source - persist
        //-----------------

        log.info(report.getSource().getCvType());

        CvTerm scvtype = daoContext
            .getCvTermDao().getByAccession( report.getSource().getCvType().getAc() );
        
        if( scvtype == null ){
            scvtype = daoContext
                .getCvTermDao().updateCvTerm(report.getSource().getCvType());
        }
        report.getSource().setCvType(scvtype);
            
        Source rsource = daoContext
            .getSourceDao().updateSource( report.getSource() );
        report.setSource(rsource);

        
        report = daoContext.getReportDao().updateReport( report );
        
        log.info(" Report updated:" + report.getNacc());
        
        
        // xrefs - persist xterm and components if needed
        //-----------------------------------------------           
            
        for( ReportXref x: report.getXrefs() ){
                
            x.setReport( report );
                
            log.info(" (*) xref: " + x );
            log.info(" cvac" + x.getCvType().getAc());
		
            // persist components if needed

            // cvtype
            //-------
            
            CvTerm xcvtype = daoContext
                .getCvTermDao().getByAccession( x.getCvType().getAc() );
            
            log.info(" xcvtype(old): " + xcvtype );
                
            if( xcvtype == null ){
                xcvtype = daoContext
                    .getCvTermDao().updateCvTerm( x.getCvType() );
            }
            log.info("xcvtype: " + xcvtype);
            x.setCvType(xcvtype);
		
            log.info(" cvt updated");
            
            // source
            //-------
                
            Source xsource = x.getSource(); 
            			 
            if( xsource == null ){
                
                log.info(" xsource: " + x.getSource() );                
                x.setSource( report.getSource() );
                
            } else {
                
                CvTerm xscvtype = daoContext.getCvTermDao()
                    .getByAccession( xsource.getCvType().getAc() );

                if( xscvtype == null ){
                    xscvtype = daoContext
                        .getCvTermDao().updateCvTerm( xsource.getCvType() );
                }
                log.info("xscvtype: " + xscvtype);
                xsource.setCvType( xscvtype );
				    
                xsource = daoContext
                    .getSourceDao().updateSource( xsource );                
                x.setSource( xsource );
            }
            
            daoContext.getXrefDao().updateXref( x );                
            log.info(" (*) xref updated");            
        }
        
        return report;
    }
   
}
