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

@Table(name = "alias")
public abstract class Alias{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="alias_pkey_seq")
    @SequenceGenerator( name="alias_pkey_seq", sequenceName="alias_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    /**
       CREATE TABLE alias (
          pkey bigint DEFAULT nextval(('"alias_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT alias_pk PRIMARY KEY,
          sclass character varying(32) DEFAULT ''::character varying,  -- node/protein/rna/gene/...
          fk_node bigint DEFAULT 0 NOT NULL,  -- foreign key
          fk_cvtype bigint DEFAULT 0 NOT NULL, -- unspecified xref type
          alias character varying(128) DEFAULT ''::character varying NOT NULL
       );
    **/
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_cvtype")
    CvTerm cvtype;
                
    @Column(name = "alias")
    String alias = "";
        
    public int compareTo( Alias o ){
        return this.getAlias().compareTo( o.getAlias() );        
    }
        
    public Alias() { }

    public Alias( CvTerm cvtype, String alias ){
        this.alias = alias;
        this.cvtype = cvtype;
    }
    
    public String getAlias(){
        return alias;
    }

    public void setAlias( String alias ){
        this.alias = alias;    
    }

    public CvTerm getCvType(){
        return cvtype;
    }

    public void setCvType( CvTerm term ){
        this.cvtype = term;
    }

    Map<String,Object> toMap(){

        Map<String,Object> map = new HashMap();
        map.put("alias",this.alias);

        if( cvtype != null){
            map.put("type-cv", this.cvtype.getAc());
            map.put("type-name", this.cvtype.getName());
        }
        return map;        
    }
    
    public String toString(){
        return "Alias:" + this.alias ;
    }        
}

