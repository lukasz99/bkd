package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;

import edu.ucla.mbi.bkd.store.*;

public class AliasDao extends AbstractDAO {
    
    public Alias getByPkey( int pk ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "AliasDao->getAlias: pkey(int)=" + pk  );
        
        try{
            Alias alias = (Alias) super.find( Alias.class, new Integer( pk ) );
            log.debug( "AliasDao->getAlias: pk=" + pk + " ::DONE"  );
            
            return alias;
        } catch( Exception ex ){
            return null;
        } 
    }
    //--------------------------------------------------------------------------

    public Alias updateAlias( Alias alias ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateAlias: " + alias.toString()  );
	
        if( alias == null ) return null;
        
        super.saveOrUpdate( alias );        
        return alias;
    }

    public Alias deleteAlias( Alias alias ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->deleteAlias: " + alias.toString()  );
	
        if( alias == null ) return null;
        
        super.delete( alias );        
        return alias;
    }
}
