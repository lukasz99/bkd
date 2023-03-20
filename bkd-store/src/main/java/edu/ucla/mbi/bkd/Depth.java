package edu.ucla.mbi.bkd;

public class Depth{

    private final String name;
    private Depth(String name){ this.name = name; }
    public String toString(){ return name;}
    
    public static final Depth STUB = new Depth("STUB");
    public static final Depth BASE = new Depth("BASE");
    public static final Depth SEQ = new Depth("SEQ");
    public static final Depth FEAT = new Depth("FEAT");
    public static final Depth FEATL = new Depth("FEATL");
    public static final Depth REPT = new Depth("REPT");
    public static final Depth FULL = new Depth("FULL");
 
}
