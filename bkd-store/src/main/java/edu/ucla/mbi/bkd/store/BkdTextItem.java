package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn (name="sclass", 
                      discriminatorType = DiscriminatorType.STRING)
@Table(name = "textitem")
public class BkdTextItem implements BkdAclAware {
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="textitem_pkey_seq")
    @SequenceGenerator( name="textitem_pkey_seq", sequenceName="textitem_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private Long pkey;


    public long getPkey(){
        return this.pkey.longValue();
    }

    public long getId(){
        return this.pkey.longValue();
    }
    
    // constructor
    
    public BkdTextItem(){}
    
   //--------------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_owner")
    BkdUser owner;
    
    public BkdUser getOwner() {
        return owner;
    }

    public void setOwner( BkdUser owner ) {
        this.owner = owner;
    }

    //--------------------------------------------------------------------------
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_report")
    Report report;
    
    public Report getReport() {
        return report;
    }
    
    public void setReport( Report root ) {
        this.report = report;
    }
    
    //--------------------------------------------------------------------------

    @Column(name = "label") 
    String label = "";
    
    public void setLabel( String label ) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
   
    // NOTE: alias for the label field
    // -------------------------------

    public void setSubject( String subject ) {
        this.label = subject;
    }

    public String getSubject() {
        return label;
    }

    //--------------------------------------------------------------------------

    @Column(name = "body") 
    String body = "";

    public void setBody( String body ){
        this.body = body;
    }

    public String getBody(){
        return body;
    }

    //--------------------------------------------------------------------------

    @Column(name = "format") 
    String format = "TEXT";
    
    public void setFormat( String format ){
        this.format = format;
    }

    public String getFormat(){
        return this.format;
    }

    //--------------------------------------------------------------------------

    public String getBodyType(){

        if( "WIKI".equalsIgnoreCase("WIKI") ) return "WIKI";
        if( "HTML" .equalsIgnoreCase("HTML")) return "HTML";
        
        return "TEXT";
    }

    
    //--------------------------------------------------------------------------

    @Column(name = "t_cr")
    Date creationTime;

    public void setCrt(Date crt){
        this.creationTime = crt;
    }

    public void setCrt( GregorianCalendar crt) {
        this.creationTime = new java.sql.Date( crt.getTimeInMillis() );
    }
    
    public Date getCrt() {
        return this.creationTime;
    }
    
    public GregorianCalendar getCrtGC() {
        
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime( this.creationTime );
        return cal;
    }

    public String getCreateDateString(){

        if( creationTime == null ) {
            return "----/--/--";
        }
        
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime( this.creationTime );
        
        StringBuffer sb = new StringBuffer();
        sb.append( cal.get(Calendar.YEAR) );
        sb.append( "/");
        sb.append( cal.get( Calendar.MONTH ) < 9 ? "0" : "" ); 
        sb.append( cal.get( Calendar.MONTH ) + 1);
        sb.append( "/" );
        
        sb.append( cal.get( Calendar.DAY_OF_MONTH ) < 10 ? "0" : "" );
        sb.append( cal.get( Calendar.DAY_OF_MONTH) );
        
        return sb.toString();
    }
    
    public String getCreateTimeString(){

        if( this.creationTime == null ) {
            return "--:--:--";
        } 
        
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime( this.creationTime );
        
        StringBuffer sb = new StringBuffer();
        sb.append( cal.get(Calendar.HOUR_OF_DAY) < 10 ? "0" : "" );
        sb.append( cal.get(Calendar.HOUR_OF_DAY) );
        sb.append( ":");
        
        sb.append( cal.get(Calendar.MINUTE) < 10 ? "0" : "" );
        sb.append( cal.get(Calendar.MINUTE) );
        sb.append( ":");
        
        sb.append( cal.get(Calendar.SECOND) < 10 ? "0" : "" );
        sb.append( cal.get(Calendar.SECOND) );
        return sb.toString();
    }

    //--------------------------------------------------------------------------

    @ManyToMany( fetch = FetchType.EAGER, cascade = CascadeType.ALL )
    @JoinTable( name = "textitem_auser", 
                joinColumns = { @JoinColumn(name = "item_id") }, 
                inverseJoinColumns = { @JoinColumn(name = "auser_id") } )

    Set<BkdUser> adminUsrSet;

    public Set<BkdUser> getAdminUsers() {
        if ( adminUsrSet == null ) {
            adminUsrSet = new TreeSet<BkdUser>();
        }
        return adminUsrSet;
    }

    public void setAdminUsers( Set<BkdUser> users ) {
        this.adminUsrSet = users;
    }

    public Set<String> getAdminUserNames(){
        
        Set<String> aul = new HashSet<String>();

        if( adminUsrSet != null ){
            for( Iterator<BkdUser> iu = adminUsrSet.iterator();
                 iu.hasNext(); ) {
                aul.add( iu.next().getLogin() );
            }
        }
        return aul;
    }

    //--------------------------------------------------------------------------

    @ManyToMany( fetch = FetchType.EAGER, cascade = CascadeType.ALL )
    @JoinTable( name = "textitem_agroup", 
                joinColumns = { @JoinColumn(name = "item_id") }, 
                inverseJoinColumns = { @JoinColumn(name = "agroup_id") } )

    private Set<BkdGroup> adminGroupSet;

    public Set<BkdGroup> getAdminGroups() {
        if ( adminGroupSet == null ) {
            adminGroupSet = new TreeSet<BkdGroup>();
        }
        return adminGroupSet;
    }

    public void setAdminGroups( Set<BkdGroup> groups ) {
        this.adminGroupSet = groups;
    }

    public Set<String> getAdminGroupNames(){

        Set<String> agl = new HashSet<String>();

        if( adminGroupSet != null ){
            for( Iterator<BkdGroup> ig = adminGroupSet.iterator();
                 ig.hasNext(); ) {
                agl.add( ig.next().getName() );
            }
        }
        return agl;
    }

    //--------------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_state")    
    BkdDataState state;
    
    public BkdDataState getState() {
        return state;
    }

    public void setState( BkdDataState state ) {
        this.state = state;
    }

    //--------------------------------------------------------------------------

    @Column(name = "hidden")    
    boolean hidden = false;
    
    public boolean getHidden() {
        return hidden;
    }

    public boolean isHidden() {
        return hidden;
    }
    
    public void setHidden( boolean hidden ) {
        this.hidden = hidden;
    }

    //---------------------------------------------------------------------
    // BkdAclAware
    //-------------
    
    public boolean testAcl( Set<String> ownerMatch, 
                            Set<String> adminUserMatch, 
                            Set<String> adminGroupMatch ) {
        try{
            Logger log = LogManager.getLogger( this.getClass() );
            log.info( "ACL Test: owner= " + ownerMatch +
                      "\n           ausr= " + adminUserMatch +
                      "\n           agrp= " + adminGroupMatch );
            
            if ( ownerMatch == null && adminUserMatch == null && 
                 adminGroupMatch == null ) return true;
            
            // owner match
            //------------
            
            if ( ownerMatch != null ) {
                if ( ownerMatch.contains( getOwner().getLogin() ) ) {
                    log.info( "ACL Test: owner matched" );
                    return true;
                }
            }
            
            log.info( "ACL Test: no owner match");

            // admin user match
            //-----------------
            
            if ( adminUserMatch != null ) {
                for( Iterator<BkdUser> oi = getAdminUsers().iterator();
                     oi.hasNext(); ) {
                    
                    String usr = oi.next().getLogin();
                    if ( adminUserMatch.contains( usr ) ) {
                        log.info( "ACL Test: ausr matched" );
                        return true;
                    }
                }
            }
            log.info( "ACL Test: no ausr match");
            
            // admin group match
            //------------------

            if ( adminGroupMatch != null ) {
                
                for( Iterator<BkdGroup> gi = getAdminGroups().iterator();
                     gi.hasNext(); ) {
                    
                    String grp = gi.next().getLabel();
                    if ( adminGroupMatch.contains( grp ) ) {
                        log.info( "ACL Test: agrp matched" );
                        return true;
                    }
                }
            }
            
            log.info( "ACL Test: no agrp match");
            return false;
        } catch(Exception e){
            e.printStackTrace();
        }
        return false;
    }

    //-------------------------------------------------------------------------------
    // equality
    //---------

    public int hashCode() {
        if( pkey != null) return pkey.intValue(); 
        return 0;
    }
    
    public boolean equals( Object obj ) {

        if( obj == null || obj.getClass() != this.getClass() ){
            return false;
        }
        
        if( this.getId() == ((BkdDataItem)obj).getId() ) {
            return true;
        }
        return false;
    }
}
