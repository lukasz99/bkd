package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

import java.security.MessageDigest;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn (name="sclass", 
                      discriminatorType = DiscriminatorType.STRING)
@Table(name = "edge")
public class Edge implements Comparable<Edge>{

    private static String generator = "edge";
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="edge_pkey_seq")
    @SequenceGenerator( name="edge_pkey_seq", sequenceName="edge_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    @Column(name = "prefix")
    protected String prefix;
    
    @Column(name = "nacc")
    protected int nacc = 0;

    @Column(name = "version")
    String version = "";


    @ManyToMany(cascade = { CascadeType.ALL },fetch = FetchType.EAGER )
    @JoinTable(
        name = "lnode", 
        joinColumns = { @JoinColumn(name = "fk_edge") }, 
        inverseJoinColumns = { @JoinColumn(name = "fk_node") }        
    )
    
    Set<Node> lnodes = new HashSet<Node>();
       
    @Column(name = "name")
    String name = "";
    
    @Column(name = "label")
    String label = "";

    @Column(name = "nhash")
    String nhash = "";
    
    @Column(name = "comment")
    String comment ="";
    
    @Column(name = "status")
    String status ="";
    
    @Column(name = "t_cr")
    Date ctime;

    @Column(name = "t_mod")
    Date utime;
    
    public int compareTo( Edge o ){
        return this.getAc().compareTo( o.getAc() );        
    }
        
    public Edge() { }

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
        return prefix + Integer.toString(nacc) + "E";
    }

    public String getVersion(){
	return this.version;
    }

    public String setVersion(String version){
	return this.version = version;
    }


    public Set<Node> getNodeSet(){

        if( this.lnodes  == null ){
            this.lnodes = new HashSet<Node>();
        }         
        return lnodes; 
    }        

    public void setNodeSet( Set<Node> nset){
        this.lnodes = nset;
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

    public String getNhash(){
        return nhash;
    }

    public void setNhash( String nhash ){
        this.nhash = nhash;
    }

    public String getLabel(){
        return label == null ? "" : label;
    }
    
    public void setComment( String comment ){
        this.comment = comment;
    }

    public String getComment(){
        return comment == null ? "" : comment;
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

    public String rehash(){ 
    
        List<String> aclist = new ArrayList<String>();

        // calculate node hash
        //--------------------
        
        for( Node n: this.getNodeSet() ){
            aclist.add( n.getAc() ); 
        }

        this.nhash = Edge.getHash( aclist );
        return this.nhash;
    }


    public static String getHash( Set<String> acset ){
        return Edge.getHash( new ArrayList<String>( acset ) );  
    }

    
    public static String getHash( List<String> aclist){
        
        Collections.sort(aclist);
        
        StringBuffer strToHash = new StringBuffer(":");
        for( String ac : aclist) strToHash.append( ac + ":" );
        String nhash ="";
        try{
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            messageDigest.update(strToHash.toString().getBytes());
            nhash = new String(messageDigest.digest());
            
        } catch (Exception ex){
            // Should not happen
        }
        return nhash;
    }
    
}


