package edu.ucla.mbi.bkd;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;
import java.lang.reflect.*;
       
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
    /*
    private WatchManager watchManager;

    public void setWatchManager( WatchManager manager ) {
        this.watchManager = manager;
    }

    public WatchManager getWatchManager() {
        return this.watchManager;
    }
    */

    //------------------------------------------------------------------------
    // Notification Manager
    /*
    private NotificationManager notificationManager;

    public void setNotificationManager( NotificationManager manager ) {
        this.notificationManager = manager;
    }

    public NotificationManager getNotificationManager() {
        return this.notificationManager;
    }
    */


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
            getIndexManager().indexNode( ((Node) rnode).getAc() );
        }         
    }

}
