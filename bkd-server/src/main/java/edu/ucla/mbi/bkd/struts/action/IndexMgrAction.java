package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.util.concurrent.*;
import java.io.*;

import javax.xml.bind.*;

import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.dxf20.*;  // ???
import edu.ucla.mbi.bkd.store.*;

import org.json.*;


public class IndexMgrAction extends PortalSupport{

    Logger log = null;
    
    private Logger log(){
        if(log == null) {
            log = LogManager.getLogger( this.getClass() );
        }
        return log;
    }
       
    // record access
    
    BkdRecordManager mgr = null;
    
    public void setRecordManager( BkdRecordManager manager){  
        this.mgr = manager;
    }
    
    // query access
    
    BkdIndexManager imgr = null;
    
    public void setIndexManager( BkdIndexManager manager){  
        this.imgr = manager;
    }

    // index list

    List ilist = null;
    
    public void setIndexList( List ilist){  
        this.ilist = ilist;
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

        if( "init".equalsIgnoreCase( op ) ){
            log().info("IndexMgrAction: initialize " + index);
            
            log().info( " index:" + getId());

            String jdoc = imgr.esPost( index, "_delete_by_query",
                                       "{\"query\": {\"match_all\":{}}}");
            log().info(" Initialize index: " + index + " jdoc: " + jdoc);
            
        } else if( "reindex".equalsIgnoreCase( op ) ){
            log().info("IndexMgrAction: reindex " + index);

            imgr.reindex( index );
        }
        
        log().info("IndexMgrAction: collecting status");

        List<Object> istat = new ArrayList<Object>(); 
        
        for( Object ci : ilist ){
            log().info( " index:" + ci);

            String jdoc = imgr.esPost( (String) ci, "_count",
                                       "{\"query\": {\"match_all\":{}}}");
            log().info(" Index: " + ci + " jdoc: " + jdoc);

            JSONObject jres = new JSONObject( jdoc );
            Map<String,Object> ccnt = new HashMap<String,Object>();
            ccnt.put("index",ci);
            if( jres.has("count") ){                
                ccnt.put( "count", jres.getLong("count"));               
            } else {
                ccnt.put( "count", new Long(-1) );
            
            }

            if( imgr.getRxActive().get(ci) != null ){                
                ccnt.put( "rxActive",imgr.getRxActive().get(ci) );
            }

            if( imgr.getRxPosition().get(ci) != null ){                
                ccnt.put( "rxPosition",imgr.getRxPosition().get(ci) );
            }
            
            istat.add( ccnt );            
        }

        if( istat.size() > 0 ){
            getData().put("status",istat);
        }
        
        
        log().info( "IndexMgrAction: DONE" );        
        return JSON;
    }

    // data[{"index":"node","count":0,...}, {"index":"record":,"count:0},...]}
    

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

    String index="";
    
    public void setId(String id){        
        this.index = id;                                     
    }
    
    public String getId(){
        return this.index;                                  
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
