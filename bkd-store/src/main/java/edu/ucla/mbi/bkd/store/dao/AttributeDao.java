package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.dao.*;

public class AttributeDao extends AbstractDAO {
    
    public Attribute getByPkey( int pk ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "AttributeDao->getAttribute: pkey(int)=" + pk  );
        
        try{
            Attribute attr = (Attribute) super.find( Attribute.class, new Integer( pk ) );
            log.debug( "AttributeDao->getAttribute: pk=" + pk + " ::DONE"  );
            
            return attr;
        } catch( Exception ex ){
            return null;
        } 
    }
    //--------------------------------------------------------------------------

    public Attribute updateAttribute( Attribute attr ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateAttribute: " + attr.toString()  );
	
        if( attr == null ) return null;
        
        super.saveOrUpdate( attr );        
        return attr;
    }
}
