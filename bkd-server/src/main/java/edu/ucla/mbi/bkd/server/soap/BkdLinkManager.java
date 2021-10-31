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
    
    public NodeType getLinkNode( edu.ucla.mbi.dxf20.NodeType node,
                                 String match, String detail ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info("BkdLinkManager.getLink(by node ac list)" );

        Edge redge = null;
        
        // parts scan
        //-----------

        List<NodeFeat> partList = new ArrayList<NodeFeat>();
        Set<String> nacset = new HashSet();
        
        log.info( " PARTS: " + node.getPartList());

        if( node.getPartList() != null ){
            for( PartType cp: node.getPartList().getPart() ){  // go over dxf
                log.info( " PART: " + cp );                    
                
                NodeType cnd = cp.getNode();
                log.info( " Node: ns=" + cnd.getNs() +
                          " ac=" + cnd.getAc());
                log.info( " Node: type ns=" + cnd.getType().getNs() +
                          " ac=" + cnd.getType().getAc() + "\n");
                if( recordManager.getBkdConfig().getPrefix()
                    .equalsIgnoreCase( cnd.getNs() ) ){
                    nacset.add( cnd.getAc() );
                }
            }

            if( nacset.size() == node.getPartList().getPart().size() ){
                redge = recordManager.getEdge( nacset );
            }                
        }
        
        if( redge instanceof Edge ){
            return this.toDxfLinkNode( (Edge) redge );	
        }
        
        return null; 
    }
    
    public NodeType getLinkNode( String ns, String ac,
                                 String match, String detail ){
        
        Logger log = LogManager.getLogger( BkdLinkManager.class );
        log.info("BkdLinkManager.getLink: get edge -> ac=" + ac );
        
        Edge redge = recordManager.getEdge( ac );
      
        if( redge instanceof Edge ){
            return this.toDxfLinkNode( (Edge) redge );	
        }
        
        return null; 
    }
       
    public NodeType processLinkNode( NodeType node, String mode ){

        // Expected:
        
        Logger log = LogManager.getLogger( BkdLinkManager.class );
        log.info("BkdLinkManager.processLinkNode");

        
        // attribute-based
        //----------------
        String sequence ="";
        String comment ="";
        
        /**
        Edge oldEdge =
            (Edge) recordManager.getEdge( ns, ac ); 
        
        if( oldEdge != null ){
            curEedge = oldNode;
            
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
		
        **/
        
        // parts scan
        //-----------

        List<NodeFeat> partList = new ArrayList<NodeFeat>();

        Set<String> nacset = new HashSet();

        
        log.info( "PARTS: " + node.getPartList());

        if( node.getPartList() != null ){
            
            for( PartType cp: node.getPartList().getPart() ){  // go over dxf

                log.info( " PART: " + cp );                    
                
                NodeType cnd = cp.getNode();
                log.info( " Node: ns=" + cnd.getNs() +
                          " ac=" + cnd.getAc());
                log.info( " Node: type ns=" + cnd.getType().getNs() +
                          " ac=" + cnd.getType().getAc() + "\n");

                nacset.add( cnd.getAc() );
            }                                  
        }
        
        if( nacset.size() == 0 ) return null;

        Edge curEdge = (Edge) recordManager.getEdge( nacset );
        
        log.info( " old edge: " + curEdge );
        if( curEdge != null ) return this.toDxfLinkNode( curEdge );  // edge already in

        curEdge = new Edge();
        
        String ac = node.getAc();
        
        try{         
            String snacc = ac.replaceAll("\\D","");
            if( snacc.length() > 0){
                int inacc = Integer.parseInt( snacc );
                curEdge.setNacc(inacc);
            }


        } catch(Exception ex){
        };

        
        curEdge.setLabel( node.getLabel() );
        curEdge.setName( node.getName() );

        //curEdge.setNacc( nac );

        for( String nac : nacset ){
            log.info( " node: " + nac );
            
            Node cn = recordManager
                .getNode( recordManager.getBkdConfig().getPrefix(), nac );

            log.info( " node: " + nac  + " :: " + cn );
            
            if( cn != null ){
                curEdge.getNodeSet().add(cn);
            } else{
                return null;
            }
        }

        log.info( " curEdge: node count=" + curEdge.getNodeSet().size() );

        if( curEdge.getNodeSet().size() == nacset.size() ){
            curEdge = (Edge) recordManager.addEdge( curEdge );
        }
        
        return this.toDxfLinkNode( curEdge );
    }

    public NodeType toDxfLinkNode( Edge edge ){

        NodeType dxfNode = dxfFactory.createNodeType();
        
        TypeDefType dxfType = dxfFactory.createTypeDefType();
        dxfType.setNs( "dxf" );
        dxfType.setAc( "dxf:0004" );
        dxfType.setName( "link" );
        
        dxfNode.setType(dxfType);
        
        dxfNode.setNs( edge.getNs() );
        dxfNode.setAc( edge.getAc() );
        //dxfNode.setName( "" );
        //dxfNode.setLabel( "" );
        
        dxfNode.setPartList( dxfFactory.createNodeTypePartList() );
        
        for( Node cn : edge.getNodeSet() ){
            
            NodeType.PartList.Part dxfPart = dxfFactory.createNodeTypePartListPart();
            dxfNode.getPartList().getPart().add( dxfPart );
            
            TypeDefType dxfPType = dxfFactory.createTypeDefType();
            dxfPType.setNs( "dxf" );
            dxfPType.setAc( "dxf:0010" );
            dxfPType.setName( "linked-node" );
            dxfPart.setType(dxfPType);

            NodeType dxfPNode = dxfFactory.createNodeType();
            dxfPart.setNode(dxfPNode);
            
            dxfPNode.setNs( cn.getNs() );
            dxfPNode.setAc( cn.getAc() );
            dxfPNode.setLabel( cn.getLabel() );
            dxfPNode.setName( cn.getName() );

            if( cn instanceof ProteinNode ){            
                ProteinNode pn = (ProteinNode) cn;
                
                XrefType dxfXref = dxfFactory.createXrefType();
                dxfXref.setType("produced-by");
                dxfXref.setTypeNs("dxf");
                dxfXref.setTypeAc("dxf:0007");
                dxfXref.setNs("taxid");
                dxfXref.setAc( String.valueOf( pn.getTaxon().getTaxid() ));
                dxfPNode.setXrefList( dxfFactory.createNodeTypeXrefList() );
                dxfPNode.getXrefList().getXref().add( dxfXref );
            
                
                if( pn.getUpr() != null && pn.getUpr().length() > 0){            
                    XrefType uref = dxfFactory.createXrefType();
                    uref.setNs("upr");
                    uref.setAc(pn.getUpr());
                    uref.setType("identical-to");
                    uref.setTypeNs("dxf");
                    uref.setTypeAc("dxf:0009");
                    dxfPNode.getXrefList().getXref().add( uref );
                }
            }            
        }
        
        return dxfNode;        
    }
       
}
 
