package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("publication")
public class PubSource extends Source{

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
        
    @Column(name = "atitle")
    String atitle = "";

    @Column(name = "jtitle")
    String jtitle = "";

    @Column(name = "citation")
    String citation = "";

    @Column(name = "abstract")
    String abstr = "";

    @Column(name = "nlmid")
    String nlmid = "";

    @Column(name = "doi")
    String doi = "";

    @Column(name = "pmid")
    String pmid = "";
        
    public String getATitle(){
	return atitle;
    }

    public void setATitle( String atitle ){
        this.atitle = atitle;
    }
    
    public String getJTitle(){
        return jtitle;
    }
    
    public void setJTitle( String jtitle ){
        this.jtitle = jtitle;
    }
    
    public String getCitation(){
        return citation;
    }
    
    public void setCitation( String citation ){
        this.jtitle = citation;
    }
    
    public String getAbstract(){
        return abstr;
    }
    
    public void setAbstract( String abstr ){
        this.abstr = abstr;
    }
    
    public String getNlmid(){
        return nlmid;
    }
    
    public void setNlmid( String nlmid ){
        this.nlmid = nlmid;
    }
    
    public String getPmid(){
        return pmid;
    }
    
    public void setPmid( String pmid ){
        this.pmid = pmid;
    }
    
    public String getDoi(){
        if( doi.length() > 0 ){
	    return "https://doi.org/"+doi;
	} else {
            return "";
        }
    }
    
    public void setDoi( String doi ){
        try{
            String ndoi = doi.replaceAll("https://doi.org/","");
            this.doi = ndoi;
        } catch(Exception ex){
            // shouldn't happen
        }
    }

    public String toString(){
        return "PubSource: [PMID=" + this.getPmid() + " DOI=" + this.getDoi() + "]";
    }
    
}


