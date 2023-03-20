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

@Table(name = "attribute")
public abstract class Attribute{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="attr_pkey_seq")
    @SequenceGenerator( name="attr_pkey_seq", sequenceName="attr_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    /**
       CREATE TABLE attribute (
          pkey bigint DEFAULT nextval(('"alias_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT alias_pk PRIMARY KEY,
          sclass character varying(32) DEFAULT ''::character varying,  -- node/protein/rna/gene/...
          fk_node bigint DEFAULT 0 NOT NULL,  -- foreign key
          fk_cvtype bigint DEFAULT 0 NOT NULL, -- unspecified xref type
          fk_source bigint DEFAULT 0 NOT NULL,  -- unspecified property source
          value character text DEFAULT ''::text NOT NULL
       );
    **/
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_cvtype")
    CvTerm cvtype;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_source")
    Source source;
    
    @Column(name = "value")
    String value = "";
        
    public int compareTo( Attribute o ){
        return this.getValue().compareTo( o.getValue() );        
    }
        
    public Attribute() { }

    public Attribute( CvTerm cvtype, String value ){
        this.cvtype = cvtype;
        this.value = value;
    }


    @OneToMany(mappedBy="attribute",fetch = FetchType.EAGER)
    private Set<AttrXref> xrefs;

    public Set<AttrXref> getXrefs(){
	if(this.xrefs == null)
	    this.xrefs = new HashSet<AttrXref>();	
        return this.xrefs;
    }

    public void setXrefs(Set<AttrXref> xrefs){
        this.xrefs = xrefs;
    }    
    
    public String getValue(){
        return value;
    }

    public void setValue( String value ){
        this.value = value;    
    }

    public CvTerm getCvType(){
        return cvtype;
    }

    public void setCvType( CvTerm term ){
        this.cvtype = term;
    }

    public void setSource( Source source ){
        this.source = source;
    }

    public Source getSource(){
        return source;
    }

    public Map<String, Object> toMap(){

        Map<String, Object> map = new HashMap<String,Object>();

        map.put( "value", this.value );

        if( this.cvtype != null){
            map.put( "type-name", this.cvtype.getName());
            map.put( "type-cv", this.cvtype.getAc());
        }

        if( this.getXrefs().size() > 0 ){
            List<Object> xlst = new ArrayList<Object>();
            for( Xref x: this.getXrefs() ){
                xlst.add( x.toMap() );
            }
            map.put("xref",xlst );
        }
        return map;
    }
    
    public String toString(){
        return "Atrribute:" + this.value ;
    }        
}

