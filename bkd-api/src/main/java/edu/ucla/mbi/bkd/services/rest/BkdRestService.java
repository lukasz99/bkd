package edu.ucla.mbi.bkd.services.rest;

import javax.ws.rs.*;

public interface BkdRestService {

    @GET @Path("/query")
        public Object query( @DefaultValue("")
                             @QueryParam("qstr") String qstr,
                             
                             @DefaultValue("miqlx")
                             @QueryParam("qtype") String qtype,
                             
                             @DefaultValue("stub")
                             @QueryParam("detail") String detail,
                             
                             @DefaultValue("dxf")
                             @QueryParam("format") String format );
    
    /** covers soap call to:  
     public List<NodeType> query(
         @WebParam(name = "query", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
         String query,
         @WebParam(name = "detail", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
         String detail,
         @WebParam(name = "format", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
         String format);
    **/
        
    @GET @Path("/rec/{ns}/{ac}")
    public Object getRecordByAccession( @PathParam("ns") String ns,
                                        @PathParam("ac") String ac,
                                        
                                        @DefaultValue("stub")
                                        @QueryParam("detail") String detail,
                                        
                                        @DefaultValue("dxf")
                                        @QueryParam("format") String format );

   
    /** covers soap calls to: 

     public List<NodeType> getSource(
        @WebParam(name = "ns", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ns,
        @WebParam(name = "ac", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ac,
        @WebParam(name = "match", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String match,
        @WebParam(name = "detail", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String detail,
        @WebParam(name = "format", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String format);

     public List<NodeType> getNode(
        @WebParam(name = "ns", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ns,
        @WebParam(name = "ac", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ac,
        @WebParam(name = "sequence", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String sequence,
        @WebParam(name = "match", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String match,
        @WebParam(name = "detail", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String detail,
        @WebParam(name = "format", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String format);

     public List<NodeType> getLink(
        @WebParam(name = "ns", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ns,
        @WebParam(name = "ac", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ac,
        @WebParam(name = "match", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String match,
        @WebParam(name = "detail", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String detail,
        @WebParam(name = "format", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String format);

     public List<XrefType> getEvidenceList(
        @WebParam(name = "ns", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ns,
        @WebParam(name = "ac", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String ac,
        @WebParam(name = "match", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String match,
        @WebParam(name = "detail", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String detail,
        @WebParam(name = "format", targetNamespace = "http://mbi.ucla.edu/dip/services/soap")
        String format);


     public String getImexSRec(
        @WebParam(name = "getImexSRec", targetNamespace = "http://mbi.ucla.edu/dip/services/soap", partName = "request")
        GetImexSRec request);

     public String getDipSRec(
        @WebParam(name = "getDipSRec", targetNamespace = "http://mbi.ucla.edu/dip/services/soap", partName = "request")
        GetDipSRec request);

    **/
         
}
