package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;

import org.json.*;
       
import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.dao.*;
import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;

public class BkdWatchManager {
    
    public BkdWatchManager() {
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( "WatchManager: creating manager" );
    }

    //---------------------------------------------------------------------
    //  TracContext
    //--------------

    private TracContext tracContext;
    
    public void setTracContext( TracContext context ) {
        this.tracContext = context;
    }
    
    public TracContext getTracContext() {
        return this.tracContext;
    }
    //---------------------------------------------------------------------
    // DaoContext
    // ----------
    
    BkdDaoContext daoContext;
    
    public void setDaoContext( BkdDaoContext daoContext ){
        this.daoContext = daoContext;
    }

    public BkdDaoContext getDaoContext(){
        return this.daoContext;
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
         log.info( "BkdWatchManager: initializing" );
    }


    public void cleanup(){
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( "WatchManager: cleanup" );
    }


    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    /*
    public List<Publication> 
        getPublicationList( BkdUser usr, 
                            int firstRecord, int blockSize,
                            String skey, boolean asc ){
        Logger log = LogManager.getLogger( this.getClass() ); 
         
        log.info( " getPublicationList -> id=" + usr.getId() );

        / *
        List<DataItem> diList = getDaoContext().getSorelDao()
            .getSubjectList( usr, firstRecord, blockSize ,skey, asc );

        if( diList != null ){

            List<Publication> pl = new ArrayList<Publication>();
            
            for( Iterator<DataItem> dii = diList.iterator(); 
                 dii.hasNext(); ){

                Publication p = (Publication) dii.next();
                log.debug( "getPublicationList: add id=" + p.getId() );
                pl.add( p );
            }
            
            return pl;
        } else {
            return null;
        }
        * /
        
        return null;
        
    }
    */
    //---------------------------------------------------------------------
    /*
    public List<Publication> 
        getPublicationList( BkdUser usr, 
                            int firstRecord, int blockSize,
                            String skey, boolean asc, 
                            Map<String,String> flt ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info( " getPublicationList -> id=" + usr.getId() );

        / *        
        List<DataItem> diList = getDaoContext().getSorelDao()
            .getSubjectList( usr, firstRecord, blockSize ,
                             skey, asc, flt );

        if( diList != null ){
            
            List<Publication> pl = new ArrayList<Publication>();
            
            for( Iterator<DataItem> dii = diList.iterator(); 
                 dii.hasNext(); ){

                Publication p = (Publication) dii.next();
                log.debug( "getPublicationList: add id=" + p.getId() );
                pl.add( p );
            }
            
            return pl;
        } else {
            return null;
        }
        * / 
        return null;
    }
    */
    //---------------------------------------------------------------------
    /*
    public long getPublicationCount( BkdUser usr ){       
        //return getDaoContext().getSorelDao().getSubjectCount( usr );

        return 0;
    }
    */
    //---------------------------------------------------------------------
    /*
    public long getPublicationCount( BkdUser usr, Map<String,String> flt ){       
        //return getDaoContext().getSorelDao().getSubjectCount( usr, flt );

        return 0;
    }
    */
    //---------------------------------------------------------------------
    /*
    public boolean getWatchStatus( BkdUser usr, Publication pub ){

        
        if( usr == null || pub == null ) return false;
        / *
        if( getDaoContext().getSorelDao()
            .getSORel( usr, pub )  == null ) return false;
        * /    
        return true;
    }
    */
    //---------------------------------------------------------------------
    
    public boolean setWatchStatus( BkdUser usr, Report report, 
                                   boolean watch ){
        
        if( usr == null || report == null ) return false;
        /*
        if( watch ){
            getDaoContext().getSorelDao().addSORel( pub, usr );
            return true;
        } else{
            getDaoContext().getSorelDao().dropSORel( pub, usr );
            return false;
        }
        */
        return false;
        
    }
    
    //---------------------------------------------------------------------
    /*
    public List<BkdUser> getObserverList( Publication pub ){
        //return getDaoContext().getSorelDao().getObserverList( pub );
        return null;
    }
    */
    //---------------------------------------------------------------------
    /*
    public void addWatchByRecordOwnerPref( BkdUser user, Publication pub,
                                           boolean force ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug("addWatchByRecordOwnerPref");

        / *
        if( force ){
            this.setWatchStatus( user, pub, true );
        } else {

            String byAttFlag = 
                PrefUtil.getPrefOption( user.getPrefs(), 
                                        "record-owner" );            
            if( byAttFlag != null 
                && byAttFlag.equalsIgnoreCase( "true" ) ){
                this.setWatchStatus( user, pub, true );
            }
        }
        * /
        log.debug("addWatchByRecordOwnerPref: DONE");
    }
    */
    //---------------------------------------------------------------------
    /*
    public void addWatchByAttachmentPref( BkdUser user, Publication pub,
                                          boolean force ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug("addWatchByAttachmentPref");
        / *
        if( force ){
            this.setWatchStatus( user, pub, true );
        } else {

            String byAttFlag = 
                PrefUtil.getPrefOption( user.getPrefs(), 
                                        "attachment-owner" );            
            if( byAttFlag != null 
                && byAttFlag.equalsIgnoreCase( "true" ) ){
                this.setWatchStatus( user, pub, true );
            }
        }
        * /
        log.debug("addWatchByAttachmentPref: DONE");
    }
    */
    //---------------------------------------------------------------------
    /*
    public void addWatchByCommentPref( BkdUser user, Publication pub,
                                       boolean force ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug("addWatchByCommentPref");
        / *
        if( force ){
            this.setWatchStatus( user, pub, true );
        } else {

            String byCommentFlag = 
                PrefUtil.getPrefOption( user.getPrefs(),
                                        "comment-owner" );            
            if( byCommentFlag != null 
                && byCommentFlag.equalsIgnoreCase( "true" ) ){
                this.setWatchStatus( user, pub, true );
            }
        }
        * /
        log.debug("addWatchByCommentPref: DONE");
    }
    */
    //---------------------------------------------------------------------
    // Event observers
    //----------------
    
    public void addNewsObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "addNewsObserver; user =" +  usr);
        
        log.debug( "ddNewsObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "ddNewsObserver; eorel =" 
                   + getDaoContext().getEorelDao() );
        
        getDaoContext().getEorelDao().addEORel( "news", usr );
        
    }

    public void dropNewsObserver( BkdUser usr ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "dropNewsObserver; user =" +  usr);
        
        log.debug( "dropNewsObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "dropNewsObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao().dropEORel( "news", usr );
        
    }

    
    //--------------------------------------------------------------------------
    // Attachments
    //------------
    /*
    public void addAttachmentObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "addAttachmentObserver; user =" +  usr);
        / *
        log.debug( "addAttachmentObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "addAttachmentObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao()
            .addEORel( "new-attachment", usr );
        * /
    }
    */
    /*
    public void dropAttachmentObserver( BkdUser usr ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "dropAttachementObserver; user =" +  usr);
        / *
        log.debug( "dropAttachementObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "dropAttachementObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao()
            .dropEORel( "new-attachment", usr );
        * /
    }
    */
    //--------------------------------------------------------------------------
    /*
    public void addWatchedAttachmentObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
       
        log.debug( "addAttachmentObserver; user =" +  usr);
        / *
        log.debug( "addWatchedAttachmentObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "addWatchedAttachmentObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao()
            .addEORel( "new-watched-attachment", usr );
        * /
    }
    */
    /*
    public void dropWatchedAttachmentObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "dropWatchedAttachementObserver; user =" +  usr);
        / *
        log.debug( "dropWatchedAttachementObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "dropWatchedAttachementObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao()
            .dropEORel( "new-watched-attachment", usr );
        * /
    }
    */
    /*
    //--------------------------------------------------------------------------
    // Comments
    //---------
    /*
    public void addCommentObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "addCommentObserver; user =" +  usr);
        / *
        log.debug( "addCommentObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "addCommentObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao()
            .addEORel( "new-comment", usr );
        * /
    }
    */
    /*

    public void dropCommentObserver( BkdUser usr ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "dropCommentObserver; user =" +  usr);
        / *
        log.debug( "dropCommentObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "dropCommentObserver; eorel =" 
                   + getDaoContext().getEorelDao() );
        
        getDaoContext().getEorelDao()
            .dropEORel( "new-comment", usr );
        * /
    }
    */
    //--------------------------------------------------------------------------
    /*
    public void addWatchedCommentObserver( BkdUser usr ){        
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "addWatchedCommentObserver; user =" +  usr);
        / *
        log.debug( "addWatchedCommentObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "addWatchedCommentObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao()
            .addEORel( "new-watched-comment", usr );
        * /
    }
    */
    /*

    public void dropWatchedCommentObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "dropWatchedCommentObserver; user =" +  usr);
        / *
        log.debug( "dropWatchedCommentObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "dropWatchedCommentObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao()
            .dropEORel( "new-watched-comment", usr );
        * /
    }
    */

    //--------------------------------------------------------------------------

    public void addNewRecordObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "addNewRecordObserver; user =" +  usr);
        
        log.debug( "addNewRecordObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "addNewRecordObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao().addEORel( "new-record", usr );
        
    }

    public void dropNewRecordObserver( BkdUser usr ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "dropNewRecordObserver; user =" +  usr);
        
        log.debug( "dropNewRecordObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "dropNewRecordObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao().dropEORel( "new-record", usr );
        
    }

    //--------------------------------------------------------------------------
                                                                        
    public void addNewAccountObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "addNewAccountObserver; user =" +  usr);
        
        log.debug( "addNewAccountObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "addNewAccountObserver; eorel =" 
                   + getDaoContext().getEorelDao() );

        getDaoContext().getEorelDao().addEORel( "new-account", usr );
        
    }

    public void dropNewAccountObserver( BkdUser usr ){

        Logger log = LogManager.getLogger( this.getClass() );        
        log.debug( "dropNewAccountObserver; user =" +  usr);
        
        log.debug( "dropNewAccountObserver; getDaoContext=" 
                   + getDaoContext() );
        log.debug( "dropNewAccountObserver; eorel =" 
                   + getDaoContext().getEorelDao() );
        getDaoContext().getEorelDao().dropEORel( "new-account", usr );
        
    }

    //--------------------------------------------------------------------------
    // List queries
    //-------------

    public List<BkdUser> getNewsObserverList(){
        return getDaoContext().getEorelDao().getEORel( "news" );       
    }
    
    //--------------------------------------------------------------------------

    public List<BkdUser> getNewRecordObserverList(){
        return getDaoContext().getEorelDao().getEORel( "new-record" );       
    }

    //--------------------------------------------------------------------------

    public List<BkdUser> getNewAccountObserverList(){
        return getDaoContext().getEorelDao().getEORel( "new-account" );       
    }
    
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    /*
    public List<BkdUser> getAttachmentObserverList(){
        //return getDaoContext().getEorelDao().getEORel( "new-attachment" );
        return null;
    }
    */
    //--------------------------------------------------------------------------
    /*
    public List<BkdUser> getWatchedAttachmentObserverList(){
        //return getDaoContext().getEorelDao()
        //    .getEORel( "new-watched-attachment" );
        return null;
    }
    */
    //--------------------------------------------------------------------------
    /*
    public boolean getWatchedAttachmentStatus( BkdUser usr ){

        //if( getDaoContext().getEorelDao()
        //    .getEORel( "new-watched-attachment", usr )  != null ){
        //    return true;
        //}             
        return false;   
    }
    */
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    public List<BkdUser> getCommentObserverList(){
        //return getDaoContext().getEorelDao().getEORel( "new-comment" );
        return null;
    }

    //--------------------------------------------------------------------------
    /*
    public List<BkdUser> getWatchedCommentObserverList(){
        //return getDaoContext().getEorelDao()
        //    .getEORel( "new-watched-comment" );
        return null;
    }
    */
    /*
    public boolean getWatchedCommentStatus( BkdUser usr ){
        
        //if( getDaoContext().getEorelDao()
        //    .getEORel( "new-watched-comment", usr )  != null ){
        //    return true;
        //}             
        return false;
    }
    */
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    // private methods 

   
}
