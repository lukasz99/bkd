package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.hibernate.*;

import java.util.*;
import java.io.Serializable;

public abstract class AbstractDAO {

    private SessionFactory sessionFactory;

    public AbstractDAO(){
    }


    public AbstractDAO( SessionFactory sessionFactory ){
        this.sessionFactory = sessionFactory;
    }

    public AbstractDAO setSessionFactory( SessionFactory sessionFactory ){
        this.sessionFactory = sessionFactory;
	return this;
    }

    public SessionFactory getSessionFactory(){
        return this.sessionFactory;
    }
    
    protected Session getCurrentSession(){
        return sessionFactory.openSession();
    }

    protected void save( Object obj ) throws DAOException {

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            session.save( obj );
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e, tx );
        } finally {
            session.close();
        }
    }
    
    protected void update( Object obj ) throws DAOException {

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {
            session.update(obj);
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e, tx );
        } finally {
            session.close();
        }

    }

    protected void saveOrUpdate( Object obj ) throws DAOException {

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {            
            session.saveOrUpdate( obj );
            tx.commit();
        } catch ( HibernateException e ) {

	    Logger log = LogManager.getLogger( this.getClass() );                                                                                                          
	    log.info( "saveOrUpdate exception" + e  );                                                                                                          

	    
            handleException( e, tx );
        } finally {
            session.close();
        }

    }

    protected void delete ( Object obj ) throws DAOException {
    
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            session.delete( obj );
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e, tx );
        } finally {
            session.close();
        }
        
    }
   
    protected Object get( Class clazz, int id ) throws DAOException {

        Object obj = null;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try {
            obj = session.get( clazz, id );
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
        } finally {
            session.close();
        }

        return obj;
    }
 
    protected List query( Object object, String tableName, 
                          String columnName ) throws DAOException {

        List obj = null;
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        try{
            Query query = session.createQuery(
                                              "from " + tableName + " a where a." +
                                              columnName + " = :" + columnName );
            query.setParameter( columnName, object );
            obj = query.list();
            tx.commit();
        } catch( HibernateException e ){
            handleException(e);
        } finally {
            session.close();
        }

        return obj;
    }

    protected Object find( Class clazz, Serializable id ) throws DAOException {

        Object obj = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            obj = session.load( clazz, id );
            tx.commit();
        } catch( HibernateException e ){
            handleException( e );
        } finally {
            session.close();
        }

        return obj;
    }

    protected Object find( Class clazz, int id ) throws DAOException {

        Object obj = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            obj = session.load( clazz, id );
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
        } finally {
            session.close();
        }


        return obj;
    }
   
    protected Object find( Class clazz, long id ) throws DAOException {

        Object obj = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            obj = session.load( clazz, id );
            tx.commit();
        } catch ( HibernateException e ) {
            handleException(e);
        } finally {
            session.close();
        }

        return obj;
    }
    
    protected Object find( Class clazz, String id ) throws DAOException {

        Object obj = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            obj = session.load(clazz, id);
            tx.commit();
        } catch (HibernateException e) {
            handleException(e);
        } finally {
            session.close();
        }

        return obj;
    }
   
    protected List findAll( Class clazz ) throws DAOException {

        List objects = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query = session.createQuery( "from " + clazz.getName());
            objects = query.list();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
        } finally {
            session.close();
        }
        
        return objects;
    }

    protected List findAll( Class clazz, String column ) throws DAOException {
        
        List objects = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query = session.createQuery( "from " + clazz.getName() +
                                               " order by " + column );
            objects = query.list();
            tx.commit();
        } catch ( HibernateException e ) {
            handleException( e );
        } finally {
            session.close();
        }

        return objects;
    }

    protected void handleException( HibernateException e, 
                                    Transaction tx ) throws DAOException {
        tx.rollback();
        handleException( e );
    }

    protected void handleException( HibernateException e ) throws DAOException {
        //e.printStackTrace();
        throw new DAOException( "Hibernate DAO Exception." );
    }

}
