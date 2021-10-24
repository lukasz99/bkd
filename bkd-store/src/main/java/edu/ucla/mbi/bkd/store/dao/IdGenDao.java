package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import edu.ucla.mbi.bkd.store.*;

import org.hibernate.*;
     
public class IdGenDao extends AbstractDAO {
    
    IdGenDao() { }

    public int getNextId( String name ){

        int nextId = 0;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try{
            Query query =
                session.createQuery( "from IdGenerator idg where " +
                                     " idg.name = :name ");
            query.setParameter( "name", name );
            query.setFirstResult( 0 );
            IdGenerator idg = (IdGenerator) query.uniqueResult();

            if( idg != null ){

                nextId = idg.getIdMax() + 1;
                idg.setIdMax(nextId);
                session.saveOrUpdate( idg );
            }
            tx.commit(); 
        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        
        return nextId;        
    }

    public int getCurrentId( String name ){

        int curId = 0;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try{
            Query query =
                session.createQuery( "from IdGenerator idg where " +
                                     " idg.name = :name ");
            query.setParameter( "name", name );
            query.setFirstResult( 0 );
            IdGenerator idg = (IdGenerator) query.uniqueResult();

            if( idg != null ){
                curId =idg.getIdMax();
            }
            tx.commit(); 
        } catch( NumberFormatException ne ){
            
            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }        
        return curId;        
    }

    public int setCurrentId( String name, int curId ){

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try{
            Query query =
                session.createQuery( "from IdGenerator idg where " +
                                     " idg.name = :name ");
            query.setParameter( "name", name );
            query.setFirstResult( 0 );
            IdGenerator idg = (IdGenerator) query.uniqueResult();

            if( idg != null ){
                idg.setIdMax(curId);                
            }
            tx.commit(); 
        } catch( NumberFormatException ne ){
            
            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }        
        return curId;        
    }    
}

