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
    // Query Nodes
    //------------
    
    public List<Node> getNodeListSimple( String queryStr ){
        return getNodeList( 0, 500, "", true, null, queryStr, "simple" );  
    }
    
    public List<Node> getNodeList( int firstRecord, int blockSize,
                                   String skey, boolean asc,
                                   Map<String,String> flt,
                                   String queryStr, String queryType  ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdIndexManager: getNodeList" );

        List<Node> res = new ArrayList<Node>(); 
        
        try{
            
            String esquery = buildEsQuery( firstRecord, blockSize,
                                           skey, asc, flt,
                                           queryStr, queryType );

            String sres = esQueryResult( "node", esquery ); 
            log.info( "EsQueryResult: " + sres);
            JSONObject jres = new JSONObject( sres );

            JSONArray harr = jres.getJSONObject("hits").getJSONArray("hits");

            for( int j=0; j < harr.length(); j++ ){
                String cacc = harr.getJSONObject( j ).getString("_id");
                log.info( "ACC: " + cacc );

                Node cnd=  (Node) recManager.getNode( null, cacc );
                if( cnd != null)  res.add( cnd );
            }
                       
        }catch( Exception ex){
            //ex.printStackTrace();
        }
        return res; 
    }

    //--------------------------------------------------------------------------
    // Query Report
    //-------------

    public List<Report> getReportListSimple( String queryStr ){
        return getReportList( 0, 500, "", true, null, queryStr, "simple" );  
    }
    
    public List<Report> getReportList( int firstRecord, int blockSize,
                                       String skey, boolean asc,
                                       Map<String,String> flt,
                                       String queryStr, String queryType ){
        
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

    private String esQueryResult( String type, String query ){ 
 
        Logger log = LogManager.getLogger( this.getClass() );
        String url = getIndexUrl().replace( "%%TYPE%%", type );
        String curl = url + "/_doc/_search";
           
        log.info("EsIndex URL=" + curl);
            
        try{    
            CloseableHttpClient httpclient = HttpClients.createDefault();
            HttpPost post = new HttpPost( curl );

            post.addHeader( "Accept", "application/json" );
            post.addHeader( HttpHeaders.CONTENT_TYPE, "application/json" );
                
            StringEntity entity = new StringEntity( query, "UTF-8" );            
            post.setEntity( entity );
 
            CloseableHttpResponse httpResponse = httpclient.execute( post );
            int statusCode = httpResponse.getStatusLine().getStatusCode(); 
            log.info( "Status: " + statusCode );
            HttpEntity content = httpResponse.getEntity();
            BufferedReader in =
                new BufferedReader(new InputStreamReader(content.getContent()));

            String line = null;
            StringBuffer jdoc=new StringBuffer();
            
            while((line = in.readLine()) != null) {
                //log.info( "Response: " + line );
                jdoc.append(line);
            }

            httpclient.close();
            return jdoc.toString();
            
        }catch( Exception ex){
            log.info("EsIndex query error(query): " + query);
        }
        return null;
    }

    //--------------------------------------------------------------------------

    private String buildEsQuery( int firstRecord, int blockSize,
                                 String skey, boolean asc,
                                 Map<String,String> flt,
                                 String queryStr, String queryType ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( "BkdIndexManager: buildEQuery" );
        JSONObject esq = new JSONObject();
        
        JSONArray filter = new JSONArray();
        JSONObject query = new JSONObject();
        
        JSONArray sort = new JSONArray();

        JSONArray recret = new JSONArray();

        recret.put("id");
        
        
        // filters
        //--------
        
        if( flt != null && flt.size() > 0 ){
            log.info( "BkdIndexManager: building filters" );
            for( Iterator ii = flt.keySet().iterator(); ii.hasNext(); ){
                
                String key = (String) ii.next();
                String value = (String) flt.get(key);

                if( key != null && key.equals( "cflag" ) ){
                    //flag filter
                    
                    try{
                        if( value != null && !value.equals( "" ) ){
                            JSONObject nested = new JSONObject()
                                .put( "path", "comment" );
                            
                            JSONObject keyval = new JSONObject()
                                .put( "comment.flag", value.toLowerCase());

                            JSONObject innerFlt = new JSONObject()
                                .put( "term", keyval );

                            JSONObject innerBool = new JSONObject()
                                .put( "filter", innerFlt );
                            
                            JSONObject innerQuery = new JSONObject()
                                .put( "bool", innerBool );

                            nested.put( "query", innerQuery );
                            
                            filter.put( new JSONObject().
                                        put( "nested", nested ) );
                        }                        
                    } catch( JSONException jx ){
                        jx.printStackTrace();
                    }                    
                } else {
                        
                    if( key != null && key.equals( "status" ) ){
                        key = "state";
                    }

                    if( key != null && key.equals( "jid" ) ){
                        key = "journal_id";
                    }

                    if( key != null && key.equals( "jid" ) ){
                        key = "journal_id";
                    }

                    if( key != null && key.equals( "owner" ) ){
                        key = "owner";
                    }

                    if( key != null && key.equals( "editor" ) ){
                        key = "curator";
                    }

                    try{        
                        if( value != null && !value.equals( "" ) ){
                            JSONObject keyval = new JSONObject()
                                .put( key, value.toLowerCase());
                            filter.put(new JSONObject().put( "term", keyval ));
                        }
                    } catch( JSONException jx ){
                        jx.printStackTrace();
                    }
                }

            }
                
        }  // filters: done

        // query
        //------
        
        if( queryType == null ||  queryStr == null || queryStr.length() == 0 ){

            // "bool":{
            //    "must":{
            //         "match_all":{}
            //      }
            //   }
            
            JSONObject bqs = new JSONObject();


            try{
                bqs.put( "must", new JSONObject().put( "match_all", new JSONObject() ) );
                bqs.put( "filter", filter );
                
                query.put( "bool", bqs );

            } catch( JSONException jx ){
                jx.printStackTrace();
            }
            
        } else {
            
            if( queryType.equals("simple") ){

                log.info( "BkdIndexManager: building simple query" );

                // "simple_query_string":{
                //        "query" : "+interacts +regulate -factor",
                //        "default_operator": "and"
                //  default fields ???
                //      }

                JSONObject sqs = new JSONObject();
                
                try{
                
                    sqs.put( "query", queryStr );
                    sqs.put( "default_operator", "and" );                    
                    
                    //query.put( "simple_query_string", sqs );
                    
                    JSONObject bqs = new JSONObject();
                    
                    bqs.put( "must", new JSONObject().put( "simple_query_string", sqs ) );

                    if( filter != null ){
                        bqs.put( "filter", filter );
                    }
                    
                    query.put( "bool", bqs );
                    
                } catch( JSONException jx ){
                    jx.printStackTrace();
                }                
            }                          
        }
        
        // sort field/direction
        //---------------------
        
        String sortFld = skey;
        
        if( sortFld != null && sortFld.length() > 0){
            log.info( "BkdIndexManager: setting sort: field=" + sortFld + "::asc="+asc);
            try{
                if( skey.equals("id") ){

                    sort.put( new JSONObject().put( skey, asc ? "asc" : "desc"));
                
                } else if( skey.equals("imex.value") ){
                    
                    sort.put( new JSONObject().put( "imexid"+".keyword", asc ? "asc" : "desc"));
                    
                } else if( skey.equals("modDate") || skey.equals("actDate") ){
                
                    sort.put( new JSONObject().put("modtime", asc ? "asc" : "desc"));
                    
                } else if( skey.equals("crt") ){

                    sort.put( new JSONObject().put( "cretime", asc ? "asc" : "desc"));
                    
                } else if( skey.endsWith(".value") ){

                    String source = "double m = 0; for(obj in params._source.score){ " +
                        " if( obj.name=='%%SNAME%%'){ m = obj.value;}} return m";
                
                    source = source.replaceAll( "%%SNAME%%",
                                                skey.replaceAll( ".value", "" ) );
                
                    JSONObject script = new JSONObject();

                    script.put("lang","painless");
                    script.put("source", source );
                
                    JSONObject sscr = new JSONObject();

                    sscr.put("type", "number");
                    sscr.put("script",script );
                    sscr.put("order", asc ? "asc" : "desc");
                    
                    sort.put( new JSONObject().put( "_script", sscr) );
                
                } else {
                    sort.put( new JSONObject().put( skey + ".keyword", asc ? "asc" : "desc"));
                }
            } catch( JSONException jx ){
                jx.printStackTrace();
            }

        }
        
        try{
            esq.put( "query", query );
            esq.put( "sort", sort );
            esq.put( "from", firstRecord );
            esq.put( "size", blockSize );
            esq.put( "_source", recret );
        } catch( JSONException jx ){
            jx.printStackTrace();
        }
        
        log.info( "ESQ: " + esq.toString() );        
        
        return esq.toString();        
    }
    
}

    
