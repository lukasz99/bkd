package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

import org.json.*;

@Entity
@DiscriminatorValue("nfrep")
public class NFReport extends Report{

    
    
    @Column(name="fk_node")
    long node_id;
    public void setNodeId(long id){
        this.node_id = id;
    }
    
    public long getNodeId(){
        return this.node_id;
    }

    @Column(name="fk_feat")
    long feature_id;
    
    public void setFeatureId(long id){
        this.feature_id = id;
    }
    
    public long getFeatureId(){
        return this.feature_id;
    }

    public String toString(){          
        return "NFReport: Node: " + node_id + " Feature:" + feature_id;
    }
   
}

    

