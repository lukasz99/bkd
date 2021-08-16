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

    @ManyToOne
    @JoinColumn(name="fk_feat", nullable=false)
    private Feature feature;

    public void setFeature(Feature feature){
	this.feature = feature;
    }

    public Feature getFeature(){
	return this.feature;
    }

    public static FeatureReport fromJsonForm( String form ){

        FeatureReport report = new FeatureReport();
        
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
                            
                            System.out.println( "Ranges: " + cols[0] + " ::: " + cols[1] );

                            if(! rangeMap.containsKey( cols[0] ) ){
                                
                                rangeMap.put( cols[0], new Range() );
                                
                            } else if( "start".equalsIgnoreCase( cols[1] ) ){
                                
                                rangeMap.get( cols[0] ).setStart( Integer.parseInt( val ) );
                                
                            } else if( "stop".equalsIgnoreCase( cols[1] ) ){
                                
                                rangeMap.get( cols[0] ).setStop( Integer.parseInt(val) );
                                
                            } else if( "sequence".equalsIgnoreCase( cols[1] ) ){
                                
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
                        }
                           
                    } catch(Exception ex ){
                        
                    }
                }                
            }

            System.out.println( "JVAL:  " + jval.toString() );
            report.setJval( jval.toString() );

            report.setFeature( new NodeFeat() );
            
            
            System.out.println( "RMAP:  " + rangeMap );
            
            for( Iterator<String> ikey = rangeMap.keySet().iterator();
                 ikey.hasNext(); ){

                Range r = rangeMap.get(ikey.next());
                report.getFeature().getRanges().add(r);                                
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

