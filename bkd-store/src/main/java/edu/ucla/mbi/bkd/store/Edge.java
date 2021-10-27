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
@DiscriminatorColumn (name="sclass", 
                      discriminatorType = DiscriminatorType.STRING)
@Table(name = "node")
public class Edge implements Comparable<Edge>{

    private static String generator = "node";
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="node_pkey_seq")
    @SequenceGenerator( name="node_pkey_seq", sequenceName="node_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    @Column(name = "prefix")
    protected String prefix;
    
    @Column(name = "nacc")
    protected int nacc = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cvtype")
    CvTerm cvtype;
        
    @Column(name = "version")
    String version = "";
        
    @Column(name = "name")
    String name = "";
    
    @Column(name = "label")
    String label = "";
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taxon")
    Taxon taxon;

    @OneToMany(mappedBy="node", fetch = FetchType.EAGER )
    private Set<NodeAlias> alias;

    @OneToMany(mappedBy="node", fetch = FetchType.EAGER)
    private Set<NodeAttr> attrs;
    
    @OneToMany(mappedBy="node",fetch = FetchType.EAGER)
    private Set<NodeXref> xrefs;

    @OneToMany(mappedBy="node",fetch = FetchType.EAGER)
    private Set<NodeReport> reps;

    @OneToMany(mappedBy="node",fetch = FetchType.EAGER)   
    private Set<NodeFeat> feats;
    
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
    
    public int compareTo( Edge o ){
        return this.getAc().compareTo( o.getAc() );        
    }
        
    public Edge() { }

    public static String generator(){
        return generator;
    }
    
    public void setPrefix( String prefix ){
        this.prefix = prefix;
    }

    public String getPrefix(){
        return this.prefix;
    }

    public void setNacc(int nacc ){        
        this.nacc = nacc;
    }

    public int getNacc(){
        return nacc;
    }
    
    public String getNs(){
        return this.prefix;
    }

    public String getAc(){
        return prefix + Integer.toString(nacc) + "N";
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

    public Set<NodeAlias> getAlias(){
	if(this.alias == null)
	    this.alias = new HashSet<NodeAlias>();	
        return this.alias;
    }

    public void setAlias(Set<NodeAlias> alias){
        this.alias = alias;
    }

    
    public Set<NodeAttr> getAttrs(){
	if(this.attrs == null)
	    this.attrs = new HashSet<NodeAttr>();	
        return this.attrs;
    }

    
    public void setAttrs(Set<NodeAttr> attrs){
        this.attrs = attrs;
    }

    
    public void setXrefs(Set<NodeXref> xrefs){
        this.xrefs = xrefs;
    }

    public Set<NodeXref> getXrefs(){
	if(this.xrefs == null)
	    this.xrefs = new HashSet<NodeXref>();	
        return this.xrefs;
    }

    public Set<NodeReport> getReps(){
	if(this.reps == null)
	    this.reps = new HashSet<NodeReport>();	
        return this.reps;
    }

    public void setProps(Set<NodeReport> reps){
        this.reps = reps;
    }

    public Set<NodeFeat> getFeats(){
	if(this.feats == null)
	    this.feats = new HashSet<NodeFeat>();	
        return this.feats;
    }

    public void setFeats(Set<NodeFeat> feats){
        this.feats = feats;
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


