package edu.ucla.mbi.bkd.server.soap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
 
import java.util.*;

import org.json.*;

import edu.ucla.mbi.dxf20.*;
import edu.ucla.mbi.bkd.store.*;
            
public class BkdLinkManager {
    
    private edu.ucla.mbi.dxf20.ObjectFactory dxfFactory
	= new edu.ucla.mbi.dxf20.ObjectFactory();
    
    BkdRecordManager recordManager;

    public void setRecordManager( BkdRecordManager manager ){
        this.recordManager = manager;
    }

    public NodeType getLink( String ns, String ac, String detail ){

        Logger log = LogManager.getLogger( BkdLinkManager.class );
        log.info("BkdLinkManager.getLink");
        
        //Node node = (Node) recordManager.getNode( ns, ac );
        //if( node == null ){
        //    return null;
        //}

        //if( node instanceof ProteinNode ){
        //    return this.toDxfProteinNode( (ProteinNode) node );	
        //}
        
        return null; 
    }
       
    public NodeType processLinkNode( NodeType node, String mode ){


        // Expected:
        

        
        Logger log = LogManager.getLogger( BkdLinkManager.class );
        log.info("BkdLinkManager.processLinkNode");
        /*
        String name = node.getName();
        String label = node.getLabel();
        String ns = node.getNs();
        String ac = node.getAc();
        
        // attribute-based
        //----------------
        String sequence ="";
        String comment ="";
        Source source = null; 
        
        // xref-based
        //-----------
        
        String taxid = "";             
        String rsq_prot ="";
        String upr ="";

        ProteinNode curNode = new ProteinNode();
        
        ProteinNode oldNode =
            (ProteinNode) recordManager.getNode( ns, ac ); 
        
        if( oldNode != null ){
            curNode = oldNode;
            
            if( mode.equalsIgnoreCase( "add" ) ){
                //return this.toDxfProteinNode( oldNode );
            }
            if( mode.equalsIgnoreCase( "update" ) ){
                //return this.toDxfProteinNode( oldNode );
            }
            //return this.toDxfProteinNode( oldNode );	    
        } else {
            try{
                
                String snacc = ac.replaceAll("\\D","");
                int inacc = Integer.parseInt( snacc );
                curNode.setNacc(inacc);
            } catch(Exception ex){
                ex.printStackTrace();
            }

        }
		
        // attribute scan
        //---------------

        List<NodeAlias> aliasList = new ArrayList<NodeAlias>();
        List<NodeAttr> attrList = new ArrayList<NodeAttr>();
        
        for( AttrType att: node.getAttrList().getAttr() ){
            
            String aval = null;
            if( att.getValue() != null ){
                aval = att.getValue().getValue();
            }
            NodeType anode = att.getNode();
            TypeDefType atype = att.getType();
            
            String attNs = att.getNs();
            String attAc = att.getAc();
                        
            if( att.getName().equalsIgnoreCase("sequence") && aval != null ){
                sequence = aval;
            } else if( att.getAc().equalsIgnoreCase("dxf:0087") ){ // comment
                comment = aval;

            } else if( recordManager.getBkdConfig()
                       .getStoredAliasAcList().contains( att.getAc() ) ){

                // stored aliases

                CvTerm cvtype = new CvTerm( "dxf", att.getAc(), att.getName() );                    
                NodeAlias nal = new NodeAlias( cvtype, aval );

                aliasList.add( nal );

            } else if( recordManager.getBkdConfig()               
                       .getStoredAttrAcList().contains( att.getAc() ) ){

                // stored attributes
                
                CvTerm cvtype = new CvTerm( att.getNs(), att.getAc(),
                                            att.getName() );
                
                NodeAttr nat = new NodeAttr( cvtype, aval );

                // test for xrefs
                log.info("ATTR:" + att); 
                if( att.getXrefList() != null ){
                    List<XrefType> xtlist = att.getXrefList().getXref();
                    for( XrefType xt : xtlist ){
                        log.info(xt);

                        // add xref
                        AttrXref axref = new AttrXref();

                        axref.setNs( xt.getNs() );
                        axref.setAc( xt.getAc() );
                        
                        CvTerm cvt = new CvTerm( xt.getTypeNs(), xt.getTypeAc(),
                                                 xt.getType() );

                        // persist if needed ? 

                        axref.setCvType(cvt);                                                   
                        nat.getXrefs().add( axref );                        
                    }
                }
                
                // test for source and add if present ? 
                
                attrList.add( nat );
                
            } else if( att.getAc().equalsIgnoreCase("dxf:0016") ){

                // data-source
                
                log.info("Attribute: data-source");
                source = this.buildSource( att );                    
            }
        }

        log.info("SRC: " + source);
        
        // xref scan
        //----------
        
        List<NodeXref> xrefList = new ArrayList<NodeXref>();
        
        for( XrefType x: node.getXrefList().getXref() ){
            if( x.getTypeAc().equalsIgnoreCase( "dxf:0007" ) ){    // produced-by
                NodeType xnode = x.getNode();
                if(xnode == null) continue; 
                TypeDefType ntype = xnode.getType();
                if( ntype.getAc().equalsIgnoreCase("dxf:0017") ){  // organism
                    taxid = x.getAc();
                    int itaxid = 0;
                    
                    try{
                        itaxid = Integer.parseInt( taxid );
                    } catch(  NumberFormatException ex ) {
                        // ignore
                    }
                    
                    if( itaxid == 0 ) return null;
                    
                    // test if taxon known
                    
                    if( recordManager.getTaxon(itaxid) == null ){

                        // unknown: create new taxon record
                        
                        String sciName = xnode.getLabel();
                        if( sciName == null) sciName = "";
                        
                        String comName = xnode.getName();
                        if( comName == null) comName = "";
                        
                        recordManager.addTaxon( new Taxon( itaxid,
                                                           sciName,
                                                           comName) );
                    }

                    
                } else if(ntype.getAc().equalsIgnoreCase("dxf:0025") ){  // xref: gene
                    
                    NodeXref nxref = new NodeXref();
                    nxref.setNs(x.getNs());
                    nxref.setAc(x.getAc());
                    
                    CvTerm cvt = new CvTerm( "dxf", "dxf:0007", "produced-by" );  // persist if needed ? 
                    nxref.setCvType(cvt);
                    //nxref.setSource( source );  // test for local overwrite ?
                    
                    xrefList.add( nxref );
                    
                } else if(ntype.getAc().equalsIgnoreCase("dxf:0053") ){  // xref: rsq-rna
                    
                    NodeXref nxref = new NodeXref();
                    nxref.setNs( x.getNs() );
                    nxref.setAc( x.getAc() );
                    
                    CvTerm cvt = new CvTerm( "dxf", "dxf:0007", "produced-by" );   // persist if neded ?
                    nxref.setCvType( cvt );
                    //nxref.setSource( source );  // test for local overwrite ?
                    xrefList.add( nxref );                                       
                }
            } else if( x.getTypeAc().equalsIgnoreCase( "dxf:0009" ) ){  // identical-to
                //xxx NodeType xnode = x.getNode();
                //xxx TypeDefType ntype = xnode.getType();
                //if(ntype.getAc().equalsIgnoreCase("dxf:0003") ){         // protein
                //    if( xnode.getNs().equalsIgnoreCase("rsq") ){         // refseq
                //        rsq_prot = x.getAc();
                //    }else if( xnode.getNs().equalsIgnoreCase("upr") ){   // uniprot
                //        upr = x.getAc();
                //    }
                //}

                if( "upr".equalsIgnoreCase(x.getNs()) ){
                    upr = x.getAc();
                    curNode.setUpr(upr);
                    System.out.println("upr:" + upr);
                }

                if( "rsq".equalsIgnoreCase(x.getNs()) ){
                    rsq_prot = x.getAc();
                    curNode.setRsq(rsq_prot);
                    System.out.println("rsq:" + rsq_prot);
                }
                
            } else {                                                   // xrefs
                                
                NodeXref nxref = new NodeXref();
                nxref.setNs(x.getNs());
                nxref.setAc(x.getAc());
                
                CvTerm cvt = new CvTerm( x.getTypeNs(), x.getTypeAc(), x.getType() );  // persist if needed ? 
                nxref.setCvType(cvt);
                //nxref.setSource( source );  // test for local overwrite ?
                
                xrefList.add( nxref );
                                
            }    
        }
        
        log.info("XREFS: DONE");
        
        // feature scan
        //-------------

        List<NodeFeat> featureList = new ArrayList<NodeFeat>();


        log.info("FEATURES: " + node.getFeatureList());
        if( node.getFeatureList() != null ){
            
            for( FeatureType cf: node.getFeatureList().getFeature() ){  // go over dxf
                
                log.info( "FEATURE: " + cf );                    
                
                NodeFeat cnf = new NodeFeat();
                JSONObject jval = new JSONObject();

                // set source
                //-----------

                //cnf.setSource(source);  // test for local overwrite ?
            
                // set name/label
                //---------------
                String flab = cf.getLabel();
                String fnam = cf.getName();
            
                // retrieve/persist/add type
                //--------------------------
                TypeDefType cft = cf.getType();
                CvTerm cvt = new CvTerm( cft.getNs(), cft.getAc(),cft.getName() );
                cnf.setCvType(cvt);

            
                // location scan
                //--------------
                for( LocationType cl: cf.getLocationList().getLocation() ){
                    Range crng = this.buildRange( cl );
                    cnf.getRanges().add(crng);                                               
                }

                // attribute scan
                //---------------
                if( cf.getAttrList() != null ){

                    
                    for( AttrType catt: cf.getAttrList().getAttr() ){
                        //String ns = catt.getNs();
                        //String ac = catt.getAc();

                        if( catt.getValue() != null ){

                            AttrType.Value aval = catt.getValue();
                            
                            String vns = aval.getNs();
                            String vac = aval.getAc();
                            String vtns = aval.getTypeNs();
                            String vtac = aval.getTypeAc();
                            String vval = aval.getValue();
                            
                            //aval = att.getValue().getValue();
                        }
                        
                        NodeType anode = catt.getNode();
                        TypeDefType atype = catt.getType();
                        
                        String attNs = catt.getNs();
                        String attAc = catt.getAc();
                        
                        if( catt.getAc().equalsIgnoreCase("dxf:0087") ){ // comment
                            
                            if( catt.getValue() != null ){
                                String cval = catt.getValue().getValue();
                                if( cval != null && cval.length() > 0 ){
                                    cnf.setComment( cval );
                                }
                            }
                            
                        } else if( catt.getAc().equalsIgnoreCase("dxf:0052") ){ // ev method
                            
                            if( catt.getValue() != null ){
                                String vns = catt.getValue().getNs();
                                String vac = catt.getValue().getAc();
                                if( vns  != null && vac != null ){
                                    
                                    // look for cv term, add if new
                                    
                                    //CvTerm term = new CvTerm(vns, vac, "");
                                    //term.setDefinition( "" );   
                                    CvTerm term =
                                        (CvTerm) recordManager.getCvTerm( vns, vac );
                                    if( term == null ){
                                        term = new CvTerm(vns, vac, "");
                                        term = (CvTerm) recordManager.addCvTerm( term );
                                    }
                                    
                                    if( term != null ){
                                        
                                        JSONObject jatt = new JSONObject();
                                        
                                        try{
                                            jatt.put( "value", term.getName() );
                                            jatt.put( "ns", catt.getNs() );
                                            jatt.put( "ac", catt.getAc() );
                                            jatt.put( "vns", term.getNs() );
                                            jatt.put( "vac", term.getAc() );
                                            
                                            jval.put("evidence-method", jatt) ;
                                            
                                        }catch(JSONException jx){
                                            // shouldn't happen
                                        }
                                    }
                                }
                            }
                            
                        } else {  // others
                            
                            if( catt.getValue() != null ){
                                String cval = catt.getValue().getValue();
                                if( cval != null && cval.length() > 0 ){
                                    
                                    // JSON value 
                                    
                                    JSONObject jatt = this.buildJAtt( catt );
                                    if( jatt != null ){
                                        try{
                                            jval.put(catt.getName(), jatt) ;
                                        } catch(JSONException jx){
                                            // shouldn't happen
                                        }
                                    }
                                    /  *
                                      JSONObject jatt = new JSONObject();
                                      try{
                                      jatt.put( "value", cval );
                                      jatt.put( "ns",catt.getNs() );
                                      jatt.put( "ac",catt.getAc() );
                                      if( catt.getValue().getNs() != null &&
                                      catt.getValue().getNs().length() > 0  ){
                                      jatt.put( "vns", catt.getValue().getNs() );                                 
                                      }
                                      if( catt.getValue().getAc() != null &&
                                      catt.getValue().getAc().length() > 0  ){
                                      jatt.put( "vac", catt.getValue().getAc() );                                 
                                      }
                                      jval.put(catt.getName(), jatt) ;
                                      }catch(JSONException jx){
                                      // shouldn't happen
                                      }
                                    *  /
                                } else {
                                    
                                }
                                
                            }                    
                        }            
                    } 
                }
                
                // feature xrefs
                //--------------
            
                if( cf.getXrefList().getXref().size() > 0){            
                    for( XrefType cx: cf.getXrefList().getXref() ){

                        FeatureXref fxref = (FeatureXref)
                            this.buildXref( cx,  new FeatureXref(), source );

                        /  *
                          FeatureXref fxref = new FeatureXref();
                    
                          fxref.setNs( cx.getNs() );
                          fxref.setAc( cx.getAc() );
                    
                          CvTerm ftype = new CvTerm( cx.getTypeNs(), cx.getTypeAc(), cx.getType() );
                          fxref.setCvType( ftype );
                    
                          fxref.setSource( source );  // test for local overwrite ?
                        *  /
                        cnf.getXrefs().add( fxref );                
                    }
                }
                
                cnf.setJval(jval.toString());
                //curNode.getFeats().add( cnf );
                featureList.add(cnf); // ?????????
            }         
        }

        log.info( " Name: " + name + " Label: " + label + " Taxid: " + taxid );
        log.info( " Ns: " + ns + " Ac: " + ac );
        log.info( " rsq_prot: " + rsq_prot + " upr:" + upr);
        
        // check if taxon present
        //-----------------------
        int itx = 0;
        try{
            itx = Integer.parseInt( taxid );
        } catch(  NumberFormatException ex ){
            
        }
        if( itx == 0 ){
            return null;
        }
        
        Taxon newTx = new Taxon( itx, "", "");  // only stub 
        
        curNode.setCvType( new CvTerm( "dxf", "dxf:0003", "protein" ) );
	    
        if( ns.equalsIgnoreCase("upr") ){
            curNode.setUpr( ac );
        } else if (ns.equalsIgnoreCase("rsq") ){
            curNode.setRsq( ac );
        } else if (ns.equalsIgnoreCase("dip") ){
            curNode.setDip( ac );
        }
        curNode.setTaxon( newTx );
        
        curNode.setName( name );
        curNode.setLabel( label );
        curNode.setSequence( sequence );
        curNode.setComment( comment );
        
        for( NodeAlias nal: aliasList ){
            nal.setNode( curNode );
            curNode.getAlias().add( nal );	   
        }
        
        for( NodeXref cxr: xrefList ){
            cxr.setNode( curNode );
            cxr.setSource( source );
            curNode.getXrefs().add( cxr );	   
        }	   
        
        for( NodeAttr cnat: attrList ){
            cnat.setNode( curNode );
            cnat.setSource( source );
            //for( NodeAttr ccnat: cnat.getAttrList() ){
            //    ccnat.setSource( source );
            //}
            
            curNode.getAttrs().add( cnat );	   
        }

        for( NodeFeat cnft: featureList ){
            cnft.setNode( curNode );
            log.info("feature source: " + source);
            cnft.setSource( source );
            //for( NodeAttr ccnft: cnft.getAttrList() ){
            //    ccnft.setSource( source );
            //}
            for( FeatureXref ccxft: cnft.getXrefs() ){
                ccxft.setSource( source );
            }
            
            curNode.getFeats().add( cnft );	   
        }
                
        curNode = (ProteinNode) recordManager.addNode( curNode );
        if( curNode == null ){
            return null;
        }	
        return this.toDxfProteinNode( curNode );
        */

        return null;

    }
    
}
 
