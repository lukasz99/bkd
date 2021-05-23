package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.text.NumberFormat;

import edu.ucla.mbi.bkd.store.dao.*;
import edu.ucla.mbi.dxf15.*;

public class BkdQueryManager extends QueryManager{
    
    public edu.ucla.mbi.dxf15.DatasetType
        query( String query, String detail ) {
	
	Logger log = LogManager.getLogger( this.getClass() );
	log.info( "DipQueryManager: query called" );
        log.info( "DipQueryManager: query= " + query );
        log.info( "DipQueryManager: detail=" + detail );
       
	if( query != null ) {

            // MIQLX
            //------

            Map<String,List<String>> miqlx = null;

            //if( query != null && query.indexOf( " Miqlx" ) > -1 ){
            //    MiqlxFilter mf = new MiqlxFilter();
            //    query = mf.process( query );
            //     miqlx = mf.getMiqlx();
            //}
	    
            log.info("query:" + query +":mqlx:" + miqlx + ":");
            
	    try {

                // run query
                


                
                // build hit list
                
                List<JDxfQueryHit> hits = new ArrayList<JDxfQueryHit>();

                // return results
                
                return dxfResult( query, hits );
                
            } catch (Exception ex) {
                ex.printStackTrace();
            }
	}
	return null;
    }
    
}
