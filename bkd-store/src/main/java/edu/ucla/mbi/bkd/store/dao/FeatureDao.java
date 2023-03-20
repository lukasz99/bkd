package edu.ucla.mbi.bkd.store.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.*;
import java.util.*;

import org.hibernate.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.dao.*;
import edu.ucla.mbi.bkd.store.*;

public class FeatureDao extends AbstractDAO {

    //--------------------------------------------------------------------------
    // single feature by its primary key
    //----------------------------------
    
    public Feature getByPkey( long pk ){  // defaults to short
        return this.getByPkey( pk, null );
    }
    
    public Feature getByPkey( long pk, Depth dpth ){ 

        Logger log = LogManager.getLogger( this.getClass() );
        log.debug( "FeatureDao->getFeature: pkey(int)=" + pk  );
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        Feature feat = null;
        try {
            Query query =
                session.createQuery( "select f from Feature f" + 
                                     " where f.pkey=:pkey" );
            
            query.setParameter( "pkey", pk );            
            query.setFirstResult( 0 );
            feat = (Feature) query.uniqueResult(); 

            if( dpth == Depth.FULL ){ // force load
                feat.getXrefs().size();
                feat.getAttrs().size();
            } else { // leave out
                feat.setXrefs( new HashSet<FeatureXref>() );
                feat.setAttrs( new HashSet<FeatureAttr>() );                
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

        return feat;
    }

    //--------------------------------------------------------------------------
    // list of features by node 
    //-------------------------
    
    public List<NodeFeat> getByNode( Node node ){
        return this.getByNode(node, null);
    }
    
    public List<NodeFeat> getByNode( Node node, String dataset ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "FeatureDao->getFeature: ByNode(node)=" + node.getPkey()
                  + " Dataset: " + dataset );

        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();

        List<NodeFeat> features = new ArrayList<NodeFeat>();;
        try {

            Query query = null;
            
            if( dataset == null || "".equals( dataset ) ){

                query = session.createQuery( "select f from NodeFeat f" + 
                                             " where f.nodeid=:ndid" );
                
            } else {
                query = session.createQuery( "select f from NodeFeat f" + 
                                             " where f.nodeid=:ndid" +
                                             "  and  f.dataset=:dts" );
                
                query.setParameter( "dts", dataset );
            }

            query.setParameter( "ndid", node.getPkey() );
            
            List<NodeFeat> qres = (List<NodeFeat>) query.list();
            for( NodeFeat nf: qres){
                
                //nf.getXrefs().size();
                nf.setXrefs(new HashSet<FeatureXref>());
                nf.setAttrs(new HashSet<FeatureAttr>());
                features.add( nf );
            }
            tx.commit();
            
            log.info( "FeatureDao->getFeature: ByNode(node): DONE" );
            
        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }
        
        if( features != null ) return features;
        
        return new ArrayList<NodeFeat>();
    }

    //--------------------------------------------------------------------------    
    // list of features by node & feature position
    //--------------------------------------------
    
    public List<NodeFeat> getByNode( Node node, int pos ){
        return this.getByNode(node, pos, null);
    }
    
    public List<NodeFeat> getByNode( Node node, int pos, String dataset ){
    
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "FeatureDao->getByNode( node, pos. dts: pos(int)=" + pos
                  + " dataset(str)=" + dataset );


        List<NodeFeat> features = new ArrayList<NodeFeat>();
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "select f from NodeFeat f"
                                     + " where f.posidx=:pos"  
                                     + " and f.nodeid=:ndid" );
            
            query.setParameter( "pos", pos );
            query.setParameter( "ndid", node.getPkey() );
            //query.setParameter( "ac", acc );
            
            query.setFirstResult( 0 );
            List<NodeFeat> flist =  (List<NodeFeat>) query.list();

            for(NodeFeat f: flist ){
                for(Range r: f.getRanges() ){
                    if( r.getStart() == pos && r.getStop() == pos ){
                        f.getXrefs().size();  // force xrefs read
                        f.getAttrs().size();  // force attributes read
                        features.add( f );
                    }
                }
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
        log.info( "FeatureDao->getByNode: DONE" );
        if( features != null && features.size() > 0) return features;
        return new ArrayList<NodeFeat>();        
        
    }
    
    //--------------------------------------------------------------------------

    public List<Feature> getByNodeAc( String nac ){

        List<Feature> features =  null;
        
        Session session = getCurrentSession();
        Transaction tx = session.beginTransaction();
        
        try {
            Query query =
                session.createQuery( "select f from NodeFeat f join f.node n" + 
                                     " where n.ac=:nac" );
            
            query.setParameter( "nac", nac );
            //query.setParameter( "ac", acc );
            
            query.setFirstResult( 0 );
            features= (List<Feature>) query.list();
            tx.commit();

        } catch( NumberFormatException ne ){

            // wrong accession fromat
            
        } catch( HibernateException e ) {
            handleException( e );
            // log error ?
        } finally {
            session.close();
        }

        if( features != null ) return features;
        return new ArrayList<Feature>();        
    }

    
    //--------------------------------------------------------------------------
    /**
    public Feature getByAccession( String accession ) { 
        
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
        return null; // node; 
    }
    **/
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

    public NodeFeat updateFeature( NodeFeat feat ) { 

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "->updateFeature: " + feat.toString()  );
        log.info( "->updateFeature: source->" + feat.getSource().getPkey() );
        log.info( "->updateFeature: source.cvtype->" + feat.getSource().getCvType().getPkey() );
        log.info( "->updateFeature: cvtype->" + feat.getCvType() );
        log.info( "->updateFeature: xrefs->" +  feat.getXrefs()  );       
        log.info( "->updateFeature: ranges->" +  feat.getRanges() );

        super.saveOrUpdate( feat.getCvType() );
        super.saveOrUpdate( feat.getSource().getCvType() );
        super.saveOrUpdate( feat.getSource() );


        log.info( "->updateFeature: saved children" );

        if( feat == null ) return null;

        if(feat.getCTime() == null){
            feat.setCTime(new Date());
        }
        feat.setUTime(new Date());

        // get/persist node
                
        super.saveOrUpdate( feat );
        
        /*
        for(Range range: feat.getRanges() ){
            range.setFeature(feat);
            range.setCTime(feat.getCTime());
            range.setUTime(new Date());
            super.saveOrUpdate( range );
        }

        for(FeatureXref f: feat.getXrefs()){
            f.setFeature(feat);
            f.setCTime(feat.getCTime());
            f.setUTime(new Date());
            super.saveOrUpdate( f );
        }
        */
        return feat;
    }
}
