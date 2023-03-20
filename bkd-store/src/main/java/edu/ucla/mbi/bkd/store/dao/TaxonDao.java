package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;
import edu.ucla.mbi.bkd.dao.*;
import edu.ucla.mbi.bkd.store.*;

public class TaxonDao extends AbstractDAO {
    
    public Taxon getByPkey( int pkey ) { 
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "TaxonDao->getTaxon: pkey(int)=" + pkey  );
        
        try{
            Taxon taxon = (Taxon) super.find( Taxon.class, new Integer( pkey ) );
            log.info( "TaxonDao->getTaxon: pkey=" + pkey + " ::DONE"  );
            return taxon;
        } catch( Exception ex ){
            return null;
        } 
    }
    
    //--------------------------------------------------------------------------
    
    public Taxon getByTaxid( int taxid ) { 
        
        Taxon taxon = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "from Taxon t where " +
                                     " t.taxid = :taxid ");
            query.setParameter("taxid", taxid );
            query.setFirstResult( 0 );
            taxon = (Taxon) query.uniqueResult();
	    Logger log = LogManager.getLogger( this.getClass() );
            log.info( taxon );
	    
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error
	    Logger log = LogManager.getLogger( this.getClass() );
	    log.error( "-> getByTaxid: " + e );
        } finally {
            session.close();
        }
        return taxon; 
    }
    
    //--------------------------------------------------------------------------
    
    public long getCount() {
        
        long count = 0;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {           
            Query query = session.createQuery( "select count(t) from Taxon t" );
            count  = (Long) query.uniqueResult();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {            
            session.close();
        }
        return count;
    }
    
    //---------------------------------------------------------------------

    public Taxon updateTaxon( Taxon taxon ) { 

	Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateTaxon: taxon=" + taxon  );

        
        super.saveOrUpdate( taxon );
        return taxon;
    }
}
