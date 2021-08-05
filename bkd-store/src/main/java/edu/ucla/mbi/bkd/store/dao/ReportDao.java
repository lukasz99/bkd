package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;

import edu.ucla.mbi.bkd.store.*;

public class ReportDao extends AbstractDAO {
    
    public Report getByPkey( int pk ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "ReportDao->getReport: pkey(int)=" + pk  );
        
        try{
            Report report = (Report) super.find( Report.class, new Integer( pk ) );
            log.debug( "ReportDao->getReport: pk=" + pk + " ::DONE"  );
            return report;
        } catch( Exception ex ){
            return null;
        } 
    }

    //--------------------------------------------------------------------------

    public Report getById( String ns, String sid ){ 
        
        Report report = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "-> getById: ns=" + ns + " ac=" + sid);
	
        try {
            
            Query query =  null;            
	    
            if( sid.startsWith( Report.getPrefix() ) ){

                //query =
                //    session.createQuery( "from Report n where " +
                //                         " n.id = :id order by n.id desc JOIN FETCH n.cvtype");
                query =
                    session.createQuery( "from Report n where " +
                                         " n.id = :id order by n.id desc");
                try{
                    sid = sid.replaceAll( "[^0-9]", "" );
                    System.out.println("sid=" + sid);
                    if(sid.length() > 0){
                        long lid = Long.parseLong( sid );
                        log.info("id=" + String.valueOf(lid));
                        query.setParameter( "id", lid );
                    }
                } catch(Exception ex){		    
                    log.info( ex );
                    
                    // should not happen
                }
            
            } else {

                /*
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
                */
            }
            query.setFirstResult( 0 );
            
            List<Report> reps= (List<Report>) query.list();            
            
            if( reps.size() > 0 ){
                report = reps.get(0);
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
        return report; 
    }
    
    //--------------------------------------------------------------------------
    /*
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
    */
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
    
    //--------------------------------------------------------------------------
    
    public long getCount() {

        long count = 0;

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {           
            Query query = session.createQuery( "select count(n) from Report n" );
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
    
    public Report updateReport( Report report ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateReport: " + report.toString()  );
        
        if( report == null ) return null;
        
        if( report.getLabel() == null ){
            report.setLabel("Report " + report.getAc() );
        }
        
        if( report.getLabel().length() > 32 ){
            String slabel = report.getLabel().substring(0,28) + "..";
            report.setLabel( slabel );
        }
        
        if(report.getCTime() == null){
            report.setCTime(new Date());
        }
        report.setUTime(new Date());
        
        super.saveOrUpdate( report );
        return report;
    }
}
