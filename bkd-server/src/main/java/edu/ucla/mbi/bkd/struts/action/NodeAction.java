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
import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;


public class NodeAction extends PortalSupport{

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
            node?ns=<ns>&ac=<ac>&ret=data&format=json&fset=<featureset> 
            node?ns=<ns>&ac=<ac>&ret=data&format=json&fset=<featureset> 
            node?ns=<ns>&ac=<ac>&ret=data&format=json&fpos=<featurepos> 
    */
    
    public String execute() throws Exception {

        Logger log = LogManager.getLogger( ReportAction.class );
        log.debug( " MenuContext: " + super.getMenuContext() );

        log.info("NS/AC: " + this.getNs() + "/" + this.getAc());
        log.info("Ret: " + this.getRet() + " Format: " + this.getFormat());
        log.info("fset: " + this.getFset() + " fpos: " + this.getFpos());
        
        return dispatch();
    }

      
    //--------------------------------------------------------------------------
    // dispatcher
    //-----------

    public String dispatch() throws Exception {
        
        if( this.getNs() != null && this.getNs().length() > 0 &&
            this.getAc() != null && this.getAc().length() > 0 ){

            if( this.fpos != null ){  // single feature request
                int pos = 0;
                try{

                    Logger log = LogManager.getLogger( ReportAction.class );
                    log.info("  fpos= " + this.fpos );
                    pos = Integer.parseInt( fpos );
                    node = manager.buildNodeFeature( ns, ac, pos, this.iso );
                    
                } catch(NumberFormatException nex){
                    node = new HashMap();                    
                }
                                
                this.setRet("data");
                return JSON;
            }
            
                
            if( "FEATL".equals( this.detail ) ){
                // strip feature details: to be replaced by index search                
                node = manager.buildNodeFeatLstMap( (Node) manager.getNode( ac, "FEAT") ,
                                                    "ALL",
                                                    this.iso,
                                                    this.dts );
            } else if( "FEATS".equals( this.detail )){
                // strip feature details: to be replaced by index search                
                node = manager.buildNodeFeatLstMap( (Node) manager.getNode( ac, "FEAT") ,
                                                    "SHORT",
                                                    this.iso,
                                                    this.dts );
                
            } else {
                if( manager.getBkdConfig().getPrefix().equalsIgnoreCase(ns) ){
                    node = manager.getNode( ac, this.detail ).toMap();  // native record
                } else {
                    node = manager.getNode( ns, ac, this.detail ).toMap();   
                }
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
    
    String ns= "";
    
    public void setNs( String ns){
        this.ns = ns;
    }

    public String getNs(){
        return this.ns;
    }

    //--------------------------------------------------------------------------
    
    String ac= "";
    
    public void setAc( String ac){
        this.ac = ac;
    }

    public String getAc(){
        return this.ac;
    }

    //--------------------------------------------------------------------------    

    String fset = "";
    public void setFset( String fset ){
        this.fset = fset;
    }

    public String getFset(){
        return this.fset;
    }

    //--------------------------------------------------------------------------    

    String fpos = null;
    public void setFpos( String fpos ){
        this.fpos = fpos;
    }

    public String getFpos(){
        return this.fpos;
    }

    //--------------------------------------------------------------------------
    
    String format = "json";
    public void setFormat( String format){
        this.format = format;
    }
    
    public String getFormat() {
        return this.format;
    }
    
    //--------------------------------------------------------------------------

    String mode = "view";
    public void setMode( String mode){
        this.mode = mode;
    }

    public String getMode(){
        return this.mode;
    }
    //--------------------------------------------------------------------------
    
    String detail = Depth.BASE.toString();
    public void setDetail( String detail ){
        this.detail = detail;
    }
    
    public String getDetail(){
        return this.detail;
    }

    //--------------------------------------------------------------------------
    
    String iso = ""; // isoform ?
    public void setIso( String iso ){
        this.iso = iso;
    }
    
    public String getIso(){
        return this.iso;
    }

    //--------------------------------------------------------------------------
    
    String dts = ""; // feature dataset
    public void setDts( String dts ){
        this.dts = dts;
    }
    
    public String getDts(){
        return this.dts;
    }

    //--------------------------------------------------------------------------
    // Result ( set only when res=data)
    
    Object node = null;
    
    public void setNode( Object node){
        this.node = node;
    }

    public Object getNode(){
        return this.node;
    }
    
}
