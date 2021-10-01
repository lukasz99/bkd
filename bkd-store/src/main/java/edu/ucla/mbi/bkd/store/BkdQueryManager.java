package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.text.NumberFormat;

import edu.ucla.mbi.bkd.store.dao.*;
import edu.ucla.mbi.dxf20.*;

public class BkdQueryManager extends QueryManager{

    //--------------------------------------------------------------------------
    // DaoContext
    //-----------
    
    BkdDaoContext daoContext;
    
    public void setDaoContext( BkdDaoContext daoContext ){
        this.daoContext = daoContext;
    }

    //--------------------------------------------------------------------------
    // Index manager
    //-----------
    
    BkdIndexManager indexManager;
    
    public void setIndexManager( BkdIndexManager manager ){
        this.indexManager = manager;
    }

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    
    public List<Object> getReportList( String ns, String ac, String sort){

        // returns reports with ns/ac target
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getReportList -> ns=" + ns + " ac=" + ac );
        
        return daoContext.getReportDao().getListByTarget( ns, ac, sort );
    }

    public List<Object> getReportList( String query, String sort){
        
        return new ArrayList<Object>();
    }

    public List<Object> getNodeList( String ns, String ac, String ndtype, String sort){

        // returns nodes of ndtype type matching ns/ac 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getNodeList -> ns=" + ns + " ac=" + ac + " type=" + ndtype );
        
        List<Object> rlist = new ArrayList<Object>();
        
        Node rnode =  daoContext.getNodeDao().getById( ns, ac );        
        
        if(rnode != null){
            rlist.add(rnode);
        }
        return rlist; 
    }


    
    public List<Object> getNodeListSimple( String query ){
        
        return new ArrayList<Object>( indexManager.getNodeListSimple( query ) );
    }

    public List<Object> getNodeList(String query, String qmode, String sort){

        return new ArrayList<Object>();
    }
    
    public edu.ucla.mbi.dxf20.DatasetType
        query( String query, String detail ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdQueryManager: query called" );
        log.info( "BkdQueryManager: query= " + query );
        log.info( "BkdQueryManager: detail=" + detail );
        
        if( query != null ) {
            
            // MIQLX
            //------
            
            Map<String,List<String>> miqlx = null;
            
            //if( query != null && query.indexOf( " Miqlx" ) > -1 ){
            //    MiqlxFilter mf = new MiqlxFilter();
            //    query = mf.process( query );
            //     miqlx = mf.getMiqlx();
            //}
	    
            log.info("query:" + query +":mqlx:" + miqlx + ":");
            
            try {

                // run query
                
                // build hit list
                
                List<JDxfQueryHit> hits = new ArrayList<JDxfQueryHit>();
                
                // return results
                
                return dxfResult( query, hits );
                
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        return null;
    }
    
}
