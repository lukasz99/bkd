package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;
import org.json.*;


//import edu.ucla.mbi.dxf20.*;

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

    public long getPkey(){
        return this.pkey;
    }
       
    /**
       CREATE TABLE feature (
         pkey bigint DEFAULT nextval(('"prop_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,
         sclass character varying(32) DEFAULT ''::character varying,  -- node/protein/rna/gene/...
         fk_type bigint DEFAULT 0 NOT NULL,   -- feature type
         fk_node bigint DEFAULT 0 NOT NULL,   -- foreign key (parent)
         fk_source bigint DEFAULT 0 NOT NULL,  -- unspecified property source
         fk_cval bigint DEFAULT 0 NOT NULL,    -- cv value
         dataset character varying(32) DEFAULT ''::character varying, -- subsets of features - ClinVar, dbSNP, CVDB,...
         jval text DEFAULT ''::text NOT NULL,  -- json value
         comment text DEFAULT ''::text NOT NULL,
         
         t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
         t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
       );
    **/

    //@OneToMany(mappedBy="feature", fetch = FetchType.EAGER,cascade = CascadeType.REMOVE )
    //private Set<Range> ranges;

    //--------------------------------------------------------------------------
    
    @OneToMany(cascade = CascadeType.ALL, fetch=FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name="fk_feature")
    private Set<Range> ranges;
    
    public Set<Range> getRanges(){
	if(this.ranges == null)
	    this.ranges = new HashSet<Range>();	
        return this.ranges;
    }

    public void setRanges(Set<Range> ranges){
        this.ranges = ranges;
    }    

    //--------------------------------------------------------------------------
    // feature pos/seq index: NOTE: set for single point feature location only
    
    @Column(name = "posidx")    
    private int posidx = 0;
    public int getPosIdx(){
        return this.posidx;
    }

    public void setPosIdx(int pos){
        this.posidx = pos;
    }       

    @Column(name = "seqidx")
    private String seqidx ="";
    public String getSeqIdx(){
        return this.seqidx;
    }

    public void setSeqIdx( String seq ){
        if( seq != null && seq.length() == 1 ){
            this.seqidx = seq;
        } else{
            this.seqidx ="";
        }
    }       
    
    //--------------------------------------------------------------------------
    
    @OneToMany(mappedBy="feature",fetch = FetchType.LAZY)  // LAZY better ?
    private Set<FeatureXref> xrefs;
    
    public Set<FeatureXref> getXrefs(){
	if(this.xrefs == null)
	    this.xrefs = new HashSet<FeatureXref>();	
        return this.xrefs;
    }

    public void setXrefs(Set<FeatureXref> xrefs){
        this.xrefs = xrefs;
    }    

    //--------------------------------------------------------------------------
    
    @OneToMany(mappedBy="feature",fetch = FetchType.LAZY) // LAZY better ?
    private Set<FeatureAttr> attrs;

    public Set<FeatureAttr> getAttrs(){
	if(this.attrs == null)
	    this.attrs = new HashSet<FeatureAttr>();	
        return this.attrs;
    }

    public void setAttrs(Set<FeatureAttr> attrs){
        this.attrs = attrs;
    }

    //--------------------------------------------------------------------------
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER) // LAZY better ?
    @JoinColumn(name = "fk_source")
    Source source;

    public void setSource( Source source ){
        this.source = source;
    }

    public Source getSource(){
        return source;
    }

    //--------------------------------------------------------------------------

    
    @Column(name = "dataset")
    String dataset ="";
    
    public void setDataset( String dataset ){
        this.dataset = dataset;
    }

    public String getDataset(){
        return dataset;
    }
    
    //--------------------------------------------------------------------------
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_type")
    
    CvTerm cvtype;
    
    public void setCvType( CvTerm cvtype ){
        this.cvtype = cvtype;
    }

    public CvTerm getCvType(){
        return this.cvtype;        
    }
    
    //--------------------------------------------------------------------------
    
    @Column(name = "label")
    String label ="";
    
    public void setLabel( String label ){
        this.label = label;
    }

    public String getLabel(){
        return label;
    }

    //--------------------------------------------------------------------------

    @Column(name = "name")
    String name ="";

    public void setName( String name ){
        this.name = name;
    }

    public String getName(){
        return name;
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
    
    @Column(name = "status")
    String status ="";

    public void setStatus( String status ){
        this.status = status;
    }

    public String getStatus(){
        return status == null ? "" : status;       
    }
    
    //--------------------------------------------------------------------------    

    @Column(name = "comment")
    String comment ="";

    public void setComment( String comment ){
        this.comment = comment;
    }

    public String getComment(){
        return comment == null ? "" : comment;
    }

    //--------------------------------------------------------------------------    

    @Column(name = "t_cr")
    Date ctime;

    public Date getCTime(){
        return ctime;
    }

    public void setCTime( Date timestamp ){
        this.ctime = timestamp;
    }
    
    //--------------------------------------------------------------------------    

    @Column(name = "t_mod")
    Date utime;
    
    public Date getUTime(){
        return utime;
    }

    public void setUTime( Date timestamp ){
        this.utime = timestamp;
    }

    //--------------------------------------------------------------------------    
    //--------------------------------------------------------------------------    
    
    public String toString(){

        String ret = " Feature:";
        /*
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
        */
        return ret;
    }
    
    public Map<String, Object> toMap(){
        return toMap( "ALL" );        
    }
    
    public Map<String, Object> toMap( String mode ){
        Map<String, Object> map = new HashMap<String,Object>();

        Logger log = LogManager.getLogger( this.getClass() );
        //log.info( "Feature->toMap: mode)=" + mode  );
        
        // name/label
        //-----------
        
        if( this.label != null && this.label.length() > 0 ){
            map.put("label", this.label );
        }
        
        if( this.name != null && this.name.length() > 0 ){
            map.put("name", this.name );
        }

        // cv type
        //--------

        if( this.getCvType() != null ){
            map.put( "type-cv", this.getCvType().getAc() );
            map.put( "type-name", this.getCvType().getName() );
        } else {
            map.put( "type-cv", "" );
            map.put( "type-name", "" );
        }
        
        // (clinical) significance
        //------------------------
                
        // parse json fields
        
        JSONObject fjo = null;

        try {
            fjo = new JSONObject( this.getJval() );                
        } catch ( JSONException jex ) {
                //log.info( "parsing error: " + jex.toString() );
        }                
                          
        // get clinical significance ac & value
        
        if( fjo != null && fjo.has("clinical-significance") ){
            JSONObject fcs =
                fjo.getJSONObject("clinical-significance");
            map.put("csig-cv", fcs.getString("vac") );
            map.put("csig-name", fcs.getString("value"));
        }

        if( fjo != null && fjo.has("var-seq") ){
            JSONObject fseq = fjo.getJSONObject("var-seq");
            map.put("var-seq", fseq.getString("value") );
        } else {
             map.put("var-seq", "all" );
        }
        
        if( fjo != null && fjo.has("var-dts") ){
            JSONObject fdts = fjo.getJSONObject("var-dts");
            map.put("var-dts", fdts.getString("value") );
        } else {
            map.put("var-dts","all" );
        }

        // ranges
        //-------
        map.put( "range", new ArrayList<Object>() );

        if( this.posidx != 0 ){  // single pos
            Map<String,Object>  rmap = new HashMap();
            rmap.put("pos", this.posidx);
            rmap.put("sequence", this.seqidx);
            
            ((List<Object>) map.get("range")).add( rmap );            
        } else {
            for( Range r: this.getRanges() ){
                ((List<Object>) map.get("range")).add( r.toMap() );             
            }
        }
        
         // attrs

         if( this.getAttrs().size() > 0 ) {
             map.put( "attr", new ArrayList<Object>() );
             
             for( Attribute a: this.getAttrs() ){
                 ((List<Object>) map.get("attr")).add( a );             
             }
         }
         // xrefs
         
         if(  this.getXrefs().size() > 0 ) {
             map.put( "xref", new ArrayList<Object>() );
         
             for( Xref x: this.getXrefs() ){
                 ((List<Object>) map.get("xref")).add( x.toMap() );             
             }
         } else {
             map.put( "xref", new ArrayList<Object>() ); // XXX
         }
                        
         return map;
    }

    
    public void dump(){
        System.out.println("Source:" + source);        
        System.out.println("jval:" + jval);
        System.out.println("Comment:" + comment);

    }

    
}


