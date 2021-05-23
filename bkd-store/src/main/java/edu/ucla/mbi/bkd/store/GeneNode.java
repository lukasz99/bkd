package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf15.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("gene")
public class GeneNode extends Node{

    private static String generator = "gene";
    
    @Column(name = "rsq_gene")
    String rsq ="";
    
    @Column(name = "genid")
    String genid = "";
            
    public GeneNode() { }
        
    public static String generator(){
        return generator;
    }

    public String getAc(){
        return prefix + "-"+ Long.toString(ndid) + "G";
    }

    public void setRsq( String rsq ){
        this.rsq = rsq;
    }

    public String getRsq(){
        return rsq == null ?  "" : rsq;
    }
    
    public void setGenid( String genid ){
        this.genid = genid;
    }
    
    public String getGenid(){
        return genid == null ? "" : genid;
    }
            
}


