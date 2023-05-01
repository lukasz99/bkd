package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;
import org.json.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity

@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn (name="sclass",
                      discriminatorType = DiscriminatorType.STRING)

@Table(name = "xref")
public abstract class Xref{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="xref_pkey_seq")
    @SequenceGenerator( name="xref_pkey_seq", sequenceName="xref_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    /**
       CREATE TABLE xref (
       pkey bigint DEFAULT nextval(('"xref_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_fk PRIMARY KEY,
       sclass character varying(32) DEFAULT ''::character varying,  -- node/experiment/evidence/... 
       node_fk bigint DEFAULT 0 NOT NULL,   -- foreign key (parent)                                                                                                                    
       feature_fk bigint DEFAULT 0 NOT NULL,   -- foreign key (parent)                                                                                                                    
       cvtype bigint DEFAULT 0 NOT NULL, -- unspecified xref type                                                                                                                   
       srckey DEFAULT 0 NOT NULL,        -- xref source                                                                                                                             
       ns character varying(8) DEFAULT ''::character varying NOT NULL,
       ac character varying(32) DEFAULT ''::character varying NOT NULL,
       url character varying(128) DEFAULT ''::character varying NOT NULL,
       jval text DEFAULT ''::text NOT NULL,  -- json value
       comment text DEFAULT ''::text NOT NULL,
       t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
       t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
       );
    **/
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_cvtype")
    CvTerm cvtype;
        
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_source")
    Source source;
        
    @Column(name = "ns")
    String ns = "";
    
    @Column(name = "ac")
    String ac = "";

    @Column(name = "url")
    String url ="";

    @Column(name = "comment")
    String comment ="";

    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
    Date utime;
    
    public int compareTo( Node o ){
        return this.getAc().compareTo( o.getAc() );        
    }
        
    public Xref() { }

    
    public String getNs(){
        return ns;
    }

    public void setNs( String ns ){
        this.ns = ns;
    }

    public String getAc(){
        return ac;
    }

    public void setAc( String ac ){
        this.ac = ac;
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


    //--------------------------------------------------------------------------

    @Column(name = "jval")
    String jval = "";
           
    public void setJval( String jval ){
        this.jval = jval;
    }

    public String getJval(){
        return jval;
    }

    //--------------------------------------------------------------------------
    
    public void setSource( Source source ){
        this.source = source;
    }

    public Source getSource(){
        return source;
    }

    public void setUrl( String  url ){
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

    public Map<String, Object> toMap(){

        Map<String, Object> map = new HashMap<String,Object>();


        map.put("ns", this.ns );
        map.put("ac", this.ac );
        if( this.cvtype != null){
            map.put("type-name", this.cvtype.getName() );
            map.put("type-cv", this.cvtype.getAc() );
        }

        if( this.jval != null && this.jval.length() > 0 ){

            try{
                JSONObject jval = new JSONObject( this.jval );
                for( Iterator<String> keys = jval.keys(); keys.hasNext(); ){ 
                    String jvName = keys.next();
                    
                    JSONObject  jvObject = jval.getJSONObject( jvName );
                    
                    map.put( jvName, jvObject.getString( "value" ) );
                            }
            } catch( JSONException jx ){
                Logger log = LogManager.getLogger( this.getClass() );
                log.info( "JSONException: ", this.jval );
            }
        }
        
        return map;
    }
    
    public String toString(){
        return "[NS:" + ns + " AC:" + ac +"]";
    }        
}


