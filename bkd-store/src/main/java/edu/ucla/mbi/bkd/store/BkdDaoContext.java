package edu.ucla.mbi.bkd.store;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.Date;
import java.util.List;
import java.util.ArrayList;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;

public class BkdDaoContext{
    
    // Node
    //-----
    
    NodeDao nodeDao;
    
    public void setNodeDao( NodeDao dao ){
        this.nodeDao = dao;
    }

    public NodeDao getNodeDao(){
        return this.nodeDao;
    }

    /**
    // Source
    //-------
    
    SourceDao sourceDao;
    
    public void setSourceDao( SourceDao dao ){
        this.sourceDao = dao;
    }

    public SourceDao getSourceDao(){
        return this.sourceDao;
    }
   
    // Producer
    //-------
    
    ProdDao prodDao;
    
    public void setProdDao( ProdDao dao ){
        this.prodDao = dao;
    }

    public ProdDao getProdDao(){
        return this.prodDao;
    }
    */
    
    // Taxon
    //------
    
    TaxonDao taxonDao;
    
    public void setTaxonDao( TaxonDao dao ){
        this.taxonDao = dao;
    }

    public TaxonDao getTaxonDao(){
        return this.taxonDao;
    }

    // CvTerm 
    //--------
    
    CvTermDao termDao;
    
    public void setTermDao( CvTermDao dao ){
        this.termDao = dao;
    }

    public CvTermDao getTermDao(){
        return this.termDao;
    }
    
    // IdGen
    //------
    
    IdGenDao idGenDao;
    
    public void setIdGenDao( IdGenDao dao ){
        this.idGenDao = dao;
    }

    public IdGenDao getIdGenDao(){
        return this.idGenDao;
    }
    
    /**
    // Experiment
    //-----------
    
    ExptDao exptDao;
    
    public void setExptDao( ExptDao dao ){
        this.exptDao = dao;
    }

    public ExptDao getExptDao(){
        return this.exptDao;
    }

    // Evidence

    EvidDao evidDao;
    
    public void setEvidDao( EvidDao dao ){
        this.evidDao = dao;
    }

    public EvidDao getEvidDao(){
        return this.evidDao;
    }
            
    // Edge
    
    EdgeDao edgeDao;
    
    public void setEdgeDao( EdgeDao dao ){
        this.edgeDao = dao;
    }

    public EdgeDao getEdgeDao(){
        return this.edgeDao;
    }

    // Imex
    
    ImexDao imexDao;
    
    public void setImexDao( ImexDao dao ){
        this.imexDao = dao;
    }

    public ImexDao getImexDao(){
        return this.imexDao;
    }
    **/
    
}
