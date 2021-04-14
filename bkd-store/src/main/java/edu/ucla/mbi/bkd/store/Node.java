package edu.ucla.mbi.bkd.store;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf15.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@Table(name = "node")
public class Node implements Comparable<Node>{

    private static String generator = "protein";
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="node_pkey_seq")
    @SequenceGenerator( name="node_pkey_seq", sequenceName="node_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    String prefix = "BKD-";
    
    @Column(name = "ndid")
    private long ndid;

    @ManyToOne
    @JoinColumn(name = "cvterm")
    CvTerm cvterm;
    
    @Column(name = "dip")
    String dip;
    
    @Column(name = "uprot")
    String uprot ="";

    @Column(name = "rfseq")
    String rfseq ="";
    
    @Column(name = "genid")
    String genid = "";
    
    @Column(name = "name")
    String name = "";
    
    @Column(name = "label")
    String label = "";
    
    @ManyToOne
    @JoinColumn(name = "taxon")
    Taxon taxon;

    @Column(name = "comment")
    String comment ="";

    @Column(name = "sequence")
    String sequence ="";

    @Column(name = "status")
    String status ="";

    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
    Date utime;
    
    public int compareTo( Node o){
        return dip.compareTo( o.getDip() );        
    }
        
    public Node() { }
        
    public void setDip( String dip ){
        this.dip = dip;
    }

    public String getDip(){
        return dip;
    }
    
    public String getNs(){
        return prefix;
    }

    public String getAc(){
        return prefix + "-"+ Long.toString(ndid) + "N";
    }
        
    public void setUprot( String uprot ){
        this.uprot = uprot;
    }

    public String getUprot(){
        return uprot == null ? "" : uprot;
    }
    
    public void setRfseq( String rfseq ){
        this.rfseq = rfseq;
    }

    public String getRfseq(){
        return rfseq == null ?  "" : rfseq;
    }
    
    public void setGenid( String genid ){
        this.genid = genid;
    }
    
    public String getGenid(){
        return genid == null ? "" : genid;
    }
    
    public void setName( String name ){        
        this.name = name == null ? "" : name;
    }

    public String getName(){
        return name == null ? "" : name;
    }
    
    public void setLabel( String label ){
        this.label = label == null ? "" : label;
    }

    public String getLabel(){
        return label == null ? "" : label;
    }
    
    public Taxon getTaxon(){
        return taxon;
    }

    public void setTaxon( Taxon taxon ){
        this.taxon = taxon;
    }

    public void setCvTerm( CvTerm cvterm ){
        this.cvterm = cvterm;
    }
    
    public void setComment( String comment ){
        this.comment = comment;
    }

    public String getComment(){
        return comment == null ? "" : comment;
    }

    public void setSequence( String sequence ){
        this.sequence = sequence;
    }

    public String getSequence(){
        return sequence == null ? "" : sequence;
    }
        
    public void setStatus( String status ){
        this.status = status;
    }

    public String getStatus(){
        return status == null ? "" : status;
    }

    public void setCTime( Date timestamp ){
        this.ctime = timestamp;
    }

    public Date getCTime(){
        return ctime;
    }

    public void setUTime( Date timestamp ){
        this.utime = timestamp;
    }

    public Date getUTime(){
        return utime;
    }

    public String toString(){
        return "[AC:" + this.getAc() +
            " name:" + name + " label:" + label +"]";
    }        
}


