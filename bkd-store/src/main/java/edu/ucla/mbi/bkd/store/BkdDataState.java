package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Table(name = "datastate")
public class BkdDataState {

    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="datastate_pkey_seq")
    @SequenceGenerator( name="dataitem_pkey_seq", sequenceName="datastate_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private Integer pkey;

    public int getPkey(){
        return this.pkey.intValue();
    }
        
    public int getId(){
        return this.pkey.intValue();
    }        
    
    //---------------------------------------------------------------------

    @Column(name = "name") 
    private String name = "";

    public String getName() {
        return name;
    }

    public void setName( String name ) {
        this.name = name;
    }

    //---------------------------------------------------------------------

    @Column(name = "comments") 
    private String comments = "";

    public void setComments( String comments ) {
        this.comments = comments;
    }

    public String getComments() {
        return comments;
    }    


    //--------------------------------------------------------------------------
    // equality
    //---------

    public int hashCode() {
        return pkey;        
    }
    
    public boolean equals( Object obj ) {
        
        if( obj.getClass() != this.getClass() ){
            return false;
        }
        
        if( this.getId() == ((BkdDataState) obj).getId() ) {
            return true;
        }
        
        return false;
    }
    
}
