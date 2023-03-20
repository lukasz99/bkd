package edu.ucla.mbi.bkd;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;
       
import edu.ucla.mbi.util.context.*;
import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

import edu.ucla.mbi.bkd.dao.*;

public class UserPrefManager {
    
    public UserPrefManager() {
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( "UserPrefManagerManager: creating manager" );
    }

    
    private UserContext userContext;

    public void setUserContext( UserContext context ) {
        this.userContext = context;
    }

    public UserContext getUserContext() {
        return this.userContext;
    }

    private String defUserPrefs = null;

    public void setDefUserPrefs( String prefs ) {
        this.defUserPrefs = prefs;
    }

    public String getDefUserPrefs() {        
        if( defUserPrefs != null) return defUserPrefs;
        return "{}";
    }

    private JsonContext uprefContext;

    public void setUprefContext( JsonContext context ) {
        this.uprefContext = context;
    }

    public JsonContext getUprefContext() {
        return this.uprefContext;
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
        log.info( "UserPrefManager: initializing" );        
    }
    
    public void cleanup(){
        Logger log = LogManager.getLogger( this.getClass() );        
        log.info( "UserPrefManager: cleanup" );
    }


    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    


    //---------------------------------------------------------------------
    //---------------------------------------------------------------------
    // private methods 


}
