package edu.ucla.mbi.bkd.access;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import edu.ucla.mbi.util.data.*;


import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Table(name = "grp")
public class BkdGroup extends Group{

    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="grp_pkey_seq")
    @SequenceGenerator( name="grp_pkey_seq", sequenceName="grp_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private int id;

    @Column(name = "label")
    private String label = "";

    @Column(name = "name")
    private String name = "";

    @Column(name = "comments")
    private String comments = "";

    @ManyToOne(fetch = FetchType.EAGER,               
               targetEntity=edu.ucla.mbi.bkd.access.BkdUser.class)
    @JoinColumn(name = "contact_uid")
    private User contactUser;

    @ManyToOne(fetch = FetchType.EAGER, targetEntity=edu.ucla.mbi.bkd.access.BkdUser.class)
    @JoinColumn(name = "admin_uid")
    private User adminUser;


    //<set name="roles" table="grp_role" sort="natural" lazy="false">
    //  <key column="grp_id"/>
    //  <many-to-many column="role_id" class="edu.ucla.mbi.imex.central.IcRole"/>
    //</set>

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable( name = "grp_role", 
                joinColumns = { @JoinColumn(name = "grp_id") }, 
                inverseJoinColumns = { @JoinColumn(name = "role_id") } )
    private Set<BkdRole> roles = new HashSet<BkdRole>();    

    //---------------------------------------------------------------------
    
    public BkdGroup() {}
    
    //---------------------------------------------------------------------

    public BkdGroup( Group group ) {
        setId( group.getId() );
        setLabel( group.getLabel() );
        setName( group.getName() );

        setComments( group.getComments() == null ? "" : group.getComments() );
        
        if ( group.getRoles() != null ) {

            this.roles = new HashSet<BkdRole>();
            
            for( Iterator<Role> ir = group.getRoles().iterator();
                 ir.hasNext(); ) {

                Role r = ir.next();
                if( r instanceof BkdRole){
                    this.roles.add( (BkdRole) r );
                } else {
                    this.roles.add( new BkdRole(r) );
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

    public String getLabel() {
        return label;
    }
    
    public void setLabel( String label ) {
        this.label = label;
    }

    //---------------------------------------------------------------------

    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    //---------------------------------------------------------------------

    
    public User getContactUser() {
        return contactUser;
    }
    
    public void setContactUser( User user ) {
        this.contactUser = user;
    }
    
    
    //---------------------------------------------------------------------

    
    public User getAdminUser() {
        return adminUser;
    }
    
    public void setAdminUser( User user ) {
        this.adminUser = user;
    }
    
    
    //---------------------------------------------------------------------
    
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
            this.roles.add( new BkdRole(r) );
        }        
    }
    
    
    //---------------------------------------------------------------------

    public void setComments( String comments ) {
        this.comments = comments;
    }

    public String getComments() {
        return comments;
    }
    
    //---------------------------------------------------------------------
    
    public String toString() {
	
        StringBuffer sb = new StringBuffer();
	
        sb.append( " BkdGroup(id=" + getId() );
        sb.append( " label=" + getLabel() );
        sb.append( " comments=" + getComments() );
        sb.append( "  roles=" + roles);
        sb.append( ")" );
        
        return sb.toString();
    }
}
