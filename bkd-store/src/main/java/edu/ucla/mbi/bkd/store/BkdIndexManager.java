package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.apache.http.*;
import org.apache.http.client.*;
import org.apache.http.impl.client.*;
import org.apache.http.client.methods.*;
import org.apache.http.entity.*;

import java.util.*;

import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;
import java.text.SimpleDateFormat;

import org.json.*;

public class BkdIndexManager {
    
    public BkdIndexManager() {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdIndexManager: creating manager" );
    }
    
    //--------------------------------------------------------------------------
    // Record Manager
    //---------------

    private BkdRecordManager recManager;

    public void setRecordManager( BkdRecordManager manager ){
        this.recManager = manager;
    }

    public BkdRecordManager getRecordManager() {
        return recManager;
    }
    
    
    //--------------------------------------------------------------------------
    // Index Url
    //----------

    private String indexUrl;

    public void setIndexUrl( String url ) {
        this.indexUrl = url;
    }

    public String getIndexUrl() {
        if( indexUrl == null ){
            indexUrl ="";
        }
        return indexUrl;
    }
    
    //---------------------------------------------------------------------
    //  Index Active Flag
    //-------------------

    private boolean indexActive = false;;

    public void setIndexActive( boolean url ) {
        this.indexActive = url;
    }

    public boolean getIndexActive() {
        return indexActive;
    }

    public boolean isIndexActive() {
        return indexActive;
    }
    
    //---------------------------------------------------------------------
    
    boolean debug = false;

    public boolean getDebug() {
        return debug;
    }
    
    public void setDebug( boolean debug ) {
        this.debug = debug;
    }
    
    //---------------------------------------------------------------------

    public void initialize(){
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( "BkdIndexManager: initializing" );
    }

    public void cleanup(){
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( "BkdIndexManager: cleanup called" );
    }
    
    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    // index Node
    //-----------
    
    public void indexNode( String ac ) {
        Logger log = LogManager.getLogger( this.getClass() );     
        log.info( " index node -> ac=" + ac );
        
        try{
            Node nde =  (Node) recManager.getNode( null, ac );
            log.info( " retrieved -> ac=" + nde );
            String idoc = node2idoc( nde );
            log.info( " idoc -> " + idoc );
            if( ! getIndexUrl().equals("") ){
                esIndex("node", ac, idoc);
            }
            
            log.info( "DONE" );
        } catch( Exception ex ){ 
            ex.printStackTrace();
            log.info( "FAILED" );            
        }
    }

    // index Report
    //-------------
    
    public void indexReport( String ac) {
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( " index report -> id=" + ac );
        
        try{
            Report rep = (Report) recManager.getReport( ac );
                      
            String idoc = report2idoc( rep );
                       
            if( ! getIndexUrl().equals("") ){
                esIndex( "report", ac, idoc );
            }
            
            log.info( "DONE" );
        } catch( Exception ex ){ 
            ex.printStackTrace();
            log.info( "FAILED" );           
        }
    }

    //--------------------------------------------------------------------------
    // Query Node
    //-----------
    
    public List<Node> getNodeList( int firstRecord, 
                                   int blockSize,
                                   String skey, boolean asc,
                                   Map<String,String> flt,
                                   String queryStr,
                                   String queryType ){
                
        //String query = buildQuery( firstRecord, blockSize,
        //                           skey, asc, flt, queryStr, queryType );
        
        List<Node> plst = new ArrayList<Node>();
        Logger log = LogManager.getLogger( this.getClass() );
        /*
        try{
            List<Integer> idList = getNodeIdList( query );
            
            log.info( idList );
            
            List<Node> pl = tracContext
                .getPubDao().getPublicationList( idList );

            if( pl != null ){
                for( Iterator<Publication> ip = pl.iterator(); ip.hasNext(); ){
                    Publication cp = ip.next();
                    if( cp instanceof IcPub ){
                        plst.add( (IcPub) cp );
                    }
                }
            }
        }catch( Exception ex){
            //ex.printStackTrace();
        }
        */ 
        return plst;
    }


    //--------------------------------------------------------------------------
    // Query Report
    //-------------
    
    public List<Report> getReportList( int firstRecord, 
                                     int blockSize,
                                     String skey, boolean asc,
                                     Map<String,String> flt,
                                     String queryStr,
                                     String queryType ){
        
        //String query = buildQuery( firstRecord, blockSize,
        //                           skey, asc, flt, queryStr, queryType );
        
        List<Report> plst = new ArrayList<Report>();
        Logger log = LogManager.getLogger( this.getClass() );
        /*
        try{
            List<Integer> idList = getReportIdList( query );
            
            log.info( idList );
            
            List<Node> pl = tracContext
                .getPubDao().getPublicationList( idList );

            if( pl != null ){
                for( Iterator<Publication> ip = pl.iterator(); ip.hasNext(); ){
                    Publication cp = ip.next();
                    if( cp instanceof IcPub ){
                        plst.add( (IcPub) cp );
                    }
                }
            }
        }catch( Exception ex){
            //ex.printStackTrace();
        }
        */
        return plst;
    }

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    public String node2idoc( Node node ){
        
        Map<String,Object> mnde = new HashMap<String,Object>();
        Logger log = LogManager.getLogger( this.getClass() ); 
        // accession
        //----------

        mnde.put("ac",node.getAc());

        // sequence
        //---------

        if( node.getSequence() != null && node.getSequence().length() > 0 ){
            mnde.put( "sequence", node.getSequence() );
        }
        
        // type
        //-----

        Map<String,Object> mtpe = new HashMap<String,Object>();
        mnde.put( "type", mtpe );
        mtpe.put( "ac", node.getCvType().getAc() ); 
        mtpe.put( "name", node.getCvType().getName() ); 
                      
        // names
        //------

        Map<String,Object> mname = new HashMap<String,Object>();
        mnde.put( "name", mname );
        mname.put( "short", node.getLabel());

        if( "protein".equalsIgnoreCase( node.getCvType().getName())){ 
            mname.put( "protein", node.getLabel() );
        } else if( "gene".equalsIgnoreCase( node.getCvType().getName())){ 
            mname.put( "gene", node.getLabel() );
        }
        
        mname.put( "full", node.getName());


        if(  node.getAlias() != null ){

            List<String> malt = new ArrayList<String>();
            
            for( NodeAlias na : node.getAlias() ){
                String tac = na.getCvType().getAc();

                if( "dxf:0031".equalsIgnoreCase( tac ) ){   // synonym
                    malt.add( na.getAlias() );
                } else if( "dxf:0102".equalsIgnoreCase( tac ) ){ // gene-name
                    malt.add( na.getAlias() );
                    mname.put( "gene", na.getAlias() ); 
                } else if( "dxf:0103".equalsIgnoreCase( tac ) ){ // gene-synonym
                    malt.add( na.getAlias() );
                } else if( "dxf:0101".equalsIgnoreCase( tac ) ){ // protein-name
                    malt.add( na.getAlias() );
                    mname.put( "protein", na.getAlias() );
                } else if( "dxf:0104".equalsIgnoreCase( tac ) ){ // protein-synonym
                    malt.add( na.getAlias() );
                }            
            }
            if(malt.size() > 0){
                mname.put( "alt", malt );
            }
        }
        
        // xrefs
        //------

        if( node.getXrefs() != null ){

            List<Object> mxref = new ArrayList<Object>();
            
            for( NodeXref nx : node.getXrefs() ){
                
                Map<String,Object> cxref = new HashMap<String,Object>();
                cxref.put( "ns", nx.getNs() );
                cxref.put( "ac", nx.getAc() );
                cxref.put( "tac", nx.getCvType().getAc() );
                cxref.put( "type", nx.getCvType().getName() );

                mxref.add( cxref );
            }
       
            if( mxref.size() > 0 ){
                mnde.put( "xref", mxref );
            }
        }
        
        // attributes
        //-----------

        if( node.getAttrs() != null ){
            
            List<Object> mattr = new ArrayList<Object>();             
            
            for( NodeAttr na : node.getAttrs() ){

                Map<String,Object> cattr = new HashMap<String,Object>();
                cattr.put( "ac", na.getCvType().getAc() );
                cattr.put( "name", na.getCvType().getName() );
                cattr.put( "value", na.getValue() );
                mattr.add( cattr );
            }

            if( mattr.size() > 0 ){
                mnde.put( "attribute", mattr );
            }
        }

        // features
        //---------
        
        if( node.getFeats() != null ){
            Map<String,Object> mfeat = new HashMap<String,Object>(); 
                    
            for( NodeFeat nf : node.getFeats() ){
                
            }
        }
        
        try{
            JSONObject  jnde = new JSONObject( mnde );
            return jnde.toString(2);
        } catch( JSONException ex){
            ex.printStackTrace();
            return null;
        }   

    }

    public String report2idoc( Report report ){
        
        Map<String,Object> mrep = new HashMap<String,Object>();
        Logger log = LogManager.getLogger( this.getClass() ); 
        try{
            JSONObject  jrep = new JSONObject( mrep );
            return jrep.toString(2);
        } catch( JSONException ex){
            ex.printStackTrace();
            return null;
        }   

    }
    
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    
    private int esIndex( String type, String ac, String jdoc){ 

        Logger log = LogManager.getLogger( this.getClass() ); 
        try{

            String url = getIndexUrl().replace( "%%TYPE%%", type );

            
            CloseableHttpClient httpclient = HttpClients.createDefault();
            String curl = url + "/_doc/" + ac;
            log.info("EsIndex URL=" + curl);
            HttpPut put = new HttpPut( curl );

            put.addHeader( "Accept", "application/json" );
            put.addHeader( HttpHeaders.CONTENT_TYPE, "application/json" );
                
            StringEntity entity = new StringEntity( jdoc, "UTF-8" );            
            put.setEntity( entity );
 
            CloseableHttpResponse httpResponse = httpclient.execute( put );
            int statusCode = httpResponse.getStatusLine().getStatusCode(); 
            log.info( "Status: " + statusCode );
            HttpEntity content = httpResponse.getEntity();
            BufferedReader in =
                new BufferedReader(new InputStreamReader(content.getContent()));
            String line = null;
            while((line = in.readLine()) != null) {
                log.info( "Response: " + line );
            }

            httpclient.close();
            return statusCode;
            
        }catch( Exception ex){
            return -1;
        }
    }
}

    
