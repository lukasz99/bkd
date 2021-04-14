package edu.ucla.mbi.bkd.store;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.StringWriter;

import edu.ucla.mbi.dxf15.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

@Entity
@Table(name = "cvterm")
public class CvTerm{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="cvterm_pkey_seq")
    @SequenceGenerator( name="cvterm_pkey_seq", sequenceName="cvterm_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")
    private long pkey;

    @Column(name = "ns")
    String ns;

    @Column(name = "ac")
    String ac;

    @Column(name = "name")
    String name;

    @Column(name = "definition")
    String definition = "";
   
    public CvTerm(){}

    public CvTerm( CvTerm term ){

        this.ns = term.getNs();
        this.ac = term.getAc();
        this.name = term.getName();
        this.definition = term.getDefinition();
    }

    public CvTerm( String ns, String ac, String name ){
        this.ns = ns;
        this.ac = ac;
        this.name = name;
        this.definition = "";
    }
     
    public void setNs( String ns ){
        this.ns = ns;
    }

    public String getNs(){
        return ns;                
    }

    public void setAc( String ac ){
        this.ac = ac;
    }

    public String getAc(){
        return ac;                
    }

    public void setName( String name ){
        this.name = name;
    }
    
    public String getName(){
        return name == null ? "" : name;        
    }
    
    public void setDefinition( String definition ){
        this.definition = definition;
    }
    
    public String getDefinition(){
        return definition == null ? "" : definition;
    }

    public String toString(){
        return  "CV[" + ns + ":" + ac + "(" + name + ")]";
    }
}

