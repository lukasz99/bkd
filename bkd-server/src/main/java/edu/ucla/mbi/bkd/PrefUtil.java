package edu.ucla.mbi.bkd;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;

import org.json.*;
       
public class PrefUtil {
    
    public static String getPrefOption( String prefs, String option){
        Logger log = LogManager.getLogger( PrefUtil.class );        
        String val = null;

        try{
            JSONObject jPrefs = new JSONObject( prefs );
            JSONObject jod = jPrefs.getJSONObject( "option-def" );
            val = PrefUtil.findValue( jod, option );
        } catch( Exception ex ){
            ex.printStackTrace();
            // noprefs or prefs not parsable 
        }
        return val;
    }

    private static String findValue( JSONObject optDef, String name ){
               
        // NOTE: "option-def" passed as optDef:
        //          {
        //           "opt-a":{"value":"true"},
        //           "opt-b":{"value":"true","option-def":{...}},
        //           "opt-c":{}
        //          }
        Logger log = LogManager.getLogger( PrefUtil.class );        
       
        try{
            log.debug(" name=" + name );
            JSONObject child = optDef.getJSONObject( name );
            String val = child.getString( "value" );
            log.debug(" val=" + val );
            if( val != null ) return val;
        } catch( JSONException jex ){
            // value not here
        }

        for( Iterator i = optDef.keys(); i.hasNext(); ){
            try{
                String key = (String) i.next();
                log.debug(" key=" + key );
                JSONObject co = optDef.getJSONObject( key );
                String val = 
                    PrefUtil.findValue( co.getJSONObject( "option-def"), 
                                        name );
                if( val != null) return val;

            } catch( JSONException jex ){
                // no children
            }
        }
        
        return null;
    }
}
