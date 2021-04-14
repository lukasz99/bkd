package edu.ucla.mbi.bkd.store.dao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.*;
import java.util.*;

import org.hibernate.*;

import edu.ucla.mbi.bkd.store.*;

public class NodeDao extends AbstractDAO {
    
    public Node getByPkey( int pk ){ 

        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.debug( "NodeDao->getNode: pkey(int)=" + pk  );
        
        try{
            Node node = (Node) super.find( Node.class, new Integer( pk ) );
            log.debug( "NodeDao->getNode: pk=" + pk + " ::DONE"  );
            return node;
        } catch( Exception ex ){
            return null;
        } 
    }
    
    //--------------------------------------------------------------------------
    
    public Node getByDip( String id ){ 

        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( "NodeDao->getNode: dip(int)=" + id  );

               
        Node node = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            
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
        log.info( "NodeDao-> found: " + node );
        return node; 
    }

    //--------------------------------------------------------------------------

    public Node getById( String ns, String sid ){ 
        
        Node node = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {

            Query query =  null;            

            if( "refseq".equalsIgnoreCase( ns ) ){                   
                query =
                    session.createQuery( "from Node n where " +
                                         " n.rfseq = :id order by n.dip asc");
            }

            if( "uniprotkb".equalsIgnoreCase( ns ) ){
                query =
                    session.createQuery( "from Node n where " +
                                         " n.uprot = :id order by n.dip asc");
            }

            if( "geneid".equalsIgnoreCase( ns ) ){
                query =
                    session.createQuery( "from Node n where " +
                                         " n.genid = :id order by n.dip asc");
            }
            
            query.setParameter( "id", sid );
            query.setFirstResult( 0 );

            List<Node> nodes= (List<Node>) query.list();
            
            if( nodes.size() > 0 ){
                node = nodes.get(0);
            }
            
            tx.commit();
            
        } catch( NumberFormatException ne ){
            ne.printStackTrace();
            // wrong accession fromat
            
        } catch( HibernateException e ) {
            e.printStackTrace();
                        
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        return node; 
    }
    
    //--------------------------------------------------------------------------

    public Node getByAccession( String accession ) { 
        
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
        return node; 
    }
    
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
    
    public List<Node> getBySequence( String sequence ){ 
        
        List<Node> nodes =  null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "select n from Node n " + 
                                     "where n.sequence =:seq" );
            
            query.setParameter( "seq", sequence );
            
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
    
    //--------------------------------------------------------------------------
    
    public long getCount() {

        long count = 0;

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {           
            Query query = session.createQuery( "select count(n) from Node n" );
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

    public Node updateNode( Node node ) { 

        if( node == null ) return null;

        //for(NodeXref x: node.getXrefList() ){
        //    x.setOwner(node);
        //}

        if( node.getLabel() != null ){
            if( node.getLabel().length() > 32 ){
                String slabel = node.getLabel().substring(0,28) + "..";
                node.setLabel( slabel );
            }
        } else {
            node.setLabel( "" );
        }
        
        super.saveOrUpdate( node );
        return node;
    }
}
