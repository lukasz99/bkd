package edu.ucla.mbi.bkd.server.soap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
 
import java.util.*;

import edu.ucla.mbi.dxf20.*;
import edu.ucla.mbi.bkd.store.*;
            
public class BkdNodeManager {
    
    private edu.ucla.mbi.dxf20.ObjectFactory dxfFactory
	= new edu.ucla.mbi.dxf20.ObjectFactory();
    
    BkdRecordManager recordManager;

    public void setRecordManager( BkdRecordManager manager ){
        this.recordManager = manager;
    }

    public NodeType processTranscriptNode( NodeType node, String mode ){
	System.out.println( "BkdNodeManager.processTranscriptNode:" + mode );
	return null; 
    }

    public NodeType processGeneNode( NodeType node, String mode ){
	System.out.println( "BkdNodeManager.processGeneNode:" + mode );
	return null; 
    }

    public NodeType processTaxonNode( NodeType node, String mode ){
	System.out.println( "BkdNodeManager.processTaxonNode:" +  mode );
	return null; 
    }
    
    public NodeType processProteinNode( NodeType node, String mode ){

	// Expected:
	//<node ac="$ns" ns="$rac" id="1">                                                                                                                                                                               
	// <type name="protein" ac="dxf:0003" ns="dxf"/>                                                                                                                                                                 
        // <label>$label</label>                                                                                                                                                                                     
        // <name>$name</name>                                                                                                                                                                                        
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
	Source src = null; 

	// xref-based
	//-----------
	
	String taxid = "";             
	String rsq_prot ="";
	String upr ="";
	
	ProteinNode testNode =
	    (ProteinNode) recordManager.getNode( ns, ac ); 
	
	if( testNode != null ){
	    if( mode.equalsIgnoreCase( "add" ) ){
		return this.toDxfProteinNode( testNode );
	    }
	    if( mode.equalsIgnoreCase( "update" ) ){
		return this.toDxfProteinNode( testNode );
	    }
	    return this.toDxfProteinNode( testNode );	    
	}
		
	// attribute scan
	//---------------
	
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
	    } else if( att.getName().equalsIgnoreCase("comment") ){
		comment = aval;
	    } else if( att.getName().equalsIgnoreCase("source") ){	       
		if( atype.getAc().equalsIgnoreCase("dxf:0054") ){         // online resource
		    log.info("SRC: online resource");
		    src = new DbSource();

		    // CvType

		    CvTerm scvt = new CvTerm( "dxf", "dxf:0054", "online-resurce" );
		    src.setCvType( scvt );
		    
		    String aurl ="";
		    
		    for( AttrType anatt: anode.getAttrList().getAttr() ){      		
			if ( anatt.getName().equalsIgnoreCase("url") ){
			    aurl = anatt.getValue().getValue();
			}
		    }
		    
		    src.setName( anode.getName() );
		    src.setUrl( aurl );
		}
	    }
	    
	    log.info( " attNs: " + attNs + " attAc: " + attAc + " aval: " + aval);
	}

	log.info("SRC: " + src);
	
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

		    CvTerm cvt = new CvTerm( "dxf", "dxf:0007", "produced-by" );
		    nxref.setCvType(cvt);
		    nxref.setSource( src );  // test for local overwrite ?
		    
		    xrefList.add( nxref );
		    
		} else if(ntype.getAc().equalsIgnoreCase("dxf:0053") ){  // xref: rsq-rna
		    
		    NodeXref nxref = new NodeXref();
		    nxref.setNs( x.getNs() );
		    nxref.setAc( x.getAc() );
		    
		    CvTerm cvt = new CvTerm( "dxf", "dxf:0007", "produced-by" );
		    nxref.setCvType( cvt );
		    nxref.setSource( src );  // test for local overwrite ?
		    xrefList.add( nxref );
		    
		    
		}
	    } else if( x.getTypeAc().equalsIgnoreCase( "dxf:0009" ) ){  // identical-to
                NodeType xnode = x.getNode();
                TypeDefType ntype = xnode.getType();
		if(ntype.getAc().equalsIgnoreCase("dxf:0003") ){         // protein
		    if( xnode.getNs().equalsIgnoreCase("rsq") ){             // refseq
			rsq_prot = x.getAc();
		    }else if( xnode.getNs().equalsIgnoreCase("upr") ){       // uniprot
			upr = x.getAc();
		    }
		}
	    }
	}
	
	log.info( " Name: " + name + " Label: " + label + " Taxid: " + taxid );
	log.info( " Ns: " + ns + " Ac: " + ac );
	log.info( " rsq_prot: " + rsq_prot + " upr:" + upr);

	// check if taxon present
	int itx = 0;
	try{
	    itx = Integer.parseInt( taxid );
	} catch(  NumberFormatException ex ){
	    
	}
	if( itx == 0 ){
	    return null;
	}
	
	Taxon newTx = new Taxon( itx, "", "");  // only stub 
	   
	ProteinNode newNode = new ProteinNode();
	
	newNode.setCvType( new CvTerm( "dxf", "dxf:0003", "protein" ) );
	    
	if( ns.equalsIgnoreCase("upr") ){
	    newNode.setUpr( ac );
	} else if (ns.equalsIgnoreCase("rsq") ){
	    newNode.setRsq( ac );
	} else if (ns.equalsIgnoreCase("dip") ){
	    newNode.setDip( ac );
	}
	newNode.setTaxon( newTx );
	
	newNode.setName( name );
	newNode.setLabel( label );
	newNode.setSequence( sequence );
	newNode.setComment( comment );

	for( NodeXref x: xrefList ){
	    x.setNode( newNode );
	    newNode.getXrefs().add( x );	   
	}	   

	newNode = (ProteinNode) recordManager.addNode( newNode );
	if( newNode == null ){
	    return null;
	}	
	return this.toDxfProteinNode( newNode );	
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

	return dxfNode;
	
    }    
}
