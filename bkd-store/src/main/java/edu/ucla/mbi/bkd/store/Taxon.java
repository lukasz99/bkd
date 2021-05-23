package edu.ucla.mbi.bkd.store;   

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf15.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Table(name = "taxon")
public class Taxon{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="taxon_pkey_seq")
    @SequenceGenerator( name="taxon_pkey_seq", sequenceName="taxon_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long  pkey;
    
    @Column(name = "taxid")
    int taxid;
    
    @Column(name = "sciname")
    String sciname ="";
    
    @Column(name = "comname")
    String comname ="";
    
    public Taxon() { }

    public Taxon( int taxid, String sciname, String comname ){
        this.taxid = taxid;
        this.sciname = sciname;
        this.comname = comname;
    }
    
    public Taxon( Taxon taxon ){
        this.taxid = taxon.getTaxid();
        this.sciname = taxon.getSciName();
        this.comname = taxon.getComName();
    }
    
    public void setTaxid(int taxid){
        this.taxid = taxid;
    }

    public int getTaxid(){
        return taxid;                
    }
    
    public void setSciName( String name ){
        this.sciname = name;
    }
    
    public String getSciName(){
        return sciname == null ? "" : sciname;        
    }
    
    public void setComName( String name ){
        this.comname = name;
    }
    
    public String getComName(){
        return comname == null ? "" : comname;
    }
    
    public String toString(){
        return  "TAXON: TAXID:" + taxid + " SN:" + sciname + " CN:" + comname;
    }
}

