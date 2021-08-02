package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;
import edu.ucla.mbi.bkd.store.*;

public class XrefDao extends AbstractDAO {
    
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
    
    //--------------------------------------------------------------------------
    
    public CvTerm getByAccession( String acc ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        CvTerm term = null;
        
        Session session = getCurrentSession();
        //Transaction tx = session.beginTransaction();
        try {
            Query query =
                session.createQuery( "from CvTerm t where " +
                                     " t.ac = :acc ");
            query.setParameter("acc", acc );
            query.setFirstResult( 0 );
            term = (CvTerm) query.uniqueResult();
            if( term != null ){
                log.debug(  "CvTerm.getByAccession(" + acc + "): " + term.toString());
            } else {
                log.debug(  "CvTerm.getByAccession(" + acc + "): NOT FOUND");
            }
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            //tx.commit();            
            session.close();
        }
        return term; 
    }
    //--------------------------------------------------------------------------
    
    public CvTerm getByName( String name ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        CvTerm term = null;
        
        Session session = getCurrentSession();
        //Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "from CvTerm t where " +
                                     " t.name = :name ");
            query.setParameter("name", name );
            query.setFirstResult( 0 );
            term = (CvTerm) query.uniqueResult();           
            if( term != null ){
                log.debug(  "Type.getByName(" + name + "): " + term.toString());
            } else {
                log.debug(  "Type.getByName(" + name + "): NOT FOUND");
            }
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            //tx.commit();
            session.close();
        }
        return term; 
    }
    
    //--------------------------------------------------------------------------
    
    public long getCount() {

        Logger log = LogManager.getLogger( this.getClass() );
        long count = 0;
        
        Session session = getCurrentSession();
        //Transaction tx = session.beginTransaction();
        
        try {           
            Query query = session.createQuery( "select count(t) from CvTerm t" );
            count  = (Long) query.uniqueResult();            
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            //tx.commit();                       
            session.close();
        }
        return count;
    }
    
    //---------------------------------------------------------------------

    **/

    public Xref updateXref( Xref xref ){

        if(xref.getCTime() == null){
            xref.setCTime(new Date());
        }
        xref.setUTime(new Date());

        super.saveOrUpdate( xref );
        return xref;
    }
}
