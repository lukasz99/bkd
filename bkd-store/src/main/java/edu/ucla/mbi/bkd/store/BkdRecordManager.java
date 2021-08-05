package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

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

    // DaoContext

    BkdDaoContext daoContext;
    
    public void setDaoContext( BkdDaoContext daoContext ){
        this.daoContext = daoContext;
    }
    
    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    // Node management
    //----------------
    
    public Node getNode( String acc ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node -> ac=" + acc );
        
        try{
            Node node = daoContext.getNodeDao().getByAccession( acc );            
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
            Node node = daoContext.getNodeDao().getById( ns, acc );            
            return node;
        } catch( Exception ex ) {
	    log.error(ex);

            return null;
        }
    }

    public Node addNode( Node node ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add node -> node=" + node.toString() );

        if( node.getId() == 0 ){ 
            long nid = daoContext.getIdGenDao().getNextId( Node.generator() );
            node.setId( nid );	    
        }
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

            log.info(" Node updated:" + node.getId());
            
            // xrefs - persist xterm and components if needed
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

            log.info(" XREFs: updated");
            
            // persist features
            //-----------------
            
            log.info(" FEATUREs: update");

            for( NodeFeat feat: node.getFeats() ){
                log.info("(*) feature" + feat.toString() );

                feat.setNode(node);

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
                    daoContext.getRangeDao().updateRange(range);
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
    // Link management
    //--------------------
    /**
    public DipLink getLink( String accession ) {
        
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( " get evid -> ac=" + accession );
        
        try{
            DipLink link = linkDao.getByAccession( accession );            
            return link;
        } catch( Exception ex ) {
            return null;
        }
    }
    **/
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
    
    public  Map<String, Object> getReportMap( String ns, String ac ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getReportMap -> ns=" + ns + " ac=" + ac );
        
        Report rep = this.getReport( ns, ac );

           
        
        Map<String, Object> map = new HashMap<String,Object>();

        if( rep == null ) return map;
        
        map.put( "report", rep);
               
        //Map<String,Map<String,String>> rval = ;
            
        map.put( "report-value", rep.getJvalMap() );
                        
        return map;
    }



    
    public Report addReport( Report report) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add report -> report=" + report.toString() );
        log.info( "Jval= " + report.getJval() ); 
        
        if( report.getId() == 0 ){ 
            long rid = daoContext.getIdGenDao().getNextId( Report.generator() );
            report.setId( rid );	    
        }
        
        if( report instanceof NodeReport){

            log.info(((NodeReport) report).getNode()); // node preexists !!!

        }

        if( report instanceof FeatureReport){

            log.info(((FeatureReport) report).getFeature());  // feature is new !!! 
            
            // commit feature here
            //--------------------
            
            log.info( ((NodeFeat) ((FeatureReport) report).getFeature()).getNode() );

            // feature type: commit if needed
            //-------------------------------
            
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

            // source type
             
            CvTerm scvt = fsrc.getCvType();
            scvt = daoContext.getCvTermDao().getByAccession( scvt.getAc() );
            if( scvt == null ){
                scvt = daoContext.getCvTermDao()
                    .updateCvTerm( fsrc.getCvType() );
            }
            
            fsrc.setCvType(scvt);            
                        
            // source
            
            fsrc = daoContext.getSourceDao().updateSource( fsrc );
            ((FeatureReport) report).getFeature().setSource( fsrc );          

            // feature: node
            //--------------
            
            Node rnode = ((NodeFeat) ((FeatureReport) report).getFeature()).getNode();
            log.info("RNODE:" + rnode);
            
            //Node oldNode = (Node) daoContext.getNodeDao().getById( rnode.getNs(), rnode.getAc() );
            //((NodeFeat) ((FeatureReport) report).getFeature()).setNode( rnode );

            Feature rfeature = ((FeatureReport) report).getFeature();
            rfeature = daoContext.getFeatureDao().updateFeature( rfeature );

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
                                        
            ((FeatureReport) report).setFeature( rfeature );
            
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
        
        log.info(" Report updated:" + report.getId());
            
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
