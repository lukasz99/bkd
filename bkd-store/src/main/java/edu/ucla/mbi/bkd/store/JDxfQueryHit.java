package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.text.NumberFormat;

import edu.ucla.mbi.dxf20.*;

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
