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
@Table(name = "feature")
public abstract class Feature{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="feat_pkey_seq")
    @SequenceGenerator( name="feat_pkey_seq", sequenceName="feat_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    /**
       CREATE TABLE feature (
         pkey bigint DEFAULT nextval(('"prop_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,
         sclass character varying(32) DEFAULT ''::character varying,  -- node/protein/rna/gene/...
         fk_type bigint DEFAULT 0 NOT NULL,   -- feature type
         fk_node bigint DEFAULT 0 NOT NULL,   -- foreign key (parent)
         fk_source bigint DEFAULT 0 NOT NULL,  -- unspecified property source
         fk_cval bigint DEFAULT 0 NOT NULL,    -- cv value
         jval text DEFAULT ''::text NOT NULL,  -- json value
         comment text DEFAULT ''::text NOT NULL,
         t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
         t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
       );
    **/

    @OneToMany(mappedBy="feature", fetch = FetchType.EAGER,cascade = CascadeType.REMOVE )
    private Set<Range> ranges;

    
    public Set<Range> getRanges(){
	if(this.ranges == null)
	    this.ranges = new HashSet<Range>();	
        return this.ranges;
    }

    public void setRanges(Set<Range> ranges){
        this.ranges = ranges;
    }    

    @OneToMany(mappedBy="feature",fetch = FetchType.EAGER)
    private Set<FeatureXref> xrefs;
    
    public Set<FeatureXref> getXrefs(){
	if(this.xrefs == null)
	    this.xrefs = new HashSet<FeatureXref>();	
        return this.xrefs;
    }

    public void setXrefs(Set<FeatureXref> xrefs){
        this.xrefs = xrefs;
    }    

    @OneToMany(mappedBy="feature",fetch = FetchType.EAGER)
    private Set<FeatureReport> reps;

    public Set<FeatureReport> getReps(){
	if(this.reps == null)
	    this.reps = new HashSet<FeatureReport>();	
        return this.reps;
    }

    public void setReps(Set<FeatureReport> reps){
        this.reps = reps;
    }

    @OneToMany(mappedBy="feature",fetch = FetchType.EAGER)
    private Set<FeatureAttr> attrs;

    public Set<FeatureAttr> getAttrs(){
	if(this.attrs == null)
	    this.attrs = new HashSet<FeatureAttr>();	
        return this.attrs;
    }

    public void setAttrs(Set<FeatureAttr> attrs){
        this.attrs = attrs;
    }
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_source")
    Source source;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_type")
    CvTerm cvtype;
    
    @Column(name = "jval")
    String jval = "";
           
    @Column(name = "label")
    String label ="";

    @Column(name = "name")
    String name ="";

    @Column(name = "comment")
    String comment ="";

    @Column(name = "status")
    String status ="";

    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
    Date utime;


    public void setLabel( String label ){
        this.label = label;
    }

    public String getLabel(){
        return label;
    }

    public void setName( String name ){
        this.name = name;
    }

    public String getName(){
        return name;
    }

    public void setSource( Source source ){
        this.source = source;
    }

    public Source getSource(){
        return source;
    }

    public void setCvType( CvTerm cvtype ){
        this.cvtype = cvtype;
    }

    public CvTerm getCvType(){
        return this.cvtype;
    }
    
    public void setJval( String jval ){
        this.jval = jval;
    }

    public String getJval(){
        return jval;
    }

    public void setStatus( String status ){
        this.status = status;
    }

    public String getStatus(){
        return status == null ? "" : status;       
    }

    public void setComment( String comment ){
        this.comment = comment;
    }

    public String getComment(){
        return comment == null ? "" : comment;
    }
    
    public Date getCTime(){
        return ctime;
    }

    public void setCTime( Date timestamp ){
        this.ctime = timestamp;
    }

    public Date getUTime(){
        return utime;
    }

    public void setUTime( Date timestamp ){
        this.utime = timestamp;
    }

    public String toString(){

        String ret = " Feature:";
        if( ranges != null ){
            ret = ret + "[";
        
            for( Range r: ranges ){
                ret = ret + r.toString() + ";";
            }
            if( jval.length() > 0){
                ret = ret +" jval=" + jval;
            }
            ret = ret + "]";
        }
        
        return ret;
    }

    public void dump(){
        System.out.println("Source:" + source);        
        System.out.println("jval:" + jval);
        System.out.println("Comment:" + comment);

    }

    
}


