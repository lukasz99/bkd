package edu.ucla.mbi.bkd.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;
//import java.math.BigInteger; 

import org.hibernate.*;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.RoleDao;

import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;

public class BkdRoleDao
    extends edu.ucla.mbi.bkd.dao.AbstractDAO
    implements edu.ucla.mbi.util.data.dao.RoleDao {
    
    public Role getRole( int id ) { 

        //BkdRole role = (BkdRole) super.find( BkdRole.class, id );

        Role role = null;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "from BkdRole r where " +
                                     " r.id = :id ");
            query.setParameter( "id", id );
            query.setFirstResult( 0 );
            role = (BkdRole) query.uniqueResult();
            tx.commit();            
        } catch ( DAOException dex ) {
            // log exception ?
        }finally {
            session.close();
        }
        return role; 
    }
    
    //---------------------------------------------------------------------

    public Role getRole( String name ) { 
        
        Role role = null;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "from BkdRole u where " +
                                     " u.name = :name ");
            query.setParameter("name", name );
            query.setFirstResult( 0 );
            role = (BkdRole) query.uniqueResult();
            tx.commit();
        
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {            
            session.close();
        }
        
        return role; 
    }
    

    //---------------------------------------------------------------------
    
    public List<Role> getRoleList() {
        
        List<Role> rlst = null;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            //startOperation();
            Query query =
                session.createQuery( "from BkdRole r order by name ");
            
            rlst = (List<Role>) query.list();
            tx.commit();
            
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }

        return rlst;
    }

    public List<Role> getRoleList( int firstRecord, int blockSize ) { 
        
        List<Role> rolel = null;
        Logger log = LogManager.getLogger( this.getClass() );
        log.debug("getRoleList: firstRecord=" + firstRecord);
        log.debug("getRoleList: blockSize=" + blockSize);
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {
            
            Query query = 
                session.createQuery( "from BkdRole r order by name ");
            query.setFirstResult( firstRecord ); // -1 ???
            query.setMaxResults( blockSize );
            
            rolel = (List<Role>) query.list();
            tx.commit();
        } catch( DAOException dex ) {
            // log error ?
        } finally {
            session.close();
        }
        
        return rolel;
    }


    //---------------------------------------------------------------------

    public long getRoleCount(){

        long count = 0;
        Logger log = LogManager.getLogger( this.getClass() );
       
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {
            Query query =
                session.createQuery( "select count(*) from BkdRole");
            
            count = (Long) query.uniqueResult();
            
            log.info("Total roles=" + count);
            
        } catch( DAOException dex ) {
            // log error ?
            log.info(dex);
        } finally {
            session.close();
        }

        return count;
    }

    //---------------------------------------------------------------------

    public void saveRole( Role role ) { 

        if( role instanceof BkdRole ){
            super.saveOrUpdate( role );
            //getCurrentSession().evict(role);
        } else {
            BkdRole nrole = new BkdRole( role );
            super.saveOrUpdate( nrole );
            //getCurrentSession().evict(nrole);
        }

    }
    

    //---------------------------------------------------------------------
    
    public void updateRole( Role role ) { 

        super.saveOrUpdate( role );
    }
    
    
    //---------------------------------------------------------------------

    public void deleteRole( Role role ) { 
    
        super.delete( role );
    }
    
    //---------------------------------------------------------------------
    // usage/count: Users
    //-------------------

    public long getUserCount( Role role ) {
        
        long cnt = 0;
        Session session = getCurrentSession();

        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "select count(u) from BkdUser u" +
                                     " join u.roles as role" +
                                     " where role.id = :rid");
            query.setParameter( "rid", role.getId() );
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

    public List<User> getUserList( Role role ) {

        // NOTE: use sparingly - potentially can load all users

        List<User> ulst = null;

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {
            //startOperation();
            Query query =
                session.createQuery( "select u from BkdUser u" +
                                     " join u.roles as role" +
                                     " where role.id = :rid");
            query.setParameter( "rid", role.getId() );
            query.setFirstResult( 0 );
            ulst = (List<User>) query.list();
            tx.commit();
            //HibernateUtil.closeSession();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        
        return ulst;
    }

    
    //---------------------------------------------------------------------
    // usage/count: Groups
    //--------------------

    public long getGroupCount( Role role ) {
        
        long cnt = 0;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {            
            Query query =
                session.createQuery( "select count(g) from BkdGroup g" +
                                     " join g.roles as role" +
                                     " where role.id = :rid");
            query.setParameter( "rid", role.getId() );
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

    public List<Group> getGroupList( Role role ) {

        // NOTE: use sparingly - potentially can load all users

        List<Group> ulst = null;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "select g from BkdGroup g" +
                                     " join g.roles as role" +
                                     " where role.id = :rid");
            query.setParameter( "rid", role.getId() );
            query.setFirstResult( 0 );
            ulst = (List<Group>) query.list();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        return ulst;
    }
}
