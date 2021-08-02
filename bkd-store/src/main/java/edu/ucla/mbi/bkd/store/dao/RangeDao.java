package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;
import edu.ucla.mbi.bkd.store.*;

public class RangeDao extends AbstractDAO {
    
    /**
    public CvTerm getByPkey( int pkey ) { 
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "CvTermDao->getType: pkey(int)=" + pkey  );
        
        try{
            CvTerm type = (CvTerm) super.find( CvTerm.class, new Integer( pkey ) );
            log.debug( "CvTermDao->getCvTerm: pkey=" + pkey + " ::DONE"  );            
            return type;
        } catch( Exception ex ){
            return null;
        } 
    }
    **/
    
    //--------------------------------------------------------------------------
    
    
    public Range updateRange( Range range ){

        if(range.getCTime() == null){
            range.setCTime(new Date());
        }
        range.setUTime(new Date());

        super.saveOrUpdate( range );
        return range;
    }
}
