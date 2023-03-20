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
@Table(name = "source")
public abstract class Source{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="source_pkey_seq")
    @SequenceGenerator( name="source_pkey_seq", sequenceName="source_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    /**
       CREATE TABLE source (   -- person/publication/online-record/institution
       pkey bigint DEFAULT nextval(('"source_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_fk PRIMARY KEY,
       sclass character varying(32) DEFAULT ''::character varying,
       fk_cvtype bigint DEFAULT 0 NOT NULL, -- unspecified source type		
       name character varying(256) DEFAULT ''::character varying NOT NULL,
       url character varying(128) DEFAULT ''::character varying NOT NULL,	

       atitle character varying(256) DEFAULT ''::character varying NOT NULL,	
       jtitle  character varying(64) DEFAULT ''::character varying NOT NULL,
       abstract text DEFAULT ''::text NOT NULL,
       nlmid character varying(16) DEFAULT ''::character varying NOT NULL,

       orcid character varying(32) DEFAULT ''::character varying NOT NULL,   -- skips https://orcid.org/
       doi character varying(32) DEFAULT ''::character varying NOT NULL,     -- skips https://doi.org/
       pmid character varying(16) DEFAULT ''::character varying NOT NULL,

       ns character varying(16) DEFAULT ''::character varying NOT NULL,  
       ac character varying(32) DEFAULT ''::character varying NOT NULL,

       comment text DEFAULT ''::text NOT NULL,
       t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
       t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
      );
    **/
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_cvtype")
    CvTerm cvtype;
        
    @Column(name = "name")
    String name = "";
    
    @Column(name = "url")
    String url = "";


    @Column(name = "comment")
    String comment ="";

    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
    Date utime;
            
    public Source() { }

    public abstract String toString();

    public long getPkey(){
        return this.pkey;
    }
    
    public String getName(){
        return name;
    }

    public void setName( String name ){
        this.name = name;
    }

    public CvTerm getCvType(){
        return cvtype;
    }

    public void setCvType( CvTerm term ){
        this.cvtype = term;
    }

    public String getUrl(){
        return url;
    }

    public void setUrl( String url ){
        this.url = url;
    }
      
    public String getComment(){
        return comment;
    }

    public void setComment( String comment ){
       this.comment = comment;
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
}


