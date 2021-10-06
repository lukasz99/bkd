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
@Table(name = "report")
public abstract class Report{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="rep_pkey_seq")
    @SequenceGenerator( name="rep_pkey_seq", sequenceName="rep_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    /**
       CREATE TABLE report (
         pkey bigint DEFAULT nextval(('"prop_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,

         prop_type character varying(32) DEFAULT ''::character varying,  -- node/protein/rna/gene/...
         rpid bigint DEFAULT 0 NOT NULL,  -- public identifier
         fk_node bigint DEFAULT 0 NOT NULL,   -- foreign key (parent: node)
         fk_feature bigint DEFAULT 0 NOT NULL,   -- foreign key (parent: feature)
         fk_source bigint DEFAULT 0 NOT NULL,  -- unspecified report source
         fk_cval bigint DEFAULT 0 NOT NULL,    -- cv value
         jval text DEFAULT ''::text NOT NULL,  -- json value
         comment text DEFAULT ''::text NOT NULL,
         t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
         t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
       );
    **/

    private static String generator = "report";
    

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
    
    public Report(){ }
    
    public static String generator(){
        return generator;
    }
    
    public String getPrefix(){
        return this.prefix;
    }

    public void setPrefix( String prefix ){
        this.prefix = prefix;
    }
    
    public void setNacc(int nacc ){        
        this.nacc = nacc;
    }

    public int getNacc(){
        return this.nacc;
    }
    
    public String getNs(){
        return prefix;
    }

    public String getAc(){
        return prefix + Integer.toString(nacc) + "R";
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
        
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_source")
    Source source;
    
    @Column(name = "jval")
    String jval = "";

    @OneToMany(mappedBy="report",fetch = FetchType.EAGER)
    private Set<ReportXref> xrefs;
    
    public Set<ReportXref> getXrefs(){
        if(this.xrefs == null)
            this.xrefs = new HashSet<ReportXref>();	
        return this.xrefs;
    }
    
    public void setXrefs(Set<ReportXref> xrefs){
        this.xrefs = xrefs;
    }
    
    @Column(name = "comment")
    String comment ="";

    @Column(name = "status")
    String status ="";

    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
        Date utime;

    public void setSource( Source source ){
        this.source = source;
    }

    public Source getSource(){
        return source;
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

        StringBuffer sbuff = new StringBuffer();
        
        sbuff.append("Report:   AC=" + this.getAc()+";");
        sbuff.append(" Type=" + this.getCvType().toString()+";");
        sbuff.append(" Label=" + this.getLabel()+"\n");
        
        return sbuff.toString();
    }

    public Map<String,Map<String,String>> getJvalMap(){
        Map<String, Map<String,String>> jmap = null;
        
        try{
            
            JSONObject jom = new JSONObject( this.jval );
            jmap = new HashMap<String, Map<String,String>>();
            
            for( Iterator<String> i = jom.keys(); i.hasNext();){ 
                String key = i.next();
                JSONObject cjo = (JSONObject) jom.get(key);                    
                Map<String,String> cval = new HashMap<String, String>();
                for( Iterator<String> ci = cjo.keys(); ci.hasNext();){
                    String ckey = ci.next();
                    String ccval = cjo.getString(ckey); 
                    cval.put( ckey, ccval );
                }
                jmap.put(key,cval);
            }
            return jmap;
        }catch( JSONException jx ){
            // should not happen
        }
        return new HashMap<String, Map<String,String>>();
    }    
}


