package edu.ucla.mbi.bkd.server.soap;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.jws.soap.SOAPBinding;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.ws.RequestWrapper;
import javax.xml.ws.ResponseWrapper;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.services.soap.*;

@WebService(serviceName = "BkdService",
            portName = "BkdServicePort",
            endpointInterface = "edu.ucla.mbi.bkd.services.soap.BkdPort",
            wsdlLocation = "/WEB-INF/wsdl/bkd-services-1.0.wsdl",
            targetNamespace = "http://mbi.ucla.edu/bkd/services/soap")
public class BkdPortImpl implements BkdPort {

    BkdBuilder builder;
    
    public void setBuilder(BkdBuilder builder){
        this.builder = builder;
    }

    BkdRecordManager recordManager;

    public void setRecordManager( BkdRecordManager recordManager ){
        this.recordManager = recordManager;
    }

    public void initialize(){
        System.out.println( "BkdPortImpl: initialize");
    }


    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getNode( java.lang.String ns,
                 java.lang.String ac,
                 java.lang.String sequence,
                 java.lang.String match,
                 java.lang.String detail,
                 java.lang.String format ){

        System.out.println( "BkdPortImpl.getNode" );
        System.out.println( "NS: " + ns + " AC:" + ac);
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getLink( java.lang.String ns,
                 java.lang.String ac,
                 java.lang.String match,
                 java.lang.String detail,
                 java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.XrefType>
        getSourceList( java.lang.String ns,
                       java.lang.String ac,
                       java.lang.String match,
                       java.lang.String detail,
                       java.lang.String format ){
        return null;        
    }
    
    public edu.ucla.mbi.dxf15.DatasetType
        getCrossRefList( GetCrossRef request ){
        return null;        
    }

    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        setLink( edu.ucla.mbi.dxf15.DatasetType dataset,
                 java.lang.String mode ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf15.XrefType>
        getNodeList( java.lang.String ns,
                     java.lang.String ac,
                     java.lang.String match,
                     java.lang.String detail,
                     java.lang.String format ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        matchNode( edu.ucla.mbi.dxf15.DatasetType dataset,
                   java.lang.String match,
                   java.lang.String detail,
                   java.lang.String format){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getLinkRange( long fr,
                      long to,
                      java.lang.String detail,
                      java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getSource( java.lang.String ns,
                   java.lang.String ac,
                   java.lang.String match,
                   java.lang.String detail,
                   java.lang.String format ){
        return null;
    }
                       
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getSourceBounds( java.lang.String detail,
                         java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getNodeBounds( java.lang.String detail,
                       java.lang.String format ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getLinkBounds( java.lang.String detail,
                       java.lang.String format ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf15.XrefType>
        getEvidenceList( java.lang.String ns,
                         java.lang.String ac,
                         java.lang.String match,
                         java.lang.String detail,
                         java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        status( java.lang.String detail,
                java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        setEvidence( edu.ucla.mbi.dxf15.DatasetType dataset,
                     java.lang.String mode ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getCounts( java.lang.String ns,
                   java.lang.String ac,
                   java.lang.String match,
                   java.lang.String detail,
                   java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getEvidence( java.lang.String ns,
                     java.lang.String ac,
                     java.lang.String match,
                     java.lang.String detail,
                     java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getSourceRange( long fr,
                        long to,
                        java.lang.String detail,
                        java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        query( java.lang.String query,
               java.lang.String detail,
               java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.XrefType>
        getLinkList( java.lang.String ns,
                     java.lang.String ac,
                     java.lang.String match,
                     java.lang.String detail,
                     java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        transform( edu.ucla.mbi.dxf15.DatasetType dataset,
                   java.lang.String detail,
                   java.lang.String format,
                   java.lang.String expand,
                   edu.ucla.mbi.bkd.services.soap.OperationType operation,
                   java.lang.String limit ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        dropSource( java.lang.String ns,
                    java.lang.String ac ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getNodeRange( long fr,
                      long to,
                      java.lang.String detail,
                      java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        dropEvidence( java.lang.String ns,
                      java.lang.String ac ){
        return null;
    }
                    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        setSource( edu.ucla.mbi.dxf15.DatasetType dataset,
                   java.lang.String mode ){
        return null;
    }
                    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        getLinksByNodeSet( edu.ucla.mbi.dxf15.DatasetType dataset,
                           java.lang.String match,
                           java.lang.String detail,
                           java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf15.NodeType>
        setNode( edu.ucla.mbi.dxf15.DatasetType dataset,
                 java.lang.String mode ){
        return null;
    }
    
}
