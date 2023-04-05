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

    private static String NSVIEW = "node-search-view";
    private static String RSVIEW = "report-search-view";
    
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

        Logger log = LogManager.getLogger( SearchAction.class );
        log.info( "DISPATCH: " );
        if( this.getNs() != null && this.getNs().length() > 0 &&
            this.getAc() != null && this.getAc().length() > 0 ){

            // record = mngr.getReportMap(ns,ac);
            if( "report".equalsIgnoreCase( this.getQmode() ) ){ 
                rdlist = qmngr.getReportList(ns, ac, sort);
            } else {
                rdlist = qmngr.getNodeList(ns, ac, qmode, sort);
                System.out.println("RDLIST: " + rdlist.size());
            }            
        } else if( this.getQuery() != null && this.getQuery().length() > 0){
            
            log.info( " qmode: " + this.getQmode() );
            
            if( "report".equalsIgnoreCase( this.getQmode() ) ){
                
                log.info( "SearchAction.getReportListSimple()" );
                
                rdlist = qmngr.getReportListSimple( query, sort );                
                log.info( "SearchAction.getReportListSimple(): DONE" );
                
            } else { 
                rdlist = qmngr.getNodeListSimple( query, sort, qfirst, qmax );
                total = qmngr.getNodeListTotal( query, sort, qfirst, qmax );
            }           
        }
        

        log.info( "SearchAction.java: rdlist: " + rdlist );
        log.info( "SearchAction.java: ret: " + getRet() + " qmode: " + this.getQmode() );
        
        if ( getRet() == null || getRet().equals( "data" ) ) {
            log.info( "SearchAction.java: return: " + JSON );
            return JSON;
         } else if( getRet().equals( "view" ) ) {
            if( "node".equalsIgnoreCase( this.getQmode() ) ){
                log.info( "SearchAction.java: return: " + NSVIEW );
                return NSVIEW;
            }
            if( "report".equalsIgnoreCase( this.getQmode() ) ){
                log.info( "SearchAction.java: return: " + RSVIEW );
                return RSVIEW;
            }            
        }
        log.info( "SearchAction.java: return: " + SUCCESS );
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

    int qfirst = 0;
    
    public void setFirst( String first ){                
        this.qfirst= Integer.parseInt( first );
    }

    public int getFirst(){
        return this.qfirst;
    }

    int qmax = 0;
    
    public void setMax( String max ){                
        this.qmax= Integer.parseInt( max );
    }

    public int getMax(){
        return this.qmax;
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

    int total = 0;
    
    public Map<String,Object> getRstats(){
        HashMap<String,Object> rstats = new HashMap<String,Object>();
        rstats.put("total",total);
        return rstats;

    }
    

    
}
