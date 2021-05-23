package edu.ucla.mbi.bkd.server.rest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

//import edu.ucla.mbi.bkd.index.*;
import edu.ucla.mbi.bkd.store.*;

import edu.ucla.mbi.bkd.services.rest.BkdRestService;

public class BkdRestServiceImpl implements BkdRestService{
    
    //@Context private MessageContext messageContext;

    private BkdRecordManager recordManager;
 
    //private HttpServletResponse httpResponse;

    public BkdRestServiceImpl(){ }

    public void initialize(){
	Logger log = LogManager.getLogger( this.getClass() );
         log.info( "ImxdipRestServiceImpl: initialize" );
   }     

    public void setRecordManager( BkdRecordManager manager ){

        this.recordManager = manager;
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdRestServiceImpl: RecordManager set" );
    }

    BkdQueryManager queryManager;

    public void setQueryManager( BkdQueryManager manager ){

        this.queryManager = manager;
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdRestServiceImpl: QueryManager set" );        
    }


    public Object query( String qstr, String qtype,
                         String detail, String format ){
        return "query: " + qstr;
    }


    public Object getRecordByAcc( String ns, String ac,
                                  String format ){
        //return getRecordByAccession( ns, ac, "", format);
        return "";
        
    }
    public Object getRecordByAccession( String ns, String ac,
                                        String detail, String format ){

        /**
        if( ns != null && ns.toLowerCase().equals("bkd") ){
            
            // BKD node by accession
            //----------------------
            
            if( ac != null && ac.endsWith("N") ){
                Node node = recordManager.getNodeByAccession( ac );
                
                if( node != null ){
                    if( format != null && format.toLowerCase().equals("json") ){
                        return node.toJsonString( false );
                    } else {
                        return node.toDxfXmlString();
                    }
                }
            }
            
            // DIP source by DIP accession ( DIP-1234S )
            //------------------------------------------
           
            if( ac != null && ac.endsWith("S") ){
                Source source = recordManager.getSource( ac );
                
                if( source != null ){
                    if( format != null && format.toLowerCase().equals("json") ){
                        return source.toJsonString( false );
                    } else {
                        return source.toDxfXmlString();
                    }
                }
            }
            
                        
            // DIP edge by DIP accession ( DIP-1234E )
            //----------------------------------------
            
            if( ac != null && ac.endsWith("E") ){
                DipLink link = recordManager.getLink( ac );

                if( link  != null ){
                    if( format != null && format.toLowerCase().equals("json") ){
                        return link.toJsonString( false );
                    } else {
                        return link.toDxfXmlString();
                    }
                }
            }
            
            // DIP evidence by DIP accession ( DIP-1234X )
            //--------------------------------------------

            if( ac != null && ac.endsWith("X") ){
                DipEvidence evid = recordManager.getEvidence( ac );
                
                if( evid  != null ){
                    if( format != null && format.toLowerCase().equals("json") ){
                        return evid.toJsonString( false );
                    } else {
                        return evid.toDxfXmlString( detail ); 
                    }
                }
            }
            
        }

        if( ns != null && ns.toLowerCase().equals("taxid") ){
            
            // taxon id by taxid

            if( ac != null ){
                
                try{
                    int taxid = Integer.parseInt( ac );
                    Taxon taxon = recordManager.getTaxon( taxid );
                    
                    if( taxon != null ){
                        return taxon.toDxfXmlString();
                    }
                } catch( NumberFormatException nex ){
                    // ignore for now
                }
            }            
        }
        
        if( "pmid".equalsIgnoreCase( ns ) ){
            
            if( ac != null ){                
                try{
                    Source source = recordManager.getSource( ns, ac );
                
                    if( source != null ){
                        if( format != null && format.toLowerCase().equals("json") ){
                            return source.toJsonString( false );
                        } else {
                            return source.toDxfXmlString();
                        }
                    }
                } catch( NumberFormatException nex ){
                    // ignore for now
                }
            }            
        }
        **/
        return "";
    }
}
