package edu.ucla.mbi.bkd;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;

import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;


public class BkdNotificationManager {
    
    public BkdNotificationManager() {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdNotificationManager: creating notification manager" );
    }
     
    String queueDir = "/var/bkd/queue";

    public void setQueueDir( String dirName ){
        this.queueDir = dirName;
    }
    
    public String getQueueDir(){
        return this.queueDir;
    }

    public void initialize(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdNotificationManager: initialized" );
    }

    public void cleanup(){
        Logger log = LogManager.getLogger( this.getClass() );        
        log.info( "BkdNotificationManager: cleanup" );
    }

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    
    /*
    public void updateNotify( Publication pub, IcLogEntry logEntry,
                              List<User> rcpLst){  
        recordNotify( pub, logEntry, rcpLst, "mail-record-watched" );
    }
    
    public void newRecordNotify( Publication pub, IcLogEntry logEntry,
                                 List<User> rcpLst ){    
        recordNotify( pub, logEntry, rcpLst, "mail-record-new" );
    }
    */
    /*
    public void attachmentNotify( Publication pub, IcLogEntry logEntry,
                                  List<User> rcpLst){  
        
        Log log = LogFactory.getLog( this.getClass() );
        log.info( "attachmentNotify called: pub=" + pub + " logEntry=" + logEntry);
        log.info( "attachmentNotify called: rcpLst=" + rcpLst);

        if( pub == null || logEntry == null 
            || rcpLst == null || rcpLst.size() == 0 ){
            
            log.info( "attachmentNotify: DONE" );
            return;
        }
        
        String pubId = Integer.toString( pub.getId() );
        String pubAuthor = pub.getAuthor();
        String pubTitle = pub.getTitle();
        String pubPmid = pub.getPmid();
        
        String alert = logEntry.getLabel();
        String message;
        
        log.debug( "pub.getId()  = " + pubId );
        log.debug( "pub.getAuthor() = " + pubAuthor );
        log.debug( "pub.getTitle()  = " + pubTitle );
        log.debug( "pub.getPmid()  = " + pubPmid );
        log.debug( "ile.getLabel()  = " + alert );
        
        if( pubAuthor.length() > 70 )
            pubAuthor = pubAuthor.substring( 0, 70 );
        if( pubTitle.length() > 70 )
            pubTitle = pubTitle.substring( 0, 70 );


        String recipients = "";
        boolean send = false;
        
        Iterator<User> rcpi = rcpLst.iterator();
        
        while( rcpi.hasNext() ){
            User recipient = rcpi.next();

            //------------------------------------------------------------------
            // NOTE: restricted only to current administrators, curators
            //       and the record owner

            log.debug( "recipient.getAllRoleNames="  
                       + recipient.getAllRoleNames() );
            log.debug( "pub.getOwner=" +  pub.getOwner() );
            
            if( recipient.getAllRoleNames().contains( "administrator" ) ||
                recipient.getAllRoleNames().contains( "curator" ) ||
                pub.getOwner() == recipient ){

                log.debug( "recipient: OK" );
                
                String globalMailFlag = PrefUtil
                    .getPrefOption( recipient.getPrefs(), "message-mail" );
                
                //String mailFlag = PrefUtil
                //    .getPrefOption( recipient.getPrefs(), 
                //                    "mail-attachment-new" );
                
                log.debug( "recipient: globalMailFlag=" + globalMailFlag);
                //+ " mailFlag=" + mailFlag );
                if( globalMailFlag != null           //&& mailFlag != null
                    && globalMailFlag.equalsIgnoreCase( "true" ) 
                    //&& mailFlag.equalsIgnoreCase( "true" ) 
                    ){
                    String rcptMail = recipient.getEmail();
                
                    recipients += " " + rcptMail + ",";
                    send = true;
                } 
            }
        }
        
        if( !send ) return;  // no mail notifiactions requested
        
        recipients  = recipients.substring(0, recipients.length() - 1);
                                           
        message = "EMAIL=\"" + recipients + "\"\n" 
            + "MODE=\"RECORD_ATTACHMENT\"\n" 
            + "ID=\"" + pubId + "\"\n" 
            + "AUTHOR=\"" + pubAuthor.replace("\"","\\\"") + "\"\n" 
            + "TITLE=\"" + pubTitle.replace("\"","\\\"") + "\"\n" 
            + "PMID=\"" + pubPmid.replace("\"","\\\"") + "\"\n" 
            + "ALERT=\"" + alert.replace("\"","\\\"") + "\"\n" ;
        
        //Write message information to a queue file
        
        try {
            String fileName = queueDir + File.separator 
                + String.valueOf( System.currentTimeMillis() ) 
                + ".queue";

            log.debug( "fileName=" + fileName );

            File file = new File( fileName );
            file.createNewFile();
            FileOutputStream fout = new FileOutputStream( file );
            fout.write( ( message ).getBytes());
            fout.close();
            
        }catch ( IOException ex ) { 
            System.out.println( ex );
        }
    }
    */
    //--------------------------------------------------------------------------
    /*
    public void commentNotify( Publication pub, IcLogEntry logEntry,
                               List<User> rcpLst){  
        
        Log log = LogFactory.getLog( this.getClass() );
        log.info( "commentNotify called: pub=" + pub + " logEntry=" + logEntry);
        log.info( "commentNotify called: rcpLst=" + rcpLst);

        if( pub == null || logEntry == null 
            || rcpLst == null || rcpLst.size() == 0 ){
            
            log.info( "commentNotify: DONE" );
            return;
        }
        
        String pubId = Integer.toString( pub.getId() );
        String pubAuthor = pub.getAuthor();
        String pubTitle = pub.getTitle();
        String pubPmid = pub.getPmid();
        
        String alert = logEntry.getLabel();
        String message;
        
        log.debug( "pub.getId()  = " + pubId );
        log.debug( "pub.getAuthor() = " + pubAuthor );
        log.debug( "pub.getTitle()  = " + pubTitle );
        log.debug( "pub.getPmid()  = " + pubPmid );
        log.debug( "ile.getLabel()  = " + alert );
        
        if( pubAuthor.length() > 70 )
            pubAuthor = pubAuthor.substring( 0, 70 );
        if( pubTitle.length() > 70 )
            pubTitle = pubTitle.substring( 0, 70 );
        
        String recipients = "";
        boolean send = false;
        
        Iterator<User> rcpi = rcpLst.iterator();
        
        while( rcpi.hasNext() ){
            User recipient = rcpi.next();

            //------------------------------------------------------------------
            // NOTE: comments are public 
            
            log.debug( "recipient.getAllRoleNames="  
                       + recipient.getAllRoleNames() );
            log.debug( "pub.getOwner=" +  pub.getOwner() );
            
            log.debug( "recipient: OK" );
                
            String globalMailFlag = PrefUtil
                .getPrefOption( recipient.getPrefs(), "message-mail" );
                
            //String mailFlag = PrefUtil
            //    .getPrefOption( recipient.getPrefs(), 
            //                    "mail-attachment-new" );
            
            log.debug( "recipient: globalMailFlag=" + globalMailFlag);
            //+ " mailFlag=" + mailFlag );
            if( globalMailFlag != null           //&& mailFlag != null
                && globalMailFlag.equalsIgnoreCase( "true" ) 
                //&& mailFlag.equalsIgnoreCase( "true" ) 
                ){
                String rcptMail = recipient.getEmail();
                
                recipients += " " + rcptMail + ",";
                send = true;
            } 
        }
        
        if( !send ) return;  // no mail notifiactions requested
        
        recipients  = recipients.substring(0, recipients.length() - 1);
        
        message = "EMAIL=\"" + recipients + "\"\n" 
            + "MODE=\"RECORD_COMMENT\"\n" 
            + "ID=\"" + pubId + "\"\n" 
            + "AUTHOR=\"" + pubAuthor.replace("\"","\\\"") + "\"\n" 
            + "TITLE=\"" + pubTitle.replace("\"","\\\"") + "\"\n" 
            + "PMID=\"" + pubPmid.replace("\"","\\\"") + "\"\n" 
            + "ALERT=\"" + alert.replace("\"","\\\"") + "\"\n" ;
        
        //Write message information to a queue file
        
        try {
            String fileName = queueDir + File.separator 
                + String.valueOf( System.currentTimeMillis() ) 
                + ".queue";

            log.debug( "fileName=" + fileName );

            File file = new File( fileName );
            file.createNewFile();
            FileOutputStream fout = new FileOutputStream( file );
            fout.write( ( message ).getBytes());
            fout.close();
            
        }catch ( IOException ex ) { 
            System.out.println( ex );
        }
    }
    */
    
    //--------------------------------------------------------------------------
    // REPORT
    
    public void reportNotify( Report report, BkdLogEntry logEntry,
                              List<BkdUser> rcpLst, String rcpFlag ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "reportNotify called" );

        if( report == null || logEntry == null 
            || rcpLst == null || rcpLst.size() == 0 ){
            
            log.info( "reportNotify: DONE" );
            return;
        }
        /*
        String pubId = Integer.toString( pub.getId() );
        String pubAuthor = pub.getAuthor();
        String pubTitle = pub.getTitle();
        String pubPmid = pub.getPmid();
        
        String alert = logEntry.getLabel();
        String message;
                
        log.debug( "pub.getId()  = " + pubId );
        log.debug( "pub.getAuthor() = " + pubAuthor );
        log.debug( "pub.getTitle()  = " + pubTitle );
        log.debug( "pub.getPmid()  = " + pubPmid );
        log.debug( "ile.getLabel()  = " + alert );
        
        if( pubAuthor.length() > 70 )
            pubAuthor = pubAuthor.substring( 0, 70 );
        if( pubTitle.length() > 70 )
            pubTitle = pubTitle.substring( 0, 70 );


        String recipients = "";
        boolean send = false;
        
        Iterator<User> rcpi = rcpLst.iterator();
        
        while( rcpi.hasNext() ){
            User recipient = rcpi.next();
            
            String globalMailFlag = 
                PrefUtil.getPrefOption( recipient.getPrefs(), "message-mail" );

            String mailFlag = 
                PrefUtil.getPrefOption( recipient.getPrefs(), rcpFlag );
            
            if( globalMailFlag != null && mailFlag != null
                && globalMailFlag.equalsIgnoreCase( "true" ) 
                && mailFlag.equalsIgnoreCase( "true" ) 
                ){
                String rcptMail = recipient.getEmail();
                
                recipients += " " + rcptMail + ",";
                send = true;
            } 
        }

        if( !send ) return;  // no mail notifiactions requested
        
        recipients  = recipients.substring(0, recipients.length() - 1);
                                           
        message = "EMAIL=\"" + recipients + "\"\n" 
            + "MODE=\"RECORD_UPDATE\"\n" 
            + "ID=\"" + pubId + "\"\n" 
            + "AUTHOR=\"" + pubAuthor.replace("\"","\\\"") + "\"\n" 
            + "TITLE=\"" + pubTitle.replace("\"","\\\"") + "\"\n" 
            + "PMID=\"" + pubPmid.replace("\"","\\\"") + "\"\n" 
            + "ALERT=\"" + alert.replace("\"","\\\"") + "\"\n" ;
        
        //Write message information to a queue file
        
        try {
            String fileName = queueDir + File.separator 
                + String.valueOf( System.currentTimeMillis() ) 
                + ".queue";
            
            File file = new File( fileName );
            file.createNewFile();
            FileOutputStream fout = new FileOutputStream( file );
            fout.write( ( message ).getBytes());
            fout.close();
            
        }catch ( IOException ex ) { 
            System.out.println( ex );
        }
        */
    }
   
    /*
    public void recordNotify( Publication pub, IcLogEntry logEntry,
                              List<User> rcpLst, String rcpFlag ){
        
        Log log = LogFactory.getLog( this.getClass() );
        log.info( "updateNotify called" );

        if( pub == null || logEntry == null 
            || rcpLst == null || rcpLst.size() == 0 ){
            
            log.info( "updateNotify: DONE" );
            return;
        }
        
        String pubId = Integer.toString( pub.getId() );
        String pubAuthor = pub.getAuthor();
        String pubTitle = pub.getTitle();
        String pubPmid = pub.getPmid();
        
        String alert = logEntry.getLabel();
        String message;
                
        log.debug( "pub.getId()  = " + pubId );
        log.debug( "pub.getAuthor() = " + pubAuthor );
        log.debug( "pub.getTitle()  = " + pubTitle );
        log.debug( "pub.getPmid()  = " + pubPmid );
        log.debug( "ile.getLabel()  = " + alert );
        
        if( pubAuthor.length() > 70 )
            pubAuthor = pubAuthor.substring( 0, 70 );
        if( pubTitle.length() > 70 )
            pubTitle = pubTitle.substring( 0, 70 );


        String recipients = "";
        boolean send = false;
        
        Iterator<User> rcpi = rcpLst.iterator();
        
        while( rcpi.hasNext() ){
            User recipient = rcpi.next();
            
            String globalMailFlag = 
                PrefUtil.getPrefOption( recipient.getPrefs(), "message-mail" );

            String mailFlag = 
                PrefUtil.getPrefOption( recipient.getPrefs(), rcpFlag );
            
            if( globalMailFlag != null && mailFlag != null
                && globalMailFlag.equalsIgnoreCase( "true" ) 
                && mailFlag.equalsIgnoreCase( "true" ) 
                ){
                String rcptMail = recipient.getEmail();
                
                recipients += " " + rcptMail + ",";
                send = true;
            } 
        }

        if( !send ) return;  // no mail notifiactions requested
        
        recipients  = recipients.substring(0, recipients.length() - 1);
                                           
        message = "EMAIL=\"" + recipients + "\"\n" 
            + "MODE=\"RECORD_UPDATE\"\n" 
            + "ID=\"" + pubId + "\"\n" 
            + "AUTHOR=\"" + pubAuthor.replace("\"","\\\"") + "\"\n" 
            + "TITLE=\"" + pubTitle.replace("\"","\\\"") + "\"\n" 
            + "PMID=\"" + pubPmid.replace("\"","\\\"") + "\"\n" 
            + "ALERT=\"" + alert.replace("\"","\\\"") + "\"\n" ;
        
        //Write message information to a queue file
        
        try {
            String fileName = queueDir + File.separator 
                + String.valueOf( System.currentTimeMillis() ) 
                + ".queue";
            
            File file = new File( fileName );
            file.createNewFile();
            FileOutputStream fout = new FileOutputStream( file );
            fout.write( ( message ).getBytes());
            fout.close();
            
        }catch ( IOException ex ) { 
            System.out.println( ex );
        }
    }
    */
    
    //--------------------------------------------------------------------------
    // NEWS
    
    public void newsNotify( String newsItem, List<BkdUser> rcpLst ){

        Logger log = LogManager.getLogger( this.getClass() );       
        log.info( "newsNotify called" );

        if( newsItem == null || rcpLst == null || rcpLst.size() == 0 ){
            log.info( "newsNotify: DONE" );
            return;
        }       
        
        String recipients = "";
        boolean send = false;
        
        Iterator<BkdUser> rcpi = rcpLst.iterator();
        
        while( rcpi.hasNext() ){
            BkdUser recipient = rcpi.next();
            
            String globalMailFlag = 
                PrefUtil.getPrefOption( recipient.getPrefs(), "message-mail" );
            
            String mailFlag = PrefUtil.getPrefOption( recipient.getPrefs(), 
                                                      "mail-news" );
            if( globalMailFlag != null && mailFlag != null
                && globalMailFlag.equalsIgnoreCase( "true" )
                && mailFlag.equalsIgnoreCase( "true" ) ){
                
                String email = recipient.getEmail();
                recipients += " " + email  + ",";
                send = true;
            } 
        }

        if( !send ) return;  // no mail notifications requested
        
        recipients  = recipients.substring(0, recipients.length() - 1);
        
        String message = "EMAIL=\"" + recipients + "\"\n" 
            + "MODE=\"NEWS_ITEM\"\n" 
            + "NEWS_ITEM=\"" + newsItem.replace("\"","\\\"") +   "\"\n" ;
        
        //Write message information to a queue file
        
        try {
            String fileName = queueDir + File.separator 
                + String.valueOf( System.currentTimeMillis() ) 
                + ".queue";
            
            File file = new File( fileName );
            file.createNewFile();
            FileOutputStream fout = new FileOutputStream( file );
            fout.write( ( message ).getBytes());
            fout.close();
            
        }catch ( IOException ex ) { 
            System.out.println( ex );
        }
    }

    //--------------------------------------------------------------------------
    // NEW ACCOUNT
    
    public void newAccountNotify( BkdUser user, List<BkdUser> rcpLst ){
        
        Logger log = LogManager.getLogger( this.getClass() );                      
        log.info( "newAccountNotify called" );
        
        if( user == null || rcpLst == null || rcpLst.size() == 0 ){
            log.info( "newAccountNotify: DONE" );
            return;
        }        
        
        String recipients = "";
        boolean send = false;
        
        Iterator<BkdUser> rcpi = rcpLst.iterator();
        
        while( rcpi.hasNext() ){
            BkdUser recipient = rcpi.next();
            log.info( " recipient:" + recipient );
            
            // NOTE: restricted only to current administrators
            //------------------------------------------------

            if( recipient.getAllRoleNames().contains( "administrator" ) ){
                log.info( " recipient role: OK" );
                String globalMailFlag = 
                    PrefUtil.getPrefOption( recipient.getPrefs(), 
                                            "message-mail" );
                
                String mailFlag = PrefUtil.getPrefOption( recipient.getPrefs(), 
                                                          "mail-account-new" );
                
                log.info( " mail flag: " + mailFlag
                          + " (global): " + globalMailFlag );
                
                if( globalMailFlag != null && mailFlag != null
                    && "true".equalsIgnoreCase( globalMailFlag )
                    && "true".equalsIgnoreCase( mailFlag ) ){
                
                    String email = recipient.getEmail();
                    recipients += " " + email + ",";
                    send = true;                  
                } 
            }
        }
        
        if( !send ) return;  // no mail notifications requested
        
        recipients  = recipients.substring(0, recipients.length() - 1);
        log.info( " recipients: " + recipients);
        
        String login = user.getLogin();
        String firstName = user.getFirstName();
        String lastName = user.getLastName();
        String affiliation = user.getAffiliation();
        String email = user.getEmail();
        
        String message = "EMAIL=\"" + recipients + "\"\n"
            + "MODE=\"NEW_ACCOUNT\"\n" 
            + "NEW_LOGIN=\"" + login + "\"\n" 
            + "FIRST_NAME=\"" + firstName.replace("\"","\\\"") + "\"\n" 
            + "LAST_NAME=\"" + lastName.replace("\"","\\\"") + "\"\n" 
            + "AFFILIATION=\"" + affiliation + "\"\n" 
            + "EMAIL=\"" + email + "\"\n" ;
        
        //Write message information to a queue file
        
        try {
            String fileName = queueDir + File.separator 
                + String.valueOf( System.currentTimeMillis() ) 
                + ".queue";
            
            File file = new File( fileName );
            file.createNewFile();
            FileOutputStream fout = new FileOutputStream( file );
            fout.write( ( message ).getBytes());
            fout.close();
            
        }catch ( IOException ex ) { 
            System.out.println( ex );
        }
    }
}
