package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("fattr")
public class FeatureAttr extends Attribute{

    @ManyToOne
    @JoinColumn(name="fk_feat", nullable=false)
    private Feature feature;

    public FeatureAttr(){
        super();
    }
    
    public FeatureAttr( CvTerm cvtype, String value ){
        super( cvtype, value );
    }
    
    public void setFeature(Feature feature){
        this.feature = feature;
    }

    public Feature getFeature(){
        return this.feature;
    }
}
