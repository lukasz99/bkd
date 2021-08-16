package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;

import edu.ucla.mbi.bkd.store.*;

public class NodeDao extends AbstractDAO {
    
    public Node getByPkey( int pk ){ 

        Logger log = LogManager.getLogger( this.getClass() );
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

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "NodeDao->getNode: dip(int)=" + id  );

               
        Node node = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            
            Query query =
                session.createQuery( "from Node n where " +
                                     " n.dip = :id");
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

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "-> getById: ns=" + ns + " ac=" + sid);
	
        try {	    
            Query query =  null;            
            
            if( sid.startsWith( Node.getPrefix() ) ){

                query =
                    session.createQuery( "from Node n where " +
                                         " n.id = :id  JOIN FETCH n.cvtype order by n.id desc");

                //query =
                //   session.createQuery( "from Node n where " +
                //                         " n.id = :id order by n.id desc");
                
                try{
                    sid = sid.replaceAll( "[^0-9\\-]", "" );
                    if(sid.length() > 0){
                        long lid = Long.parseLong( sid );
                        query.setParameter( "id", lid );
                    }
                } catch(Exception ex){		    
                    log.info( ex );
                    
                    // should not happen
                }
                
            } else {
                
                if( "upr".equalsIgnoreCase( ns ) ){
                    query =
                        session.createQuery( "from Node n where " +
                                             " n.upr = :id order by n.id desc");
                }
                
                if( "rsq".equalsIgnoreCase( ns ) ){                   
                    query =
                        session.createQuery( "from Node n where " +
                                             " n.rsq = :id order by n.id desc");
                }
                
                
                if( "dip".equalsIgnoreCase( ns ) ){
                    query =
                        session.createQuery( "from Node n where " +
                                             " n.dip = :id order by n.id desc");
                }
                
                if( "gid".equalsIgnoreCase( ns ) ){
                    query =
                        session.createQuery( "from Node n where " +
                                             " n.gid = :id order by n.id desc");
                }
                
                query.setParameter( "id", sid );
            }
            query.setFirstResult( 0 );
            
            List<Node> nodes= (List<Node>) query.list();            

            if( nodes.size() > 0 ){
                node = nodes.get(0);
            }
            
            tx.commit();
            
        } catch( HibernateException e ) {
            log.error(e);                        
	    handleException( e );           
	}catch( Exception ex){
	    log.error( ex );
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

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateNode: " + node.toString()  );
	
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

        if(node.getCTime() == null){
            node.setCTime(new Date());
        }
        node.setUTime(new Date());
        
        super.saveOrUpdate( node );
        return node;
    }
}
