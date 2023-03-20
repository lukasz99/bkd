package edu.ucla.mbi.bkd.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;
//import java.math.BigInteger;

import org.hibernate.*;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

//import edu.ucla.mbi.bkd.dao.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.access.*;

public class BkdUserDao
    extends edu.ucla.mbi.bkd.dao.AbstractDAO
    implements edu.ucla.mbi.util.data.dao.UserDao {
    
    public User getUser( int id ) { 
        
        User user = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "from BkdUser u where " +
                                     " u.id = :id ");
            query.setParameter( "id", id );
            query.setFirstResult( 0 );
            user = (BkdUser) query.uniqueResult();
            tx.commit();            
        } catch ( DAOException dex ) {
            // log exception ?
        }finally {
            session.close();
        }
        return user;
    }

    
    //---------------------------------------------------------------------
    
    public User getUser( String login ) {
        
        User user = null;

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "from BkdUser u where " +
                                     " u.login = :login ");
            query.setParameter( "login", login );
            query.setFirstResult( 0 );
            user = (BkdUser) query.uniqueResult();
            tx.commit();
        } catch( DAOException dex ) {
            // log error ?
        } finally {
            session.close();
        }

        return user;
    }

    
    //---------------------------------------------------------------------
    
    public List<User> getUserList() {   
        return null;
    }
    
    public List<User> getUserList( int firstRecord, int blockSize ) { 
       
        List<User> userl = null;
        Logger log = LogManager.getLogger( this.getClass() );        
        log.debug("getUserList: firstRecord=" + firstRecord);
        log.debug("getUserList: blockSize=" + blockSize);
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {    
            Query query = 
                session.createQuery( "from BkdUser u order by id ");
            query.setFirstResult( firstRecord );  // -1 ???
            query.setMaxResults( blockSize );
            
            userl = (List<User>) query.list();
            tx.commit();            
        } catch( DAOException dex ) {
            // log error ?
        } finally {
            session.close();
        }
        
        return userl;
    }

    
    //---------------------------------------------------------------------

    public long getUserCount(){ 

        long count = 0;
        Logger log = LogManager.getLogger( this.getClass() );
               
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {            
            Query query =
                session.createQuery( "select count(*) from BkdUser");
            
            count = (Long) query.uniqueResult();
            
            log.info("Total users=" + count);
            
        } catch( DAOException dex ) {
            // log error ?
            log.info(dex);
        } finally {
            session.close();
        }
        
        return count;
    }
    
    public void saveUser( User user ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info("saveUser:" + user);
        
        if( user instanceof BkdUser ){
            log.info("saveUser: BkdUser");
            super.saveOrUpdate( user );            
            getCurrentSession().evict(user);
        } else {
            log.info("saveUser: User");
            BkdUser nusr = new BkdUser ( user );
            super.saveOrUpdate( nusr );
            //getCurrentSession().evict( nusr );
        }
    }
    
    public void updateUser( User user ) { 
        super.saveOrUpdate( user );
    }
    
    public void deleteUser( User user ) { 
        super.delete( user );
    }
}
