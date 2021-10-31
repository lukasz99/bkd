package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

import java.security.MessageDigest;

@Entity
@DiscriminatorValue("molint")
public class InteractionEdge extends Edge{
    
    private static String generator = "molint";
            
    public InteractionEdge(){ }

    public static String generator(){
        return generator;
    }    
}


