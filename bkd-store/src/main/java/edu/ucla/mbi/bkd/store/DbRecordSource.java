package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("dbrecord")
public class DbRecordSource extends Source{

    @Column(name = "ns")
    String ns;
    
    public String getNs(){
        return ns == null ? "" : ns;
    }
    
    public void setNs( String ns ){
        if( ns != null){
            this.ns = ns;
        }
    }

    @Column(name = "ac")
    String ac;
    
    public String getAc(){
        return ac == null ? "" : ac;
    }
    
    public void setAc( String ac ){
        if( ac != null){
            this.ac = ac;
        }
    }

    public String toString(){
        return "DbRecordSource: [NS=" + this.getNs() + " AC=" + this.getAc() + "]";
    }

    
}


