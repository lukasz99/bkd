package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("rna")
public class RnaNode extends Node{

    private static String generator = "rna";
        
    @Column(name = "rsq_rna")
    String rsq ="";
            
    public RnaNode() { }

    public static String generator(){
        return generator;
    }

    public String getAc(){
        return prefix + "-"+ Long.toString(ndid) + "R";
    }
     
    public void setRsq( String rsq ){
        this.rsq = rsq;
    }

    public String getRsq(){
        return rsq == null ?  "" : rsq;
    }
            
}


