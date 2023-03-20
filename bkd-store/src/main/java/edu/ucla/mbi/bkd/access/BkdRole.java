package edu.ucla.mbi.bkd.access;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import edu.ucla.mbi.util.data.*;
import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Table(name = "role")
public class BkdRole extends Role {
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="role_pkey_seq")
    @SequenceGenerator( name="role_pkey_seq", sequenceName="role_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private int id;
    
    @Column(name = "name")
    private String name; // = "USER";

    @Column(name = "comments")
    private String comments;

    @Column(name = "grp_unique")
    private boolean grp_ex;
    
    // preset roles
    //-------------

    public static final Role USER = new Role("user");
    public static final Role ADMIN = new Role("administrator");
    public static final Role EDIT = new Role("editor");

    public BkdRole() {
        //Logger log = LogManager.getLogger( BkdRole.class );
        //log.info( " BkdRole() called");
    }
    
    public BkdRole( String name ) {
        //Logger log = LogManager.getLogger( BkdRole.class );
        //log.info( " BkdRole(String name) called on:" + name);

        this.name = name;
    }

    //---------------------------------------------------------------------
    
    public BkdRole( Role role ) {
        //Logger log = LogManager.getLogger( BkdRole.class );
        //log.info( " BkdRole( Role role ) called on: " + role ); 
        setId( role.getId() );
        setName( role.getName() );
        setComments( role.getComments() == null ? "" : role.getComments() );
    }
    
    //---------------------------------------------------------------------

    public void setId( int id ) {
	this.id = id;
    } 

    public int getId() {
	return id;
    }
    
    //---------------------------------------------------------------------

    public void setName( String name ) {
	this.name = name;
    } 

    public String getName() {
	return name;
    }

    //---------------------------------------------------------------------

    public void setComments( String comments ) {
	this.comments = comments;
    } 

    public String getComments() {
	return comments;
    }

    //---------------------------------------------------------------------

    public void setGrpEx( boolean exclude ) {
	this.grp_ex = exclude;
    } 

    public boolean isGrpEx(){
        return grp_ex;
    }

    public boolean getGrpEx(){
        return grp_ex;
    }
    
    
    public String toString() {
        
	StringBuffer sb = new StringBuffer();
	
	sb.append( " BkdRole(id=" + getId() );
	sb.append( " name=" + getName() );
        if( isGrpEx() ) {
            sb.append( " (group-exclusive)");
        }        
	sb.append( " comments=" + getComments() );
	sb.append( ")" );

	return sb.toString();
    }

}
