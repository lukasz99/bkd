package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("nrep")
public class NodeReport extends Report{

    @Column(name="fk_node", insertable=false, updatable=false)
    long node_id;
    
    public void setNodeId(long id){
        this.node_id =id;
    }

    public long getNodeId(){
        return this.node_id;
    }
    
}

