package edu.ucla.mbi.bkd.store;

import java.util.*;
import java.text.NumberFormat;

import edu.ucla.mbi.dxf15.*;

public class JDxfQueryHit {

    NodeType node;

    public NodeType getNode(){
        return node;
    }
    public void setNode( NodeType node){
        this.node = node;
    }

    Float score = null;
    
    public Float getScore(){
        return score;
    }
    
    public void setScore( Float score){
        this.score = score;
    }
    
    public void setScore( float score){
        this.score = new Float( score );
    }   
}
