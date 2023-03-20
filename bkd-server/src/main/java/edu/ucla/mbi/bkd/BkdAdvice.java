package edu.ucla.mbi.bkd;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;
import java.lang.reflect.*;
       
import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;

public class BkdAdvice {

    //------------------------------------------------------------------------
    // Attachment Manager
    /*
    private AttachmentManager attManager;

    public void setAttachmentManager( AttachmentManager manager ) {
        this.attManager = manager;
    }

    public AttachmentManager getAttachmentManager() {
        return this.attManager;
    }
    */

    //------------------------------------------------------------------------
    // Watch Manager
    
    private BkdWatchManager watchManager;

    public void setWatchManager( BkdWatchManager manager ) {
        this.watchManager = manager;
    }

    public BkdWatchManager getWatchManager() {
        return this.watchManager;
    }
    

    //------------------------------------------------------------------------
    // Notification Manager
    
    private BkdNotificationManager notificationManager;

    public void setNotificationManager( BkdNotificationManager manager ) {
        this.notificationManager = manager;
    }

    public BkdNotificationManager getNotificationManager() {
        return this.notificationManager;
    }
    


    //-----------------------------------------------------------------------
    //------------------------------------------------------------------------
    // Index Manager

    private BkdIndexManager indexManager;

    public void setIndexManager( BkdIndexManager manager ) {
        this.indexManager = manager;
    }

    public BkdIndexManager getIndexManager() {
        return this.indexManager;
    }
    
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    public BkdAdvice() {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdManager: creating log manager" );
    }
    
    //--------------------------------------------------------------------------

    public void simpleMonitor(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdManager: simple monitor called");
    }
    
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------


    public void addReportMonitor( Object report, Object rreport ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "BkdAdvice: addReport monitor called: rep=" + rreport );
               
        // index if needed
        //----------------

        if( rreport != null && getIndexManager() != null ){
            getIndexManager().indexReport( ((Report) rreport).getAc() );
        } 
        
    }
    
    public void addNodeMonitor( Object node, Object rnode ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "BkdAdvice: addNode monitor called: rnode=" + rnode );
        
        // index if needed
        //----------------
        
        if( rnode != null && getIndexManager() != null ){
            getIndexManager().indexNode( ((Node) rnode).getAc(), "BASE" );
        }         
    }

    public void newAccountMonitor( Object user ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "new account monitor called:");
        log.info( " new user:" + user);
        if( watchManager != null && notificationManager != null ){
            List<BkdUser> usrNewObsLst
                = watchManager.getNewAccountObserverList();
            log.info( " obslist:" + usrNewObsLst );             
            notificationManager.newAccountNotify((BkdUser) user, usrNewObsLst);
        } else {
            log.info( " watchManager:" + watchManager
                      + " notificationManager:" + notificationManager );
        }
    }
}
