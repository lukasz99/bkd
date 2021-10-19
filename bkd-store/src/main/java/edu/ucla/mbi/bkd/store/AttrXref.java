package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("attr")
public class AttrXref extends Xref{

    @ManyToOne
    @JoinColumn(name="fk_attr", nullable=false)
    private Attribute attribute;

    public void setAttr(Attribute attr){
        this.attribute = attr;
    }

    public Attribute getAttr(){
	return this.attribute;
    }
    
}


