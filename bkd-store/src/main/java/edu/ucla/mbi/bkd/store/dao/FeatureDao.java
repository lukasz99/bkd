package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;

import edu.ucla.mbi.bkd.store.*;

public class FeatureDao extends AbstractDAO {
    
    public Feature getByPkey( int pk ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "FeatureDao->getFeature: pkey(int)=" + pk  );
        
        try{
            Feature feat = (Feature) super.find( Feature.class, new Integer( pk ) );
            log.debug( "FeatureDao->getFeature: pk=" + pk + " ::DONE"  );
            
            return feat;
        } catch( Exception ex ){
            return null;
        } 
    }
        
    //--------------------------------------------------------------------------
    /**
    public Feature getByAccession( String accession ) { 
        
        Node node = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {

            // convert accession to uid
            
            int id = 0;

            if( accession.startsWith("DIP-") ){
                accession = accession.substring(4);
            }

            if( accession.endsWith("N") ){
                accession = accession.substring(0,accession.length()-1);
            }

            id = Integer.parseInt( accession );
                      
            Query query =
                session.createQuery( "from Node n where " +
                                     " n.dip = :id ");
            query.setParameter( "id", id );
            query.setFirstResult( 0 );
            node = (Node) query.uniqueResult();
            tx.commit();

        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        return null; // node; 
    }
    **/
    //--------------------------------------------------------------------------
    /**    
    public List<Node> getByXref( String ns, String acc ){ 
        
        List<Node> nodes =  null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "select n from Node n join n.xrefs x " + 
                                     "where x.ac=:acc and x.ns =:ns" );
            
            query.setParameter( "ns", ns );
            query.setParameter( "ac", acc );
            
            query.setFirstResult( 0 );
            nodes= (List<Node>) query.list();
            tx.commit();

        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }

        if( nodes != null ){
            return nodes;
        } else {
            return new ArrayList<Node>();
        }
    }
    **/
    //--------------------------------------------------------------------------

    public Feature updateFeature( Feature feat ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateFeature: " + feat.toString()  );
	
        if( feat == null ) return null;

        if(feat.getCTime() == null){
            feat.setCTime(new Date());
        }
        feat.setUTime(new Date());


        // get/persist node
        




        
        super.saveOrUpdate( feat );

        /*
        for(Range range: feat.getRanges() ){
            range.setFeature(feat);
            range.setCTime(feat.getCTime());
            range.setUTime(new Date());
            super.saveOrUpdate( range );
        }

        for(FeatureXref f: feat.getXrefs()){
            f.setFeature(feat);
            f.setCTime(feat.getCTime());
            f.setUTime(new Date());
            super.saveOrUpdate( f );
        }
        */
        return feat;
    }
}
