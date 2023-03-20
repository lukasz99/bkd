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

import edu.ucla.mbi.bkd.access.*;

public class FeedbackManager {
    
    public FeedbackManager() {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "FeedbackManager: creating manager" );
    }

    //---------------------------------------------------------------------
    //  UserContext
    //--------------
    
    private UserContext userContext;

    public void setUserContext( UserContext context ) {
        this.userContext = context;
    }

    public UserContext getUserContext() {
        return this.userContext;
    }
    
    //---------------------------------------------------------------------
    // mail config
    //------------

    String adminMail;

    public String getAdminMail() {
        return adminMail;
    }

    public void setAdminMail( String mail ) {
        adminMail = mail;
    }

    String mailServer;

    public String getMailServer() {
        return mailServer;
    }

    public void setMailServer( String server ) {
        mailServer = server;
    }


    //---------------------------------------------------------------------
    
    public void initialize(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "FeedbackManager: initializing" );
    }


    public void cleanup(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "FeedbackManager: cleanup" );
    }


    
    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    // registered user feedback
    //-------------------------

    public void regUserFeedback( Integer uid, 
                                 String about, String comment ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "regUserFeedback");
   
        BkdUser bkdUser = (BkdUser) userContext.getUserDao().getUser( uid );

        bkdUser.sendComment( adminMail, mailServer, about, comment );
    }

    //---------------------------------------------------------------------
    // email usee feedback
    //--------------------
    
    public void mailUserFeedback( String email, 
                                  String about, String comment ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "mailUserFeed: email=" + email);
        
        if ( email != null ) {
            try {
                email = email.replaceAll("^\\s+","");
                email = email.replaceAll("\\s+$","");
            } catch (Exception e ) {
                // cannot be here
            }
        }
        
        if ( email != null ) {
            comment = "\n\nFrom: " + email + "\n\n" + comment;
        }
        BkdUser.sendComment( adminMail, adminMail, mailServer,
                             about, comment );
    }
}
 
