package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;

import org.hibernate.*;

public class BkdDaoContext{

    String state ="flip";

    SessionFactory flipSF = null;
    SessionFactory flopSF = null;
   
    public void setFlipSF( SessionFactory factory ){
	flipSF = factory;
    }

    public void setFlopSF( SessionFactory factory ){
	flopSF = factory;
    }

    public void setState(String state){
	if(state.equalsIgnoreCase("flop") ){
	    this.state = "flop";
	} else {
	    this.state = "flip";
	}
    }
    public String getState(){
	return state;
    }
    
    // Node
    //-----
    
    NodeDao nodeDao;
    
    public void setNodeDao( NodeDao dao ){
        this.nodeDao = dao;
    }

    public NodeDao getNodeDao(){
	if( this.state.equals("flip") ){
	    nodeDao.setSessionFactory( flipSF );
	} else{
	    nodeDao.setSessionFactory( flopSF );
	}
	return this.nodeDao;
    }
    
    // Source
    //-------
    
    SourceDao sourceDao;
    
    public void setSourceDao( SourceDao dao ){
        this.sourceDao = dao;
    }

    public SourceDao getSourceDao(){
	if( this.state.equals("flip") ){
	    sourceDao.setSessionFactory( flipSF );
        } else{
            sourceDao.setSessionFactory( flopSF );
        }
	return this.sourceDao;
    }
    
    /*
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
        
	if( this.state.equals("flip") ){
	    this.taxonDao.setSessionFactory(flipSF);
	} else{
	    this.taxonDao.setSessionFactory(flopSF);
	}
	return this.taxonDao;
    }

    // CvTerm 
    //--------
    
    CvTermDao termDao;
    
    public void setCvTermDao( CvTermDao dao ){
        this.termDao = dao;
    }

    public CvTermDao getCvTermDao(){       
	if( this.state.equals("flip") ){
	    this.termDao.setSessionFactory( flipSF );
	} else{
	    this.termDao.setSessionFactory( flopSF );
	}
	return this.termDao;
    }

    // Xref 
    //-----
    
    XrefDao xrefDao;
    
    public void setXrefDao( XrefDao dao ){
        this.xrefDao = dao;
    }

    public XrefDao getXrefDao(){       
	if( this.state.equals("flip") ){
	    this.xrefDao.setSessionFactory( flipSF );
	} else{
	    this.xrefDao.setSessionFactory( flopSF );
	}
	return this.xrefDao;
    }
    
    // IdGen
    //------
    
    IdGenDao idGenDao;
    
    public void setIdGenDao( IdGenDao dao ){
        this.idGenDao = dao;
    }

    public IdGenDao getIdGenDao(){        
	if( this.state.equals("flip") ){
	    this.idGenDao.setSessionFactory( flipSF );
	} else{
	    this.idGenDao.setSessionFactory( flopSF );
	}
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
