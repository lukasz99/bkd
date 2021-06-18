package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn (name="node_type", 
                      discriminatorType = DiscriminatorType.STRING)
@Table(name = "node")
public class Node implements Comparable<Node>{

    private static String generator = "node";
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="node_pkey_seq")
    @SequenceGenerator( name="node_pkey_seq", sequenceName="node_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    protected static String prefix = "BKD";
    
    @Column(name = "ndid")
    protected long ndid = 0;

    @ManyToOne
    @JoinColumn(name = "cvtype")
    CvTerm cvtype;
        
    @Column(name = "version")
    String version = "";
        
    @Column(name = "name")
    String name = "";
    
    @Column(name = "label")
    String label = "";
    
    @ManyToOne
    @JoinColumn(name = "taxon")
    Taxon taxon;

    @OneToMany(mappedBy="node")
    private Set<NodeXref> xrefs;
    
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
    
    public int compareTo( Node o ){
        return this.getAc().compareTo( o.getAc() );        
    }
        
    public Node() { }

    public static String generator(){
        return generator;
    }
    
    public static String getPrefix(){
	return prefix;
    }
    
    public void setId(long id ){        
        this.ndid = id;
    }

    public long  getId(){
        return ndid;
    }
    
    public String getNs(){
        return prefix;
    }

    public String getAc(){
        return prefix + "-"+ Long.toString(ndid) + "N";
    }

    public String getVersion(){
	return this.version;
    }

    public String setVersion(String version){
	return this.version = version;
    }
    
    public CvTerm getCvType(){
        return cvtype;
    }

    public CvTerm setCvType(CvTerm cvtype ){
        return this.cvtype = cvtype;
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

    public Set<NodeXref> getXrefs(){
	if(this.xrefs == null)
	    this.xrefs = new HashSet<NodeXref>();	
        return this.xrefs;
    }

    public void setXrefs(Set<NodeXref> xrefs){
        this.xrefs = xrefs;
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


