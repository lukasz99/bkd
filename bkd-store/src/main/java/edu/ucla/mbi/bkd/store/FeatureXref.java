package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("feature")
public class FeatureXref extends Xref{

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="fk_feature", nullable=true)
    private Feature feature;

    public void setFeature(Feature feature){
	this.feature = feature;
    }

    public Feature getFeature(){
	return this.feature;
    }
    

}


