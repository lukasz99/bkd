package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("protein")
public class ProteinNode extends Node{

    private static String generator = "protein";
     
    @Column(name = "dip")
    String dip;
    
    @Column(name = "upr")
    String upr ="";

    @Column(name = "rsq_prot")
    String rsq ="";
        
    public ProteinNode() { }

    public static String generator(){
	return generator;
    }
    
    public String getAc(){
        return prefix + Long.toString(nacc) + "P";
    }
    
    public void setDip( String dip ){
        this.dip = dip;
    }

    public String getDip(){
        return dip;
    }
        
    public void setUpr( String upr ){
        this.upr = upr;
    }

    public String getUpr(){
        return upr == null ? "" : upr;
    }
    
    public void setRsq( String rsq ){
        this.rsq = rsq;
    }

    public String getRsq(){
        return rsq == null ?  "" : rsq;
    }
   
}


