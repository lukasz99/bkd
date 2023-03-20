package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("nfeature")
public class NodeFeat extends Feature{

    @Column(name="fk_node")
    private long nodeid;
    
    public void setNodeId( long id){
        this.nodeid = id;
    }

    public long getNodeId(){
        return this.nodeid;
    }
        
}
