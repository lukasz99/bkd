package edu.ucla.mbi.bkd.server.soap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
 
import java.util.*;

import org.json.*;

import edu.ucla.mbi.dxf20.*;
import edu.ucla.mbi.bkd.store.*;
            
public class BkdNodeManager {
    
    private edu.ucla.mbi.dxf20.ObjectFactory dxfFactory
	= new edu.ucla.mbi.dxf20.ObjectFactory();
    
    BkdRecordManager recordManager;

    public void setRecordManager( BkdRecordManager manager ){
        this.recordManager = manager;
    }

    public NodeType processCVTermNode( NodeType node, String mode ){
        
        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.processCVTermNode");
        
        // Expected:
        //
        //  <node id="1" ns="mesh" ac="D000595">
        //    <type ns="dxf" name="cv-term" ac="dxf:0030"/>
        //    <label>Amino Acid Sequence</label>
        //  </node>
        //
        //  or 
        //
        //  <node id="2" ns="mi" ac="MI:0496">
        //    <type ns="dxf" name="cv-term" ac="dxf:0030"/>
        //    <label>bait</label>
        //    <attributeList>
        //      <attribute name="definition" ns="dxf" ac="dxf:0032">
        //        <value>Molecule experimentally treated to capture its interacting partners.</value>
        //      <attribute>
        //    </attributeList>
        //  </node>
		
        String name = node.getName();
        String label = node.getLabel();
        String ns = node.getNs();
        String ac = node.getAc();
        
        // attribute-based
        //----------------

        String definition ="";
        
        for( AttrType att: node.getAttrList().getAttr() ){
            
            String aval = null;
            if( att.getValue() != null ){
                aval = att.getValue().getValue();
            }
            NodeType anode = att.getNode();
            TypeDefType atype = att.getType();
            
            String attNs = att.getNs();
            String attAc = att.getAc();
            
            if( att.getName().equalsIgnoreCase("definition") && aval != null ){
                definition = aval;
            }
            break;
        }
        
        if( mode.equalsIgnoreCase("add") ){
            CvTerm term = new CvTerm(ns, ac, label);
            term.setDefinition( definition );   
            CvTerm newTerm = (CvTerm) recordManager.addCvTerm( term );
            if( newTerm == null ){
                return null;
            }	
            return this.toDxfCvTermNode( newTerm );	
        }
        
        return null; 
    }

    public NodeType getCvTermNode( String ns, String ac, String detail ){

        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.getCVTermNode");

        CvTerm term = (CvTerm) recordManager.getCvTerm( ns, ac );
        if( term == null ){
            return null;
        }	
        return this.toDxfCvTermNode( term );	
        
    }
    
    public NodeType processTranscriptNode( NodeType node, String mode ){
        System.out.println( "BkdNodeManager.processTranscriptNode:" + mode );
        return null; 
    }

    public NodeType processGeneNode( NodeType node, String mode ){
        System.out.println( "BkdNodeManager.processGeneNode:" + mode );
        return null; 
    }

    public NodeType getNode( String ns, String ac, String detail ){

        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.getNode");
        
        Node node = (Node) recordManager.getNode( ns, ac );
        if( node == null ){
            return null;
        }

        if( node instanceof ProteinNode ){
            return this.toDxfProteinNode( (ProteinNode) node );	
        }
        
        return null; 
    }
    
    public NodeType processTaxonNode( NodeType node, String mode ){

        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.processTaxonNode");
        
        // Expected:
        //
        //<node id="1" ns="taxid" ac="9606">
        //  <type ns="dxf" name="taxon" ac="dxf:0017"/>
        //  <label>Homo sapiens</label>
        //  <name>Human</name>
        //</node>

        String comname = node.getName();
        String sciname = node.getLabel();
        String ns = node.getNs();
        String strTaxid = node.getAc();

        int intTaxid = 0;
        try{
            intTaxid = Integer.parseInt( strTaxid );  
        }catch( NumberFormatException ex ){
            // shouldn't happen
        }
        
        if( mode.equalsIgnoreCase("add") ){
            Taxon taxon = new Taxon( intTaxid, sciname, comname );
            Taxon newTaxon = (Taxon) recordManager.addTaxon( taxon );
            if( newTaxon == null ){
                return null;
            }	
            return this.toDxfTaxonNode( newTaxon );	
        }
        return null; 
    }

    public NodeType getTaxonNode( String ns, String ac, String detail ){

        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.getTaxonNode");

        Taxon taxon = (Taxon) recordManager.getTaxon( ns, ac );
        if( taxon == null ){
            return null;
        }	
        return this.toDxfTaxonNode( taxon);        
    }
    
    public NodeType processProteinNode( NodeType node, String mode ){

        // Expected:
        //
        //<node ac="$ns" ns="$rac" id="1">                                                                                                                                                                               
        // <type name="protein" ac="dxf:0003" ns="dxf"/>                                                                                                                                                                 
        // <label>$label</label>                                                                                                                                                                                     
        // <name>$name</name>
        // <featureList>
        //   <feature>
        //     <type ns="mi" name="mutation" ac="MI:0118"/>   <!-- mutation -->
        //     <label>p.[Val113Ile]
        //     <locationList>
        //       <location>
        //         <begin>113</begin>
        //         <end>113</end>
        //       <location>
        //     </locationList>
        //     <xrefList>
        //       <xref ns="dbSNP" ac="rs:757933370" type="mutation" typeAc="MI:0118" typeNs="mi"/>
        //       <xref ns="pubmed" ac="16636649" type="described-by" typeAc="dxf" typeNs="dxf:0014"/>
        //       <!-- <xref ns="mim" ac="" type="has-phenotype" typeAc="" typeNs=""/> -->
        //     </xrefList>
        //     <attrlist>
        //       <attr name="resulting sequence" ns="mi" ac="MI:1308">
        //         <value>I</value>
        //       </attr>
        //       <attr name="data-source" ns="dxf" ac="dxf:0016">
        //         <type ns="dxf"  name="publication" ac="dxf:0055"/>
        //         <node id="1" ns="pubmed" ac="16636649">
        //           <type ns="dxf"  name="article" ac="16636649"/>
        //           <label>Zenteno2006</label>
        //         </node>
        //       </attr>
        //     <attrlist>
        //   </feature>
        //</featureList>
        // <xrefList>
        //  <xref type="produced-by" typeAc="dxf:0007" typeNs="dxf" ac="4932" ns="taxid">
        //      <node id="1" ns="taxid" ac="4932">
        //        <type ns="dxf" ac="dxf:0017" name="organism"/>
        //        <label>yeast</label>
        //        <name>S cerevisiae</name>
        //      </node>	
        //  </xref>
        //  <xref ns="rsq" ac="NM_001179927.1" typeNs="dxf" typeAc="dxf:0007" type="produced-by">
        //      <node id="1" ns="rsq" ac="rsq">
        //        <type ns="dxf" ac="dxf:0053" name="rna"/>
        //        <label></label>
        //        <name></name>
        //      </node>
        //    </xref>
        //    <xref ns="geneid" ac="850504" typeNs="dxf" typeAc="dxf:0007" type="produced-by">
        //      <node id="1" ns="geneid" ac="geneid">
        //        <type ns="dxf" ac="dxf:0025" name="gene"/>
        //        <label></label>
        //        <name></name>
        //      </node>
        //    </xref>
        //    <xref ns="rsq" ac="NP_116614.1" typeNs="dxf" typeAc="dxf:0009" type="identical-to">
        //      <node id="1" ns="" ac="">
        //        <type ns="dxf" ac="dxf:0025" name="gene"/>
        //        <label></label>
        //        <name></name>
        //      </node>
        //    </xref>

        // <xref ns="upr" ac="A12345" typeNs="dxf" typeAc="dxf:0036" type="replaces">   <- secondary accession

        //  </xrefList>
        //  <attrList>
        //    <attr ns="dxf" ac="dxf:0000" name="sequence">
        //      <value>
        //        MDSEVAALVIDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGIMVGMGQKDSY
        //        VGDEAQSKRGILTLRYPIEHGIVTNWDDMEKIWHHTFYNELRVAPEEHPVLLT
        //        EAPMNPKSNREKMTQIMFETFNVPAFYVSIQAVLSLYSSGRTTGIVLDSGDGV
        //        THVVPIYAGFSLPHAILRIDLAGRDLTDYLMKILSERGYSFSTTAEREIVRDIK
        //        EKLCYVALDFEQEMQTAAQSSSIEKSYELPDGQVITIGNERFRAPEALFHPSVL
        //        GLESAGIDQTTYNSIMKCDVDVRKELYGNIVMSGGTTMFPGIAERMQKEITALA
        //        PSSMKVKIIAPPERKYSVWIGGSILASLTTFQQMWISKQEYDESGPSIVHHKCF
        //      </value>
        //   </attr>
        //   <attr ns="dxf" ac="dxf:0000" name="comment">
        //      <value>my comment</value>
        //   </attr>


        //   <attr ns="dxf" ac="dxf:0031" name="synonym">   
        //      <value>alias</value>              -> alias
        //   </attr>

        //   <attr ns="dxf" ac="dxf:0102" name="gene-name">
        //      <value>gene(primary)</value>      -> alias
        //   </attr>

        //   <attr ns="dxf" ac="dxf:0103" name="gene-synonym">
        //      <value>gene(secondary)</value>    -> alias
        //   </attr>

        //   <attr ns="dxf" ac="dxf:0000" name="comment">
        //      <value>my comment</value>         -> alias
        //   </attr>       
        
        //   <attr ns="dxf" ac="dxf:1234" name="function">
        //     <type ns="dxf" ac="dxf:0025" name="source"/>
               
        //
        //   </attr>       
        
        //   <attr ns="dxf" ac="dxf:0000" name="source">
        //     <type ns="dxf" ac="dxf:0025" name="source"/> 
        //     <node id="1" ns="" ac="">
        //       <type ns="dxf" ac="dxf:0057" name="person"/>
        //       <label>Schmoo, J</label>
        //       <name>Schmoo, John</name>
        //       <attrList>
        //          <attr ns="dxf" ac="dxf:0000" name="orcid">
        //            <value>https://orcid.org/1111-1111-1111-1111</value>
        //          </attr>
        //       <attrList>
        //     </node>   
        //   </attr>
        //  </attrList>
        //</node>                                                                                                                                                                                                        
        
        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.processProteinNode");
		
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
            } else if( att.getAc().equalsIgnoreCase("dxf:0031") ||  // synonym
                       att.getAc().equalsIgnoreCase("dxf:0102") ||  // gene-name
                       att.getAc().equalsIgnoreCase("dxf:0103")     // gene-synonym
                       ){ 
                
                CvTerm cvtype = new CvTerm( "dxf", att.getAc(), att.getName() );                    
                NodeAlias nal = new NodeAlias( cvtype, aval );

                aliasList.add( nal );

            } else if( att.getAc().equalsIgnoreCase("dxf:0104") ||  // function
                       att.getAc().equalsIgnoreCase("dxf:0106") ||  // subcellular-location
                       att.getAc().equalsIgnoreCase("dxf:0107") ||  // tissue-specificity
                       att.getAc().equalsIgnoreCase("dxf:0109")     // activity-regulation
                       ){ 
                
                CvTerm cvtype = new CvTerm( att.getNs(), att.getAc(), att.getName() );                    
                NodeAttr nat = new NodeAttr( cvtype, aval );

                // test for source and add if present ? 
                
                attrList.add( nat );
                
            } else if( att.getAc().equalsIgnoreCase("dxf:0016") ){ // data-source
                
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
                if( ntype.getAc().equalsIgnoreCase("dxf:0017") ){        // organism
                    taxid = x.getAc();   		    
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
                NodeType xnode = x.getNode();
                TypeDefType ntype = xnode.getType();
                if(ntype.getAc().equalsIgnoreCase("dxf:0003") ){         // protein
                    if( xnode.getNs().equalsIgnoreCase("rsq") ){         // refseq
                        rsq_prot = x.getAc();
                    }else if( xnode.getNs().equalsIgnoreCase("upr") ){   // uniprot
                        upr = x.getAc();
                    }
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
                                /*
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
                                */
                            } else {
                            
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

                        /*
                          FeatureXref fxref = new FeatureXref();
                    
                          fxref.setNs( cx.getNs() );
                          fxref.setAc( cx.getAc() );
                    
                          CvTerm ftype = new CvTerm( cx.getTypeNs(), cx.getTypeAc(), cx.getType() );
                          fxref.setCvType( ftype );
                    
                          fxref.setSource( source );  // test for local overwrite ?
                        */
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
    }

    public NodeType processReportNode( NodeType node, String mode ){
                
        //<node id="1" ns="" ac="">
        //  <type ns="dxf" name="report" ac="dxf:0000"/>
        //  <label>mutation report</label>
        //  <xrefList>
        //    <xref ns="upr" ac="O00180" type="describes" typeAc="DXF:0024" typeNs="dxf">
        //      <node>
        //        <type ns="mi" name="protein" ac="dxf:0000"/>
        //        <label>O00180</label>           
        //        <featureList>
        //          <feature>
        //            <type ns="mi" name="mutation" ac="MI:0118"/>   <!-- mutation -->
        //            <label>p.[Val113Ile]
        //            <locationList>
        //              <location>
        //                <begin>113</begin>
        //                <end>113</end>
        //                <attrList>
        //                  <attr name="resulting sequence" ns="mi" ac="MI:1308">
        //                    <value>I</value>
        //                  </attr>        
        //                </attrList>
        //              <location>
        //            </locationList>
        //          </feature>
        //        </featureList>
        //      </node>
        //    </xref>
        //    <xref ns="dbSNP" ac="rs:757933370" type="mutation" typeAc="MI:0118" typeNs="mi"/>
        //    <xref ns="pubmed" ac="16636649" type="described-by" typeAc="dxf" typeNs="dxf:0014"/>
        //    <!-- <xref ns="mim" ac="" type="has-phenotype" typeAc="" typeNs=""/> -->          
        //  </xrefList>
        //  <attrlist>          
        //    <attr name="data-source" ns="dxf" ac="dxf:0016">
        //      <value ns="orcid"  ac="orcid:1234-1234-1234" type="person" typeNs="dxf" typeAc="dxf:0056"/>
        //    </attr>
        //    <attr name="field-1" ns="dxf" ac="dxf:0000">
        //      <value>value 1</value>
        //    </attr>  
        //    <attr name="field-2" ns="dxf" ac="dxf:0000">
        //      <value>value 1</value>
        //    </attr>  
        //  <attrlist>        
        //</node>

        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.processReportNode");
		
        String rname = node.getName();
        String rlabel = node.getLabel();
        String rns = node.getNs();
        String rac = node.getAc();
        CvTerm rtype = null;
        
        if( node.getType() != null ){
            rtype = new CvTerm( node.getType().getNs(),
                                node.getType().getAc(),
                                node.getType().getName() );
        }
        
        Source rSource = null;     // report source
        Node tgtNode = null;        // target node
        NodeFeat tgtFeat = null;    // target feature        
        
        JSONObject jval = new JSONObject();
         
        // attribute scan
        //---------------

        if( node.getAttrList() != null ){
            for( AttrType att: node.getAttrList().getAttr() ){
                log.info(att.getName());
                String aval = null;
                if( att.getValue() != null ){
                    aval = att.getValue().getValue();
                }
                NodeType anode = att.getNode();
                TypeDefType atype = att.getType();
                
                String attNs = att.getNs();
                String attAc = att.getAc();
                
                if( "dxf:0016".equalsIgnoreCase(att.getAc() ) ){  // data-source
                    log.info("Attribute: data-source :SRC: " + att.toString() );
                    
                    rSource = this.buildSource( att );
                    
                } else {                    
                    if( att.getValue() != null ){
                        String cval = att.getValue().getValue();
                        if( cval != null && cval.length() > 0 ){

                            // JSON value 
                            
                            JSONObject jatt = this.buildJAtt( att );
                            if( jatt != null ){
                                try{
                                    jval.put(att.getName(), jatt) ;
                                } catch(JSONException jx){
                                    // shouldn't happen
                                }                                
                            }
                        } else {
                            // cval here ?
                        }                           
                    }
                }
            }
        }
        
        // xref scan
        //----------
        
        List<ReportXref> rxrefList = new ArrayList<ReportXref>();
                
        for( XrefType x: node.getXrefList().getXref() ){
            if( x.getTypeAc().equalsIgnoreCase( "dxf:0024" ) ){ // describes:tgtNode here
                String tgtNs = x.getNs();
                String tgtAc = x.getAc();               

                log.info( "TGT: NS=" + tgtNs + " AC=" + tgtAc );
                
                // test if present

                tgtNode = (Node) recordManager.getNode( tgtNs, tgtAc );
                log.info( "TGT: " + tgtNode);
                                
                // find/set tgtNode
                
                NodeType xnode = x.getNode();
                if(xnode == null) continue;                

                TypeDefType tgtType = xnode.getType();                
                
                // test if features present
                // find/set tgtFeat

                if( xnode.getFeatureList() == null) continue;
                
                for( FeatureType f: xnode.getFeatureList().getFeature() ){                   
                    log.info( "TGT FEATURE:" + f.toString());
                    
                    if( f.getLocationList() == null) break;
                    
                    tgtFeat = new NodeFeat();

                    // feature label/name
                    //-------------------

                    tgtFeat.setLabel( f.getLabel() );


                    if( f.getName() != null ){
                        tgtFeat.setName( f.getName() );
                    } else {
                        tgtFeat.setName( "" );
                    }
                    
                    // feature type
                    //-------------
                    
                    CvTerm cvt = new CvTerm( f.getType().getNs(),
                                             f.getType().getAc(),
                                             f.getType().getName() );
                    tgtFeat.setCvType( cvt );
                    
                    // location scan
                    //--------------

                    for( LocationType cl: f.getLocationList().getLocation() ){
                        Range crng = this.buildRange( cl );
                        tgtFeat.getRanges().add(crng);                                               
                    }
                    
                    // xref scan
                    //----------

                    if( f.getXrefList() != null ){
                        
                        for( XrefType cx: f.getXrefList().getXref() ){
                            FeatureXref fxref = (FeatureXref)
                                this.buildXref( cx, new FeatureXref(), null );
                            
                            fxref.setFeature( tgtFeat );
                            tgtFeat.getXrefs().add( fxref );                                               
                        }
                    }                    
                                     
                    break;
                }
            } else {
                // xrefs
                
                ReportXref rxref = (ReportXref)
                    this.buildXref( x, new ReportXref(), null ); // set source
                //nrep.getXrefs().add( rxref );

                rxrefList.add( rxref );
            }        
        }

        /*
          NodeReport nrep = new NodeReport();

          Node tgtNode = null;        // target node
          NodeFeat tgtFeat = null;    // target feature        
          
          Source rSource = null;     // report source
          
          JSONObject jval = new JSONObject();
        */
        
        if( tgtNode == null || rSource == null) return null;

        Report rep = null;
        
        if( tgtFeat != null ){
            rep = new FeatureReport();
            tgtFeat.setNode( tgtNode );
            tgtFeat.setSource( rSource );
            
            ((FeatureReport) rep).setFeature( tgtFeat );
            
        } else {
            rep = new NodeReport();
            ((NodeReport) rep).setNode( tgtNode );
        }
        
        if( rlabel != null && rlabel.length() > 0 ){ 
            rep.setLabel(rlabel);
        }

        if( rname != null && rname.length() > 0 ){ 
            rep.setName(rname);
        }

        //rep.setNs(rns);
        //rep.setAc(rac);
        
        rep.setCvType(rtype);
        rep.setSource( rSource );
        rep.setJval( jval.toString() );
        rep.getXrefs().addAll( rxrefList );            

        if( rns.length() == 0 && rac.length() == 0 ){
            rep = recordManager.addReport( rep );
        } else{
            //rep = recordManager.updateReport( rns, rac, rep );
        }
        if( rep == null ){
            return null;
        }
        
        return this.toDxfReportNode( rep );                
    }

    private NodeType toDxfProteinNode( ProteinNode node ){
        
        // Returned:
        //<node ac="$ns" ns="$rac" id="1">
        // <type name="protein" ac="dxf:0003" ns="dxf"/>
        // <label>$label</label>
        // <name>$name</name>
        // <xrefList>
        //  <xref type="produced-by" typeAc="dxf:0007" typeNs="dxf" ac="4932" ns="taxid"/>
        // </xrefList>
        //</node>
		
        NodeType dxfNode = dxfFactory.createNodeType();
        
        TypeDefType dxfType = dxfFactory.createTypeDefType();
        dxfType.setNs( "dxf" );
        dxfType.setAc( "dxf:0003" );
        dxfType.setName( "protein" );
        
        dxfNode.setType(dxfType);
        
        dxfNode.setNs( node.getNs() );
        dxfNode.setAc( node.getAc() );
        dxfNode.setName( node.getName() );
        dxfNode.setLabel( node.getLabel() );
         
        XrefType dxfXref = dxfFactory.createXrefType();
        dxfXref.setType("produced-by");
        dxfXref.setTypeNs("dxf");
        dxfXref.setTypeAc("dxf:0007");
        dxfXref.setNs("taxid");
        dxfXref.setAc( String.valueOf( node.getTaxon().getTaxid() ));
        dxfNode.setXrefList( dxfFactory.createNodeTypeXrefList() );
        dxfNode.getXrefList().getXref().add( dxfXref );


        if(node.getSequence() != null && node.getSequence().length() > 0){

            if(dxfNode.getAttrList() == null){
                dxfNode.setAttrList(dxfFactory.createNodeTypeAttrList() );
            }
            
            //<attr name="sequence" ns="dxf" ac="dxf:0071">
            //<value>ATG</value>
            //</attr>

            AttrType da = dxfFactory.createAttrType();

            da.setName("sequence");
            da.setNs("dxf");
            da.setAc("dxf:0071");
            
            AttrType.Value av = dxfFactory.createAttrTypeValue();
            av.setValue(node.getSequence());
            da.setValue(av);
            dxfNode.getAttrList().getAttr().add( da );
            
        }      
        

        for( NodeXref x: node.getXrefs() ){
            
            XrefType dx = dxfFactory.createXrefType();
            dx.setNs(x.getNs());
            dx.setAc(x.getAc());

            CvTerm ccvt = x.getCvType();
            
            dx.setType( ccvt.getName() );
            dx.setTypeNs( ccvt.getNs() );
            dx.setTypeAc( ccvt.getAc() );

            dxfNode.getXrefList().getXref().add( dx );
            
        }

        if( ! node.getFeats().isEmpty()  ){
            dxfNode.setFeatureList( dxfFactory.createNodeTypeFeatureList() );
        }
        
        for( NodeFeat f: node.getFeats() ){
            
            FeatureType df = dxfFactory.createFeatureType();
            TypeDefType dt = dxfFactory.createTypeDefType();
            dt.setNs( f.getCvType().getNs() );
            dt.setAc( f.getCvType().getAc() );
            dt.setName( f.getCvType().getName() );
            df.setType(dt);
            
            //<label>N/A</label>
            df.setLabel("");
            //<name>feature</name>  // skip
            //<locationList>
            // <location>
            //   <begin>299</begin>
            //   <end>336</end>
            // </location>
            //</locationList>
            

            if( ! f.getXrefs().isEmpty() ){

                //for(Iterator<Xref> ix = f.iterator; ix.hasNext();){
                //    Xref cx =ix.next();                  
                //}


                if( df.getXrefList() == null ){
                    df.setXrefList( dxfFactory.createFeatureTypeXrefList() );
                }
                
                for( FeatureXref x: f.getXrefs() ){
                    
                    XrefType dx = dxfFactory.createXrefType();
                    dx.setNs(x.getNs());
                    dx.setAc(x.getAc());
                
                    CvTerm ccvt = x.getCvType();
                
                    dx.setType( ccvt.getName() );
                    dx.setTypeNs( ccvt.getNs() );
                    dx.setTypeAc( ccvt.getAc() );
                                                       
                    df.getXrefList().getXref().add( dx );
                }                
            }
            
            if(f.getJval() != null){
                try{
                    JSONObject jval = new JSONObject(f.getJval());

                    if( jval.length() > 0){
                        if(df.getAttrList() == null){
                            df.setAttrList( dxfFactory.createFeatureTypeAttrList() );
                        }
                    }

                    Iterator<String> jvk = jval.keys();
                    while( jvk.hasNext() ){
                        String janame = jvk.next();                        
                        JSONObject jatt = (JSONObject) jval.get(janame);
                        
                        AttrType djatt = dxfFactory.createAttrType();
                        djatt.setName(janame);
                        djatt.setNs(jatt.getString("ns"));
                        djatt.setAc(jatt.getString("ac"));
                        djatt.setValue( dxfFactory.createAttrTypeValue());
                        djatt.getValue().setValue(jatt.getString("value"));
                        if(jatt.has("vns")){
                            djatt.getValue().setNs(jatt.getString("vns"));
                        }
                        if(jatt.has("vac")){
                            djatt.getValue().setAc(jatt.getString("vac"));
                        }
                        df.getAttrList().getAttr().add(djatt);                                                
                    }

                } catch( JSONException jx){
                    // shouldn't happen
                    System.out.println(jx);
                }
            }

            
            if( ! f.getRanges().isEmpty() ){
                df.setLocationList( dxfFactory.createFeatureTypeLocationList() );
            }
            
            for( Range r: f.getRanges() ){
                int rstart = r.getStart();
                int rstop = r.getStop();

                LocationType lt = dxfFactory.createLocationType();
                lt.setBegin(String.valueOf(rstart));
                lt.setEnd(String.valueOf(rstop));


                if(r.getSequence() !=null &&
                   (r.getSequence().length() > 0 ||
                    r.getSequence().length() != rstart-rstop) ){

                    if(lt.getAttrList() == null){
                        lt.setAttrList(dxfFactory.createLocationTypeAttrList() );
                    }
                                     
                    AttrType ra = dxfFactory.createAttrType();

                    ra.setName("resulting-sequence");
                    ra.setNs("psi-mi");
                    ra.setAc("MI:1308");
            
                    AttrType.Value av = dxfFactory.createAttrTypeValue();
                    av.setValue(r.getSequence());
                    ra.setValue(av);
                    lt.getAttrList().getAttr().add( ra );
                }               
                df.getLocationList().getLocation().add(lt);
            }
            
            dxfNode.getFeatureList().getFeature().add(df);
        }
        return dxfNode;
        
    }
    
    //----------------------------------------------------------------------------    
    // privates
    //---------
    
    private NodeType toDxfReportNode( Report report ){

        Logger log = LogManager.getLogger( BkdNodeManager.class );
        log.info("BkdNodeManager.toDxfReportNode");
                
        // Returned:
        //<node ac="$ns" ns="$rac" id="1">
        // <type name="protein" ac="dxf:0003" ns="dxf"/>
        // <label>$label</label>
        // <name>$name</name>
        // <xrefList>
        //  <xref type="produced-by" typeAc="dxf:0007" typeNs="dxf" ac="4932" ns="taxid"/>
        // </xrefList>
        //</node>
		
        NodeType dxfNode = dxfFactory.createNodeType();

        log.info( report.getCvType().getNs() + ":" + report.getCvType().getAc() );

        TypeDefType dxfType = dxfFactory.createTypeDefType();
        dxfType.setNs( report.getCvType().getNs() );
        dxfType.setAc( report.getCvType().getAc() );
        dxfType.setName( report.getCvType().getName() );
        
        dxfNode.setType(dxfType);
        
        dxfNode.setNs( report.getNs() );
        dxfNode.setAc( report.getAc() );
        if( report.getName() != null && report.getName().length() > 0){
            dxfNode.setName( report.getName() );
        }
        dxfNode.setLabel( report.getLabel() );

        dxfNode.setXrefList( dxfFactory.createNodeTypeXrefList() );

        // target xref/node/feature
        
        XrefType dxfXref = dxfFactory.createXrefType();
        dxfXref.setType("describes");
        dxfXref.setTypeNs("dxf");
        dxfXref.setTypeAc("dxf:0024");

        if( report instanceof NodeReport ){

            Node nd = ((NodeReport)report).getNode();
            
            dxfXref.setNs( nd.getNs() );
            dxfXref.setAc( nd.getAc());
            
        } else if( report instanceof FeatureReport ){

            NodeFeat nf = (NodeFeat) ((FeatureReport)report).getFeature();

            ProteinNode pn = (ProteinNode) nf.getNode();  // must test type !!!
            
            dxfXref.setNs( pn.getNs() );
            dxfXref.setAc( pn.getAc() );
            
            // set node value

            NodeType xnode =  dxfFactory.createNodeType();
            dxfXref.setNode( xnode );

            xnode.setId(0);
            xnode.setNs(nf.getNode().getNs() );
            xnode.setAc(nf.getNode().getAc() );
            xnode.setLabel(nf.getNode().getLabel());
            if( nf.getNode().getName().length() > 0 ){
                xnode.setName( nf.getNode().getName() );
            }
            
            xnode.setXrefList( dxfFactory.createNodeTypeXrefList() );

            if( pn.getUpr() != null && pn.getUpr().length() > 0){            
                XrefType uref = dxfFactory.createXrefType();
                uref.setNs("upr");
                uref.setAc(pn.getUpr());
                uref.setType("identical-to");
                uref.setTypeNs("dxf");
                uref.setTypeAc("dxf:0009");
                xnode.getXrefList().getXref().add( uref );
            }
            
            if( pn.getRsq() != null && pn.getRsq().length() > 0){            
                XrefType uref = dxfFactory.createXrefType();
                uref.setNs("rsq");
                uref.setAc(pn.getRsq());
                uref.setType("identical-to");
                uref.setTypeNs("dxf");
                uref.setTypeAc("dxf:0009");
                xnode.getXrefList().getXref().add( uref );
            }

            if( pn.getDip() != null && pn.getDip().length() > 0){            
                XrefType uref = dxfFactory.createXrefType();
                uref.setNs("dip");
                uref.setAc(pn.getDip());
                uref.setType("identical-to");
                uref.setTypeNs("dxf");
                uref.setTypeAc("dxf:0009");
                xnode.getXrefList().getXref().add( uref );
            }
            
            xnode.setFeatureList( dxfFactory.createNodeTypeFeatureList() );

            FeatureType ft = dxfFactory.createFeatureType(); 
            xnode.getFeatureList().getFeature().add(ft);

            TypeDefType tdt = dxfFactory.createTypeDefType();
            tdt.setNs( nf.getCvType().getNs() );
            tdt.setAc( nf.getCvType().getAc() );
            tdt.setName( nf.getCvType().getName() );
            ft.setType( tdt );

            ft.setLabel( nf.getLabel() );
            if( nf.getName() != null && nf.getName().length() > 0){
                ft.setName( nf.getName() );
            }
            
            ft.setLocationList( dxfFactory.createFeatureTypeLocationList() );
            
            for( Range r: nf.getRanges() ){

                LocationType lt = dxfFactory.createLocationType();
                lt.setBegin( String.valueOf( r.getStart() ) );
                lt.setEnd( String.valueOf( r.getStop() ) );                

                if(r.getSequence() != null && r.getSequence().length() > 0){
                    lt.setAttrList( dxfFactory.createLocationTypeAttrList() );
                    AttrType aseq = dxfFactory.createAttrType();
                    aseq.setName("resulting sequence");
                    aseq.setNs("psi-mi");
                    aseq.setAc("MI:1308");
                    aseq.setValue( dxfFactory.createAttrTypeValue() );
                    aseq.getValue().setValue( r.getSequence() );
                    lt.getAttrList().getAttr().add(aseq);
                }
               
                ft.getLocationList().getLocation().add( lt );
                
            }

            // add feature xrefs
            if( ! nf.getXrefs().isEmpty() ){
                ft.setXrefList( dxfFactory.createFeatureTypeXrefList() );

                for( Xref x: nf.getXrefs() ){
                    XrefType fx = dxfFactory.createXrefType();
                    ft.getXrefList().getXref().add(fx);
                    fx.setNs(x.getNs());
                    fx.setAc(x.getAc());

                    CvTerm xtype = x.getCvType();
                    
                    fx.setType(xtype.getName());
                    fx.setTypeNs(xtype.getNs());
                    fx.setTypeAc(xtype.getAc());                    
                }
            }                        
        }
        dxfNode.getXrefList().getXref().add(dxfXref);
                
        // report xrefs
        //-------------
        
        log.info(report.getXrefs());
        for( Xref rx: report.getXrefs() ){
            
            XrefType fx = dxfFactory.createXrefType();            
            fx.setNs(rx.getNs());
            fx.setAc(rx.getAc());
            
            CvTerm xtype = rx.getCvType();
            
            fx.setType(xtype.getName());
            fx.setTypeNs(xtype.getNs());
            fx.setTypeAc(xtype.getAc());
            
            dxfNode.getXrefList().getXref().add( fx );
        }
        
        dxfNode.setAttrList(dxfFactory.createNodeTypeAttrList() );

        // report data source
        //-------------------


        log.info(report.getSource());

        if(report.getSource() != null ){

            Source src = report.getSource();
            CvTerm stp = src.getCvType();
            
            AttrType satt = dxfFactory.createAttrType(); 
            satt.setNs( "dxf" );
            satt.setAc( "dxf:0016" );
            satt.setName( "data-source" );
            satt.setValue(dxfFactory.createAttrTypeValue());

            if( src instanceof DatabaseSource ){
                //satt.getValue().setNs(src.getNs());
                //satt.getValue().setAc(src.getNs());
            }else if( src instanceof DbRecordSource ){
                    satt.getValue().setNs( ((DbRecordSource)src).getNs());
                satt.getValue().setAc( ((DbRecordSource)src).getAc());                
            }else if( src instanceof OrgSource ){
                satt.getValue().setNs("mail-to");
                satt.getValue().setAc( ((OrgSource)src).getEmail());
            }else if( src instanceof PersonSource ){                
                satt.getValue().setNs("orcid");
                satt.getValue().setAc(((PersonSource)src).getOrcid());                
            }else if( src instanceof PubSource ){
                String pmid = ((PubSource)src).getPmid();
                if( pmid != null && pmid.length() > 0){
                    satt.getValue().setNs("pmid");
                    satt.getValue().setAc(pmid);
                } else {
                    String doi = ((PubSource)src).getDoi();
                    if( doi != null && doi.length() > 0){
                        satt.getValue().setNs("doi");
                        satt.getValue().setAc(doi);
                    }   
                }
            }
            
            satt.getValue().setTypeNs(stp.getNs());
            satt.getValue().setTypeAc(stp.getAc());
            satt.getValue().setType(stp.getName());
            
            dxfNode.getAttrList().getAttr().add( satt );
            
        }
            
        // report attribs
        //---------------
        
        String jval = report.getJval();
        log.info( "JVAL=" + jval );

        try{
            JSONObject oval = new JSONObject( jval );
            
            for( Iterator<String> i = oval.keys(); i.hasNext(); ){
                String k = i.next();
                
                JSONObject kv = oval.getJSONObject(k); 
                
                String value = kv.getString("value");
                
                AttrType ratt = dxfFactory.createAttrType(); 
                ratt.setNs( kv.getString("ns") );
                ratt.setAc( kv.getString("ac") );
                ratt.setName( k );
                ratt.setValue(dxfFactory.createAttrTypeValue());
                ratt.getValue().setValue(kv.getString("value"));
                
                dxfNode.getAttrList().getAttr().add( ratt );
            }        
                  
        }catch( JSONException jx ){
            // shouldn't get here
        }
        
        return dxfNode;        
    }
    
    private NodeType toDxfTaxonNode( Taxon taxon ){

        NodeType dxfNode = dxfFactory.createNodeType();
        
        TypeDefType dxfType = dxfFactory.createTypeDefType();
        dxfType.setNs( "dxf" );
        dxfType.setAc( "dxf:0017" );
        dxfType.setName( "taxon" );
        
        dxfNode.setType(dxfType);
        
        dxfNode.setNs( "taxid" );
        dxfNode.setAc( String.valueOf( taxon.getTaxid() ) );
        dxfNode.setName( taxon.getComName() );
        dxfNode.setLabel( taxon.getSciName() );
                
        return dxfNode;        
    }
    
    private NodeType toDxfCvTermNode( CvTerm term ){

        NodeType dxfNode = dxfFactory.createNodeType();
        
        TypeDefType dxfType = dxfFactory.createTypeDefType();
        dxfType.setNs( "dxf" );
        dxfType.setAc( "dxf:0030" );
        dxfType.setName( "cv-term" );
        
        dxfNode.setType(dxfType);
        
        dxfNode.setNs( term.getNs() );
        dxfNode.setAc( term.getAc() );       
        dxfNode.setLabel( term.getName() );

        // definition
        // <attribute name="definition" ns="dxf" ac="dxf:0032">

        AttrType attDef = dxfFactory.createAttrType();
        attDef.setNs("dxf");
        attDef.setAc("dxf:0032");
        attDef.setName("definition");
        
        AttrType.Value attDefVal  = dxfFactory.createAttrTypeValue();
        attDefVal.setValue( term.getDefinition() );
        attDef.setValue( attDefVal );
        
        dxfNode.setAttrList( dxfFactory.createNodeTypeAttrList() );
        dxfNode.getAttrList().getAttr().add( attDef );

        return dxfNode;        
    }

    private Range buildRange(LocationType location){
        
        // LocationType -> Range 
        Range range = new Range();
        
        String sbeg = location.getBegin();
        String send = location.getEnd();
        
        try{                
            String[] arrBeg = sbeg.split("-", 2);
            String[] arrEnd = send.split("-", 2);
            
            int rbeg = Integer.parseInt(arrBeg[0]);
            int rend = Integer.parseInt(arrEnd[0]);
            
            range.setStart(rbeg);
            range.setStop(rend);                   
        } catch(Exception ex){
            // shouldnt happen
        }
                
        if( location.getAttrList() != null ){
            for( AttrType cla: location.getAttrList().getAttr() ){
                String lns = cla.getNs();
                String lac = cla.getAc();
                
                AttrType.Value lval = cla.getValue();
                
                String lvns = lval.getNs();
                String lvac = lval.getAc();
                String lvtns = lval.getTypeNs();
                String lvtac = lval.getTypeAc();
                String lsval = lval.getValue();
                
                //<attr name="resulting sequence" ns="mi" ac="MI:1308">
                
                if( "MI:1308".equalsIgnoreCase(lac ) ){
                    if( lval.getValue() != null ){
                        range.setSequence( lval.getValue() );
                    }
                    break;
                }
            }
        }
        return range;            
    }

    private Xref buildXref( XrefType xrt, Xref xref, Source source ){
            
        xref.setNs( xrt.getNs() );
        xref.setAc( xrt.getAc() );

        CvTerm ftype = new CvTerm( xrt.getTypeNs(), xrt.getTypeAc(),
                                   xrt.getType() );
        xref.setCvType( ftype );

        if( source != null ){
            xref.setSource( source );  // test for local overwrite ?                    
        }
        return xref;
    }
    
    private JSONObject buildJAtt( AttrType att ){

        try{
            
            JSONObject jatt = new JSONObject();
            
            jatt.put( "value", att.getValue().getValue() );
            jatt.put( "ns", att.getNs() );
            jatt.put( "ac", att.getAc() );

            if( att.getValue().getNs() != null &&
                att.getValue().getNs().length() > 0  ){
                jatt.put( "vns", att.getValue().getNs() );                                 
            }
            if( att.getValue().getAc() != null &&
                att.getValue().getAc().length() > 0  ){
                jatt.put( "vac", att.getValue().getAc() );                                 
            }
            
            return jatt;
            
        }catch(JSONException jx){
            // shouldn't happen
        }

        return null;        
    }
    
    private Source buildSource( AttrType att ){
        
        Source source = null;
                
        AttrType.Value cval = att.getValue();
        String  ctypeAc = cval.getTypeAc();
        if( "dxf:0057".equalsIgnoreCase(ctypeAc) ){  // database-record 
                                        
            DbRecordSource dsrc = new DbRecordSource();
            dsrc.setCvType( new CvTerm( "dxf", "dxf:0057",
                                        "database-record" ) );
            
            dsrc.setNs( cval.getNs() );
            dsrc.setAc( cval.getAc() );
            source = dsrc;
            
        } else if( "dxf:0055".equalsIgnoreCase(ctypeAc) ){ // publication
            
            PubSource psrc = new PubSource();
            psrc.setCvType( new CvTerm( "dxf", "dxf:0055",
                                        "publication" ) );
            
            if( "pmid".equalsIgnoreCase(cval.getNs()) ){
                psrc.setPmid( cval.getAc() );
            } else if( "doi".equalsIgnoreCase(cval.getNs()) ){
                psrc.setDoi(cval.getAc());
            }
            
            source = psrc;
            
        } else if( "dxf:0056".equalsIgnoreCase(ctypeAc) ){ // person
            
            PersonSource psrc = new PersonSource();
            psrc.setCvType( new CvTerm( "dxf", "dxf:0056",
                                        "person" ) );
            
            if( "orcid".equalsIgnoreCase(cval.getNs()) ){
                psrc.setOrcid(cval.getAc());
            }
            
            source = psrc;
            
        } else if( "dxf:0088".equalsIgnoreCase(ctypeAc) ){ // organization
            
            OrgSource osrc = new OrgSource();
            osrc.setCvType( new CvTerm( "dxf", "dxf:0088",
                                        "organization" ) );
            
            if( "mail-to".equalsIgnoreCase(ctypeAc) ){
                osrc.setEmail(cval.getAc());
            }

            if( att.getNode() != null ){
                for( AttrType anatt: att.getNode().getAttrList().getAttr() ){
                    if ( anatt.getName().equalsIgnoreCase("url") ){
                        osrc.setUrl( anatt.getValue().getValue() );
                    }
                }
            }        
        }
        
        return source;
    }
}
 
