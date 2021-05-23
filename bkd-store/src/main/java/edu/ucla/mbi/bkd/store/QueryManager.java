package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import edu.ucla.mbi.dxf15.*;

public abstract class QueryManager extends JDxfQuerySupport{

    public void initialize(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdQueryManager: initialize" );
    }

    public abstract edu.ucla.mbi.dxf15.DatasetType
        query( String query, String detail );
    
}
