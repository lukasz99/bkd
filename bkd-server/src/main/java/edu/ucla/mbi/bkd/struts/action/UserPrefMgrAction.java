package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.util.ServletContextAware;

import org.json.*;

import java.io.*;
import java.util.*;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.dao.*;

public class UserPrefMgrAction extends ManagerSupport {
    
    private static final String JSON = "json";    
    private static final String REDIRECT = "redirect";    
    private static final String ACL_PAGE = "acl_page";
    private static final String ACL_OPER = "acl_oper";
    
    ////------------------------------------------------------------------------
    /// User Preferences Manager
    //---------------
    
    private UserPrefManager uprefManager;
    
    public void setUserPrefManager( UserPrefManager manager ){
        this.uprefManager = manager;
    }
    
    public UserPrefManager getUserPrefManager() {
        return this.uprefManager;
    }
    
    ////------------------------------------------------------------------------
    /// Watch Manager
    //---------------
    
    private BkdWatchManager watchManager;

    public void setWatchManager( BkdWatchManager manager ){
        this.watchManager = manager;
    }

    public BkdWatchManager getWatchManager() {
        return this.watchManager;
    }
    
    //--------------------------------------------------------------------------
    // format
    //-------

    private String format = null;
    
    public void setFormat( String format ) {
        this.format = format;
    }
    
    public String getFormat(){
        return this.format;
    }
    
    //--------------------------------------------------------------------------
    // results
    //--------
    
    String preferences;
    
    public String getPreferences(){
        return this.preferences;
    }

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    public String execute() throws Exception {
        
        Logger log = LogManager.getLogger( this.getClass() );
        
        log.debug( "|id=" + getId() + " op=" + getOp() );

        Integer iusr = (Integer) getSession().get( "USER_ID" );
        log.debug( " login id=" + iusr );
        
        BkdUser luser = null;
        if( iusr != null && iusr.intValue() > 0 ){
            luser = (BkdUser) getUserContext().getUserDao().getUser( iusr.intValue() );
            log.debug( " user set to: " + luser );
        } else  {
            return SUCCESS;
        }
        
        if( getOp() == null ) return SUCCESS;
        
        for ( Iterator<String> i = getOp().keySet().iterator();
              i.hasNext(); ) {
            
            String key = i.next();
            String val = getOp().get(key);

            if ( val != null && val.length() > 0 ) {
                
                if ( key.equalsIgnoreCase( "view" ) ) {
                    return execView( luser );
                }

                if ( key.equalsIgnoreCase( "update" ) ) {
                    return execUpdate( luser );
                }
                
                if ( key.equalsIgnoreCase( "defset" ) ) {
                    return execDefset( luser );
                }
                
                if ( key.equalsIgnoreCase( "updateTable" ) ) {
                    return execUpdateTable( luser );
                }
                if ( key.equalsIgnoreCase( "defaultTableLayout" ) ) {
                    return execDefaultTable( luser );
                }
            }
        }
        return SUCCESS;
    }
    
    //--------------------------------------------------------------------------

    
    private String execView( BkdUser user ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        this.preferences = user.getPrefs();
        
        log.debug( "execView: pref length = : " + this.preferences.length() );
        
        if( this.preferences == null || this.preferences.length() <= 0 ){
            log.debug( "No prefs found, updating with Defaults" );

            //  getUserPrefManager().getUprefContext();  // jsoncontext here!!!

            if( getUserPrefManager().getUprefContext()
                .getJsonConfig() == null ){
                
                String jsonPath = (String) getUserPrefManager()
                    .getUprefContext().getConfig().get( "json-config" );
                
                log.info( "JsonPageDef=" + jsonPath );
        
                if ( jsonPath != null && jsonPath.length() > 0 ) {
            
                    String cpath = jsonPath.replaceAll("^\\s+","" );
                    cpath = jsonPath.replaceAll("\\s+$","" );

                    try {
                        InputStream is = 
                            getServletContext().getResourceAsStream( cpath );
                        getUserPrefManager().getUprefContext()
                            .readJsonConfigDef( is );
                    
                        this.preferences = getUserPrefManager()
                            .getUprefContext().getJsonConfigString();
                    
                    } catch ( Exception e ){
                        log.info( "JsonConfig reading error" );
                    }
                }                
            }
            
            //this.preferences = getUserPrefManager().getDefUserPrefs();
            
            this.preferences = getUserPrefManager()
                .getUprefContext().getJsonConfigString();
            
            user.setPrefs(this.preferences);
            getUserContext().getUserDao().updateUser( user );
        }
        
        return JSON;
    }
    
    //--------------------------------------------------------------------------

    private String execUpdate( BkdUser user ){
        
        Logger log = LogManager.getLogger( this.getClass() );        
        log.debug( "|update called" );
        log.debug( " opp=" + getOpp() );

        String upref = user.getPrefs();
        
        try{
            JSONObject jUpref = new JSONObject( upref );
            
            process( jUpref, getOpp() );
            String nUpref = jUpref.toString(); 
            
            user.setPrefs( nUpref );

            getUserContext().getUserDao().updateUser( user );
            
            if ( isOppSet( "mmacc" ) ) 
                watchManager.addNewAccountObserver( user );
            else
                watchManager.dropNewAccountObserver( user );
            
            if ( isOppSet(  "mmna" ) ) 
                watchManager.addNewsObserver( user );
            else
                watchManager.dropNewsObserver( user );
                
            if ( isOppSet( "mmrec" ) ) 
                watchManager.addNewRecordObserver( user );
            else
                watchManager.dropNewRecordObserver( user );
            
            // mail attachments
            //------------------
            /*
            if ( isOppSet( "mmatt" ) ) 
                watchManager.addAttachmentObserver( user );
            else
                watchManager.dropAttachmentObserver( user );
            
            if ( isOppSet( "mmattw" ) ) 
                watchManager.addWatchedAttachmentObserver( user );
            else
                watchManager.dropWatchedAttachmentObserver( user );
            */
            
            // mail comments
            //--------------
            /*
            if ( isOppSet( "mmcom" ) ) 
                watchManager.addCommentObserver( user );
            else
                watchManager.dropCommentObserver( user );
                        
            if ( isOppSet( "mmcomw" ) ) 
                watchManager.addWatchedCommentObserver( user );
            else
                watchManager.dropWatchedCommentObserver( user );
            */
            
        } catch( JSONException jex ){
        }
        
        user = (BkdUser) getUserContext()
            .getUserDao().getUser( user.getId() );
        
        this.preferences = user.getPrefs();
        return JSON;
    }
    
    private boolean isOppSet( String prop ){
        return Boolean.parseBoolean( getOpp().get( prop ) );
    } 

    //--------------------------------------------------------------------------
    
    private void process( JSONObject jo, Map<String,String> opp ){
        Logger log = LogManager.getLogger( this.getClass() );                
        try{       
            try{ 
                String nval = opp.get( jo.getString( "opp" ) );
                if( nval != null ){
                    jo.put( "value", nval );
                    log.debug( "opp=" + jo.getString( "opp" ) 
                               + " value=" + nval );
                }
            } catch( JSONException jex ){
                log.debug("no value" );
            }

            try{ 
                JSONObject jod = jo.getJSONObject( "option-def" );
                for( Iterator i = jod.keys(); i.hasNext(); ){
                    
                    String k = (String) i.next();
                    log.debug("|START key=" + k );
                    
                    try{
                        process( jod.getJSONObject( k ), opp );
                    } catch( JSONException jex ){
                        log.debug("key jex=" + jex );
                    }
                    log.debug("|DONE key=" + k );
                }
            } catch( JSONException jex ){
                log.debug( "| no option-def" );
            }
        } catch( Exception ex ){
            ex.printStackTrace();
        }
    }

    //--------------------------------------------------------------------------

    private String execDefset( User user ){
        Logger log = LogManager.getLogger( this.getClass() );
        
        log.debug( " execDefset called" );
        
        String userPrefs = user.getPrefs();
        //this.preferences = getUserPrefManager().getDefUserPrefs();

        if( getUserPrefManager().getUprefContext()
            .getJsonConfig() == null ){
                
            String jsonPath = (String) getUserPrefManager()
                .getUprefContext().getConfig().get( "json-config" );
                
            log.info( "JsonPageDef=" + jsonPath );
            
            if ( jsonPath != null && jsonPath.length() > 0 ) {
                
                String cpath = jsonPath.replaceAll("^\\s+","" );
                cpath = jsonPath.replaceAll("\\s+$","" );
                
                try {
                    InputStream is = 
                        getServletContext().getResourceAsStream( cpath );
                    getUserPrefManager().getUprefContext()
                        .readJsonConfigDef( is );
                    
                    this.preferences = getUserPrefManager()
                        .getUprefContext().getJsonConfigString();
                    
                } catch ( Exception e ){
                    log.info( "JsonConfig reading error" );
                }
            }
            
        }
            
        //this.preferences = getUserPrefManager().getDefUserPrefs();
            
            
        this.preferences = getUserPrefManager()
            .getUprefContext().getJsonConfigString();
        
        String newUserPrefs = "";
        try{
            log.debug( " userPrefs =  "+ userPrefs );
            JSONObject jsonUserPrefs = new JSONObject( userPrefs );
            JSONObject defaultUserPrefs = new JSONObject( this.preferences );
            String tableLayoutPref = jsonUserPrefs.getString( "tableLayout");
            defaultUserPrefs.put( "tableLayout",  tableLayoutPref);
            
            newUserPrefs = defaultUserPrefs.toString(); 
            
            //user.setPrefs( newUserPrefs );
            //getUserContext().getUserDao().updateUser( user );
        } catch( JSONException jex ){
        log.debug( "exception " + jex);
        }
        
        user.setPrefs( newUserPrefs );
        getUserContext().getUserDao().updateUser( user );
        this.preferences = user.getPrefs();
        
        return JSON;
    }
    
     private String execUpdateTable( User user ){
         Logger log = LogManager.getLogger( this.getClass() );
         
        log.debug( " execUpdateTable called" );
        
        String userPrefs = user.getPrefs();
        String newUserPrefs = "";
        
         try{
            JSONObject jsonUserPrefs = new JSONObject( userPrefs );
            //log.debug( "jUpref.getString( 'tableLayout' ) called: " +  jUpref.getString( "tableLayout"));
            
            String tableLayoutPref = getOpp().get( "tableLayout" );
            jsonUserPrefs.put( "tableLayout",  tableLayoutPref);
            newUserPrefs = jsonUserPrefs.toString(); 
        } catch( JSONException jex ){
             log.debug( "exception " + jex);
        }
        user.setPrefs( newUserPrefs );
        getUserContext().getUserDao().updateUser( user );
       
        return JSON;
    }
    
    private String execDefaultTable( User user ){
        
        Logger log = LogManager.getLogger( this.getClass() );        
        log.debug( " execDefaultTable called" );
        
        String userPrefs = user.getPrefs();
        String newUserPrefs = "";
        
        try{
            JSONObject jsonUserPrefs = new JSONObject( userPrefs );
            jsonUserPrefs.put( "tableLayout",  "null" );
            newUserPrefs = jsonUserPrefs.toString(); 
        } catch( JSONException jex ){
            log.debug( "exception " + jex);
        }
        user.setPrefs( newUserPrefs );
        getUserContext().getUserDao().updateUser( user );
        
        return JSON;
    }    
}
