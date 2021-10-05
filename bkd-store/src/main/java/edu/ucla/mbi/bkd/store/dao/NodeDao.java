package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;
import java.math.BigInteger;
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
    
    public Node getByNac( int nac ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "NodeDao->getNode: nac(int)=" + nac  );

               
        Node node = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            
            Query query =
                session.createQuery( "from Node n where " +
                                     " n.nacc = :nac order by n.id desc");
            query.setParameter( "nac", nac );
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
        log.info( "-> getById: ns=" + ns + " ac=" + sid );
	
        try {	    
            Query query =  null;            
            
                
            if( "upr".equalsIgnoreCase( ns ) ){
                log.info( "-> getById: upr=" + sid );
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
            query.setFirstResult( 0 );
            
            List<Node> nodes= (List<Node>) query.list();            
            
            if( nodes.size() > 0 ){
                node = nodes.get(0);
            }
            
            tx.commit();
            log.info("found node: " + node);
            
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

    public Node getByAcc( String acc ){ 
        
        Node node = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {

            // convert accession to uid
            
            int id = Integer.parseInt(acc.replaceAll("[^0-9]", "") );
                      
            Query query =
                session.createQuery( "from Node n where " +
                                     " n.nacc = :nacc ");
            query.setParameter( "nacc", id );
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
    
    public List<Object> getListById( String ns, String ac,
                                     String ndtype, String sort ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "NodeDao->getListById: ns=" + ns + " ac=" + ac  );
        log.info( " type=" + ndtype + " sort=" + sort  );
        
        List<Object> rlist = null;

        Session session = getCurrentSession();           
        Transaction tx = session.beginTransaction();
        
        try {
            
            Query query =
                session.createQuery( "from Node n where " +
                                     " n.dip = :id");
            query.setParameter( "id", ac );
            query.setFirstResult( 0 );
            rlist = (List<Object>) query.list();
            tx.commit();
            
        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }

        if( rlist != null){
            return rlist;
        } else {
            return new ArrayList<Object>();
        }
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
    
    public List<Integer> getIdList( int rfirst, int rmax ){

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        List<Integer> res = new ArrayList<Integer>();
        try {           
            SQLQuery query = session.createSQLQuery( "select nacc from node order by nacc asc" );
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
