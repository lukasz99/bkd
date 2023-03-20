package edu.ucla.mbi.bkd.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

import edu.ucla.mbi.orm.context.*;

import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;

import org.hibernate.*;

public class BkdDaoContext extends DaoContext{

    // Node
    //-----
    
    NodeDao nodeDao;
    
    public void setNodeDao( NodeDao dao ){
        this.nodeDao = dao;
    }
    
    public NodeDao getNodeDao(){
        nodeDao.setSessionFactory( getSessionFactory() );        
        return this.nodeDao;
    }
    
    // Feature
    //--------
    
    FeatureDao featureDao;
    
    public void setFeatureDao( FeatureDao dao ){
        this.featureDao = dao;
    }
    
    public FeatureDao getFeatureDao(){
        featureDao.setSessionFactory( getSessionFactory() );        
        return this.featureDao;
    }

    // Range
    //------
    
    RangeDao rangeDao;
    
    public void setRangeDao( RangeDao dao ){
        this.rangeDao = dao;
    }
    
    public RangeDao getRangeDao(){
        rangeDao.setSessionFactory( getSessionFactory() );        
        return this.rangeDao;
    }
    
    // Source
    //-------
    
    SourceDao sourceDao;
    
    public void setSourceDao( SourceDao dao ){
        this.sourceDao = dao;
    }

    public SourceDao getSourceDao(){
	    sourceDao.setSessionFactory( getSessionFactory() );
        return this.sourceDao;
    }

    // Report
    //-------
    
    ReportDao reportDao;
    
    public void setReportDao( ReportDao dao ){
        this.reportDao = dao;
    }
    
    public ReportDao getReportDao(){
        reportDao.setSessionFactory( getSessionFactory() );        
        return this.reportDao;
    }

    // EORel
    //-------
    
    BkdEorelDao eorelDao;
    
    public void setEorelDao( BkdEorelDao dao ){
        this.eorelDao = dao;
    }
    
    public BkdEorelDao getEorelDao(){
        eorelDao.setSessionFactory( getSessionFactory() );        
        return this.eorelDao;
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
        taxonDao.setSessionFactory( getSessionFactory() );        
        return taxonDao;
    }

    // CvTerm 
    //--------
    
    CvTermDao termDao;
    
    public void setCvTermDao( CvTermDao dao ){
        this.termDao = dao;
    }

    public CvTermDao getCvTermDao(){
	    termDao.setSessionFactory( getSessionFactory() );
        return termDao;
    }

    // Xref 
    //-----
    
    XrefDao xrefDao;
    
    public void setXrefDao( XrefDao dao ){
        this.xrefDao = dao;
    }

    public XrefDao getXrefDao(){       
	    xrefDao.setSessionFactory( getSessionFactory() );
        return xrefDao;
    }

    // Alias 
    //------
    
    AliasDao aliasDao;
    
    public void setAliasDao( AliasDao dao ){
        this.aliasDao = dao;
    }

    public AliasDao getAliasDao(){       
        aliasDao.setSessionFactory( getSessionFactory() );        
        return aliasDao;
    }


    // Attribute 
    //----------
    
    AttributeDao attrDao;
    
    public void setAttributeDao( AttributeDao dao ){
        this.attrDao = dao;
    }

    public AttributeDao getAttributeDao(){       
        attrDao.setSessionFactory( getSessionFactory() );        
        return attrDao;
    }
    
    // IdGen
    //------
    
    IdGenDao idGenDao;
    
    public void setIdGenDao( IdGenDao dao ){
        this.idGenDao = dao;
    }

    public IdGenDao getIdGenDao(){        
	    idGenDao.setSessionFactory( getSessionFactory() );        
        return idGenDao;
    }

    // Edge
    //-----
    
    EdgeDao edgeDao;
    
    public void setEdgeDao( EdgeDao dao ){
        this.edgeDao = dao;
    }

    public EdgeDao getEdgeDao(){
        edgeDao.setSessionFactory( getSessionFactory() );
        return edgeDao;  
    }

    // Role
    //-----
    
    BkdRoleDao roleDao;
    
    public void setRoleDao( BkdRoleDao dao ){
        this.roleDao = dao;
    }

    public BkdRoleDao getRoleDao(){
        roleDao.setSessionFactory( getSessionFactory() );
        return roleDao;  
    }

    // Group
    //-----
    
    BkdGroupDao groupDao;
    
    public void setGroupDao( BkdGroupDao dao ){
        this.groupDao = dao;
    }

    public BkdGroupDao getGroupDao(){
        groupDao.setSessionFactory( getSessionFactory() );
        return groupDao;  
    }

    // User
    //-----
    
    BkdUserDao userDao;
    
    public void setUserDao( BkdUserDao dao ){
        this.userDao = dao;
    }

    public BkdUserDao getUserDao(){
        userDao.setSessionFactory( getSessionFactory() );
        return userDao;  
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
