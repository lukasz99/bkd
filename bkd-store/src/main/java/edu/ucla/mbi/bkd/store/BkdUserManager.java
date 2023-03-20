package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;

//import edu.ucla.mbi.util.*;
import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.access.*;

import javax.mail.*;
import javax.mail.internet.*;

public class BkdUserManager {
    
    public BkdUserManager() {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "UserManager: creating user manager" );
    }
    
    public void notifyRegistrationByMail( BkdUser user, 
                                          String notifyFrom,
                                          String notifyServer ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "UserManager: notifyRegistration " );
        
        if( user != null ){
            user.notifyByMail( notifyFrom, notifyServer );            
        }
    }

    /*
    public void notifyByMail( String from, String server ) {
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.info("from: " + from + " server: " + server);

        Properties props = new Properties();
        props.put("mail.from", from);
        props.put("mail.smtp.host", server);
        
        Session session = Session.getInstance(props, null);

        //----------------------------------------------------------------------
        //sanitize
        //--------
    
        String sFirstName = sanitize( getFirstName(), 16 );    
        String sLastName = sanitize( getLastName(), 32 );
        String sLogin = sanitize( getLogin(), 32 );
        
        //----------------------------------------------------------------------
        
    
        String message = 
            "Thank you for registering as a user of the CVUS Database user.\n" +
            "In order to activate your CVUS Database account (user name: " + 
            sLogin + "), please, use the key:\n\n" +
            "    " + getActivationKey() +"\n\n" +
            "when loging in for the first time.  Without activation\n" +
            "the account might be terminated shortly.\n\n\n"+
            "Regards,\nThe CVUS Database Deamon\n\n";
        
        log.debug("message:  "+ message);
        
        //----------------------------------------------------------------------

        try {
            MimeMessage msg = new MimeMessage( session );
            msg.setFrom();
            msg.setRecipients( Message.RecipientType.TO,
                               getEmail() );
            msg.setSubject( "CVUS Database Account Activation" );
            msg.setSentDate( new Date() );
            msg.setText( message );
            Transport.send( msg );
        } catch ( MessagingException mex ) {
            System.out.println("send failed, exception: " + mex);
        }
    }
    
    public void sendComment( String to, String server,
                             String about, String comment ) {
        
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        Properties props = new Properties();
        props.put("mail.from", getEmail() );
        props.put("mail.smtp.host", server);
        
        Session session = Session.getInstance(props, null);
        
        try {
            MimeMessage msg = new MimeMessage( session );
            msg.setFrom();
            msg.setRecipients( Message.RecipientType.TO,
                               to );
            msg.setSubject( "DIP Feedback:" + about);
            msg.setSentDate( new Date() );
            msg.setText( comment );
            Transport.send( msg );
            
            log.info( "send ok: " + to );
            
        } catch ( MessagingException mex ) {
            
            log.info( "send to: " + to );
            log.info( "send failed, exception: " + mex );
        }
    }
    
    public static void sendComment( String from, String to, String server, 
                                    String about, String comment ) {
        
        
        Logger log = LogManager.getLogger( User.class ); 
        Properties props = new Properties();
        props.put("mail.from", from );
        props.put("mail.smtp.host", server);
        
        Session session = Session.getInstance(props, null);
        
        try {
            MimeMessage msg = new MimeMessage( session );
            msg.setFrom();
            msg.setRecipients( Message.RecipientType.TO,
                               to );
            msg.setSubject( "ImexCentral Feedback:" + about );
            msg.setSentDate( new Date() );
            msg.setText( comment );
            Transport.send( msg );
            log.info( "send ok: " + to );
            
        } catch ( MessagingException mex ) {
            log.info( "send to: " + to );
            log.info( "send failed, exception: " + mex );
        }
    }
    
    private String sanitize( String field, int maxlen ){

        String sfield = field;
        
        if( field == null ) return "";
        sfield = sfield.trim();
        
        int spi = field.indexOf( " " ); 
        if(spi > 0 ){
            sfield = sfield.substring( 0, spi );
            if( sfield.length() > maxlen ){
                sfield = sfield.substring( maxlen );
            }            
        }
        
        return sfield;    
    }    

    */

}
