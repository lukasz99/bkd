package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;
import org.json.*;

import edu.ucla.mbi.dxf15.*;
//import org.hupo.psi.mi.mif.*; 
//import org.hupo.psi.mi.mif300.*; 

import javax.xml.bind.JAXB;
 
public abstract class JDxfSupport{

    protected edu.ucla.mbi.dxf15.ObjectFactory dxfFactory
        = new edu.ucla.mbi.dxf15.ObjectFactory();

    //protected org.hupo.psi.mi.mif.ObjectFactory mifFactory
    //    = new org.hupo.psi.mi.mif.ObjectFactory();
    
    //protected org.hupo.psi.mi.mif300.ObjectFactory mif300Factory
    //    = new org.hupo.psi.mi.mif300.ObjectFactory();
    
    
    // abstract methods
    //-----------------

    public abstract NodeType getDxfNode( String detail );
    public abstract Map<String,Object>  getJDxfMap( String detail );
    
    //--------------------------------------------------------------------------
    // DXF Support
    //--------------------------------------------------------------------------
    
    public String toDxfXmlString(){
        return toDxfXmlString( null );
    }
    
    public String toDxfXmlString( String detail ){ 
 
        StringWriter sw = new StringWriter();
        JAXB.marshal( toDxfDataset(detail) , sw);
        String xmlString = sw.toString();
        
        return xmlString;
    }
    
    public DatasetType toDxfDataset(){
        return toDxfDataset( null ); 
    }
    
    public DatasetType toDxfDataset( String detail ){
        
        DatasetType dxf = dxfFactory.createDatasetType(); 

        dxf.getNode().add( this.getDxfNode( detail ) ); 
        
        return dxf;
    }

    //--------------------------------------------------------------------------
    
    protected AttrType createAttr( String name, String ns, String ac,
                                   String value, String vNs, String vAc ){

        AttrType attr = dxfFactory.createAttrType();
        attr.setName( name );
        attr.setNs( ns );
        attr.setAc( ac );

        if( value != null ){
            attr.setValue( dxfFactory.createAttrTypeValue() );

            attr.getValue().setValue( value );

            if( vNs != null && vAc != null){
                attr.getValue().setNs( vNs );
                attr.getValue().setAc( vAc );
            }            
        }
        return attr;
    }

    protected AttrType createAttr( String name, String ns, String ac,
                                   String value){

        AttrType attr = dxfFactory.createAttrType();
        attr.setName( name );
        attr.setNs( ns );
        attr.setAc( ac );

        if( value != null ){
            attr.setValue( dxfFactory.createAttrTypeValue() );

            attr.getValue().setValue( value );
        }
        return attr;
    }
    
    protected AttrType createAttr( String name, String ns, String ac,
                                 NodeType node ){

        AttrType attr = dxfFactory.createAttrType();
        attr.setName( name );
        attr.setNs( ns );
        attr.setAc( ac );

        if( node != null ){
            attr.setNode( node );
        }
        return attr;
    }

    //--------------------------------------------------------------------------


    protected edu.ucla.mbi.dxf15.XrefType
        createXref( String type, String typeNs, String typeAc,
                    String ns, String ac ){
        
        return createXref( type, typeNs, typeAc, ns, ac, null );            
    }

    //--------------------------------------------------------------------------

    protected edu.ucla.mbi.dxf15.XrefType
        createXref( String type, String typeNs, String typeAc,
                    String ns, String ac, NodeType node ){
        
        edu.ucla.mbi.dxf15.XrefType xref = dxfFactory.createXrefType();
        xref.setType( type );
        xref.setTypeNs( typeNs );
        xref.setTypeAc( typeAc );
        xref.setNs( ns );

        while( ac.startsWith( " " ) ){
            ac = ac.substring(1);
        }

        while( ac.endsWith( " " ) ){
            ac = ac.substring(0,ac.length()-1);
        }
        
        xref.setAc( ac );

        if( node != null ){
            xref.setNode( node );
        }
        
        return xref;
    }
    /*
    
    //--------------------------------------------------------------------------

    protected edu.ucla.mbi.dxf15.XrefType createXref( String type,
                                                      String typeNs, String typeAc,
                                                      String ns, String ac ){
        
        edu.ucla.mbi.dxf15.XrefType xref = dxfFactory.createXrefType();
        xref.setType( type );
        xref.setTypeNs( typeNs );
        xref.setTypeAc( typeAc );
        xref.setNs( ns );

        while( ac.startsWith( " " ) ){
            ac = ac.substring(1);
        }
        
        while( ac.endsWith( " " ) ){
            ac = ac.substring(0,ac.length()-1);
        }
        
        xref.setAc( ac );

        return xref;
    }
    */
    //--------------------------------------------------------------------------

    protected NodeType.PartList.Part createPartType(  NodeType node,
                                                    int id, String name ){

        NodeType.PartList.Part dxfpart = dxfFactory.createNodeTypePartListPart();
        
        // part type
        //----------
        // NOTE: should linked-node be an instance-of at the CV level ?    
        
        dxfpart.setType( dxfFactory.createTypeDefType() );
        dxfpart.getType().setName("linked-node");   
        dxfpart.getType().setNs("dxf");    
        dxfpart.getType().setAc("dxf:0010");
        
        // id
        //---
        
        dxfpart.setId( id );

        // name
        //------
        
        dxfpart.setName( name );
        
        // node
        //------
        
        dxfpart.setNode( node );
        
        return dxfpart;
    }

    //--------------------------------------------------------------------------
    
    protected NodeType createTaxonNode( int taxid,
                                        String name, String commonName){
        
        //<node ac="4932" ns="TaxId" id="123">
        //  <type name="organism" ac="dip:0301" ns="dip"/>
        //  <label>Saccharomyces cerevisiae</label>
        //  <name>baker's yeast</name>
        //</node>              
    
        NodeType txnode = dxfFactory.createNodeType();

        txnode.setNs( "TaxId" );
        txnode.setAc( Integer.toString( taxid ) );
        
        // type 
        
        txnode.setType( dxfFactory.createTypeDefType() );
        txnode.getType().setName( "organism" );
        txnode.getType().setNs( "dip" );
        txnode.getType().setAc( "dxf:0301" );
        
        // label

        txnode.setLabel( name );
        
        // name
        
        if( commonName != null &&
            commonName != "" ){
            txnode.setName( commonName );
        }
        
        return txnode;
    }
    
    //--------------------------------------------------------------------------
    //  DXF -> JDXF (json)  conversion
    //--------------------------------------------------------------------------
    
    public Map<String,Object> jsonMap = null;
    
    public String toJsonString( boolean clear){

        if( clear ){
            jsonMap = null;
        }

        if( jsonMap == null ){
            this.getJDxfMap(null);
        }
        
        if( jsonMap != null ){
            JSONObject jsonObject = new JSONObject( jsonMap );
            
            try{
                return jsonObject.toString(1);
            } catch(Exception ex){
                return "{}";
            }
        } else {
            return "{}";
        }
            
    }

   
    protected Map<String,Object> createJsonCvTerm( String cv, String id,
                                                 String name ){
        return  createJsonCvTerm( cv, id, name, null);
    }
    
    protected Map<String,Object> createJsonCvTerm( String cv, String id,
                                                 String name,
                                                 List<String> alt_name ){
        
        Map<String,Object> term = new HashMap<String,Object>();
        term.put("cv",cv);
        term.put("id",id);
        term.put("name",name  );
        if( alt_name != null){
            term.put("alt-name", alt_name );
        }
        return term;
    }

    protected Map<String,Object> createJsonXref( String db, String id ){
        return createJsonXref( db, id, null, null );
    }

    protected Map<String,Object> createJsonXref( String db, String id,
                                                 String type ){
        return createJsonXref( db, id, type, null );
    }
    
    protected Map<String, Object> createJsonXref( String db, String id,
                                                  String type, Map<String, Object> target ){
        
        Map<String,Object> xref= new HashMap<String,Object>();
        xref.put("db",db);
        xref.put("id",id);
        if(type != null){
            xref.put("type",type);
        }
        if( target != null){
            xref.put( "target", target );
        }
        return xref;        
    }

    //--------------------------------------------------------------------------
    //  MIF Suppot
    //--------------------------------------------------------------------------

    

    
}


