package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.access.*;


public class BkdAttachment extends BkdDataItem {
    
    BkdAttachment() { }
    
    public BkdAttachment( BkdUser owner, Report report,
                          String label, String body){
        
        this.setOwner( owner );
        this.setReport( report );
        
        this.setLabel( label );
        this.setBody( body );
    }
}

