package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.text.NumberFormat;

import edu.ucla.mbi.dxf15.*;

public abstract class JDxfQuerySupport {
    
    edu.ucla.mbi.dxf15.ObjectFactory dxfFactory
	= new edu.ucla.mbi.dxf15.ObjectFactory();
    
    public abstract edu.ucla.mbi.dxf15.DatasetType
        query( String query, String detail );
    
    //--------------------------------------------------------------------------
    
    protected edu.ucla.mbi.dxf15.DatasetType
        dxfResult( String query, List<JDxfQueryHit> hits ){

        edu.ucla.mbi.dxf15.NodeType resNode = dxfFactory.createNodeType();
        
        resNode.setLabel( "Text Search Report" );
        
        TypeDefType res_type = dxfFactory.createTypeDefType();
        res_type.setNs("dxf");
        res_type.setAc("dxf:0026");
        res_type.setName("search-report");
        
        resNode.setType( res_type );
        
        NodeType.AttrList al= dxfFactory.createNodeTypeAttrList();
        resNode.setAttrList(al);
	
        AttrType at= dxfFactory.createAttrType();
        at.setName( "text-query-string" );
        
        AttrType.Value atv= dxfFactory.createAttrTypeValue();
        at.setValue( atv );
        atv.setValue( query );
        
        al.getAttr().add( at );
        
        edu.ucla.mbi.dxf15.NodeType.PartList 
            part_list= dxfFactory.createNodeTypePartList();
        resNode.setPartList( part_list );
        
        NumberFormat scoreFormat = NumberFormat.getInstance();
        scoreFormat.setMaximumFractionDigits( 3 );
        
        for( Iterator<JDxfQueryHit> ni = hits.iterator(); ni.hasNext(); ){

            JDxfQueryHit hit = ni.next();
            NodeType hitNode = hit.getNode();
            Float score = hit.getScore();
            
            edu.ucla.mbi.dxf15.NodeType.PartList.Part
                part = dxfFactory.createNodeTypePartListPart();
            
            part_list.getPart().add( part );
            
            TypeDefType part_type = dxfFactory.createTypeDefType();
            part_type.setNs( "dxf" );
            part_type.setAc( "dxf:0027" );
            part_type.setName( "search-result" );
            part.setType( part_type );
            
            PartType.AttrList hit_attr_list = 
                dxfFactory.createPartTypeAttrList();
            part.setAttrList( hit_attr_list );
            
            AttrType hit_attr= dxfFactory.createAttrType();
            hit_attr.setName( "search-score" );
            
            AttrType.Value hit_attr_value = 
                dxfFactory.createAttrTypeValue();
            hit_attr.setValue(hit_attr_value);
            if( score != null ){
                hit_attr_value.setValue(scoreFormat.format(score));
            } else {
                hit_attr_value.setValue("N/A");
            }
            hit_attr_list.getAttr().add(hit_attr);
            
            edu.ucla.mbi.dxf15.NodeType result_node=
                result_node= dxfFactory.createNodeType();
            part.setNode( result_node );
            
            result_node.setNs( hitNode.getNs() );
            result_node.setAc( hitNode.getAc() );
            result_node.setLabel( hitNode.getLabel() );
            result_node.setType( hitNode.getType() );
            
            NodeType.XrefList xref_list = 
                dxfFactory.createNodeTypeXrefList();
            result_node.setXrefList( xref_list );
            
            XrefType cxref=dxfFactory.createXrefType();
            cxref.setNs( hitNode.getNs() );
            cxref.setAc( hitNode.getAc() );
            cxref.setTypeNs( "dxf" );
            cxref.setTypeAc( "dxf:0009" );
            cxref.setType( "identical-to" );
            xref_list.getXref().add( cxref );
        }


        DatasetType dataset = dxfFactory.createDatasetType();
        dataset.getNode().add( resNode );
        
        return dataset;
    }

    //--------------------------------------------------------------------------

    /*
    
    private static edu.ucla.mbi.dxf15.NodeType
        dxfFacet( String query, List<String> facetFieldList, 
                  Map<String,String> facet ){
                  
        edu.ucla.mbi.dxf15.NodeType resNode = dof.createNodeType();
        
        resNode.setLabel( "Facet Report" );
        
        TypeDefType res_type = dof.createTypeDefType();
        res_type.setNs("dxf");
        res_type.setAc("dxf:0063");
        res_type.setName("facet-report");
        
        resNode.setType( res_type );
        
        NodeType.AttrList al =  dof.createNodeTypeAttrList();
        resNode.setAttrList( al );
        
        AttrType at= dof.createAttrType();
        at.setName( "text-query-string" );

        AttrType.Value atv = dof.createAttrTypeValue();
        at.setValue( atv );
        atv.setValue( query );
        al.getAttr().add( at );

        for( Iterator<String> ffi = facetFieldList.iterator(); 
             ffi.hasNext(); ){
            
            String ff = ffi.next();

            AttrType ffat= dof.createAttrType();
            ffat.setName( "facet-field" );
            
            AttrType.Value ffatv = dof.createAttrTypeValue();
            ffat.setValue( ffatv );
            ffatv.setValue( ff );
            al.getAttr().add( ffat );            
        }

        if( facet == null || facet.size() == 0 ){
            return null;
        }
        
        edu.ucla.mbi.dxf15.NodeType.PartList
            part_list= dof.createNodeTypePartList();
        resNode.setPartList( part_list );

        for ( Iterator<String> i = facet.keySet().iterator(); i.hasNext(); ){

            String key = i.next();
            String val = facet.get( key );

            String cnt = val.substring( 0, val.indexOf( ":" ) );
            String name = val.substring( val.indexOf( ":" ) + 1 );
            
            edu.ucla.mbi.dxf15.NodeType.PartList.Part
                part= dof.createNodeTypePartListPart();
            part_list.getPart().add(part);
            
            TypeDefType part_type = dof.createTypeDefType();
            part_type.setNs("dxf");
            part_type.setAc("dxf:0027");
            part_type.setName("search-result");
            part.setType( part_type );
            
            PartType.AttrList hit_attr_list = 
                dof.createPartTypeAttrList();
            part.setAttrList(hit_attr_list);
            
            AttrType hit_attr= dof.createAttrType();
            hit_attr.setName( "count" );
            
            AttrType.Value hit_attr_value = 
                dof.createAttrTypeValue();
            hit_attr.setValue(hit_attr_value);
            hit_attr_value.setValue(cnt);
            hit_attr_list.getAttr().add(hit_attr);
            
            edu.ucla.mbi.dxf15.NodeType result_node=
                result_node= dof.createNodeType();
            part.setNode(result_node);
            String cac="";
            
            TypeDefType ctp = dof.createTypeDefType();
            ctp.setNs("dxf");
            ctp.setAc("dxf:0003");
            ctp.setName("organism");
            result_node.setType(ctp);			    
            
            result_node.setNs("taxid");
            result_node.setAc( key );
            result_node.setLabel( name );
            
            NodeType.XrefList xref_list = 
                dof.createNodeTypeXrefList();
            result_node.setXrefList(xref_list);
            
            XrefType cxref=dof.createXrefType();
            cxref.setNs( "taxid" );
            cxref.setAc( key );
            cxref.setTypeNs( "dxf" );
            cxref.setTypeAc( "dxf:0009" );
            cxref.setType( "identical-to" );
            xref_list.getXref().add( cxref );            
        }     
        return resNode;
    }

    */
}
