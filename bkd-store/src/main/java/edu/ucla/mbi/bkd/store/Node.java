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
@Table(name = "node")
public class Node implements Comparable<Node>{

    public static String STUB = "STUB";
    public static String BASE = "BASE";
    public static String SEQ = "SEQ";
    public static String FEAT = "FEAT";
    public static String FEATL = "FEATL";
    public static String REPT = "REPT";
    public static String FULL = "FULL";
    
    public static List<String> DEPTH =
        Arrays.asList( STUB, BASE, FEAT, REPT, FULL, FEATL );

    private static String generator = "node";
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="node_pkey_seq")
    @SequenceGenerator( name="node_pkey_seq", sequenceName="node_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

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
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taxon")
    Taxon taxon;

    @OneToMany(mappedBy="node", fetch = FetchType.EAGER)
    private Set<NodeAlias> alias;

    @OneToMany(mappedBy="node", fetch = FetchType.EAGER)
    private Set<NodeAttr> attrs;
    
    @OneToMany(mappedBy="node",fetch = FetchType.EAGER)
    private Set<NodeXref> xrefs;

    /*
    @OneToMany(mappedBy="node",fetch = FetchType.LAZY)
    private Set<NodeReport> reps;
    */
    /*
    @OneToMany(mappedBy="node",fetch = FetchType.EAGER)   
    //@OneToMany(fetch = FetchType.LAZY)
    //@JoinColumn(name = "fk_node")    
    private Set<NodeFeat> featsxxx;
    */

    @Column(name = "jval")
    String jval = "";
    
    @Column(name = "comment")
    String comment ="";

    @Column(name = "sequence")
    String sequence ="";

    @Column(name = "status")
    String status ="";

    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
    Date utime;
    
    public int compareTo( Node o ){
        return this.getAc().compareTo( o.getAc() );        
    }
        
    public Node() { }

    public Node( long pkey, int nacc, CvTerm cvtype, String label, String name, Taxon taxon ) {
        this.pkey = pkey;
        this.nacc = nacc;
        this.cvtype = cvtype;
        this.label = label;
        this.name = name;
        this.taxon = taxon;
        
    }

    public long getPkey(){
        return this.pkey;
    }
    
    public static String generator(){
        return generator;
    }
    
    public void setPrefix( String prefix ){
        this.prefix = prefix;
    }

    public String getPrefix(){
        return this.prefix;
    }

    public void setNacc(int nacc ){        
        this.nacc = nacc;
    }

    public int getNacc(){
        return nacc;
    }
    
    public String getNs(){
        return this.prefix;
    }

    public String getAc(){
        return prefix + Integer.toString(nacc) + "N";
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
    
    public Taxon getTaxon(){
        return taxon;
    }

    public void setTaxon( Taxon taxon ){
        this.taxon = taxon;
    }

    public Set<NodeAlias> getAlias(){
	if(this.alias == null)
	    this.alias = new HashSet<NodeAlias>();	
        return this.alias;
    }

    public void setAlias(Set<NodeAlias> alias){
        this.alias = alias;
    }
    
    public Set<NodeAttr> getAttrs(){
	if(this.attrs == null)
	    this.attrs = new HashSet<NodeAttr>();	
        return this.attrs;
    }
    
    public void setAttrs(Set<NodeAttr> attrs){
        this.attrs = attrs;
    }
    
    public Set<NodeXref> getXrefs(){
	if(this.xrefs == null)
	    this.xrefs = new HashSet<NodeXref>();	
        return this.xrefs;
    }

    public void setXrefs(Set<NodeXref> xrefs){
        this.xrefs = xrefs;
    }
    /*
    public Set<NodeReport> getReps(){
	if(this.reps == null)
	    this.reps = new HashSet<NodeReport>();	
        return this.reps;
    }
    
    public void setReps(Set<NodeReport> reps){
        this.reps = reps;
    }
    */
    /*
    public Set<NodeFeat> getFeats(){
        //if(this.featsxxx == null)
        //    this.featsxxx = new HashSet<NodeFeat>();       
        //return this.featsxxx;
        return new HashSet<NodeFeat>();
    }

    public void setFeats(Set<NodeFeat> feats){
        //this.featsxxx = feats;
    }
    */
    
    public void setComment( String comment ){
        this.comment = comment;
    }

    public String getComment(){
        return comment == null ? "" : comment;
    }

    public void setSequence( String sequence ){
        this.sequence = sequence;
    }

    public String getSequence(){
        return sequence == null ? "" : sequence;
    }
        
    public void setStatus( String status ){
        this.status = status;
    }

    public String getStatus(){
        return status == null ? "" : status;
    }

    public void setCTime( Date timestamp ){
        this.ctime = timestamp;
    }

    public Date getCTime(){
        return ctime;
    }

    public void setUTime( Date timestamp ){
        this.utime = timestamp;
    }

    public Date getUTime(){
        return utime;
    }

    public String toString(){
        return "[AC:" + this.getAc() +
            " name:" + name + " label:" + label +"]";
    }

    public Map<String, Object> toMap(){

        Map<String, Object> map = new HashMap<String,Object>();

        map.put( "ns", this.getNs() );
        map.put( "ac", this.getAc());

        if(this.getVersion().length() > 0){
            map.put("version",this.getComment());
        }
        
        if(this.getTaxon() != null ){
            map.put("taxon",this.getTaxon() );
        }
        
        if( this.getLabel().length() > 0 ){
            map.put("label",this.getLabel() );
        }
        
        if(this.getName().length() > 0){
            map.put("name",this.getName() );
        }

        if( this.cvtype != null){
            map.put( "type-name", this.cvtype.getName());
            map.put( "type-cv", this.cvtype.getAc());
        } else {
            
            Logger log = LogManager.getLogger( this.getClass() );
            log.info("cvtype: " + this.cvtype);
        }
        
        if(this.getComment().length() > 0){
            map.put("comment",this.getComment());
        }
        
        if(this.getSequence().length() > 0){
            map.put("sequence",this.getSequence());
        }

        if( this.getAlias().size() > 0 ){
            List<Object> allst = new ArrayList<Object>();
            for( Alias a: this.getAlias() ){
                allst.add( a.toMap() );
            }
            map.put("alias",allst );
        }

        if( this.getAttrs().size() > 0 ){
            List<Object> atlst = new ArrayList<Object>();
            for( Attribute a: this.getAttrs() ){
                atlst.add( a.toMap() );
            }
            map.put("attr",atlst );
        }
        
        if( this.getXrefs().size() > 0 ){
            List<Object> xlst = new ArrayList<Object>();
            for( Xref x: this.getXrefs() ){
                xlst.add( x.toMap() );
            }
            map.put("xref",xlst );
        }

        /*
        if( this.getFeats().size() > 0 ){
            List<Object> flst = new ArrayList<Object>();
            for( Feature f: this.getFeats() ){
                flst.add( f.toMap() );
            }
            map.put("feature",flst );


            
            map.put("feature",this.getFeats() );
        }
        */

        map.putAll(this.getJvalMap());
               
        return map;
    }
    
    public void setJval( String jval ){
        this.jval = jval;
    }

    public String getJval(){
        return jval;
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



