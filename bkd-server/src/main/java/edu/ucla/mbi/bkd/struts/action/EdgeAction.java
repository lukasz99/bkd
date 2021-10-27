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

public class EdgeAction extends PortalSupport{

    // record access
    
    BkdRecordManager manager = null;
    
    public void setRecordManager( BkdRecordManager manager){  
        this.manager = manager;
    }
    
    //--------------------------------------------------------------------------
    // EXECUTE ACTION
    //---------------
    
    /* valid parameter combinations:
         - view: 
            node?ns=<ns>&ac=<ac>&ret=view 
         - data: 
            report?ns=<ns>&ac=<ac>&ret=data&format=json         
    */
    
    public String execute() throws Exception {

        Logger log = LogManager.getLogger( ReportAction.class );
        log.debug( " MenuContext: " + super.getMenuContext() );

        log.info("NS/AC: " + this.getNs() + "/" + this.getAc());
        log.info("Ret: " + this.getRet() + " Format: " + this.getFormat());
        
        return dispatch();
    }

      
    //--------------------------------------------------------------------------
    // dispatcher
    //-----------

    public String dispatch() throws Exception {
        
        if( this.getNs() != null && this.getNs().length() > 0 &&
            this.getAc() != null && this.getAc().length() > 0 ){

            if( manager.getBkdConfig().getPrefix().equalsIgnoreCase(ns) ){
                node = manager.getNode( ac );  // native record
            } else {
                node = manager.getNode( ns, ac); 
            }
        }
            
        if ( getRet() == null || getRet().equals( "view" ) ) {    
            return SUCCESS;
        } else if( getRet().equals( "data" ) ) {
            return JSON;
        }
        return SUCCESS;
    }

    //--------------------------------------------------------------------------
    // arguments
    //----------
    
    String format = "json";
    
    public void setFormat( String format){
        this.format = format;
    }

    public String getFormat() {
        return this.format;
    }

    String ns= "";
    
    public void setNs( String ns){
        this.ns = ns;
    }

    public String getNs(){
        return this.ns;
    }

    String ac= "";
    
    public void setAc( String ac){
        this.ac = ac;
    }

    public String getAc(){
        return this.ac;
    }

    String mode = "view";
    
    public void setMode( String mode){
        this.mode = mode;
    }

    public String getMode(){
        return this.mode;
    }

    Object node = null;
    
    public void setNode( Object node){
        this.node = node;
    }

    public Object getNode(){
        return this.node;
    }
    
}
