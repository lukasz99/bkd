package edu.ucla.mbi.bkd.store;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.ucla.mbi.bkd.store.dao.*;

public class BkdRecordManager {
    
    public BkdRecordManager() {
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( "RecordManager: creating manager" );
    }
    
    public void initialize(){
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( "RecordManager: initializing" );
    }
    
    public void cleanup(){
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( "RecordManager: cleanup called" );
    }

    // DaoContext

    BkdDaoContext daoContext;
    
    public void setDaoContext( BkdDaoContext daoContext ){
        this.daoContext = daoContext;
    }

  

    
    // CvTerm

    CvTermDao cvTermDao;
    
    public void setCvTermDao( CvTermDao dao ){
        this.cvTermDao = dao;
    }

    public CvTermDao getCvTermDao(){
        return this.cvTermDao;
    }
    
    // Taxon
    
    TaxonDao taxonDao;
    
    public void setTaxonDao( TaxonDao dao ){
        this.taxonDao = dao;
    }

    public TaxonDao getTaxonDao(){
        return this.taxonDao;
    }
    
    // Node
    
    NodeDao nodeDao;
    
    public void setNodeDao( NodeDao dao ){
        this.nodeDao = dao;
    }

    public NodeDao getNodeDao(){
        return this.nodeDao;
    }

    /**
    // Source
    
    DipSourceDao sourceDao;
    
    public void setSourceDao( DipSourceDao dao ){
        this.sourceDao = dao;
    }

    public DipSourceDao getSourceDao(){
        return this.sourceDao;
    }


    public ImexRecordDao getImexRecordDao(){
        return this.imexRecordDao;
    }

    // Evidence

    DipEvidenceDao evidenceDao;
    
    public void setEvidenceDao( DipEvidenceDao dao ){
        this.evidenceDao = dao;
    }

    public DipEvidenceDao getEvidenceDao(){
        return this.evidenceDao;
    }

    // Link 

    DipLinkDao linkDao;
    
    public void setLinkDao( DipLinkDao dao ){
        this.linkDao = dao;
    }

    public DipLinkDao getLinkDao(){
        return this.linkDao;
    }

    // ImexRecord

    ImexRecordDao imexRecordDao;
    
    public void setImexRecordDao( ImexRecordDao dao ){
        this.imexRecordDao = dao;
    }
    **/
    
    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    // Node management
    //----------------
    
    public Node getNode( String accession ) {
        
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( " get node -> ac=" + accession );
        
        try{
            Node node = nodeDao.getByAccession( accession );            
            return node;
        } catch( Exception ex ) {
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

    public Taxon getTaxon( int id ) {
        
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( " get taxon -> id=" + id );
        
        try{
            Taxon taxon = taxonDao.getByTaxid( id );            
            return taxon;
        } catch( Exception ex ) {
            return null;
        }
    }
}
