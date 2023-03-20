package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

import javax.xml.bind.JAXB;
import javax.persistence.*;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.access.*;


@Entity
@DiscriminatorValue("logentry")
public class BkdLogEntry extends BkdTextItem {
    
    BkdLogEntry() { }
    
    public BkdLogEntry( BkdUser owner, Report report,
                        String label, String body){
        
        this.setOwner( owner );
        this.setReport( report );
        this.setLabel( label );
        this.setBody( body );
    }
}

