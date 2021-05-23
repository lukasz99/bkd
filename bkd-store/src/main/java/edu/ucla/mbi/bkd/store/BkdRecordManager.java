package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

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

	    // cvtype - persist cvterm if needed
	    
	    CvTerm ncvtype = daoContext
		.getCvTermDao().getByAccession( node.getCvType().getAc() );

	    if( ncvtype == null ){
		ncvtype = daoContext
                .getCvTermDao().updateCvTerm( node.getCvType() );
	    }
	    node.setCvType( ncvtype );
	    

	    // taxon 

	    Taxon ntaxon = daoContext
		.getTaxonDao().getByTaxid( node.getTaxon().getTaxid() );

	    if( ntaxon == null ){
		ntaxon = daoContext
                .getTaxonDao().updateTaxon( node.getTaxon() );
	    }
	    node.setTaxon( ntaxon );
	    
	    // xrefs - persist xterm and components if needed
	    
            node = daoContext.getNodeDao().updateNode( node );

	    log.info(" node updated");
	    
	    for( NodeXref x: node.getXrefs() ){
		
		x.setNode( node );

		log.info(" xref: " + x );

		
		// persist components if needed
		//  - cvtype
		
		CvTerm xcvtype = daoContext
		    .getCvTermDao().getByAccession( x.getCvType().getAc() );

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
		Source xsource = daoContext
		    .getSourceDao().getByName( x.getSource().getName() );

		log.info(" source: " + xsource);
			 
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

		log.info(" xref updated");

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

    public Taxon getTaxon( int taxid ) {
        
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
            taxon = daoContext.getTaxonDao().updateTaxon( taxon );            
            return taxon;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    // CvTerm management
    //------------------

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
            term = daoContext.getCvTermDao().updateCvTerm( term );            
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
   
}
