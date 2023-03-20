package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;
import org.hibernate.criterion.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.dao.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.access.*;

public class BkdEorelDao extends AbstractDAO{ //  implements ObsMgrDao {

    //public EorelDao(){super();};

    //public EorelDao( SessionFactory sessionFactory ){
    //    super( sessionFactory );
    //}

    public void addEORel( String event, BkdUser observer ){

        Logger log = LogManager.getLogger( this.getClass() );        
        log.info( '\n' + "got to addEORel with event = " + event 
                   + " and  observer = " + observer );

        // NOTE: MUST check if old record present as neither observer nor
        //       subject are primary record ID 
        
        BkdEORel oldRelationship = getEORel( event, observer );
        log.info( "addEORel: oldRelationship=" + oldRelationship );
        
        if( oldRelationship == null ){            
            
            BkdEORel newRelationship = new BkdEORel( event, observer );
            log.debug( newRelationship );
            super.saveOrUpdate( newRelationship );
        }
        log.debug( "addEORel: DONE" );
    }

    public void dropEORel( String event, BkdUser observer ){
        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( '\n' + "got to dropSOrel with event = " 
                   + event + " and  observer = " + observer );
        
        // NOTE: MUST check if old record present as neither observer nor
        //       subject are primary record ID
        
        BkdEORel oldRelationship = getEORel( event, observer );
        if( oldRelationship != null ){
            log.debug( oldRelationship );
            super.delete( oldRelationship );
        }
    }
    
    //--------------------------------------------------------------------------

    public BkdEORel getEORel( String event, BkdUser observer  ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "getEORel(HQL) event=" + event
                   + " sid=" + observer.getId() );
        
        //Session session =
        //    HibernateUtil.getSessionFactory().openSession();
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        BkdEORel watchStatus = null;
        
        try {
            Query query =
                session.createQuery( "select eor from BkdEORel as eor where "
                                     + " eor.event = :event " 
                                     + " and eor.observer = :observer" );

            query.setParameter( "event", event );
            query.setParameter( "observer", observer );
            
            watchStatus = (BkdEORel) query.uniqueResult();
            
        } catch ( HibernateException e ) {
            log.info( e );
            handleException( e );
            // log exception ?
            e.printStackTrace();
        } catch ( Exception ex ){
            ex.printStackTrace();

        } finally {
            session.close();
        }

        log.info( "(getEORel)watchStatus=" + watchStatus );
        return watchStatus;
    }

    //--------------------------------------------------------------------------
    
    public List<BkdUser> getEORel( String event ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "getEORel(HQL) event=" + event );
        
        //Session session =
        //    HibernateUtil.getSessionFactory().openSession();

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        List<BkdUser> olst = null;
        
        try {
            Query query =
                session.createQuery( "select eor.observer " 
                                     + " from BkdEORel as eor where "
                                     + " eor.event = :event " );
            
            query.setParameter( "event", event );
            
            olst = (List<BkdUser>) query.list();
            log.info( "getEORel(HQL) olist=" + olst );

        } catch ( HibernateException e ) {
            log.info( e );
            handleException( e );
            // log exception ?
            e.printStackTrace();
            
        } finally {
            session.close();
        }
        if( olst != null ) return olst;
        return new ArrayList<BkdUser>();
    }

}
