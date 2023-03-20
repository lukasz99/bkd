package edu.ucla.mbi.bkd.access;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.apache.commons.codec.digest.Crypt;

import java.util.*;

import javax.mail.*;
import javax.mail.internet.*;

import edu.ucla.mbi.util.data.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Table(name = "usr")
public class BkdUser extends User {

    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="usr_pkey_seq")
    @SequenceGenerator( name="usr_pkey_seq", sequenceName="usr_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private int id;

    @Column(name = "fname")
    private String firstName = "";

    @Column(name = "lname")
    private String lastName = "";
    
    @Column(name = "affiliation")
    private String affiliation = "";

    @Column(name = "title")
    private String title = "";
    
    @Column(name = "email")
    private String email = "";

    @Column(name = "login")
    private String login = "";

    @Column(name = "act_key")
    private String activationKey = "";

    @Column(name = "prefs")
    private String prefs = "";
    
    @Column(name = "act_flag")
    private boolean active = false;

    @Column(name = "enable_flag")
    private boolean enabled = true;

    @Column(name = "sha1pass")
    private String sha1pass = "";

    @Column(name = "password")
    private String passcrypt = "";

    @Column(name = "time_login")
    private GregorianCalendar loginTime;

    
    //--------------------------------------------------------------------------
    
    //<set name="roles" table="usr_role" sort="natural" lazy="false">
    //  <key column="grp_id"/>
    //  <many-to-many column="role_id" class="edu.ucla.mbi.imex.central.IcRole"/>
    //</set>

    @ManyToMany( fetch = FetchType.EAGER, cascade = CascadeType.ALL )
    @JoinTable( name = "usr_role", 
                joinColumns = { @JoinColumn(name = "usr_id") }, 
                inverseJoinColumns = { @JoinColumn(name = "role_id") } )
    Set<BkdRole> roles = new HashSet<BkdRole>();
    
    //--------------------------------------------------------------------------
    
    //<set name="groups" table="usr_group" sort="natural" lazy="false">
    //  <key column="grp_id"/>
    //  <many-to-many column="role_id" class="edu.ucla.mbi.imex.central.IcRole"/>
    //</set>

    @ManyToMany( fetch = FetchType.EAGER, cascade = CascadeType.ALL )
    @JoinTable( name = "usr_grp", 
                joinColumns = { @JoinColumn(name = "usr_id") }, 
                inverseJoinColumns = { @JoinColumn(name = "grp_id") } )    
    Set<BkdGroup> groups = new HashSet<BkdGroup>();
    
    //--------------------------------------------------------------------------
    
    public BkdUser() {}
    
    //--------------------------------------------------------------------------
    
    public BkdUser ( String login, String pass ){
        this.login = login;
        setPassword( pass );     
    }
    
    //--------------------------------------------------------------------------
    
    public BkdUser( User user ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info("BkdUser(User user) called on:" + user);

        setFirstName( user.getFirstName() );
        setLastName( user.getLastName() );
        setAffiliation( user.getAffiliation() );
        setTitle( user.getTitle() ); 
        setEmail( user.getEmail() );
        setLogin( user.getLogin() ); 
        setActivated( false );
        setEnabled( false );
        
        setActivationKey( user.getActivationKey() );
        setPassword( user.getPassword() );
        
        if ( user.getRoles() != null ) {    
            for( Iterator<Role> ir = user.getRoles().iterator();
                 ir.hasNext(); ) {
                
                Role r = ir.next();

                log.info("r:" + r);
                
                if( r instanceof BkdRole ){ 
                    roles.add( (BkdRole )r );
                } else { 
                    roles.add( new BkdRole( r ) );
                }
            }
        }
        
        if ( user.getGroups() != null ) {
            for( Iterator<Group> ig = user.getGroups().iterator();
                 ig.hasNext(); ){
                
                Group g = ig.next();

                log.info("g:" + g);
                
                
                if( g instanceof BkdGroup ){
                    groups.add( (BkdGroup) g );
                } else {
                    groups.add( new BkdGroup( g ) );
                }
            }
        }
    }
    
    //---------------------------------------------------------------------

    public int getId(){
        return id;
    }

    public void setId( int id ) {
        this.id = id;
    }

    //---------------------------------------------------------------------

    public void setLogin( String login ) {
        this.login = login;
    }
    
    public String getLogin() {
        return login;
    }

    
    //---------------------------------------------------------------------

    public void setFirstName( String name ) {
        this.firstName = name;
    }
    
    public String getFirstName() {
        return firstName;
    }

    //---------------------------------------------------------------------

    public void setLastName( String name ) {
        this.lastName = name;
    }

    public String getLastName() {
        return lastName;
    }

    //---------------------------------------------------------------------

    public void setTitle( String title ) {
        this.title = title;
    }
    
    public String getTitle() {
        return title;
    }
    
    //---------------------------------------------------------------------
    
    public void setEmail( String email ) {
        this.email = email;
    }
    
    public String getEmail() {
        return email;
    }

    //---------------------------------------------------------------------

    public void setAffiliation( String affiliation ) {
        this.affiliation = affiliation;
    }

    public String getAffiliation() {
        return affiliation;
    }

    
    //---------------------------------------------------------------------
    // account prefereces
    //-------------------

    public void setPrefs( String prefs ) {
        this.prefs = prefs;
    }
   
    public String getPrefs() {
        return prefs;
    }

    //---------------------------------------------------------------------
    // enable/disable account
    //-----------------------

    public void setEnabled( boolean enabled ) {
        this.enabled = enabled;
    }

    public boolean getEnabled() {
        return enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    //---------------------------------------------------------------------
    // acount activation
    //------------------

    public void setActivationKey() {

      	String key = "::" + UUID.randomUUID().toString() + "::";
        this.activationKey = key;
    }

    public void setActivationKey( String key ) {
        this.activationKey = key;
    }

    public boolean testActivationKey( String key ) {
	
        if ( key != null && activationKey != null &&
             key.equals( activationKey ) ) {
            return true;
	}
	
        return false;
    }

    public String getActivationKey() {
        return this.activationKey;
    }

    public void setActivated( boolean active ) {
        this.active = active;
    }

    public boolean getActivated() {
        return active;
    }

    public boolean isActivated() {
        return active;
    }
    
    //---------------------------------------------------------------------
    // user roles
    //-----------

    public Set<Role> getRoles() {

        Set<Role> ret = new TreeSet<Role>();
        
        if ( roles == null ) {
            roles = new TreeSet<BkdRole>();
        }
        ret.addAll(roles);
        return ret;
    }    

    public void setRoles( Set<Role> roles ) {

        this.roles = new TreeSet<BkdRole>();
        
        for( Iterator<Role> ir = roles.iterator();
             ir.hasNext(); ) {

            Role r = ir.next();

            if( r instanceof BkdRole ){
                this.roles.add( (BkdRole) r );
            } else {
                this.roles.add( new BkdRole(r) );
            }
        }
        
    }

    public void addRole( BkdRole role ) {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " addRole(BkdRole role)" + role );
        if(this.roles == null ){
            this.roles = new HashSet<BkdRole>();
        }
        this.roles.add( role );        
    }
    
    public void dropRoles( List<Role> roles ) {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " dropRoles(Role role) " + roles );
        if( this.roles == null ) return;
        
        for ( Iterator<Role> ir = roles.iterator(); ir.hasNext(); ){
            Role cr = ir.next();
            
            for ( Iterator<BkdRole> ior = this.roles.iterator();
                  ior.hasNext(); ){
                
                BkdRole cor = ior.next();
                if ( cr.getId() == cor.getId() ) {                    
                    this.roles.remove( cor );
                    break;
                }
            }
        }
        log.info( " dropRoles(Role role): final " + this );
    }

    public Set<String> getRoleNames(){

        Set<String> rnl = new HashSet<String>();

        if( roles != null ){
            for( Iterator<BkdRole> ir = roles.iterator();
                 ir.hasNext(); ) {
                rnl.add( ir.next().getName());
            }
        }

        return rnl;

    }
    
    //---------------------------------------------------------------------

    public Set<Role> getAllRoles() {
        
        Set<Role> all = new HashSet<Role>();

        if( roles != null ){
            all.addAll( roles );
        }
        
        if( groups != null ) {
            for( Iterator<BkdGroup> ig = groups.iterator(); 
                 ig.hasNext(); ) {
                BkdGroup g = ig.next();

                if ( g.getRoles() != null ) {
                    all.addAll( g.getRoles() );
                }
            }
        }
        return all;
    }
    
    public Set<String> getAllRoleNames(){

        Set<Role> rl = getAllRoles();
        Set<String> rnl = new HashSet<String>();

        if( rl != null ){
            for( Iterator<Role> ir = rl.iterator();
                 ir.hasNext(); ) {
                rnl.add( ir.next().getName());
            }
        }

        return rnl;
    }

    
    //---------------------------------------------------------------------
    // user groups
    //------------

    public Set<Group> getGroups() {

        Set<Group> ret = new TreeSet<Group>();
         
        if ( groups == null ) {
            groups = new TreeSet<BkdGroup>();
        }
        ret.addAll(groups);
        
        return ret;
    }    

    public void setGroups( Set<Group> groups ) {
        
        this.groups = new TreeSet<BkdGroup>();
        
        for( Iterator<Group> ir = groups.iterator();
             ir.hasNext(); ) {
            
            Group g = ir.next();
            if( g instanceof BkdGroup ){
                this.groups.add( (BkdGroup) g );
            } else {
                this.groups.add( new BkdGroup(g) );
            }
        }
    }
    
    public void addGroup( BkdGroup group ) {
        this.groups.add( group );        
    }


    
    
    public Set<String> getGroupNames(){
        
        Set<String> gnl = new HashSet<String>();

        if( groups != null ){
            for( Iterator<BkdGroup> ig = groups.iterator();
                 ig.hasNext(); ) {
                gnl.add( ig.next().getName() );
            }
        }
        
        return gnl;
    }
    
    //---------------------------------------------------------------------
    
    
    public String toStringX(){

        StringBuffer buffer = new StringBuffer();
	
        buffer.append("Id=");
        buffer.append(id);
        buffer.append(" Login="); 
        buffer.append(login);
        buffer.append(" First=");
        buffer.append(firstName);
        buffer.append(" Last=");
        buffer.append(lastName);
        
        return buffer.toString();
    }
    
    //--------------------------------------------------------------------------
    
    public void setPassword( String pass ) {
        
        // set encrypted password
        //-----------------------
        
        this.passcrypt =  pass;        
    }
   
    public String getPassword() {
        return passcrypt;
    }
    
    //---------------------------------------------------------------------

    
    public String getSha1pass(){
        return sha1pass;
    }

    public void setSha1pass( String pass ){
        this.sha1pass = pass;
    }

    public String getPassCrypt(){
        return passcrypt;
    }
    
    public void setPassCrypt( String pass ){
        this.passcrypt = pass;
    }
    
    public void setLoginTime( GregorianCalendar time) {
        this.loginTime = time;
    }

    public GregorianCalendar getLoginTime() {
        return this.loginTime;
    }
        
    private String encrypSHA1(String input ){
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] messageDigest = md.digest(input.getBytes());
            BigInteger no = new BigInteger(1, messageDigest);
            String hashtext = no.toString(16);
            while( hashtext.length() < 32 ){
                hashtext = "0" + hashtext;
            }
            return hashtext;
            
        }catch( NoSuchAlgorithmException e ){
            throw new RuntimeException(e);
        }
    }
    
    private String encrypSHA512( String input ){
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] messageDigestSHA512 = md.digest( input.getBytes() );
            BigInteger noSHA512 = new BigInteger(1, messageDigestSHA512);
            String hashSHA512 = noSHA512.toString(16);
            while (hashSHA512.length() < 128) {
                hashSHA512 = "0" + hashSHA512;
            }
            
            return hashSHA512;
            
        }catch( NoSuchAlgorithmException e ){
            throw new RuntimeException(e);
        }
    }
    
    public void encryptPassword( String pass ) {
       
        this.passcrypt = encrypSHA512( pass );                      
        this.sha1pass =  encrypSHA1( pass );
        
    }
    
    public boolean testPassword( String pass ) {
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( "Test Password: " );
        
        if( ( sha1pass == null || sha1pass.equals( "" )) &&
            ( passcrypt == null || passcrypt.equals( "" ) ) ) {
            return true;
        } 
        
        if( pass == null || pass.equals( "" )  ) {
            return false;
        }
        
        if( pass.startsWith( "SHA1:") && (pass.length() > 5 ) ){
            return testSHA1Password( pass.substring(5) );
        }
        
        if( passcrypt == null || passcrypt.equals( "" ) ){
            
            // update encrypted password
            
            if( testPassword( pass ) ){
                this.passcrypt = encrypSHA512( pass );
                setPassword("");
            }
        }
        
        if( sha1pass == null || sha1pass.equals( "" ) ){

            // update SHA1-encrypted password
                       
            this.encryptPassword( encrypSHA1(  pass ) );
        }
        
        // test SHA512
        
        return passcrypt.equals( encrypSHA512( pass ) );
    } 
 
    public boolean testSHA1Password( String pass ) {
        
        if( sha1pass == null || sha1pass.equals( "" )  ) {
            //return true;
            return false;
        }
        
        if( pass == null || pass.length() == 0 ) {
            return false;
        }
        
        return  sha1pass.equals( encrypSHA1(pass) );
    }
    
    public String toString() {
        
        StringBuffer sb = new StringBuffer();
	
        sb.append( " BkdUser(id=" + getId() );
        sb.append( " login=" + getLogin() );
        sb.append( " email=" + getEmail() );

        if( roles != null ){
            sb.append("; roles=[");
            for( Iterator ir = roles.iterator(); ir.hasNext(); ){
                sb.append( ir.next() );
            }
            sb.append("]");
        }

        if( groups != null ){
            sb.append("; groups=[");
            for( Iterator ig = groups.iterator(); ig.hasNext(); ){
                sb.append( ig.next() );
            }
            sb.append("]");
        }
        
        sb.append( ")" );
           
        return sb.toString();
    }
    
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
}
