package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.apache.struts2.ServletActionContext;

import java.util.*;

//import org.vps.crypt.Crypt;

import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.util.struts.captcha.*;

import edu.ucla.mbi.dxf20.*;  // ???


import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;

public class UserAction extends UserSupport {

    //--------------------------------------------------------------------------
    // configuration
    //---------------

    BkdUserManager userManager;
    
    public BkdUserManager getUserManager() {
        return userManager;
    }

    public void setUserManager( BkdUserManager manager ) {
        this.userManager = manager;
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
    
    //---------------------------------------------------------------------
    // new user registration
    //---------------------

    private String notifyFrom;

    public void setNotifyFrom( String from ) {
        this.notifyFrom = from;
    }
    
    private String notifyServer;

    public void setNotifyServer( String server ) {
        this.notifyServer = server;
    }
    
    //---------------------------------------------------------------------
    //---------------------------------------------------------------------

    public String register( User user ) {

        // sanitize 
        user.setLogin( sanitize( user.getLogin(), 32 ) );
        user.setFirstName( sanitize( user.getFirstName(), 32 ) );
        user.setLastName( sanitize( user.getLastName(), 32 ) );        


        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " register:" + user );
        log.debug( " register:login=" + user.getLogin() );
        log.debug( " register:login=" + user.getFirstName() );
        log.debug( " register:login=" + user.getLastName() );
        
        
        UserDao dao = getUserContext().getUserDao();
        BkdUser bkdUser = new BkdUser( user );
        
        // set password
        //-------------

        bkdUser.encryptPassword( pass0 );
                
        
        // generate activation key
        //------------------------
        
        bkdUser.setActivationKey();
        log.info( " activationKey: " + bkdUser.getActivationKey() );

        bkdUser.setActivated( false );
        bkdUser.setEnabled( true );
        
        // create new account 
        //-------------------
        
        dao.saveUser( bkdUser );
        
        log.info( " Account created: " + user.getLogin() +
              " (" + user.getId() + ")" );

        // sent notification
        //------------------
        
        getUserManager()
            .notifyRegistrationByMail( bkdUser, notifyFrom, notifyServer );
        
        //bkdUser.notifyByMail( notifyFrom, notifyServer );
        
        return ACTIVATE;
    }


    //---------------------------------------------------------------------
    // user activation
    //----------------

    public String activate( User user ) {

        Logger log = LogManager.getLogger( this.getClass() );
        
        log.info( " activate:" + user );

        if ( user != null ){

            log.info( " login:" + user.getLogin() );

            UserDao dao =  getUserContext().getUserDao();
            BkdUser bkdUser = (BkdUser) dao.getUser( getUser().getLogin() );
        
            if ( bkdUser != null &&
                 bkdUser.testPassword( getPass0() ) ) {

            if ( !bkdUser.testActivationKey( getUser().getActivationKey() ) 
                 ) {
                addFieldError( "user.activationKey", 
                               "Activation key does not match." );
                return ACTIVATE;
            } 
            
            bkdUser.setActivated( true );
            dao.updateUser( bkdUser );
            
                // valid user
                //-----------
    
                getSession().put( "USER_ID", bkdUser.getId() );
                getSession().put( "LOGIN", bkdUser.getLogin() );

                Map<String,Integer> roles = new HashMap();
                Map<String,Integer> groups = new HashMap();
                
            if ( bkdUser.getRoles()  != null ) {
                    for ( Iterator ii = bkdUser.getRoles().iterator();
                          ii.hasNext(); ) {
                        Role r = (Role) ii.next();
                        log.info( "  role=" + r.toString() );
                        roles.put( r.getName(), r.getId() );
                    }
                    
                }

                if ( bkdUser.getGroups() != null ) {
                    for ( Iterator ig = bkdUser.getGroups().iterator();
                          ig.hasNext(); ) {
                        BkdGroup g = (BkdGroup) ig.next();
                        log.info( "  group=" + g.toString() );
                        groups.put( g.getLabel(), g.getId() );
                        
                        if ( g.getRoles()  != null ) {
                            for ( Iterator ir = g.getRoles().iterator();
                                  ir.hasNext(); ) {
                                Role r = (Role) ir.next();
                                log.info( "  role=" + r.toString() );
                                roles.put( r.getName(), r.getId() );
                            }
                        }
                    }
                }
                
                getSession().put( "USER_ROLE", roles );
                getSession().put( "USER_GROUP", groups );
                log.info( " login: session set" );

                return HOME;
            }
        }

        return INPUT;
    }


    //---------------------------------------------------------------------
    // user edit
    //----------

    private String uedit;
    
    public void setUedit( String uedit ) {
        this.uedit = uedit;
    }

    public String edit() {

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( " edit: uid=" + getSession().get( "USER_ID" ) );
        
        int uid = (Integer) getSession().get( "USER_ID" );
        
        if( uid <= 0) return HOME;

        UserDao dao = getUserContext().getUserDao();
        BkdUser bkdUser = (BkdUser) 
            dao.getUser( (String) getSession().get( "LOGIN") );
        
        if ( bkdUser != null ) {

            log.debug( " bkdUser=" + bkdUser );
            
            // get preferences
            //----------------
            
            if( getOp()!= null && getOp().equalsIgnoreCase( "getprefs" ) ){
                setUser( new User() );
                getUser().setPrefs( bkdUser.getPrefs() );
                return JSON;
            }
            
            // set preferences
            //----------------
            
            if( getOp()!= null && getOp().equalsIgnoreCase( "setprefs" ) ){
                log.info( " edit: setprefs" );
                log.info( " edit:" + this.prefs );
                
                bkdUser.setPrefs( this.prefs );
                
                // store new settings
                //-------------------

                dao.updateUser( bkdUser );

                setUser( new User() );
                getUser().setPrefs( bkdUser.getPrefs() );
                return JSON;
            }
            
            if ( uedit != null && uedit.equalsIgnoreCase( "save" ) ) {
                    
                log.info( " edit: updating uid=" + uid );

                // incorporate form changes
                //-------------------------
                
                bkdUser.setFirstName( getUser().getFirstName() );
                bkdUser.setLastName( getUser().getLastName() );
                bkdUser.setAffiliation( getUser().getAffiliation() );
                bkdUser.setEmail( getUser().getEmail() );
                
                if ( pass0 != null && bkdUser.testPassword( pass0 ) ) {
                    bkdUser.encryptPassword( pass1 );			
                }
                
                // store new settings
                //-------------------
    
                dao.updateUser( bkdUser );
                return HOME;
            }
                
            if ( uedit != null && uedit.equalsIgnoreCase( "reset" ) ) {
                log.debug( " edit: resetting uid=" + uid );
            }

            if ( getUser() == null ){
                setUser( new User() );
            }
            getUser().setLogin( (String) getSession().get( "LOGIN"));
            getUser().setFirstName( bkdUser.getFirstName() );
            getUser().setLastName( bkdUser.getLastName() );
            getUser().setAffiliation( bkdUser.getAffiliation() );
            getUser().setEmail( bkdUser.getEmail() );
            
        }
    
        setPass0("");
        setPass1("");
        setPass2("");
        
        return UEDIT;        
    }


    //---------------------------------------------------------------------
    // user login
    //------------
    
    public String login( User user ) {

        Logger log = LogManager.getLogger( this.getClass() );
        
        if ( user != null ){

            log.info( " login:" + user.getLogin() );
            System.out.println( "login:" + user.getLogin() );

            
            UserDao dao = getUserContext().getUserDao();
            
            System.out.println( "dao:" + dao );
            
            BkdUser bkdUser = (BkdUser) dao.getUser( getUser().getLogin() );
            
                
            if ( bkdUser !=null && 
             bkdUser.testPassword( getPass0() ) ) {

                // update & log current login time
                //--------------------------------
                
                bkdUser.setLoginTime( new GregorianCalendar() );
                dao.updateUser( bkdUser );
                
                
                // valid user
                //-----------
                
                if ( !bkdUser.isActivated() ) return ACTIVATE;

                getSession().put( "USER_ID", bkdUser.getId() );
                getSession().put( "LOGIN", bkdUser.getLogin() );
                getSession().put( "PREFS", bkdUser.getPrefs() );
                log.debug( " login: session set" );

                Map<String,Integer> roles = new HashMap();
                Map<String,Integer> groups = new HashMap();

                if ( bkdUser.getRoles()  != null ) {
                    
                    for ( Iterator ii = bkdUser.getRoles().iterator(); 
                          ii.hasNext(); ) {
                        BkdRole r = (BkdRole) ii.next();
                        log.debug( "  role=" + r.toString() );
                        roles.put( r.getName(),r.getId());
                    }	    
                }
                    
                if ( bkdUser.getGroups() != null ) {
                    for ( Iterator ig = bkdUser.getGroups().iterator();
                          ig.hasNext(); ) {
                        BkdGroup g = (BkdGroup) ig.next();
                        log.debug( "  group=" + g.toString() );
                        groups.put( g.getLabel(), g.getId() );

                        if ( g.getRoles()  != null ) {
                            for ( Iterator ir = g.getRoles().iterator();
                                  ir.hasNext(); ) {
                                BkdRole r = (BkdRole) ir.next();
                                log.debug( "  role=" + r.toString() );
                                roles.put( r.getName(), r.getId() );
                            }
                        }
                    }
                }
                
                getSession().put( "USER_ROLE", roles );
                getSession().put( "USER_GROUP", groups );
                log.debug( " login: session set" );
                
                log.info( " referer:" + getReferer() );
                log.info( " fragment:" + getFragment() );
                rurl = getReferer();
                if( getFragment() != null && ! "null".equals( getFragment() ) )
                    rurl += getFragment();
                
                if( rurl != null ) return REDIRECT;
                
                //this.setMst("1:1");
                return HOME;
            }

            if( bkdUser != null ){
                log.debug( " login: id=" + bkdUser.getId() );
                log.debug( " login: oldpass=" + bkdUser.getPassword() );
            }
            if( getPass1() != null ){
                log.debug( " login: newpass " + getPass1() );
            }
        }
        log.info( " login: unknown user" );
        addActionError( "User/Password not recognized." );

        if( rurl != null ) return REDIRECT;
        
        return INPUT;
    }

    //---------------------------------------------------------------------
    // user logout
    //------------

    public String logout() {

        Logger log = LogManager.getLogger( this.getClass() );        
        log.info( " logout: " + getSession().get( "LOGIN" ) );

        getSession().put( "USER_ID", -1 );
        getSession().put( "USER_ROLE", null );
        getSession().put( "LOGIN", "" );
        getSession().put( "PREFS", null );

        if( rurl != null ) return REDIRECT;
        
        //this.setMst("1:1"); // NOTE: should be set in struts action conf
        return HOME;
    }

    
    //---------------------------------------------------------------------
    //---------------------------------------------------------------------
    // terms agree
    //------------
    
    private boolean agree;

    public void setAgree( boolean agree ) {

        this.agree = agree;
    }

    public boolean getAgree() {
        return this.agree;
    }

    //---------------------------------------------------------------------
    // new password
    //--------------

    private String pass0;

    public void setPass0( String pass ) {
        this.pass0 = pass;
    }

    public String getPass0() {
        return this.pass0;
    }

    private String pass1;

    public void setPass1( String pass ) {
        this.pass1 = pass;
    }

    public String getPass1() {
        return this.pass1;
    }

    private String pass2;

    public void setPass2( String pass ) {
        this.pass2 = pass;
    }

    public String getPass2() {
        return this.pass2;
    }
    private String referer;

    public void setReferer( String ref ) {
        this.referer = ref;
    }

    public String getReferer() {
        return this.referer;
    }
    
    private String fragment;

    public void setFragment( String frag ) {
        this.fragment = frag;
    }

    public String getFragment() {
        return this.fragment;
    }


    private String submit;

    public void setSubmit( String sub) {
        this.submit = sub;
    }

    public String getSubmit() {
        return this.submit;
    }  

    
    //---------------------------------------------------------------------
    
    public void validate() {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " validate: session=" + getSession() );
        
        
        // registration options
        //---------------------

        if( getOp() != null && getOp().equalsIgnoreCase( "reg" ) ) { 

            log.info("Registering user: login->" + getUser().getLogin());

 
            
            // test login
            //-----------

            if( getUser() != null ){
                log.debug( " validate:" + getUser().getLogin() );
                
                UserDao dao = getUserContext().getUserDao();
                BkdUser oldUser = 
                    (BkdUser) dao.getUser( getUser().getLogin() );
                if( oldUser != null ){
                    addFieldError( "user.login","User name already taken. " +
                                   "Please, select another one.");
                    log.debug( " old login... id=" + oldUser.toString() );
                } 
            }

            log.info( "Captcha:" + captcha );
            log.info( "  response: " + capresponse );
            
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
                        
            // test password typos
            //--------------------
            
            log.debug( "UserAction->validate: pass0=" + pass0 + " pass1=" + pass1 );
            
            if( pass0 != null && pass1 != null && !pass0.equals( pass1 ) ) {
                addFieldError( "pass1", "Passwords do not match." );
            }
            return;
        }
        
        // edit options
        //-------------
        
        if( getOp() != null 
            && getOp().equalsIgnoreCase( "edit" ) 
            && getSession() != null ){ 
            
            log.debug( "UserAction->validate: session login=" + (String) getSession().get("LOGIN")  );
            
            if( getSession().get("LOGIN") != null ){
        
                // test passoword typos
                //---------------------

                if( pass0 != null && pass0.length() > 0 ){
                    
                    UserDao dao = getUserContext().getUserDao();
                    BkdUser oldUser = 
                        (BkdUser) dao.getUser( (String) getSession().get("LOGIN") );
                    
                    log.debug( "UserAction->validate: login=" + getUser().getLogin()  );
                    log.debug( "UserAction->validate: pass0=" + pass0 + " pass1=" + pass1 );
                    
                    log.debug( "UserAction->validate: oldUser" + oldUser);
                    
                    if ( !oldUser.testPassword( pass0 ) ) {
                        addFieldError( "pass0", "Wrong password." );
                    } else {
                        if ( pass1 == null || !pass1.equals( pass2) ) {
                            addFieldError( "pass1", "Passwords do not match." );
                        }
                    }	
                }	    
            }
            
            return;
        }

	// activate options
	//-----------------
        
        if( getOp() != null && getOp().equalsIgnoreCase( "activate" ) ) { 
            return;
        }
    }
    
    //--------------------------------------------------------------------------    
    //sanitize
    //--------
    
    private String sanitize( String field, int maxlen ){

        String sfield = field;

        if( field == null ) return "";
        sfield = field.trim();
        
        int spi = field.indexOf( " " );
        if(spi > 0 ){
            sfield = sfield.substring( 0, spi );
            if( sfield.length() > maxlen ){
                sfield = sfield.substring( maxlen );
            }
        }

        return sfield;
    }

}
