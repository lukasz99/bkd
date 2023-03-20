package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.util.ServletContextAware;
       
//import org.vps.crypt.Crypt;

import java.util.*;
import java.security.*;

import java.io.IOException;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;
       
import edu.ucla.mbi.util.struts.captcha.*;

import edu.ucla.mbi.bkd.*;

//import edu.ucla.mbi.imex.central.*;
//import edu.ucla.mbi.imex.central.dao.*;

public class FeedbackAction extends PortalSupport {

    public static final String ACCEPTED = "accepted";

    //---------------------------------------------------------------------
    // configuration
    //--------------
    
    FeedbackManager feedbackManager;
    
    public FeedbackManager getFeedbackManager() {
        return feedbackManager;
    }

    public void setFeedbackManager( FeedbackManager manager ) {
        this.feedbackManager = manager;
    }

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
    // registered feedback
    //--------------------

    public String regFeed() {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "regFeed");	
        Integer uid = (Integer) getSession().get( "DIP_USER_ID" );
        feedbackManager.regUserFeedback( uid, getAbout(), getComment());
        
	return ACCEPTED;
    }
    
    //--------------------------------------------------------------------------
    // email feedback
    //----------------

    public String mailFeed() {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "mailFeed: email=" + email);
	
        feedbackManager.mailUserFeedback( email, getAbout(), getComment());
	
        return ACCEPTED;
    }
    
    //--------------------------------------------------------------------------

    String submit;

    public String getSubmit() {
        return submit;
    }
    
    public void setSubmit( String submit ) {
        this.submit = submit;
    }
    
    String email;

    public void setEmail( String email ) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    String comment;
    
    public void setComment( String comment ) {
        this.comment = comment;
    }
    
    public String getComment() {
        return comment;
    }
    
    String about;
    
    public void setAbout( String about ) {
        this.about = about;
    }
    
    public String getAbout() {
        return about;
    }
    
    //---------------------------------------------------------------------
    // Captcha
    //--------
    
    Captcha captcha = null;
    
    public void setCaptcha( Captcha captcha ){
        this.captcha = captcha; 
    }
    
    public Captcha getCaptcha(){
        return this.captcha; 
    }
    
    String capresponse ="";
    
    public void setCaptchaResponse( String response ){
        this.capresponse = response;
    }
    
    public String getCaptchaResponse(){
        return this.capresponse;
    }
    
    //--------------------------------------------------------------------------
    
    public String execute() throws Exception {
        
        if( getSubmit() != null && getSubmit().length() > 0 ) {
            
            if ( getSession().get( "DIP_USER_ID" ) != null &&
                 (Integer) getSession().get( "DIP_USER_ID" )  > 0 ) {
                return regFeed();
            } else {
                return mailFeed();
            }
        } 
        return SUCCESS;
    }
    
    //---------------------------------------------------------------------

    public void validate() {
        
        Logger log = LogManager.getLogger( this.getClass() );        
        if( getSubmit() != null && getSubmit().length() > 0 ) {
            
            String comment = getComment();
            if ( comment != null ) {
                try {
                    comment = comment.replaceAll("^\\s+","");
                    comment = comment.replaceAll("\\s+$","");
                } catch ( Exception ex ) {
                    // cannot be here 
                }
                setComment( comment );
            }
            
            if ( comment == null || comment.length() == 0 ) {
                addFieldError( "comment",
                               "Comment field cannot be left empty" );
            }
            
            if ( getSession().get( "DIP_USER_ID" ) != null &&
                 (Integer) getSession().get( "DIP_USER_ID" )  > 0 ) {
            } else {                
                // test recaptcha
                //---------------
                
                boolean rvalid = true;
                
                if( captcha == null ){
                    rvalid = true; 
                } else {
                    rvalid = captcha.validate( capresponse );
                }
                
                if ( ! rvalid ) {  
                    addActionError("Not a good CAPTCHA");
                    log.info( "recaptcha: error" );                    
                } else {
                    log.info( "recaptcha: OK" );
                }                            
            }
        }
    }    
}

