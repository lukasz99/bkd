package edu.ucla.mbi.bkd.dao;
 
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;
import org.hibernate.Query;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.GroupDao;

import edu.ucla.mbi.bkd.dao.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.access.*;

public class BkdGroupDao
    extends edu.ucla.mbi.bkd.dao.AbstractDAO
    implements edu.ucla.mbi.util.data.dao.GroupDao {

    public BkdGroupDao(){}
                    
    public Group getGroup( int id ) { 
        //BkdGroup group = (BkdGroup) super.find( BkdGroup.class, id );

        Group  group = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "from BkdGroup g where " +
                                     " g.id = :id ");
            query.setParameter( "id", id );
            query.setFirstResult( 0 );
            group = (BkdGroup) query.uniqueResult();
            tx.commit();            
        } catch ( DAOException dex ) {
            // log exception ?
        }finally {
            session.close();
        }
        return group; 
    }
    
    //---------------------------------------------------------------------

    public Group getGroup( String label ) {
        
        Group group = null;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {
            Query query =
                session.createQuery( "from BkdGroup g where " +
                                     " g.label = :label ");
            query.setParameter( "label", label );
            query.setFirstResult( 0 );
            group = (BkdGroup) query.uniqueResult();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        return group;
    }


    //---------------------------------------------------------------------

    public List<Group> getGroupList() {
        
        List<Group> glst = (List<Group>) super.findAll( BkdGroup.class );

        List<Group> groupl = null;
        Logger log = LogManager.getLogger( this.getClass() );        
        log.debug("getGroupList: all" );
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            
            Query query = 
                session.createQuery( "from BkdGroup g order by name ");
            
            groupl = (List<Group>) query.list();
            tx.commit();
        } catch( DAOException dex ) {
            // log error ?
        } finally {
            session.close();
        }
        return groupl;
    }
    
    public List<Group> getGroupList( int firstRecord, int blockSize ) { 
        
        List<Group> groupl = null;
        Logger log = LogManager.getLogger( this.getClass() );
                
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            
            Query query = 
                session.createQuery( "from BkdGroup g order by name ");
            query.setFirstResult( firstRecord ); // -1 ???
            query.setMaxResults( blockSize );
            
            groupl = (List<Group>) query.list();
            tx.commit();
            
        } catch( DAOException dex ) {
            // log error ?
        } finally {
            session.close();
        }
        return groupl;
    }


    //---------------------------------------------------------------------

    public long getGroupCount(){

        long count = 0;
        Logger log = LogManager.getLogger( this.getClass() );
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {            
            Query query =
                session.createQuery( "select count(*) from BkdGroup");
            
            count = (Long) query.uniqueResult();
            
            log.info("Total groups=" + count);
            
        } catch( DAOException dex ) {
            // log error ?
            log.info(dex);
        } finally {
            session.close();
        }

        return count;
    }
    
    //---------------------------------------------------------------------
    
    public List<Group> getGroupList( Role role ){

        Logger log = LogManager.getLogger( this.getClass() );
        
        List<Group> glst = null;

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {

            Query query =
                session.createQuery( "select g from BkdGroup g join g.roles as r" +
                                     " where r = :r ");
            query.setParameter( "r", role );
            query.setFirstResult( 0 );
            glst = (List<Group>) query.list();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ? 
        } finally {
            session.close();
        }
        
        log.debug( "list=" + glst );
        return glst;
    }


    //---------------------------------------------------------------------

    public void saveGroup( Group group ) {

        if( group instanceof BkdGroup ){
            super.saveOrUpdate( group );
            //getCurrentSession().evict(group);
        } else {
            BkdGroup ngrp = new BkdGroup( group ); 
            super.saveOrUpdate( ngrp );
            //getCurrentSession().evict(ngrp);
        }
    }
    

    //---------------------------------------------------------------------
    
    public void updateGroup( Group group ) {   
        super.saveOrUpdate( group );
    }
    
    
    //---------------------------------------------------------------------

    public void deleteGroup( Group group ) { 
        super.delete( group );
    }

    
    //---------------------------------------------------------------------
    // usage/count: Users
    //-------------------

    public long getUserCount( Group group ) {

        long cnt = 0;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {
            Query query =
                session.createQuery( "select count(u) from BkdUser u" +
                                     " join u.groups as grp" +
                                     " where grp.id = :gid");
            query.setParameter( "gid", group.getId() );
            query.setFirstResult( 0 );
            cnt = (Long) query.uniqueResult();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        
        return cnt;
    }
    
    //---------------------------------------------------------------------

    public List<User> getUserList( Group group ) {

        // NOTE: use sparingly - potentially can load all users
        
        List<User> ulst = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            //startOperation();
            Query query =
                session.createQuery( "select u from BkdUser u" +
                                     " join u.groups as grp" +
                                     " where grp.id = :gid");
            query.setParameter( "gid", group.getId() );
            query.setFirstResult( 0 );
            ulst = (List<User>) query.list();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        return  ulst;
    }
}
