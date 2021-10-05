package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;
import java.math.BigInteger;

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

    public Report getByNac( int nacc ){ 
        
        Report report = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "-> getByNac(int): nacc=" + nacc );
        
        try {
            
            Query query =
                session.createQuery( "from Report n where " +
                                     " n.nacc = :nacc order by n.rpid desc");
            
            query.setParameter( "nacc", nacc );
            
            query.setFirstResult( 0 );
            
            List<Report> reps= (List<Report>) query.list();            
            
            log.info("-> getByNac(int): count=" + reps.size() );
            
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
            
    public Report getById( String ns, String sid ){ 
        
        Report report = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "-> getById: ns=" + ns + " ac=" + sid);
        
        try {

            int id = Integer.parseInt(sid.replaceAll("[^0-9]", "") );
             
            Query query =
                session.createQuery( "from Report n where " +
                                     " n.nacc = :nacc order by n.id desc");
            
            query.setParameter( "nacc", id );            
            query.setFirstResult( 0 );
                        
            List<Report> reps= (List<Report>) query.list();            

            System.out.println("size");
            System.out.println(reps.size());
            System.out.println("...");
           
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

    public Report getByAcc( String acc ){ 
        
        Report report = null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "-> getByAcc: acc=" + acc );
	
        try {
            int id = Integer.parseInt( acc.replaceAll("[^0-9]", "") );
            Query query =
                session.createQuery( "from Report n where " +
                                     " n.nacc = :nacc order by n.id desc");
            
            query.setParameter( "nacc", id );            
            query.setFirstResult( 0 );
                        
            List<Report> reps= (List<Report>) query.list();            

            System.out.println("size");
            System.out.println(reps.size());
            System.out.println("...");
           
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

    public List<Object> getListByTarget( String ns, String ac, String sort ){

        if( ns!=null && ac != null ){
            
            List<Object>  rlist = null;
        
            Session session = getCurrentSession();
            Transaction tx = session.beginTransaction();
            
            Logger log = LogManager.getLogger( this.getClass() );
            log.info( "-> getListByTarget: ns=" + ns + " ac=" + ac );
            
            try {
                
                if( "upr".equalsIgnoreCase( ns ) ){
                    
                    // find target                    
                    
                    Query pnq = session
                        .createQuery( "from ProteinNode pn where " +
                                      " pn.upr = :ac ");
                    
                    pnq.setParameter( "ac", ac );
                    pnq.setFirstResult( 0 );

                    List<ProteinNode> pnlist = (List<ProteinNode>) pnq.list();

                    log.info( "PNList" + pnlist );
                    
                    if( pnlist != null && pnlist.size() > 0 ){
                    
                        // find matching features
                                
                        Query nfq = session
                            .createQuery( "from NodeFeat nf where " +
                                          " nf.node in ( :pnl ) ");
                
                        nfq.setParameter( "pnl", pnlist );
                        nfq.setFirstResult( 0 );
                
                        List<NodeFeat> nflist = (List<NodeFeat>) nfq.list();

                        log.info( "NFlist: " + nflist );
                        
                        if( nflist != null && nflist.size() > 0 ){
                    
                            Query rq = session
                                .createQuery( "from FeatureReport fr where " +
                                              " fr.feature in ( :nfl ) " +
                                              " order by fr.rpid desc" );
               
                            rq.setParameter( "nfl", nflist );
                            rq.setFirstResult( 0 );
                    
                            rlist = (List<Object>) rq.list();

                            log.info( "RList:" + rlist );
                        }
                    }
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

            log.info( "RList:" + rlist );
            if( rlist != null ) return rlist;
            
        }
        
        return new ArrayList<Object>();
        
    }
        
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

    public List<Integer> getIdList( int rfirst, int rmax ){

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        List<Integer> res = new ArrayList<Integer>();
        try {           
            SQLQuery query = session.createSQLQuery( "select rpid from report order by rpid asc" );
            query.setFirstResult(rfirst);
            query.setMaxResults(rmax);

            List qres = query.list();
            for( Object co : qres ){
                res.add( ((BigInteger)co).intValue()  );
                System.out.println(co);
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
    
    public Report updateReport( Report report ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateReport: " + report.toString()  );
        log.info( "->updateReport: class" + report.getClass()  );
        
                
        // quit if no persisted report 
        
        if( report == null || report.getNacc() == 0) return null;
                   
        Report oldRep = this.getByNac( report.getNacc() );


        /*

        if( oldRep != null &&
            oldRep.getRpid() != report.getRpid() ) return null;

        // reports exists: update all the fields

        // label
        
        if( report.getLabel() == null ){
            oldRep.setLabel("Report " + report.getAc() );
        } else{
            oldRep.setLabel( report.getLabel() );
        }
        
        if( oldRep.getLabel().length() > 32 ){
            String slabel = oldRep.getLabel().substring(0,28) + "..";
            oldRep.setLabel( slabel );
        }

        //version
        oldRep.setVersion( report.getVersion() );

        //name
        oldRep.setName( report.getName() );

        // jvals
        oldRep.setJval( report.getJval() );
        
        //source
        oldRep.setSource( report.getSource() );
                
        //xrefs
        oldRep.setXrefs( report.getXrefs() );

        //comment
        oldRep.setComment( report.getComment() );

        Feature ofeature = null;
        
        //NodeReport: update node
        if( oldRep instanceof NodeReport) {
            ((NodeReport)oldRep).setNode( ((NodeReport)report).getNode() );
        } else if( oldRep instanceof FeatureReport){

            / *
            ofeature = ((FeatureReport)oldRep).getFeature();
            Node onode = ((NodeFeat) ofeature).getNode();

            // drop old feature            
            //super.delete(((FeatureReport)oldRep).getFeature());            
                        
            // save new feature
            
            Feature nf = ((FeatureReport)report).getFeature();

            // set old node
            ((NodeFeat)nf).setNode(onode);
            
            for(Range range: nf.getRanges() ){
                range.setFeature(nf);
                range.setCTime(nf.getCTime());
                range.setUTime(new Date());
                super.saveOrUpdate( range );
            }

            for(FeatureXref f: nf.getXrefs()){
                f.setFeature(nf);
                f.setCTime(nf.getCTime());
                f.setUTime(new Date());
                super.saveOrUpdate( f );
            }

            if(nf.getCTime() == null){
                nf.setCTime(new Date());
            }
            
            nf.setUTime(new Date());            
            
            super.saveOrUpdate(nf);
            
            ((FeatureReport)oldRep).setFeature( nf );
            * /
        }
        
        // status
        oldRep.setStatus( report.getStatus() );

        // reset update time
        oldRep.setUTime(new Date());
        */

            
        //super.saveOrUpdate( oldRep );

        super.saveOrUpdate( report );
        super.delete(oldRep);
        //if(ofeature != null){
        //    super.delete( ofeature );
        //}
        
        //return oldRep;
        return report;
    }
}
