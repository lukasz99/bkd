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

public class ReportAction extends PortalSupport{

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
            report?ns=<ns>&ac=<ac>&ret=view 

         - edit: 
            report?ns=<ns>&ac=<ac>&ret=edit         

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

        if( "update".equalsIgnoreCase( getOp() ) &&
            record != null ){ 
            
            manager.addReport( (Report) record );
            
        } else if( "new".equalsIgnoreCase( getOp() ) ){
            
            if( this.getNs() != null && this.getNs().length() > 0 &&
                this.getAc() != null && this.getAc().length() > 0 ){
                
                record = manager.getNewFeatureReport( ns, ac );
            }
            
        } else {
        
            if( this.getNs() != null && this.getNs().length() > 0 &&
                this.getAc() != null && this.getAc().length() > 0 ){

                record = manager.getReportMap(ns,ac);            
            }

            if( this.getQuery() != null && this.getQuery().length() > 0){

                if( "protein".equalsIgnoreCase( this.getQmode() ) ){ 
                    record = manager.getReportMap("upr", query);
                }

                if( "report".equalsIgnoreCase( this.getQmode() ) ){ 
                    record = manager.getReportMap("cvdb", query);
                }
            
            }
        }       
        if ( getRet() == null || getRet().equals( "view" ) ) {    
            return SUCCESS;
        } else if ( getRet().equals( "edit" ) ) {
            return "input";
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

    Object record = null;
    
    public void setRecord( Object record){
        this.record = record;
    }

    public Object getRecord(){
        return this.record;
    }

    String query = "";
    
    public void setQuery( String query){
        this.query = query;
    }

    public String getQuery(){
        return this.query;
    }

    String qmode = "report";
    
    public void setQmode( String mode){
        this.qmode = mode;
    }

    public String getQmode(){
        return this.qmode;
    }


    String op="";
    
    public void setOp(String op){
        System.out.println(op);
        this.op = op;                                     
    }
    
    public String getOp(){
        return this.op;                                  
    }

    String repJson = null;
    
    public void setReportJson( String report ){
        
        try{

            CvTerm rtype = new CvTerm("dxf","dxf:0094","phenotype-report");
            PersonSource src = new PersonSource();
            src.setCvType(new CvTerm("dxf","dxf:0056","person"));
            src.setOrcid("0000-0003-4522-1969");
            Report jrep = FeatureReport.fromJsonForm( report, rtype, src);     

            this.record = jrep;
            
        } catch(Exception ex){
            
        }

        
        this.repJson=report;                   
    }
    
    public String getReportJson(){
        return this.repJson;                                  
    }
    
}
