package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;

import org.json.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.dao.*;

public class BkdRecordManager {

    /*
    private static List<String> featureXrefList
        = Arrays.asList( "dbsnp", "clinvar", "upr", "refseq", "gnomad", "clingen",
                         "pfam", "cdd", "cathgene3d", "upr", "ipro", "prints",
                         "grch37","grch37.p13",
                         "grch38","grch38.p13","mim");
    */
    public BkdRecordManager() {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "RecordManager: creating manager" );
    }
    
    public void initialize(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "RecordManager: initializing" );
    }
    
    public void cleanup(){
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "RecordManager: cleanup called" );
    }

    // BKD Config

    BkdConfig bkdconf;
    
    public void setBkdConfig( BkdConfig config ){
        this.bkdconf = config;
    }

    public BkdConfig getBkdConfig(){
        return this.bkdconf;
    }

    // DaoContext
    //-----------
    
    BkdDaoContext daoContext;
    
    public void setDaoContext( BkdDaoContext daoContext ){
        this.daoContext = daoContext;
    }

    public BkdDaoContext getDaoContext(){
        return this.daoContext;
    }

    // UserDaoContext
    //---------------
    
    BkdUserContext usrContext;
    
    public void setUserContext( BkdUserContext usrContext ){
        this.usrContext = usrContext;
    }

    public BkdUserContext getUsrContext(){
        return this.usrContext;
    }

    
    
    
    //---------------------------------------------------------------------
    // Operations
    //---------------------------------------------------------------------
    // Node management
    //----------------
    
    public Node getNode( String acc, String depth ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node(2) -> ac=" + acc );
        
        Node node = daoContext.getNodeDao().getByAcc( acc, depth );            
        return node;
        
    }

    public Node getNodeByPkey( long pkey, String depth ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node(pk) -> pk=" + pkey +" (" + depth + ")" );
        
        Node node = daoContext.getNodeDao().getByPkey( pkey, depth );            
        return node;
        
    }

    public Map<String, Object> getNodeMap( String acc, String depth ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "getNodeMap -> acc=" + acc + " :: " + depth );
        
        
        
        Map<String, Object> map =
            daoContext.getNodeDao().getByAcc( acc, depth ).toMap();        
        
        if(map == null ) return  new HashMap<String,Object>();
        
        return map;
    }

    
    public Node getNode( int id, String depth ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node -> nac(int)=" + id );
        
        try{
            Node node = daoContext.getNodeDao().getByNac( id, depth );
            return node;
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }

    public Node getNodeSimple( String acc, String depth ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node(simple,2) -> nac(str)=" + acc );
        
        try{
            Node node = daoContext.getNodeDao().getByAcc( acc, depth );            
            return node;
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }

    public Node getNode( String ns, String acc, String depth ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get node(3)-> ns=" + ns + "  ac=" + acc );

        try{
            if( bkdconf.getPrefix().equalsIgnoreCase( ns ) ){
                return daoContext.getNodeDao().getByAcc( acc, depth );
            } else {
                return daoContext.getNodeDao().getById( ns, acc, depth );
            }            
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }





    
    public Object buildNodeFeature( String ns, String ac, int pos, String iso ){

        Node mynode = null;
        if( ns == null
            || "".equals( ns )
            || getBkdConfig().getPrefix().equalsIgnoreCase( ns ) ){
            
            // native record accession
            mynode = daoContext.getNodeDao().getByAcc( ac,
                                                       Depth.BASE.toString() ); 
        } else {
            // non-native accession: (same for now ?)
            mynode = daoContext.getNodeDao().getByAcc( ac,
                                                       Depth.BASE.toString() );   
        }

        if( mynode == null ) return new HashMap();  // unknown node
        
        // node exists
        
        Map rmap = new HashMap<String,Object>();

        List<NodeFeat> feats = daoContext.getFeatureDao().getByNode( mynode,
                                                                     pos,
                                                                     iso );                
        if( feats.size() > 0 ){
            
            List afl = new ArrayList();

            Map rnode = new HashMap<String,Object>();
            rmap.put("node",rnode);
            
            rnode.put("ns", mynode.getNs());
            rnode.put("ac", mynode.getAc());
            rnode.put("label", mynode.getLabel());
            
            List flst = new ArrayList();
            rnode.put("feature", flst);            

            for( NodeFeat nf: feats ){
                flst.add( nf.toMap() );
            }   
        }
        
        return rmap;
    }


    public Object buildNodeStructureLstMap( Node node,
                                            String mode, 
                                            String isoform,
                                            String dataset ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "buildNodeStructureLst: mode->" + mode );
        log.info( "buildNodeStructureLst: isof->" + isoform );
        log.info( "buildNodeStructureLst: dtst->" + dataset );
        
        Map rnode = new HashMap();
        rnode.put("ns", node.getNs());
        rnode.put("ac", node.getAc());
        rnode.put("label", node.getLabel());
        
        List slst = new ArrayList();
        rnode.put("structure", slst);

        Map<String,Map<String,String>> jval = node.getJvalMap();

        for( Map.Entry<String, Map<String,String>> entry : jval.entrySet()){
            log.info( "buildNodeStructureLst: key->" + entry.getKey() );
            log.info( "buildNodeStructureLst: jval(key)->" + entry.getValue() );
            
        }        
        return rnode;
    }


    public Object buildNodeFeatLstMap( Node node,
                                       String mode, 
                                       String isoform,
                                       String dataset ){

        // isoform: if not "" get only with matched var-seq
        // dataset: if not "" get only with matched var-dts/dataset
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "buildNodeFeatLst: " + mode );
 
        Map rnode = new HashMap();
        rnode.put("ns", node.getNs());
        rnode.put("ac", node.getAc());
        rnode.put("label", node.getLabel());

        List flst = new ArrayList();
        rnode.put("feature", flst);

        List<NodeFeat> feats =
            daoContext.getFeatureDao().getByNode( node, dataset );

        log.info( "buildNodeFeatLst: FeatureDao().getByNode(node)" + " DONE" );

        for( NodeFeat f: feats ){
                     
            if( "SHORT".equals( mode ) 
                && "MI:1241".equals( f.getCvType().getAc() ) ){ 

                continue;  // exclude sequence variants
            }

            //if( f.getPosIdx() == 0 ){
            //    
            //}
            
            Map rf = f.toMap("SINGLE");
            flst.add( rf );
            
            if( "SHORT".equals( mode ) ){
                // append attrs
                //-------------
                //log.info( "buildNodeFeatLst: attrs");         
                List rfa = new ArrayList();
                rf.put( "attrs", rfa );
                
                for( FeatureAttr a: f.getAttrs()){                
                    Map fa = new HashMap();
                    fa.put( "value", a.getValue() );                    
                    Map acvt = new HashMap();
                    acvt.put( "ns", a.getCvType().getNs() );
                    acvt.put( "ac", a.getCvType().getNs() );
                    acvt.put( "name", a.getCvType().getName() );                
                    fa.put( "cvType", acvt );                  
                    rfa.add( fa );                    
                }

                // parse json fields other than clin significance

                JSONObject fjo = null;
                
                try {
                    fjo = new JSONObject( f.getJval() );                
                } catch ( JSONException jex ) {
                    //log.info( "parsing error: " + jex.toString() );
                }                
                
                if( fjo != null ){
                    for( Iterator<String> ik = fjo.keys(); ik.hasNext(); ){
                        String k = ik.next();                                                               
                        if( ! k.equals("clinical-significance") ){
                            Map fam = new HashMap();
                            fam.put("name",k);
                            JSONObject fcs = fjo.getJSONObject(k);
                            for( Iterator<String> iak=fcs.keys();iak.hasNext(); ){
                                String ak = iak.next();
                                fam.put(ak, fcs.getString(ak) );
                            }
                            rfa.add(fam);
                        }
                    }
                }                
            }
        }
        
        //Map ret = new HashMap();        
        //ret.put( "node", rnode );       
        return rnode;

    }
    
    public Node addNode( Node node, List<NodeFeat> nflist ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add node -> node=" + node.toString() );

        if( node.getNacc() == 0 ){ 
            int nid = daoContext.getIdGenDao().getNextId( Node.generator() );
            node.setNacc( nid );	    
        }

        node.setPrefix( bkdconf.getPrefix() );
                
        try{

            // cvtype - persist if needed
            //---------------------------
            
            CvTerm ncvtype = daoContext
                .getCvTermDao().getByAccession( node.getCvType().getAc() );
            
            if( ncvtype == null ){
                ncvtype = daoContext
                    .getCvTermDao().updateCvTerm( node.getCvType() );
            }
            node.setCvType( ncvtype );
	    

            // taxon 
            //------
            
            Taxon ntaxon = daoContext
                .getTaxonDao().getByTaxid( node.getTaxon().getTaxid() );

            if( ntaxon == null ){
                ntaxon = daoContext
                    .getTaxonDao().updateTaxon( node.getTaxon() );
            }
            node.setTaxon( ntaxon );

            // node add/update
            //----------------
            
            node = daoContext.getNodeDao().updateNode( node );

            log.info(" Node updated:" + node.getNacc());

        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }

        try{
            
            // xrefs - persist xrefs and components if needed
            //-----------------------------------------------           
            
            for( NodeXref x: node.getXrefs() ){
                
                x.setNode( node );
                
                log.info(" (*) xref: " + x );
                log.info(" cvac" + x.getCvType().getAc());
		
                // persist components if needed
                //  - cvtype
		
                CvTerm xcvtype = daoContext
                    .getCvTermDao().getByAccession( x.getCvType().getAc() );

                log.info(" xcvtype(old): " + xcvtype );
                    
                if( xcvtype == null ){
                    xcvtype = daoContext
                        .getCvTermDao().updateCvTerm( x.getCvType() );
                }
                log.info("xcvtype: " + xcvtype);
                x.setCvType(xcvtype);
		
                log.info(" cvt updated");
                log.info(" source name: " + x.getSource().getName() );
                log.info(" source cvt: " + x.getSource().getCvType() );

                // - source
                Source xsource = null; // daoContext

                //    .getSourceDao().getByName( x.getSource().getName() );
                //
                
                log.info(" source: " + x.getSource().toString());
			 
                if( xsource == null ){
	   		    
                    CvTerm scvtype = daoContext
                        .getCvTermDao().getByAccession( x.getSource().getCvType().getAc() );
                    
                    if( scvtype == null ){
                        scvtype = daoContext
                            .getCvTermDao().updateCvTerm( x.getSource().getCvType() );
                    }
                    log.info("scvtype: " + scvtype);
                    x.getSource().setCvType( scvtype );
				    
                    xsource = daoContext
                        .getSourceDao().updateSource( x.getSource() );
                }
                log.info(" source: " + xsource);
                
                x.setSource( xsource );
                
                log.info(" source updated");
                
                daoContext.getXrefDao().updateXref( x );
                
                log.info(" (*) xref updated");
                
            }

        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }

        
        log.info(" XREFs: updated");

        // features - persist fetures (and components if neeed)
        //-----------------------------------------------------
            
        log.info(" FEATUREs: update");
        
        for( NodeFeat feat: nflist ){

            try{
                log.info("(*) feature" + feat.toString() );
                feat.setNodeId(node.getPkey());
                
                // source
                //-------
                
                Source fsource = null;
                if( fsource == null ){

                    CvTerm scvtype = daoContext
                        .getCvTermDao().getByAccession( feat.getSource().getCvType().getAc() );

                    if( scvtype == null ){
                        scvtype = daoContext
                            .getCvTermDao().updateCvTerm( feat.getSource().getCvType() );
                    }
                    log.info("scvtype: " + scvtype + "(pk:"+scvtype.getPkey()+")" );
                    feat.getSource().setCvType( scvtype );

                    fsource = daoContext
                        .getSourceDao().updateSource( feat.getSource() );
                }
                log.info(" feature source: " + fsource);

                feat.setSource( fsource );

                log.info(" feature source updated");

                // feature type
                //--------------
                
                CvTerm fcvtype = daoContext
                    .getCvTermDao().getByAccession( feat.getCvType().getAc() );
                
                if( fcvtype == null ){
                    fcvtype = daoContext
                        .getCvTermDao().updateCvTerm( feat.getCvType() );
                    
                }
                log.info("fcvtype: " + fcvtype + "(pk:" + fcvtype.getPkey() + ")" );
                feat.setCvType( fcvtype );			   
                
                log.info(" feature cvtype updated"); 
 
                // keep aside xrefs/attrs/ranges
                //------------------------------
                
                Set<FeatureXref> fxl = feat.getXrefs();
                feat.setXrefs(new HashSet<FeatureXref>());

                Set<FeatureAttr> fal = feat.getAttrs();
                feat.setAttrs(new HashSet<FeatureAttr>());
               
                Set<Range> frl = feat.getRanges();
                feat.setRanges(new HashSet<Range>());
                
                // persist feature
                //----------------
                
                daoContext.getFeatureDao().updateFeature( feat );
                log.info(" feature updated (core)");
                
                // xrefs
                //------

                log.info("Feature XREFs: persist ");
                for( FeatureXref x: fxl ){
                    CvTerm xcvtype = daoContext
                        .getCvTermDao().getByAccession( x.getCvType().getAc() );
                        
                    if( xcvtype == null ){
                        xcvtype = daoContext
                            .getCvTermDao().updateCvTerm( x.getCvType() );
                        log.info("Feature XREF: " + xcvtype );
                    }
                    x.setCvType( xcvtype );                    
                    x.setFeature( feat );                    
                    daoContext.getXrefDao().updateXref( x );
                    feat.getXrefs().add( x );
                }
                log.info("Feature XREFs: update DONE");
                
                // ranges
                //-------
                
                log.info("Feature Ranges: persist ");

                boolean idxFlag = false;                                
                int posidx = 0;
                String seqidx = "";
                
                for( Range r: frl ){
                    
                    if( idxFlag ){  // consecutive passes
                        posidx = 0;    // reset to 0
                        seqidx = "";   // reset to "" 
                    } else {           // first pass: set only if single pos
                        idxFlag = true;
                        if( r.getStart() == r.getStop()
                            && r.getSequence() != null
                            && r.getSequence().length() == 1 ){
                            
                            posidx = r.getStart();
                            seqidx = r.getSequence(); 
                        }
                    }
                    
                    r.setFeature( feat );

                    // CvStart
                    //--------
                    
                    CvTerm cvstart = daoContext
                        .getCvTermDao().getByAccession( r.getCvStart().getAc() );
                    
                    if( cvstart == null ){
                        cvstart = daoContext
                            .getCvTermDao().updateCvTerm( r.getCvStart() );
                    }
                    log.info("cvstart: " + cvstart + "(pk:"+cvstart.getPkey()+")" );
                    r.setCvStart( cvstart );

                    // CvStop
                    //-------
                    
                    CvTerm cvstop = daoContext
                        .getCvTermDao().getByAccession( r.getCvStop().getAc() );
                    
                    if( cvstop == null ){
                        cvstop = daoContext
                            .getCvTermDao().updateCvTerm( r.getCvStop() );
                    }
                    log.info("cvstop: " + cvstop + "(pk:"+cvstop.getPkey()+")" );
                    r.setCvStop( cvstop );
                    
                    daoContext.getRangeDao().updateRange( r );
                    feat.getRanges().add( r );
                }
                
                log.info("Feature Ranges: update DONE ");
                
                // attributes
                //------------

                log.info("Feature ATTRs: update ");
               
                for( FeatureAttr a: fal ){
                    log.info("(*) attr" + a.toString() );
                        
                    a.setFeature( feat );

                    // attribute type 
                    //---------------
                    
                    CvTerm acvtype = daoContext
                        .getCvTermDao().getByAccession( a.getCvType().getAc() );
                    
                    if( acvtype == null ){
                        acvtype = daoContext
                            .getCvTermDao().updateCvTerm( a.getCvType() );                    
                    }
                    
                    log.info("acvtype: " + acvtype);
                    a.setCvType( acvtype );
                    
                    // attribute source
                    //------------------
                    
                    Source asource = null;                 
                    log.info(" asource: " + a.getSource().toString());
                    
                    if(  a.getSource() != null ){
                        
                        CvTerm ascvtype = daoContext
                            .getCvTermDao().getByAccession( a.getSource().getCvType().getAc() );
                        
                        if( ascvtype == null ){
                            ascvtype = daoContext
                                .getCvTermDao().updateCvTerm( a.getSource().getCvType() );
                        }
                        log.info("ascvtype: " + ascvtype);
                        a.getSource().setCvType( ascvtype );
                        
                        asource = daoContext
                            .getSourceDao().updateSource( a.getSource() );
                    }
                    log.info(" attr source: " + asource);
                    
                    a.setSource( asource );
                    
                    log.info(" attr source updated");
                    
                    a = (FeatureAttr) daoContext.getAttributeDao().updateAttribute( a );
                    
                    try{
                        
                        // attribute xrefs
                        //----------------
                        
                        log.info("Attribute XREFs: update ");
                        if( a.getXrefs() != null ){
                            for( AttrXref x: a.getXrefs()){
                                CvTerm xcvtype = daoContext
                                    .getCvTermDao().getByAccession( x.getCvType().getAc() );
                                
                                if( xcvtype == null ){
                                    xcvtype = daoContext
                                        .getCvTermDao().updateCvTerm( x.getCvType() );
                                    log.info("Attribute XREF: " + xcvtype );
                                }
                                x.setCvType( xcvtype );                    
                                x.setAttr( a );
                                x.setSource(asource);
                                daoContext.getXrefDao().updateXref( x );                                    
                            }
                            log.info("Attr XREFs: update DONE");
                        }
                    }catch( Exception ex ) {
                        log.error(ex);
                    }

                    feat.getAttrs().add( a );
                }                    
                
                // set posidex
                //------------
            
                feat.setPosIdx( posidx );
                feat.setSeqIdx( seqidx );
                
                // persist feature
                //----------------
                
                daoContext.getFeatureDao().updateFeature( feat );
                log.info(" feature updated (full)");
                                                   
            } catch( Exception ex ) {
                log.error(ex);
                return null;
            }
        }
        log.info(" FEATs: done");
        
        try{
                    
            // attributes - persist attribute (and components)
            //------------------------------------------------

            log.info(" ATTRIBUTEs: update");

            if( node.getAttrs() != null ){
                for( NodeAttr attr: node.getAttrs() ){
                    log.info("(*) attr" + attr.toString() );

                    attr.setNode(node);

                    // attribute type 
                    //---------------
                    
                    CvTerm acvtype = daoContext
                        .getCvTermDao().getByAccession( attr.getCvType().getAc() );
                    
                    if( acvtype == null ){
                        acvtype = daoContext
                            .getCvTermDao().updateCvTerm( attr.getCvType() );                    
                    }
                    
                    log.info("acvtype: " + acvtype);
                    attr.setCvType( acvtype );
                    
                    // attribute source
                    //------------------
                    
                    Source asource = null;                 
                    log.info(" asource: " + attr.getSource().toString());
                    
                    if(  attr.getSource() != null ){
                        
                        CvTerm ascvtype = daoContext
                            .getCvTermDao().getByAccession( attr.getSource().getCvType().getAc() );
                        
                        if( ascvtype == null ){
                            ascvtype = daoContext
                                .getCvTermDao().updateCvTerm( attr.getSource().getCvType() );
                        }
                        log.info("ascvtype: " + ascvtype);
                        attr.getSource().setCvType( ascvtype );
                        
                        asource = daoContext
                            .getSourceDao().updateSource( attr.getSource() );
                    }
                    log.info(" attr source: " + asource);
                    
                    attr.setSource( asource );
                    
                    log.info(" attr source updated");
                    
                    attr = (NodeAttr) daoContext.getAttributeDao().updateAttribute( attr );

                    try{

                        // attribute xrefs
                        //----------------

                        log.info("Attribute XREFs: update ");
                        if( attr.getXrefs() != null ){
                            for( AttrXref x: attr.getXrefs()){
                                CvTerm xcvtype = daoContext
                                    .getCvTermDao().getByAccession( x.getCvType().getAc() );
                                
                                if( xcvtype == null ){
                                    xcvtype = daoContext
                                        .getCvTermDao().updateCvTerm( x.getCvType() );
                                    log.info("Attribute XREF: " + xcvtype );
                                }
                                x.setCvType( xcvtype );                    
                                x.setAttr( attr );
                                x.setSource(asource);
                                daoContext.getXrefDao().updateXref( x );                                    
                            }
                            log.info("Attr XREFs: update DONE");
                        }
                    }catch( Exception ex ) {
                        log.error(ex);
                    }
                }
            }

        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }

        log.info(" ATTRs: done");
        
        try{
            
            // aliases - persist alias (and components)
            //-----------------------------------------

            log.info(" ALIASes: update");

            if( node.getAlias() != null){
                for( NodeAlias alias: node.getAlias() ){
                    log.info("(*) alias" + alias.toString() );
                    
                    alias.setNode(node);
                    
                    CvTerm acvtype = daoContext
                        .getCvTermDao().getByAccession( alias.getCvType().getAc() );
                    
                    if( acvtype == null ){
                        acvtype = daoContext
                            .getCvTermDao().updateCvTerm( alias.getCvType() );
                        
                    }
                    log.info("acvtype: " + acvtype);
                    alias.setCvType( acvtype );
                    
                    daoContext.getAliasDao().updateAlias(alias);
                    
                }
            }
            
            return node;
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }



    public Node updateNode( Node node, List<NodeFeat> nflist ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " update node -> node=" + node.toString() );

        if( node.getNacc() == 0 ){ 
            int nid = daoContext.getIdGenDao().getNextId( Node.generator() );
            node.setNacc( nid );	    
        }

        node.setPrefix( bkdconf.getPrefix() );

        return node;
    }

    
    //---------------------------------------------------------------------
    // Source management
    //------------------
    /**
    public DipSource getSource( String accession ) {
        
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( " get node -> ac=" + accession );
        
        try{
            DipSource source = sourceDao.getByAccession( accession );            
            return source;
        } catch( Exception ex ) {
            return null;
        }
    }
    **/
    //---------------------------------------------------------------------
    // Evidence management
    //--------------------
    /**
    public DipEvidence getEvidence( String accession ) {
        
        Logger log = LoggerFactory.getLogger( this.getClass() );
        log.info( " get evid -> ac=" + accession );
        
        try{
            DipEvidence evid = evidenceDao.getByAccession( accession );            
            return evid;
        } catch( Exception ex ) {
            return null;
        }
    }
    **/

    //---------------------------------------------------------------------
    // Alias management
    //-----------------
    
    public void deleteAlias( Alias alias ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " delete alias -> ac=" + alias );
        
        try{
            daoContext.getAliasDao().deleteAlias( alias );            
            
        } catch( Exception ex ) {
            // should not happen
        }
    }



    
    //---------------------------------------------------------------------
    // Edge management
    //----------------
    
    public Edge getEdge( String accession ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get edge -> ac=" + accession );
        
        try{
            Edge edge = daoContext.getEdgeDao().getByAcc( accession );            
            return edge;
        } catch( Exception ex ) {
            return null;
        }
    }

    public Edge getEdge( Set<String> acset ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get edge(by node ac set)"  );
        
        try{
            Edge nedge = daoContext.getEdgeDao().getByNodeAccSet( acset );
            return nedge;
        } catch( Exception ex ) {
            return null;
        }
    }

    public Edge addEdge( Edge edge ){

        Edge iedge = (Edge) edge;
        
        edge.setPrefix( bkdconf.getPrefix() );
        
        if( iedge.getNacc() == 0 ){ 
            int eid = daoContext.getIdGenDao().getNextId( Edge.generator() );
            iedge.setNacc( eid );	    
        }
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add edge -> " + iedge );

        try{
            Edge nedge = daoContext.getEdgeDao().addEdge(  iedge );            
            return nedge;
        } catch( Exception ex ) {
            return null;
        }
    }

    
    //---------------------------------------------------------------------
    // Taxon management
    //-----------------

    public Taxon getTaxon( String ns, String ac ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get taxon -> ns=" + ns + " ac=" + ac );

        if( "taxid".equalsIgnoreCase( ns ) ){
            int itax = Integer.parseInt( ac );            
            return this.getTaxon( itax );
            
        }
        return null; 
    }
    
    public Taxon getTaxon( int taxid ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get taxon -> taxid=" + taxid );
        
        try{
            Taxon taxon = daoContext.getTaxonDao().getByTaxid( taxid );
            log.info( " found taxon -> id=" + taxon );
            
            return taxon;
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }

    public Taxon addTaxon( Taxon taxon ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add taxon -> " + taxon.toString() );
        
        try{
                      
            Taxon otax = daoContext.getTaxonDao().getByTaxid( taxon.getTaxid() );

            if( otax != null ){
                otax.setSciName( taxon.getSciName() );
                otax.setComName( taxon.getComName() );
                otax = daoContext.getTaxonDao().updateTaxon( otax );            
                return otax; 
            } else {
                taxon = daoContext.getTaxonDao().updateTaxon( taxon );            
                return taxon;
            }
        } catch( Exception ex ) {
            log.error(ex);
            return null;
        }
    }
    
    // CvTerm management
    //------------------

    public CvTerm getCvTerm( String ns, String acc ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get cv term -> acc=" + acc );
        
        try{
            CvTerm term = daoContext.getCvTermDao().getByAccession( acc );
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    public CvTerm getCvTerm( String acc ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get cv term -> acc=" + acc );
        
        try{
            CvTerm term = daoContext.getCvTermDao().getByAccession( acc );
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    public CvTerm addCvTerm( CvTerm term ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add cvterm -> " + term.toString() );
        
        try{
            CvTerm oterm = daoContext.getCvTermDao().getByAccession( term.getAc() );
            
            if( oterm != null ){
                oterm.setName( term.getName() );
                oterm.setDefinition( term.getDefinition() );
                term = daoContext.getCvTermDao().updateCvTerm( oterm );            
            } else {
                term = daoContext.getCvTermDao().updateCvTerm( term );
            }
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    // xref management

    /**
    public CvTerm getXref( String acc ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get cv term -> acc=" + acc );
        
        try{
            CvTerm term = daoContext.getCvTermDao().getByAccession( acc );
            return term;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }
    **/
    
    public Xref addXref( Xref xref ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " add xref -> " + xref.toString() );
        
        try{
            xref = daoContext.getXrefDao().updateXref( xref );            
            return xref;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }
    
    //--------------------------------------------------------------------------
    //Report Management
    //-----------------

    public Report getReport( String ns, String ac ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getReport -> ns=" + ns + " ac=" + ac );
        
        //Report report =  daoContext.getReportDao().getById( ns, ac );

        NodeFeatureReport report =
            daoContext.getReportDao().getNodeFeatureReportById( ns, ac );
        
        return report;
    }

    public Report getReport( String acc ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getReport ->  acc=" + acc );
        
        Report report =  daoContext.getReportDao().getNodeFeatureReportById( "", acc );
        return report;
    }

    public Report getReport( int id ) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " get report -> id(int)=" + id );
        
        try{
            Report report = daoContext.getReportDao().getByNac( id );            
            return report;
        } catch( Exception ex ) {
	    log.error(ex);
            return null;
        }
    }

    public Object getNewFeatureReportMap( String tgtNs, String tgtAc ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "getNewFeatureReportMap(ns,ac): "
                  +"ns->" + tgtNs + " ac->" + tgtAc);
        
        return getNewFeatureReportMap( tgtNs,tgtAc, null );        
    }

    public Object getNewFeatureReportMap( String tgtNs, String tgtAc,
                                          String cvtype ){

        Logger log = LogManager.getLogger( this.getClass() );
                
        NodeFeatureReport nfr = getNewFeatureReport( tgtNs, tgtAc, cvtype );

        log.info("New NodeFeatureReport" + nfr );
        log.info(" Target: " + tgtNs + " : " + tgtAc );
        log.info(" Type: " + cvtype );
        
        ProteinNode tgt = (ProteinNode) daoContext.getNodeDao().getByAcc( tgtAc, Node.BASE );

        log.info( "Target" + tgt );
        
        nfr.setNodeId( tgt.getPkey() );
        return nfr.toMap( tgt );
    }
    
    public NodeFeatureReport getNewFeatureReport( String tgtNs, String tgtAc ){
        return getNewFeatureReport( tgtNs,tgtAc, null );
    }
    
    public NodeFeatureReport getNewFeatureReport( String tgtNs, String tgtAc, String rtype ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " getNewFeatureReport -> tgt=" + tgtAc + " rtype=" + rtype);
        log.info( " getNewFeatureReport -> tns=" + tgtNs + " nat ns="+ bkdconf.getPrefix());
        
        Node tnode;

        if( bkdconf.getPrefix().equalsIgnoreCase(tgtNs) ){
            tnode = daoContext.getNodeDao().getByAcc( tgtAc, Node.BASE );
        } else {
            tnode = daoContext.getNodeDao().getById( tgtNs, tgtAc, Node.BASE );
        }

        log.info( " getNewFeatureReport -> tnode=" + tnode );
        
        NodeFeatureReport report = new NodeFeatureReport();
        report.setPrefix( bkdconf.getPrefix() );
        
        NodeFeat nfeat = new NodeFeat();
        //nfeat.setNode( tnode );
        report.setFeature( nfeat );

        if( rtype != null ){
            CvTerm tcv = daoContext.getCvTermDao().getByAccession( rtype );
            log.info( " getNewFeatureReport -> cvtype " + tcv );
            report.setCvType( tcv );
        }
            
        return report;
    }
    
    
    public  Map<String, Object> getReportMap( String ns, String ac ) {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "getReportMap -> ns=" + ns + " ac=" + ac );
        
        if( "upr".equalsIgnoreCase(ns) ){  

            ProteinNode pn = (ProteinNode) daoContext.getNodeDao().getById( ns, ac, Node.FULL );

            FeatureReport protRep = new FeatureReport();
            NodeFeat nfeat = new NodeFeat();
            //nfeat.setNode(pn);
            protRep.setFeature(nfeat);

          
            Map<String, Object> map = new HashMap<String,Object>();
            
            if( protRep == null ) return map;
        
            map.put( "report", protRep);
               
            //Map<String,Map<String,String>>
             
            map.put( "report-value", protRep.getJvalMap() );
                        
            return map;            
            
        } else {
            
            NodeFeatureReport rep = (NodeFeatureReport) this.getReport( ns, ac );
            
            Map<String, Object> map = new HashMap<String,Object>();

            if( rep == null ) return map;

            log.info( "BkdRecordManager.getReportMap:  nodeId -> " + rep.getNodeId() );

            if( rep.getNodeId() > 0 ){
                ProteinNode tgtn = (ProteinNode) daoContext.getNodeDao()
                    .getByPkey( rep.getNodeId(), Node.BASE );
                return rep.toMap( tgtn );
            }
                
            return map;
        }
    }
    
    public Report addReport( Report report) {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "addReport -> report=" + report.toString() );
        log.info( "addReport -> Jval= " + report.getJval() ); 
        
        if( report.getNacc() == 0 ){ 
            int rid = daoContext.getIdGenDao().getNextId( Report.generator() );
            report.setPrefix( bkdconf.getPrefix() );
            report.setNacc( rid );            
        }

        // CV Type
        //--------
        
        CvTerm rcvt = report.getCvType();

        rcvt = daoContext.getCvTermDao().getByAccession(rcvt.getAc());
        if( rcvt == null ){
            rcvt = daoContext.getCvTermDao()
                .updateCvTerm( report.getCvType() );
        }
        report.setCvType(rcvt);

        // Owner
        //------

        if( report.getOwner() == null ){
            log.info( "addReport -> defowner: userContext ->" + usrContext);
            BkdUser defowner = (BkdUser) usrContext.getUserDao().getUser("ADMIN");
            log.info( "addReport -> defowner: " + defowner );
            
            report.setOwner( defowner );
        } else {
            BkdUser owner = report.getOwner();
            log.info( "addReport -> owner: " + owner );
            
            owner = (BkdUser) usrContext.getUserDao()
                .getUser( owner.getLogin() );
            report.setOwner( owner );
        }

        log.info( "addReport -> owner", report.getOwner());
        
        
        //-------------------
        
        if( report instanceof NodeReport){
            log.info( "addReport -> NodeReport here...");
            log.info(((NodeReport) report).getNodeId()); // node must preexist !!!
            
        } else if( report instanceof NodeFeatureReport){

            log.info( "addReport -> FeatureReport here...");
            log.info(((NodeFeatureReport) report).getFeature());  // feature is new !!! 
            
            // commit feature here
            //--------------------
            
            //log.info( ((NodeFeat) ((FeatureReport) report).getFeature()).getNode() );

            // feature cv type: commit if needed
            //----------------------------------
            
            CvTerm fcvt = ((NodeFeatureReport) report).getFeature().getCvType();
            fcvt = daoContext.getCvTermDao().getByAccession(fcvt.getAc());
            if( fcvt == null ){
                fcvt = daoContext.getCvTermDao()
                    .updateCvTerm( ((NodeFeatureReport) report).getFeature().getCvType() );
            }
            ((NodeFeatureReport) report).getFeature().setCvType(fcvt);
            
            // feature source type/source: commit
            //-----------------------------------
            
            Source fsrc = ((NodeFeatureReport) report).getFeature().getSource();
            log.info("fsrc= " + fsrc); 

            // source cv type
            //----------------
            
            CvTerm scvt = fsrc.getCvType();
            log.info("fsrc.type= " + scvt);
            
            scvt = daoContext.getCvTermDao().getByAccession( scvt.getAc() );
            if( scvt == null ){
                scvt = daoContext.getCvTermDao()
                    .updateCvTerm( fsrc.getCvType() );
            }
            
            fsrc.setCvType(scvt);            
                        
            // source
            //-------
                       
            fsrc = daoContext.getSourceDao().updateSource( fsrc );
            ((NodeFeatureReport) report).getFeature().setSource( fsrc );          

            // feature: node
            //--------------
            
            //Node rnode = ((NodeFeat) ((FeatureReport) report).getFeature()).getNode();
            //log.info("feature node:" + rnode);
            //log.info("feature node: ns=" + rnode.getNs() + "ac=" + rnode.getAc());

            //Node testNode = null;
            
            //if( bkdconf.getPrefix().equalsIgnoreCase( rnode.getNs() ) ){                                        
            //    testNode = (Node) daoContext.getNodeDao().getByAcc( rnode.getAc(), Node.FULL );
            //} else { 
            //    testNode = (Node) daoContext.getNodeDao().getById( rnode.getNs(),
            //                                                       rnode.getAc(), Node.FULL );
            //}
            
            //log.info("feature node(test):" + testNode);  // node must exist
            //((NodeFeat) ((FeatureReport) report).getFeature()).setNode( testNode );

            NodeFeat rfeature = ((NodeFeatureReport) report).getFeature();

            // Persist CV Type
            //----------------
            
            CvTerm rcdef =
                daoContext.getCvTermDao().getByAccession( rfeature.getCvType().getAc() );
            rfeature.setCvType( rcdef );                    
            
            Set<Range> frl = rfeature.getRanges();
            rfeature.setRanges(new HashSet<Range>());
            
            // persist feature
            //----------------
            
            rfeature = daoContext.getFeatureDao().updateFeature( rfeature );
            log.info(" feature updated (core)");

            ((NodeFeatureReport) report).setFeature( rfeature );

            boolean idxFlag = false;
            int posidx = 0;
            String seqidx = "";
            
            for( Range r: frl ){
                log.info("R: "+r);

                if( idxFlag ){  // consecutive passes
                    posidx = 0;    // reset to 0
                    seqidx = "";   // reset to "" 
                } else {           // first pass: set only if single pos
                    idxFlag = true;
                    if( r.getStart() == r.getStop()
                        && r.getSequence() != null
                        && r.getSequence().length() == 1 ){
                        
                        posidx = r.getStart();
                        seqidx = r.getSequence(); 
                    }
                }

                if( idxFlag ){  // consecutive passes
                    posidx = 0;    // reset to 0
                } else {           // first pass: set only if single pos
                    idxFlag = true;
                    if( r.getStart() == r.getStop() ) posidx = r.getStart();                    
                }
                
                r.setFeature( rfeature );
                
                if(r.getCvStart() == null){                        
                    CvTerm rbcdef =
                        daoContext.getCvTermDao().getByName("unspecified");                        
                    r.setCvStart(rbcdef);
                } else {
                    CvTerm rbcdef =
                        daoContext.getCvTermDao().getByAccession( r.getCvStart().getAc() );
                    r.setCvStart(rbcdef);
                }

                if(r.getCvStop() == null){
                    CvTerm recdef =
                        daoContext.getCvTermDao().getByName("unspecified");                        
                    r.setCvStop(recdef);
                } else {
                    CvTerm recdef =
                        daoContext.getCvTermDao().getByAccession( r.getCvStop().getAc() );
                    r.setCvStop( recdef );                    
                }

                daoContext.getRangeDao().updateRange(r);
                rfeature.getRanges().add( r );
            }

            // set posidex
            //------------
            
            rfeature.setPosIdx( posidx );
            rfeature.setSeqIdx( seqidx );
            
            // feature xrefs
            //--------------
            
            for( FeatureXref x: rfeature.getXrefs()){
                log.info(x);
                
                CvTerm xcvtype = daoContext
                    .getCvTermDao().getByAccession( x.getCvType().getAc() );
                    
                if( xcvtype == null ){
                    xcvtype = daoContext
                        .getCvTermDao().updateCvTerm( x.getCvType() );
                    log.info("Feature XREF: " + xcvtype );
                }
                x.setCvType( xcvtype );                    
                x.setFeature( rfeature );
                x.setSource(fsrc);
                daoContext.getXrefDao().updateXref( x );                                    
            }
            log.info("Feature XREFs: update DONE");
                                                    
        }
            
        // cvtype - persist if needed
        //---------------------------
            
        CvTerm rcvtype = daoContext
            .getCvTermDao().getByAccession( report.getCvType().getAc() );
            
        if( rcvtype == null ){
            rcvtype = daoContext
                .getCvTermDao().updateCvTerm( report.getCvType() );
        }
        
        report.setCvType( rcvtype );
        
        // source - persist
        //-----------------

        log.info(report.getSource().getCvType());

        CvTerm scvtype = daoContext
            .getCvTermDao().getByAccession( report.getSource().getCvType().getAc() );
        
        if( scvtype == null ){
            scvtype = daoContext
                .getCvTermDao().updateCvTerm(report.getSource().getCvType());
        }
        
        report.getSource().setCvType(scvtype);
        
        Source rsource = daoContext
            .getSourceDao().updateSource( report.getSource() );

        report.setSource(rsource);

        // recommit updated report
        //------------------------
        
        report = daoContext.getReportDao().updateReport( report );
        
        log.info(" Report updated:" + report.getNacc());
        
        
        // xrefs - persist xterm and components if needed
        //-----------------------------------------------           
            
        for( ReportXref x: report.getXrefs() ){
                
            x.setReport( report );
                
            log.info(" (*) xref: " + x );
            log.info(" cvac" + x.getCvType().getAc());
		
            // persist components if needed

            // cvtype
            //-------
            
            CvTerm xcvtype = daoContext
                .getCvTermDao().getByAccession( x.getCvType().getAc() );
            
            log.info(" xcvtype(old): " + xcvtype );
                
            if( xcvtype == null ){
                xcvtype = daoContext
                    .getCvTermDao().updateCvTerm( x.getCvType() );
            }
            log.info("xcvtype: " + xcvtype);
            x.setCvType(xcvtype);
            
            log.info(" cvt updated");
            
            // source
            //-------
                
            Source xsource = x.getSource(); 
            			 
            if( xsource == null ){
                
                log.info(" xsource: " + x.getSource() );                
                x.setSource( report.getSource() );
                
            } else {
                
                CvTerm xscvtype = daoContext.getCvTermDao()
                    .getByAccession( xsource.getCvType().getAc() );

                if( xscvtype == null ){
                    xscvtype = daoContext
                        .getCvTermDao().updateCvTerm( xsource.getCvType() );
                }
                log.info("xscvtype: " + xscvtype);
                xsource.setCvType( xscvtype );
				    
                xsource = daoContext
                    .getSourceDao().updateSource( xsource );                
                x.setSource( xsource );
            }
            
            daoContext.getXrefDao().updateXref( x );                
            log.info(" (*) xref updated");            
        }
        
        return report;
    }
   
}
