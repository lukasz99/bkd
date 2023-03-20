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

public class ReportAction extends ManagerSupport{

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
        log.info("Qmode: " + getQmode() + " Query: " + this.getQuery() );
        
        log.info("Ret: " + this.getRet()
                 + " Mode: " + this.getMode()
                 + " Op: " + this.getOp()
                 + " Rtype: " + this.getRtype()
                 + " Format: " + this.getFormat());
        
        return dispatch();
    }

      
    //--------------------------------------------------------------------------
    // dispatcher
    //-----------

    public String dispatch() throws Exception {

        Logger log = LogManager.getLogger( ReportAction.class );
        log.info("ReportAction: dispatch");
        
        if( getQuery() != null && getQuery().length() > 0 &&
            getQmode() != null && getQmode().length() > 0 ){
            
            return SUCCESS;
                        
        }

        if( getOp() != null && getOp().containsKey( "update" ) ){
            
            manager.addReport( (NodeFeatureReport) record );
            
        }  else if( getOp() != null && getOp().containsKey( "create") ){

            if( this.getNs() != null && this.getNs().length() > 0 &&
                this.getAc() != null && this.getAc().length() > 0 ){
                
                if( getMode() != null
                    && "edit".equalsIgnoreCase( getMode() ) ){
                    log.info( " report: ret -> success(rtype)" );
                    return SUCCESS;
                }
                
                String repType = getRtype();
                record = manager.getNewFeatureReportMap( ns, ac, repType );
                return JSON;
            }

        } if( getOp() != null && getOp().containsKey( "edit") ){
            this.mode="edit";

            if (  getRet() != null && getRet().equals( "data" ) ) {
            
                if( this.getNs() != null && this.getNs().length() > 0 &&
                    this.getAc() != null && this.getAc().length() > 0 ){
                    
                    record = manager.getReportMap(ns,ac);            
                } 
                
                return JSON;
                
            } else {            
                log.info( " report: ret -> success(op.edit)" );
                return SUCCESS;
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
            log.info( " report: ret -> success(view)" );
            return SUCCESS;
        } else if ( getRet().equals( "edit" ) ) {
             
            log.info( " report: ret -> input" );
            return "input";
        } else if( getRet().equals( "data" ) ) {
                    
            log.info( " record: " + record );
            log.info( " report: ret -> json(data)" );
            return JSON;
        }
        log.info( " report: ret -> success(fallback)" );
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

    /*
    String op="";
    
    public void setOp(String op){     
        this.op = op;                                     
    }
    
    public String getOp(){
        return this.op;                                  
    }
    */
    
    String rtype = null;
    
    public void setRtype(String rtype){     
        this.rtype=rtype;                    
    }
    
    public String getRtype(){
        return this.rtype;                               
    }

    String repJson = null;
    
    public void setReportJson( String report ){
        
        Logger log = LogManager.getLogger( ReportAction.class );
        
        try{
            log.info( "setReportJson: incoming ->" + report );
            
            CvTerm rtype = new CvTerm("dxf","dxf:0094","phenotype-report");
            PersonSource src = new PersonSource();
            src.setCvType(new CvTerm("dxf","dxf:0056","person"));
            src.setOrcid("0000-0003-4522-1969");
            //Report jrep = FeatureReport.fromJsonForm( report, rtype, src);
            NodeFeatureReport jrep = this.fromJsonForm( report, rtype, src);     
            
            this.record = jrep;

            log.info( "setReportJson: outgoing ->" + jrep.toString() );

        } catch(Exception ex){
            ex.printStackTrace();
            log.info( "setReportJson:" + record );

        }

        
        this.repJson=report;                   
    }
    
    public String getReportJson(){
        return this.repJson;                                  
    }

    public NodeFeatureReport fromJsonForm( String sform, CvTerm freportType,
                                Source source ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "fromJsonForm sform=" + sform );
        
        NodeFeatureReport report = new NodeFeatureReport();
        
        report.setCvType( new CvTerm() );
        report.setSource( source );
        
        String tgtNs = "";
        String tgtAc = "";
        String rac = "";

        String featCvtNs = "";
        String featCvtAc = "";
        String featCvtNm = "";

        String featLabel = "";
        String featName = "";
                       
        try{
            JSONObject jform = new JSONObject( sform );
            
            JSONObject jval = new JSONObject(); 
            Map<String,Range> rangeMap = new HashMap<String,Range>();
            Map<String,FeatureXref> xrefMap = new HashMap<String,FeatureXref>();
            
            for( Iterator<String> k = jform.keys(); k.hasNext(); ){
                String key = k.next();
                String val = jform.getString(key);
                
                log.debug( "KEY(debug): " + key + " || VAL: " + val);

                if( key.startsWith("report_value_") ){   // jvalue 

                    try{
                        String vname = key.replace("report_value_","");                         
                        //System.out.println( " name= " + vname );

                        if( vname.contains("_") ){                         
                            String [] cols = vname.split("_",2);
                            String attr = cols[1];

                            // ns/ac in value

                            if("ns".equalsIgnoreCase(attr) ){
                                //System.out.println(cols[0] + ": ns: " + val);
                            }                            
                            if("ac".equalsIgnoreCase(attr) ){
                                //System.out.println(cols[0] + ": ac: " + val);
                            }                            

                            if( (! "comments".equalsIgnoreCase( cols[0] ) )
                                && ! jval.has( cols[0] ) ){
                                jval.put(cols[0], new JSONObject());
                            }
                            if( ! "comments".equalsIgnoreCase( cols[0] ) ){
                                JSONObject jo = jval.getJSONObject( cols[0] );
                                jo.put( attr, val );                                                            
                            }
                        } else {
                            //System.out.println(vname + ": val: " + val);
                            // property value here

                            if( "comments".equalsIgnoreCase(vname)){
                                report.setComment(val);
                            } else {
                            
                                if( ! jval.has( vname ) ){
                                    jval.put( vname , new JSONObject());
                                }
                                JSONObject jo = jval.getJSONObject(vname);
                                jo.put( "value", val );                                                        
                            }
                        }
                        
                    } catch(Exception ex){
                        System.out.println(ex);                        
                    }
                    
                } else if( key.startsWith("report_target_feature_") ){

                    // feature details: label, ranges, xrefs
                    
                    String vname = key.replace("report_target_feature_","");
                    
                    
                    log.debug( " feature: name= " + vname );

                    if( "label".equalsIgnoreCase( vname ) ){

                        // feature label

                        featLabel = val;
                        

                    }else if( "name".equalsIgnoreCase( vname ) ){   

                        // feature name

                        featName = val;                        

                    }else if( vname.startsWith( "cvtype_" ) ){   

                        // feature type
                        
                        vname = vname.replace("cvtype_","");

                        if( "ac".equalsIgnoreCase( vname ) ){
                            featCvtAc = val;
                        } else if( "ns".equalsIgnoreCase( vname ) ){
                            featCvtNs = val;
                        } else if( "name".equalsIgnoreCase( vname ) ){
                            featCvtNm = val;
                        } 
                            
                    }else if( vname.startsWith( "ranges_" ) ){

                        // feature ranges
                        
                        log.debug(  " feature: ranges= " + vname );
                        //ranges_0_start
                        vname = vname.replace( "ranges_", "" );
                        
                        if( vname.contains("_") ){
                            String [] cols = vname.split( "_", 2 );
                            
                            log.debug( "Ranges: " + cols[0] + " ::: " + cols[1]  + " val=" + val);

                            if(! rangeMap.containsKey( cols[0] ) ){                                
                                rangeMap.put( cols[0], new Range() );                                
                            }

                            if( "from".equalsIgnoreCase( cols[1] ) ){
                                log.debug(  "  start=" + val + " ::: " + Integer.parseInt( val ));
                                rangeMap.get( cols[0] ).setStart( Integer.parseInt( val ) );                                
                            } else if( "to".equalsIgnoreCase( cols[1] ) ){
                                log.debug( "  stop=" + val + " ::: " + Integer.parseInt( val ));
                                rangeMap.get( cols[0] ).setStop( Integer.parseInt(val) );                                
                            } else if( "sequence".equalsIgnoreCase( cols[1] ) ){
                                log.debug(  "  seq=" + val );
                                rangeMap.get( cols[0] ).setSequence( val );                                
                            }
                            
                        }                        
                    }

                    if( vname.startsWith("xrefs_") ){

                        log.debug( " feature: xrefs= " + vname );

                        vname = vname.replace("xrefs_","");
                        
                        if( vname.contains("_") ){
                            String [] cols = vname.split("_",2);
                            
                            log.debug( "Xrefs: " + cols[0] + " ::: " + cols[1] );

                            if(! xrefMap.containsKey( cols[0] ) ){
                                xrefMap.put( cols[0], new FeatureXref() );
                                xrefMap.get( cols[0] ).setCvType( new CvTerm() );
                            }

                            if( "ns".equalsIgnoreCase( cols[1] ) ){                                
                                xrefMap.get( cols[0] ).setNs( val );
                            }else if( "ac".equalsIgnoreCase( cols[1] ) ){ 
                                xrefMap.get( cols[0] ).setAc( val );                                
                            }else if( "tns".equalsIgnoreCase( cols[1] ) ){
                                xrefMap.get( cols[0] ).getCvType().setNs( val );
                            }else if( "tac".equalsIgnoreCase( cols[1] ) ){                                
                                xrefMap.get( cols[0] ).getCvType().setAc( val );                                
                            }else if( "tname".equalsIgnoreCase( cols[1] ) ){                                
                                xrefMap.get( cols[0] ).getCvType().setName( val );                                
                            }
                        }                    
                    }
                                        
                } else if( key.startsWith("report_target_") ){

                    // target 
                    
                    try{
                        String vname = key.replace("report_target_","");                         
                        log.debug( " name= " + vname );

                        if( vname.contains("_") ){                         
                            String [] cols = vname.split("_",2);
                            String attr = cols[1];
                                                        
                        }

                        if("ns".equalsIgnoreCase( vname ) ){
                            // target namespace in val
                            log.debug( " target ns = " + val );
                            tgtNs = val;                                                        
                        }
                        if("ac".equalsIgnoreCase( vname ) ){
                            // target accession in val
                            log.debug( " target ac = " + val );
                            tgtAc = val;                                                        
                        }
                           
                    } catch(Exception ex ){
                        
                    }
                } else if(  key.equalsIgnoreCase("ac") ){
                    rac = val;
                    log.debug( " report ac = " + val );                  
                
                } else if(  key.startsWith("report_type_") ){
                    
                    log.debug( " report type: key= " + key + "  val=" + val );                    
                    String vname = key.replace("report_type_","");
                    if( "ns".equalsIgnoreCase( vname ) ){
                        report.getCvType().setNs( val );
                    } else if( "ac".equalsIgnoreCase( vname ) ){
                        report.getCvType().setAc( val );
                    } else if( "name".equalsIgnoreCase( vname ) ){
                        report.getCvType().setName( val );
                    }
                }
            }

            // report ac
            //----------
            
            try{
                String rid = rac.replaceAll( "[^0-9]", "" );
                int lrid = Integer.parseInt( rid );
                report.setNacc( lrid );
                report.setPrefix( manager.getBkdConfig().getPrefix() );
                
                log.debug("report id set to -> " + report.getAc());

            } catch( Exception ex ){
                // shouldn't happen                
            }
            
            log.debug( "JVAL:  " + jval.toString() );
            report.setJval( jval.toString() );

            NodeFeat tgtFeat = new NodeFeat();

            // report feature target
            //----------------------
                        
            log.debug( "feature target: ns=" + tgtNs + " ac=" + tgtAc ); 

            Node tgtNode;

            if( manager.getBkdConfig().getPrefix().equalsIgnoreCase( tgtNs ) ){ 
                tgtNode = manager.getNode( tgtAc, Node.STUB );
            } else {
                tgtNode = manager.getNode( tgtNs, tgtAc, Node.STUB);
            }
            log.info( "tgt nodeId:  " + tgtNode.getPkey() );
            report.setNodeId( tgtNode.getPkey() );
            
            
            report.setFeature( tgtFeat );

            report.getFeature().setLabel( featLabel );
            report.getFeature().setName( featName );
            
            CvTerm cvt = new CvTerm( featCvtNs, featCvtAc, featCvtNm );            

            if( featCvtAc == null || featCvtAc.equals("") ){
               cvt = new CvTerm( "MI", "MI:0118", "mutation" );
            }            
            
            report.getFeature().setCvType( cvt );
            report.getFeature().setSource( source );
            
            log.info( "RMAP:  " + rangeMap );
            
            for( Iterator<String> ikey = rangeMap.keySet().iterator();
                 ikey.hasNext(); ){

                Range r = rangeMap.get(ikey.next());
                report.getFeature().getRanges().add(r);
                log.debug( r );
            }
            
            log.debug( "XMAP:  " + xrefMap );

            for( Iterator<String> ikey = xrefMap.keySet().iterator();
                 ikey.hasNext(); ){

                FeatureXref r = xrefMap.get(ikey.next());
                report.getFeature().getXrefs().add(r);                                
            }
             
        } catch( JSONException jx ){
            // shouldn't happen
        }
        return report;
    }    
}
