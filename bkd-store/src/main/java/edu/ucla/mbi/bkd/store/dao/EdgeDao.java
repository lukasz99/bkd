package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;
import java.math.BigInteger;
import org.hibernate.*;

import edu.ucla.mbi.bkd.store.*;

public class EdgeDao extends AbstractDAO {
    
    public Edge getByPkey( int pk ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "EdgeDao->getByPkey: pkey(int)=" + pk  );
        
        try{
            Edge edge = (Edge) super.find( Edge.class, new Integer( pk ) );
            log.debug( "EdgeDao->getEdge: pk=" + pk + " ::DONE"  );
            return edge;
        } catch( Exception ex ){
            return null;
        } 
    }

    //--------------------------------------------------------------------------
    
    public Edge getByNac( int nac ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "EdgeDao->getByNac: nac(int)=" + nac  );
               
        Edge edge = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            
            Query query =
                session.createQuery( "from Edge e where " +
                                     " e.nacc = :nac order by e.id desc");
            query.setParameter( "nac", nac );
            query.setFirstResult( 0 );
            edge = (Edge) query.uniqueResult();
            tx.commit();
            
        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        log.info( "EdgeDao-> found: " + edge );
        return edge; 
    }
    
    //--------------------------------------------------------------------------

    public Edge getByAcc( String acc ){ 
        
        Edge edge = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {

            // convert accession to uid
            
            int id = Integer.parseInt(acc.replaceAll("[^0-9]", "") );
                      
            Query query =
                session.createQuery( "from Edge e where " +
                                     " e.nacc = :nacc ");
            query.setParameter( "nacc", id );
            query.setFirstResult( 0 );
            edge = (Edge) query.uniqueResult();
            tx.commit();

        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        return edge; 
    }
        
    //--------------------------------------------------------------------------
    
    public long getTotalCount() {

        long count = 0;

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {           
            Query query = session.createQuery( "select count(e) from Edge e" );
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

    public int getMaxAcc(){
        
        int maxacc = 0;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {           
            Query query = session.createQuery( "select max(e.nacc) from Edge e" );
            maxacc  = (Integer) query.uniqueResult();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {            
            session.close();
        }
        return maxacc;
    }
    
    public List<Integer> getIdList( int rfirst, int rmax ){

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        List<Integer> res = new ArrayList<Integer>();
        try {           
            SQLQuery query = session.createSQLQuery( "select nacc from edge order by nacc asc" );
            query.setFirstResult(rfirst);
            query.setMaxResults(rmax);

            List qres = query.list();
            for( Object co : qres ){
                res.add( ((Integer)co).intValue()  );                
            }
            
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {            
            session.close();
        }
        return res;
    }
    
    //---------------------------------------------------------------------

    public Edge updateEdge( Edge edge ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateEdge: " + edge.toString()  );
	
        if( edge == null ) return null;
	
        if( edge.getLabel() == null ) edge.setLabel( "" ); 

        if(edge.getCTime() == null){
            edge.setCTime(new Date());
        }
        edge.setUTime(new Date());
        
        super.saveOrUpdate( edge );
        return edge;
    }
}
