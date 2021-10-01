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

public class SearchAction extends PortalSupport{

    // record access
    
    BkdRecordManager mngr = null;
    
    public void setRecordManager( BkdRecordManager manager){  
        this.mngr = manager;
    }
    // record access
    
    BkdQueryManager qmngr = null;
    
    public void setQueryManager( BkdQueryManager manager){  
        this.qmngr = manager;
    }

    //--------------------------------------------------------------------------
    // EXECUTE ACTION
    //---------------
    
    /* 
     Valid parameter combinations:
      - search: ns/ac  
         ?ns=<ns>&ac=<ac>&qmode=<node|protein|gene|report>&ret=data&format=json

      - search: query
         ?query=<query>&qmode=<node|protein|gene|report>&ret=data&format=json
    */
    
    public String execute() throws Exception {

        Logger log = LogManager.getLogger( SearchAction.class );
        log.debug( " MenuContext: " + super.getMenuContext() );

        log.info("NS/AC: " + this.getNs() + "/" + this.getAc());
        log.info("QMode: " + this.getQmode() + " Query=" + this.getQuery());
        log.info("Ret:   " + this.getRet() + " Format: " + this.getFormat());
        
        return dispatch();
    }

      
    //--------------------------------------------------------------------------
    // dispatcher
    //-----------

    public String dispatch() throws Exception {

        if( this.getNs() != null && this.getNs().length() > 0 &&
            this.getAc() != null && this.getAc().length() > 0 ){

            // record = mngr.getReportMap(ns,ac);
            if( "report".equalsIgnoreCase(qmode) ){ 
                rdlist = qmngr.getReportList(ns, ac, sort);
            } else {
                rdlist = qmngr.getNodeList(ns, ac, qmode, sort);
                System.out.println("RDLIST: " + rdlist.size());
            }            
        } else if( this.getQuery() != null && this.getQuery().length() > 0){
            
            if( "report".equalsIgnoreCase( this.getQmode() ) ){ 
                rdlist = qmngr.getReportList( query, sort );
            } else { 
                rdlist = qmngr.getNodeListSimple( query );
            }           
        }
                    
        if ( getRet() == null || getRet().equals( "data" ) ) {              
            return JSON;
         } else if( getRet().equals( "view" ) ) {
            return SUCCESS;
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

    String mode = "data";
    
    public void setMode( String mode){
        this.mode = mode;
    }

    public String getMode(){
        return this.mode;
    }
    
    String sort = "";
    
    public void setSort( String sort){
        this.sort = sort;
    }

    public String getSort(){
        return this.sort;
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
        System.out.println(report);

        try{

            CvTerm rtype = new CvTerm("dxf","dxf:0094","phenotype-report");
            PersonSource src = new PersonSource();

            // Note: this will come from authentication
            src.setOrcid("0000-0003-4522-1969");
            Report jrep = FeatureReport.fromJsonForm(report,rtype,src);     

        } catch(Exception ex){
            
        }
        
        this.repJson=report;                   
    }
    
    public String getReportJson(){
        return this.repJson;                                  
    }

    List<Object> rdlist = null;

    public void setRdata(List<Object> data){
        this.rdlist = data;
    }

    public List<Object> getRdata(){
        if(rdlist != null){
            return rdlist;
        } else {
            rdlist = new ArrayList();
            if( record != null ){
                rdlist.add(record);
            }
            return rdlist;
        }            
    }       
}
