package edu.ucla.mbi.bkd.store;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.ucla.mbi.dxf15.*;

public abstract class QueryManager extends JDxfQuerySupport{

    public void initialize(){
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( "BkdQueryManager: initialize" );
    }

    public abstract edu.ucla.mbi.dxf15.DatasetType
        query( String query, String detail );
    
}
