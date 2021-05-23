package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.persistence.*;

@Entity
@Table(name = "ident")
public class IdGenerator{
    
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="ident_pkey_seq")
    @SequenceGenerator( name="ident_pkey_seq", sequenceName="ident_pkey_seq",
                       allocationSize=1)
                       
    @Column(name = "pkey")
    private int pkey;

    @Column(name = "name")
    String name;
    
    @Column(name = "idmax")
    int idmax;

    @Column(name = "prfix")
    String prefix;

    @Column(name = "ptfix")
    String pstfix;

    IdGenerator() { }

    public IdGenerator( String name, String prefix, String pstfix, int idmax ){
        this.name = name;
        this.prefix = prefix;
        this.pstfix = pstfix;
        this.idmax = idmax;        
    }
    
    
    private void setPkey(int pk){
        this.pkey = pkey;        
    }

    public int getPkey(){
        return pkey;
    }
    
    private void setName(String name){
        this.name = name;       
    }

    public String getName(){
        return name;
    }
    
    public void setPrefix( String prefix ){
        this.prefix = prefix;
    }
    
    public String getPrefix(){
        return prefix == null ? "" : prefix;        
    }
    
    public void setPstfix( String pstfix ){
        this.pstfix = pstfix;
    }
    
    public String getPstfix(){
        return pstfix == null ? "" : pstfix;        
    }
    
    public void setIdMax( int idmax){
        this.idmax = idmax;
    }

    public int getIdMax(){
        return this.idmax;
    }
    
    public String toString(){
        return  "IDGEN: PK:" + Long.toString(pkey) + " Type:"+ name + " IDMAX:"+ idmax;        
    }
}

