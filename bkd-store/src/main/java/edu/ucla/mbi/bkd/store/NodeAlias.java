package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("nalias")
public class NodeAlias extends Alias{

    @ManyToOne
    @JoinColumn(name="fk_node", nullable=false)
    private Node node;

    public NodeAlias(){
        super();
    }
    
    public NodeAlias( CvTerm cvtype, String alias ){
        super(cvtype, alias);
    }
    
    public void setNode(Node node){
        this.node = node;
    }

    public Node getNode(){
        return this.node;
    }
}
