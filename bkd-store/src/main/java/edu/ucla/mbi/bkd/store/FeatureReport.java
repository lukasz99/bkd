package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

import org.json.*;

@Entity
@DiscriminatorValue("frep")
public class FeatureReport extends Report{

    @ManyToOne(fetch = FetchType.EAGER,cascade = CascadeType.ALL)
    @JoinColumn(name="fk_feat", nullable=false)
    private Feature feature;

    public void setFeature(Feature feature){
	this.feature = feature;
    }

    public Feature getFeature(){
	return this.feature;
    }

    public static FeatureReport fromJsonForm( String form,
                                              CvTerm freportType,
                                              Source source ){

        Logger log = LogManager.getLogger( FeatureReport.class );

        FeatureReport report = new FeatureReport();
               
        report.setCvType( new CvTerm() );
        report.setSource( source );

        String tgtAc = "";
        String rac = "";
        try{
            JSONObject jform = new JSONObject( form );

            JSONObject jval = new JSONObject(); 
            Map<String,Range> rangeMap = new HashMap<String,Range>();
            Map<String,FeatureXref> xrefMap = new HashMap<String,FeatureXref>();
            
            for( Iterator<String> k = jform.keys(); k.hasNext(); ){
                String key = k.next();
                String val = jform.getString(key);
                
                System.out.println( "KEY: " + key + "  |||| VAL: " + val);

                if( key.startsWith("report_value_") ){   // jvalue 

                    try{
                        String vname = key.replace("report_value_","");                         
                        //System.out.println( " name= " + vname );

                        if( vname.contains("_") ){                         
                            String [] cols = vname.split("_",2);
                            String attr = cols[1];

                            // ns/ac in value

                            if("ns".equalsIgnoreCase(attr) ){
                                //System.out.println(cols[0] + ": ns: " + val);
                            }                            
                            if("ac".equalsIgnoreCase(attr) ){
                                //System.out.println(cols[0] + ": ac: " + val);
                            }                            

                            if( ! jval.has(cols[0]) ){
                                jval.put(cols[0], new JSONObject());
                            }
                            JSONObject jo = jval.getJSONObject( cols[0] );
                            jo.put( attr, val );                                                            
                            
                        } else {
                            //System.out.println(vname + ": val: " + val);
                            // property value here

                            if( ! jval.has( vname ) ){
                                jval.put( vname , new JSONObject());
                            }
                            JSONObject jo = jval.getJSONObject(vname);
                            jo.put( "value", val );                                                        
                        }                        
                        
                    } catch(Exception ex){
                        System.out.println(ex);                        
                    }
                    
                } else if( key.startsWith("report_target_feature_") ){

                    // feature details: label, ranges, xrefs
                    
                    String vname = key.replace("report_target_feature_","");

                    System.out.println( " feature: name= " + vname );
                    
                    if( vname.startsWith( "ranges_" ) ){

                        System.out.println( " feature: ranges= " + vname );
                        //ranges_0_start
                        vname = vname.replace( "ranges_", "" );
                        
                        if( vname.contains("_") ){
                            String [] cols = vname.split( "_", 2 );
                            
                            System.out.println( "Ranges: " + cols[0] + " ::: " + cols[1]  + " val=" + val);

                            if(! rangeMap.containsKey( cols[0] ) ){                                
                                rangeMap.put( cols[0], new Range() );                                
                            }

                            if( "from".equalsIgnoreCase( cols[1] ) ){
                                System.out.println( "  start=" + val + " ::: " + Integer.parseInt( val ));
                                rangeMap.get( cols[0] ).setStart( Integer.parseInt( val ) );                                
                            } else if( "to".equalsIgnoreCase( cols[1] ) ){
                                System.out.println( "  stop=" + val + " ::: " + Integer.parseInt( val ));
                                rangeMap.get( cols[0] ).setStop( Integer.parseInt(val) );                                
                            } else if( "sequence".equalsIgnoreCase( cols[1] ) ){
                                System.out.println( "  seq=" + val );
                                rangeMap.get( cols[0] ).setSequence( val );                                
                            }
                            
                        }                        
                    }

                    if( vname.startsWith("xrefs_") ){

                        System.out.println( " feature: xrefs= " + vname );

                        vname = vname.replace("xrefs_","");
                        
                        if( vname.contains("_") ){
                            String [] cols = vname.split("_",2);
                            
                            System.out.println( "Xrefs: " + cols[0] + " ::: " + cols[1] );

                            if(! xrefMap.containsKey( cols[0] ) ){
                                xrefMap.put( cols[0], new FeatureXref() );
                                xrefMap.get( cols[0] ).setCvType( new CvTerm() );
                            }

                            if( "ns".equalsIgnoreCase( cols[1] ) ){                                
                                xrefMap.get( cols[0] ).setNs( val );
                            }else if( "ac".equalsIgnoreCase( cols[1] ) ){ 
                                xrefMap.get( cols[0] ).setAc( val );                                
                            }else if( "tns".equalsIgnoreCase( cols[1] ) ){
                                xrefMap.get( cols[0] ).getCvType().setNs( val );
                            }else if( "tac".equalsIgnoreCase( cols[1] ) ){                                
                                xrefMap.get( cols[0] ).getCvType().setAc( val );                                
                            }else if( "tname".equalsIgnoreCase( cols[1] ) ){                                
                                xrefMap.get( cols[0] ).getCvType().setName( val );                                
                            }
                        }                    
                    }
                                        
                } else if( key.startsWith("report_target_") ){

                    // target 
                    
                    try{
                        String vname = key.replace("report_target_","");                         
                        System.out.println( " name= " + vname );

                        if( vname.contains("_") ){                         
                            String [] cols = vname.split("_",2);
                            String attr = cols[1];
                                                        
                        }

                        if("ac".equalsIgnoreCase( vname ) ){
                            // target accession in val
                            System.out.println( " target ac = " + val );
                            tgtAc = val;                                                        
                        }
                           
                    } catch(Exception ex ){
                        
                    }
                } else if(  key.startsWith("report_ac") ){
                    rac = val;
                    System.out.println( " report ac = " + val );                  
                
                } else if(  key.startsWith("report_type_") ){
                    
                    System.out.println( " report type: key= " + key + "  val=" + val );                    
                    String vname = key.replace("report_type_","");
                    if( "ns".equalsIgnoreCase( vname ) ){
                        report.getCvType().setNs( val );
                    } else if( "ac".equalsIgnoreCase( vname ) ){
                        report.getCvType().setAc( val );
                    } else if( "name".equalsIgnoreCase( vname ) ){
                        report.getCvType().setName( val );
                    }
                }
            }

            // report ac
            //----------
            
            try{
                String rid = rac.replaceAll( "[^0-9]", "" );
                long lrid = Long.parseLong( rid );
                report.setRpid( lrid );
                log.info("report id set to -> " + report.getAc());

            } catch( Exception ex ){
                // shouldn't happen                
            }
                        
            
            // report target
            //--------------
            
            System.out.println( "JVAL:  " + jval.toString() );
            report.setJval( jval.toString() );

            NodeFeat tgtFeat = new NodeFeat();
            tgtFeat.setNode( new Node() );
            
            
            try{
                String sid = tgtAc.replaceAll( "[^0-9]", "" );
                long lid = Long.parseLong( sid );
                tgtFeat.getNode().setId( lid );
                System.out.println(lid );
                System.out.println( "tgt node:  " + tgtFeat.getNode().toString() );                
                log.info("feature: tgtnode set to -> " + tgtFeat.getNode());

            } catch( Exception ex ){
                // shouldn't happen                
            }
            
            report.setFeature( tgtFeat );
            CvTerm cvt = new CvTerm( "psi-mi", "mi:0118", "mutation" );            
            report.getFeature().setCvType( cvt );
            report.getFeature().setSource( source );

            
            System.out.println( "RMAP:  " + rangeMap );
            
            for( Iterator<String> ikey = rangeMap.keySet().iterator();
                 ikey.hasNext(); ){

                Range r = rangeMap.get(ikey.next());
                report.getFeature().getRanges().add(r);
                System.out.println( r );
            }
            
            System.out.println( "XMAP:  " + xrefMap );

            for( Iterator<String> ikey = xrefMap.keySet().iterator();
                 ikey.hasNext(); ){

                FeatureXref r = xrefMap.get(ikey.next());
                report.getFeature().getXrefs().add(r);                                
            }
             
        } catch( JSONException jx ){
            // shouldn't happen
        }
        return report;
    }
}

