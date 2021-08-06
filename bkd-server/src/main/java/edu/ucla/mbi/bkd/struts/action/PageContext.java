package edu.ucla.mbi.bkd.struts.action;

/* ========================================================================
 #                                                                        $
 # PageContext: configuration of the static pages                         $
 #                                                                        $
 #     TO DO:                                                             $
 #                                                                        $
 #======================================================================= */

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory; 

import java.util.*;
import java.io.*;
import org.json.*;

public class PageContext {

    public PageContext() {}

    Map config;
    private static final int BUFFER_SIZE = 4096;
    
    public void setPageConfig( Map config ) {
	this.config = config;
    }
    
    public Map getPageConfig() {
	return config;
    }

    //---------------------------------------------------------------------
    // JSON-based page definitions
    //----------------------------
    
    private static String jsonPageDefString;

    public String getJsonPageDefString() {
        return jsonPageDefString;
    }

    public void setJsonPageDefString( String def ) {
        this.jsonPageDefString = def;
    }
    
    private static JSONObject jsonPageDefObject;

    public JSONObject getJsonPageDefObject() {
        return jsonPageDefObject;
    }

    public void setJsonPageDefObject( JSONObject def ) {
        this.jsonPageDefObject = def;
    }

    private static Map<String,Object> jsonPageDefUtil = null;

    public Map<String,Object>  getJsonPageDef() {
        return jsonPageDefUtil;
    }
    
    //---------------------------------------------------------------------
    // read JSON definitions
    //----------------------

    public void readJsonPageDef( InputStream is ) {

	Log log = LogFactory.getLog( this.getClass() );	

	StringBuffer sb = new StringBuffer();
	char[] buffer = new char[BUFFER_SIZE];
		
	try {
	    InputStreamReader ir = new InputStreamReader( is );
	    int len =0;
	    while ( (len = ir.read( buffer, 0, BUFFER_SIZE ) ) >= 0 ) {
		sb.append( buffer , 0, len);
	    }
	    
	} catch ( Exception e ) {
	    log.info( e.toString() );
	}
	
	String jsonPageDef = sb.toString();
	log.debug( "unparsed=" + jsonPageDef);
	try {
	    JSONObject jo = new JSONObject( jsonPageDef );
	    log.info( "parsed: " +jo.toString() );
	    jsonPageDefObject = jo;
	    jsonPageDefString = jo.toString();
	    jsonPageDefUtil = json2util( jo );
	} catch ( JSONException jex ) {
	    log.info( "parsing error: " + jex.toString() ); 
	}
    }

    //---------------------------------------------------------------------
    // JSON -> java.util conversion
    //-----------------------------
    
    public Map<String,Object> json2util( JSONObject json ) {

	Map<String,Object> util = new HashMap<String,Object>();

	for ( Iterator ki = json.keys(); ki.hasNext(); ) {
	    String key = (String) ki.next();
	    Object o = null;
	    try {
		o = json.get( key );
	    } catch ( JSONException jex ) {
		key = null;
	    }
	    if ( key != null && o.getClass().getName().equals( "org.json.JSONObject" ) ) {
		// JSONObject
		
		o = json2util( (JSONObject) o );
	    }
	    
	    if ( key != null && o.getClass().getName().equals( "org.json.JSONArray" ) ) {
		// JSONArray
		o = json2util( (JSONArray) o );
	    }
	    if (key != null ){
		util.put( key,o );
	    }
	}

	return util;
    }
    
    public List json2util( JSONArray json ) {
	
	List util = new ArrayList();

	for ( int i = 0; i < json.length(); i++ ) {
	    
	    Object o = null;
	    try {
	        o = json.get( i );
	    } catch ( JSONException jex ) {
		o = null;
	    }
	    
	    if ( o != null && o.getClass().getName().equals( "org.json.JSONObject" ) ) {
		// JSONObject
		
		o = json2util( (JSONObject) o );
	    }
	    
	    if ( o != null && o.getClass().getName().equals( "org.json.JSONArray" ) ) {
		// JSONArray
		o = json2util( (JSONArray) o );
	    }
	    if (o != null ){
		util.add( o );
	    }
	}

	return util;
    }
}
