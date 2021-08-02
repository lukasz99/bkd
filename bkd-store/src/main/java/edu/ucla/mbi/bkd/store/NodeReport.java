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

    @ManyToOne
    @JoinColumn(name="fk_node", nullable=false)
    private Node node;

    public void setNode(Node node){
	this.node = node;
    }

    public Node getNode(){
	return this.node;
    }
    

}

