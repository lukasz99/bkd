package edu.ucla.mbi.bkd.server.soap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.jws.soap.SOAPBinding;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.ws.RequestWrapper;
import javax.xml.ws.ResponseWrapper;

import java.util.List;
import java.util.ArrayList;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.services.soap.*;

@WebService(serviceName = "BkdService",
            portName = "BkdServicePort",
            endpointInterface = "edu.ucla.mbi.bkd.services.soap.BkdPort",
            wsdlLocation = "/WEB-INF/wsdl/bkd-services-1.0.wsdl",
            targetNamespace = "http://mbi.ucla.edu/bkd/services/soap")
public class BkdPortImpl implements BkdPort {

    private edu.ucla.mbi.dxf20.ObjectFactory dxfFactory
	= new edu.ucla.mbi.dxf20.ObjectFactory();

    private Logger logger = null;
    
    BkdBuilder builder = null;
    
    public void setBuilder(BkdBuilder builder){
        this.builder = builder;
    }

    BkdNodeManager nodeManager= null;

    public void setNodeManager( BkdNodeManager nodeManager ){
        this.nodeManager = nodeManager;
    }

    public void initialize(){

	logger = LogManager.getLogger( BkdPortImpl.class );	
        System.out.println( "BkdPortImpl: initialize");
	logger.info( "BkdPortImpl: initialize");
    }

    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
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
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getLink( java.lang.String ns,
                 java.lang.String ac,
                 java.lang.String match,
                 java.lang.String detail,
                 java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.XrefType>
        getSourceList( java.lang.String ns,
                       java.lang.String ac,
                       java.lang.String match,
                       java.lang.String detail,
                       java.lang.String format ){
        return null;        
    }
    
    public edu.ucla.mbi.dxf20.DatasetType
        getCrossRefList( GetCrossRef request ){
        return null;        
    }

    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        setLink( edu.ucla.mbi.dxf20.DatasetType dataset,
                 java.lang.String mode ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf20.XrefType>
        getNodeList( java.lang.String ns,
                     java.lang.String ac,
                     java.lang.String match,
                     java.lang.String detail,
                     java.lang.String format ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        matchNode( edu.ucla.mbi.dxf20.DatasetType dataset,
                   java.lang.String match,
                   java.lang.String detail,
                   java.lang.String format){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getLinkRange( long fr,
                      long to,
                      java.lang.String detail,
                      java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getSource( java.lang.String ns,
                   java.lang.String ac,
                   java.lang.String match,
                   java.lang.String detail,
                   java.lang.String format ){
        return null;
    }
                       
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getSourceBounds( java.lang.String detail,
                         java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getNodeBounds( java.lang.String detail,
                       java.lang.String format ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getLinkBounds( java.lang.String detail,
                       java.lang.String format ){
        return null;
    }

    public java.util.List<edu.ucla.mbi.dxf20.XrefType>
        getEvidenceList( java.lang.String ns,
                         java.lang.String ac,
                         java.lang.String match,
                         java.lang.String detail,
                         java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        status( java.lang.String detail,
                java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        setEvidence( edu.ucla.mbi.dxf20.DatasetType dataset,
                     java.lang.String mode ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getCounts( java.lang.String ns,
                   java.lang.String ac,
                   java.lang.String match,
                   java.lang.String detail,
                   java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getEvidence( java.lang.String ns,
                     java.lang.String ac,
                     java.lang.String match,
                     java.lang.String detail,
                     java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getSourceRange( long fr,
                        long to,
                        java.lang.String detail,
                        java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        query( java.lang.String query,
               java.lang.String detail,
               java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.XrefType>
        getLinkList( java.lang.String ns,
                     java.lang.String ac,
                     java.lang.String match,
                     java.lang.String detail,
                     java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        transform( edu.ucla.mbi.dxf20.DatasetType dataset,
                   java.lang.String detail,
                   java.lang.String format,
                   java.lang.String expand,
                   edu.ucla.mbi.bkd.services.soap.OperationType operation,
                   java.lang.String limit ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        dropSource( java.lang.String ns,
                    java.lang.String ac ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getNodeRange( long fr,
                      long to,
                      java.lang.String detail,
                      java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        dropEvidence( java.lang.String ns,
                      java.lang.String ac ){
        return null;
    }
                    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        setSource( edu.ucla.mbi.dxf20.DatasetType dataset,
                   java.lang.String mode ){
        return null;
    }
                    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        getLinksByNodeSet( edu.ucla.mbi.dxf20.DatasetType dataset,
                           java.lang.String match,
                           java.lang.String detail,
                           java.lang.String format ){
        return null;
    }
    
    public java.util.List<edu.ucla.mbi.dxf20.NodeType>
        setNode( edu.ucla.mbi.dxf20.DatasetType dataset,
                 java.lang.String mode ){

	Logger log = LogManager.getLogger( BkdPortImpl.class );	
	log.info( "setNode" );
       
	List<edu.ucla.mbi.dxf20.NodeType> nList = dataset.getNode();
	List<edu.ucla.mbi.dxf20.NodeType> rList = new <edu.ucla.mbi.dxf20.NodeType>ArrayList();    

	for(edu.ucla.mbi.dxf20.NodeType nd: nList){
	    edu.ucla.mbi.dxf20.TypeDefType ntp = nd.getType();

	    //String name = ntp.getNs();
	    //String ns = ntp.getNs();

	    String ac = ntp.getAc();
	    log.info( "setNode: node type: " + ntp.getName() );

	    edu.ucla.mbi.dxf20.NodeType rnode = null;
	    
	    switch (ac) {
	    case "dxf:0003":  rnode = nodeManager.processProteinNode( nd, mode );
		    break;
	    case "dxf:0053":  rnode = nodeManager.processTranscriptNode( nd, mode );
		    break;
	    case "dxf:0025":  rnode = nodeManager.processGeneNode( nd, mode );
		    break;
	    case "dxf:0017":  rnode = nodeManager.processTaxonNode( nd, mode );
		    break;
	    case "dxf:0001":  rnode = nodeManager.processProteinNode(nd,mode);
		    break;
	    default: rnode = null;
		break;
	    }
	    log.info(rnode);
	    if( rnode != null){
		rList.add( rnode );
	    }
	}
	if(rList.size() > 0){
	    return rList;
	}
	return null;
    }
    
}
