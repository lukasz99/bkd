package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("person")
public class PersonSource extends Source{

    /**
       CREATE TABLE source (   -- person/publication/database
       pkey bigint DEFAULT nextval(('"source_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_fk PRIMARY KEY,
       source_type character varying(32) DEFAULT ''::character varying,
       cvtype bigint DEFAULT 0 NOT NULL, -- unspecified source type		
       name character varying(256) DEFAULT ''::character varying NOT NULL,
       url character varying(128) DEFAULT ''::character varying NOT NULL,	

       atitle character varying(256) DEFAULT ''::character varying NOT NULL,	
       jtitle  character varying(64) DEFAULT ''::character varying NOT NULL,
       abstract text DEFAULT ''::text NOT NULL,
       nlmid character varying(16) DEFAULT ''::character varying NOT NULL,

       orcid character varying(32) DEFAULT ''::character varying NOT NULL,   -- skips https://orcid.org/
       doi character varying(32) DEFAULT ''::character varying NOT NULL,     -- skips https://doi.org/
       pmid character varying(16) DEFAULT ''::character varying NOT NULL,

       comment text DEFAULT ''::text NOT NULL,
       t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
       t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
      );
    **/

    @Column(name = "orcid")
    String orcid = "";

    public String getOrcid(){
        if( orcid.length() > 0 ){
            return "https://orcid.org/"+orcid;
        } else {
            return "";
        }
    }

    public void setOrcid( String orcid ){
        try{
            String norcid = orcid.replaceAll("https://orcid.org/","");
            this.orcid = orcid;
        } catch(Exception ex){
            // shouldn't happen
        }
    }

    
    @Column(name = "email")
    String email = "";
    
    public String getEmail(){
        return email;
    }

    public void setEmail( String email ){
        this.email = email;
    }

    public String toString(){
        return "PersonSource: [ORCID=" + this.getOrcid() + "]";
    }

    
    
}


