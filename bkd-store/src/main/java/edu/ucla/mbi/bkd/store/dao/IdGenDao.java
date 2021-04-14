package edu.ucla.mbi.bkd.store.dao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
}

