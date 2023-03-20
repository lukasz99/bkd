package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.util.ServletContextAware;

import java.io.*;
import java.util.*;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;


public class WatchMgrAction extends ManagerSupport {
    
    private static final String JSON = "json";    
    private static final String REDIRECT = "redirect";    
    private static final String ACL_PAGE = "acl_page";
    private static final String ACL_OPER = "acl_oper";
    
    ////------------------------------------------------------------------------
    /// Watch Manager
    //---------------
    
    private BkdWatchManager watchManager;

    public void setWatchManager( BkdWatchManager manager ) {
        this.watchManager = manager;
    }

    public BkdWatchManager getWatchManager() {
        return this.watchManager;
    }
    
    //--------------------------------------------------------------------------
    // format
    //-------

    private String format = null;

    public void setFormat( String format ) {
        this.format = format;
    }

    public String getFormat(){
        return this.format;
    }
    
    //--------------------------------------------------------------------------
    // results
    //--------
    
    //--------------------------------------------------------------------------

    Map<String,Object> flags = null;

    public Map<String,Object> getFlags(){
        return this.flags;
    }
    
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    public String execute() throws Exception {

        Logger log = LogManager.getLogger( this.getClass() );        
        log.debug(  "id=" + getId() + " op=" + getOp() );
        
        Integer iusr = (Integer) getSession().get( "USER_ID" );
        log.debug( " login id=" + iusr );
        
        BkdUser luser = null;
        if( iusr != null) {
            luser = (BkdUser) getUserContext().getUserDao().getUser( iusr.intValue() );
            log.debug( " user set to: " + luser );
        }
        
        if( getOp() == null ) return SUCCESS;

        Report report = null;

        if(  getNs() != null && getAc() != null ) {           
            report = (Report) getWatchManager().getTracContext().getReportDao()
                .getById( getNs(), getAc() );
        }
               
        for ( Iterator<String> i = getOp().keySet().iterator();
              i.hasNext(); ) {
            
            String key = i.next();
            String val = getOp().get(key);

            if ( val != null && val.length() > 0 ) {
                
                if ( key.equalsIgnoreCase( "wpg" ) ) {
                    return getWatchPage( getId(), getOpp() );
                }

                if ( key.equalsIgnoreCase( "wflu" ) ) {
                    if( report != null && getOpp() != null ){
                        String wfl = getOpp().get( "wfl" );
                        return updateWatchStatus( luser, report,  wfl );
                    }
                }
            }
        }
        return SUCCESS;
    }

    //--------------------------------------------------------------------------

    
    private String getWatchPage( int id, Map opp ){
        
        //watchManager.getWatchPage( id );

        return JSON;
    }

    //--------------------------------------------------------------------------

    private String updateWatchStatus( BkdUser usr, Report report,  String wfl ){
        
        boolean watch 
            = (wfl!= null && wfl.equalsIgnoreCase("true") ) ? true : false;
        
        flags = new HashMap<String,Object>();
        
        flags.put("watch", watchManager.setWatchStatus( usr, report, watch ) );
        
        return JSON;
    }
    
    String ns= "";
    
    public void setNs( String ns){
        this.ns = ns;
    }
    
    public String getNs(){
        return this.ns;
    }
    
    String ac= "";
    
    public void setAc( String ac){
        this.ac = ac;
    }
    
    public String getAc(){
        return this.ac;
    }
    
}
