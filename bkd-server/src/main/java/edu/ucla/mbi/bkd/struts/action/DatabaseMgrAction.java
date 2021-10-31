package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.util.concurrent.*;
import java.io.*;

import javax.xml.bind.*;

import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.bkd.store.*;

import org.json.*;

public class DatabaseMgrAction extends PortalSupport{

    Logger log = null;
    
    private Logger log(){
        if(log == null) {
            log = LogManager.getLogger( this.getClass() );
        }
        return log;
    }
    
    //--------------------------------------------------------------------------
    // Configuration Parameters
    //--------------------------------------------------------------------------
    // record access
    
    BkdRecordManager mgr = null;
    
    public void setRecordManager( BkdRecordManager manager){  
        this.mgr = manager;
    }
    
    //-------------
    // query access
    
    BkdIndexManager imgr = null;
    
    public void setIndexManager( BkdIndexManager manager){  
        this.imgr = manager;
    }

    //------------------
    // id generator list

    List idGenList = null;
    
    public void setIdGenList( List list){  
        this.idGenList = list;
    }
    
    //--------------------------------------------------------------------------
    // EXECUTE ACTION
    //---------------
        
    public String execute() throws Exception {
        log().debug( " MenuContext: " + super.getMenuContext() );        
        return dispatch();
    }
      
    //--------------------------------------------------------------------------
    // dispatcher
    //-----------

    public String dispatch() throws Exception {

        // operations
        //-----------
        
        if( "toggle".equalsIgnoreCase( op ) ){
            if( "flip".equalsIgnoreCase( mgr.getDaoContext().getState())){
                mgr.getDaoContext().setState("flop");
            } else {
                mgr.getDaoContext().setState("flip");
            }
            log.info( "DatabaseMgrAction: new state: "
                      + mgr.getDaoContext().getState() );
            
        } else if( "set".equalsIgnoreCase( op ) ){

            log.info("DatabaseMgrAction: set idgen=" + idgen + " value=" + nval);
            
            if( idGenList.contains(idgen) && nval > 0 ){                
                log.info( " updating generator");
                mgr.getDaoContext()
                    .getIdGenDao().setCurrentId( idgen, nval);                
            }
            
        } else if( "reset".equalsIgnoreCase( op ) ){
            
            log.info("DatabaseMgrAction: reset idgen=" + idgen );
            
            if( idGenList.contains(idgen) ){
                
                log.info( " resetting generator");

                int maxid = 0;
                
                if( "node".equalsIgnoreCase(idgen) ){
                    maxid = mgr.getDaoContext().getNodeDao().getMaxAcc();
                }

                if( "edge".equalsIgnoreCase(idgen) ){
                    maxid = mgr.getDaoContext().getEdgeDao().getMaxAcc();
                }

                if( "report".equalsIgnoreCase(idgen) ){
                    maxid = mgr.getDaoContext().getReportDao().getMaxAcc();
                }
                
                log.info( " max id=" + maxid);

                if( maxid > 0 ){
                    mgr.getDaoContext()
                        .getIdGenDao().setCurrentId( idgen , maxid );
                }                
            }
        }

        // build state report
        //-------------------
        
        List<Object> idGenStat = new ArrayList<Object>(); 

        log().info( "Collecting IdGen Info:" );

        for( Object ci : idGenList ){
            log().info( " idgen:" + ci);

            int curid = mgr.getDaoContext()
                .getIdGenDao().getCurrentId( (String) ci );
            
            log.info("  curid=" + curid );
            
            Map<String,Object> ccnt = new HashMap<String,Object>();
            ccnt.put("name",ci);
            ccnt.put( "curid", curid);                           
            idGenStat.add( ccnt );            
        }

        if( idGenStat.size() > 0 ){
            getData().put("idgen",idGenStat);
        }

        String state = mgr.getDaoContext().getState();
        getData().put( "state", state );

        // record counts
        //--------------

        List<Object> counts = new ArrayList<Object>(); 
        
        for( Object ci : idGenList ){

            long count = 0;
                
            if( "node".equalsIgnoreCase( (String) ci) ){
                count = mgr.getDaoContext().getNodeDao().getTotalCount();
            }

            if( "edge".equalsIgnoreCase( (String) ci) ){
                count = mgr.getDaoContext().getEdgeDao().getTotalCount();
            }
            if( "report".equalsIgnoreCase( (String) ci) ){
                count = mgr.getDaoContext().getReportDao().getTotalCount();
            }

            Map<String,Object> ccnt = new HashMap<String,Object>();
            ccnt.put("name",ci);
            ccnt.put( "total", count);
            counts.add( ccnt );            
        }
        
        if( counts.size() > 0 ){
            getData().put("counts",counts);
        }
        
        log().info( "DatabaseMgrAction: DONE" );        
        return JSON;
    }
    
    //--------------------------------------------------------------------------
    // arguments
    //----------
    
    String op="";
    
    public void setOp(String op){        
        this.op = op;                                     
    }
    
    public String getOp(){
        return this.op;                                  
    }

    String idgen="";
    
    public void setIdgen(String idgen){
        this.idgen = idgen;
    }
    
    public String getIdgen(){
        return this.idgen;
    }

    int nval = 0;
    
    public void setValue(int value){
        this.nval = value;
    }
    
    public int getValue(){
        return this.nval;
    }
    
    Map<String,Object> data = null;

    public void setData(Map<String,Object> data){
        this.data = data;
    }
    
    public Map<String,Object> getData(){
        if( data != null){
            return data;
        } else {
            data = new HashMap<String,Object>();
            return data;
        }            
    }       
}
