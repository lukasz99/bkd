package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.xml.bind.JAXB;
import javax.persistence.*;

import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;

@Entity
@DiscriminatorValue("comment")
public class BkdComment extends BkdTextItem {
    
    BkdComment() {}
    
    public BkdComment( BkdUser owner, Report report,
                       String label, String body){
        
        this.setOwner( owner );
        this.setReport( report );
        
        this.setLabel( label );
        this.setBody( body );
    }
    
}
