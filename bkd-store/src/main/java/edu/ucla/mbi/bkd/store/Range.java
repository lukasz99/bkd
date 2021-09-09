package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Table(name = "range")
public class Range{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="source_pkey_seq")
    @SequenceGenerator( name="source_pkey_seq", sequenceName="source_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    /**
       CREATE TABLE range (
         pkey bigint DEFAULT nextval(('"range_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,
         fk_feature bigint DEFAULT 0 NOT NULL,   -- foreign key (feature)
         start int DEFAULT 0 NOT NULL,
         fk_cvstart bigint DEFAULT 0 NOT NULL, -- unspecified beg type
         stop DEFAULT 0 NOT NULL,
         fk_cvstop bigint DEFAULT 0 NOT NULL, -- unspecified end type
         sequence text DEFAULT ''::text NOT NULL,
         t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
         t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
       );
    **/

    @ManyToOne
    @JoinColumn(name="fk_feature", nullable=false)
    private Feature feature;

    public void setFeature(Feature feature){
    this.feature = feature;
    }

    public Feature getFeature(){
    return this.feature;
    }
    
    @ManyToOne
    @JoinColumn(name = "fk_cvstart")
    CvTerm cvstart;

    @Column(name = "rstart")
    int start = 0;
    
    @ManyToOne
    @JoinColumn(name = "fk_cvstop")
    CvTerm cvstop;

    @Column(name = "rstop")
    int stop = 0;
    
    @Column(name = "sequence")
    String sequence = null;

    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
    Date utime;
            
    public Range() { }
    
    public int getStart(){
        return this.start;
    }

    public void setStart( int start ){
        this.start = start;
    }

    public CvTerm getCvStart(){
        return cvstart;
    }

    public void setCvStart( CvTerm term ){
        this.cvstart = term;
    }
    
    public int getStop(){
        return this.stop;
    }

    public void setStop( int stop ){
        this.stop = stop;
    }

    public CvTerm getCvStop(){
        return cvstop;
    }

    public void setCvStop( CvTerm term ){
        this.cvstop = term;
    }
    
    public String getSequence(){
        return sequence;
    }

    public void setSequence( String seq ){
        this.sequence = seq;
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
        return "start=" + String.valueOf(this.start) + " end=" + String.valueOf(stop) + "seq=" + sequence;
    }
}


