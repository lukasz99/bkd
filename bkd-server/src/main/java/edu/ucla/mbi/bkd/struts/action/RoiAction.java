package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.util.concurrent.*;
import java.io.*;

import javax.xml.bind.*;

import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.bkd.store.*;

import org.json.*;

public class RoiAction extends PortalSupport{

    Logger log = null;
    
    private Logger log(){
        if(log == null) {
            log = LogManager.getLogger( this.getClass() );
        }
        return log;
    }    
    
    //--------------------------------------------------------------------------
    // EXECUTE ACTION
    //---------------
        
    public String execute() throws Exception {
        log().debug( " MenuContext: " + super.getMenuContext() );        
        return dispatch();
    }
      
    //--------------------------------------------------------------------------
    // dispatcher
    //-----------

    public String dispatch() throws Exception {

        // operations
        //-----------
        
        if( "bed".equalsIgnoreCase( op ) ){
            System.out.println(this.pos);
        }
        
        log().info( "RoiAction: DONE" );        
        return JSON;
    }
    
    //--------------------------------------------------------------------------
    // arguments
    //----------
    
    String op="";
    
    public void setOp(String op){        
        this.op = op;                                     
    }
    
    public String getOp(){
        return this.op;                                  
    }

    String pos="";
    
    public void setPos(String pos){
        this.pos = pos;
    }
    
    public String getPos(){
        return this.pos;
    }
}
