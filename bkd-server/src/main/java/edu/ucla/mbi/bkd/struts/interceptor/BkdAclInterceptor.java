package edu.ucla.mbi.bkd.struts.interceptor;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.util.ValueStack;
import com.opensymphony.xwork2.interceptor.Interceptor;
import com.opensymphony.xwork2.interceptor.PreResultListener;

import java.util.*;
import java.io.*;

import java.io.InputStream;
import javax.servlet.ServletContext;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.context.*;
import edu.ucla.mbi.util.struts.*;
import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.bkd.struts.*;

public class BkdAclInterceptor implements Interceptor{

    public static final String ACL_PAGE = "acl_page";
    public static final String ACL_OPER = "acl_oper";
    public static final String ACL_TGET = "acl_tget";

    private JsonContext aclCtx;
    
    public void setAclContext( JsonContext context ) {
        aclCtx = context;
    }

    //--------------------------------------------------------------------------

    public void destroy() {}
    public void init() {}

    //--------------------------------------------------------------------------
    
    private void aclInitialize ( PortalSupport action ) {
	
        Logger log = LogManager.getLogger( this.getClass() );
	      
        if ( aclCtx.getJsonConfigObject() == null ) {
	    log.info( " initilizing ACL defs..." );
            String jsonPath =
                (String) aclCtx.getConfig().get( "json-config" );
            log.info( "JsonMenuDef=" + jsonPath );
	    
            if ( jsonPath != null && jsonPath.length() > 0 ) {

                String cpath = jsonPath.replaceAll("^\\s+","" );
                cpath = jsonPath.replaceAll("\\s+$","" );
		
                try {
                    InputStream is = action.
			getServletContext().getResourceAsStream( cpath );
                    aclCtx.readJsonConfigDef( is );
		} catch ( Exception e ){
                    log.info( "JsonAclContext reading error" );
                }
            }
        }        
    }
    
    //--------------------------------------------------------------------------
    // ACL Validator
    //--------------

    // NOTE: should replace implementation local to interceptor
    
    private BkdAclValidator aclv;
    
    public void setAclValidator( BkdAclValidator validator ){
        aclv = validator;
    }
    
    public BkdAclValidator getAclValidator(){
        return aclv;
    }
    
    //---------------------------------------------------------------------
    
    public String intercept( ActionInvocation invocation )
        throws Exception {

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "ACL(info): start interceptor" );
        
        if ( ! ( invocation.getAction() instanceof PortalSupport ) ) {
            return invocation.invoke(); // no ACL control
        }
        
        // load menu definitions (if needed)
        //----------------------------------
            
        PortalSupport psa = (PortalSupport) invocation.getAction();
        Map sss = psa.getSession();
        
        aclInitialize( psa ); 	    
                    
        // action name
        //------------
        
        String actionName = invocation.getInvocationContext().getName();
        log.info( "ACL: Interceptor action=" + actionName );
        
        // operation name
        //---------------

        String operationName = null;
        
        if( invocation.getAction() instanceof AclAware ){
            
            AclAware action = (AclAware) invocation.getAction();
            
            Map<String,String> op = action.getOp();
            log.info( "ACL Interceptor: op=" + op );
            
            if ( op != null ) {                    
                Set<String> oset = op.keySet();
            
                if ( oset.size() == 1 ) {
                    operationName  = (String) oset.toArray()[0];
                } else {
                    return ACL_OPER; // oeration ambiguous
                }
            }
        }
        
        log.info( "ACL Interceptor: operation name=" + operationName );
        
        String login = (sss == null || (String) sss.get( "LOGIN" ) == null) ? 
            null : (String) sss.get( "LOGIN" );
            
        Set<String>  roles = sss.get( "USER_ROLE" ) == null ? null : 
            (Set<String>) ((Map) sss.get( "USER_ROLE") ).keySet();
        
        Set<String> groups = sss.get( "USER_GROUP" ) == null ? null :
            (Set<String>) ((Map) sss.get( "USER_GROUP") ).keySet();

        
        if( aclv.checkNoTargetVerify( actionName, operationName,
                                      login, roles, groups ) ){
            //  if true -> verified, no target check needed -> invoke()
            log.info( "ACL Interceptor: checkNoTargetVerify -> true");
            return invocation.invoke();
        } 

        log.debug( "ACL Interceptor: checkNoTargetVerify -> false");
        
        // false - got to check if target needed

        log.info( "ACL Interceptor: ActionTargetVerify"); 
        
        if( aclv.isActionTargetVerify( actionName, operationName ) ){
            
            log.debug( "ACL Interceptor: ActionTargetVerify -> true" );    
            // if true -> need target match, set match list, call invoke()
            
            if( ! ( invocation.getAction() instanceof AclAware ) ) {
                return ACL_TGET;
            }
            
            AclAware action = (AclAware) invocation.getAction();
            
            Set<String> ouSet =
                aclv.getTgtOwnerSet( actionName, operationName,
                                     login, roles, groups );
            
            Set<String> auSet =
                aclv.getTgtUserSet( actionName, operationName,
                                    login, roles, groups );
            
            Set<String> agSet =
                aclv.getTgtGroupSet( actionName, operationName,
                                     login, roles, groups );
            
            // NOTE: nulls mean no target-level control
            //-----------------------------------------
        
            action.setOwnerMatch( ouSet );
            action.setAdminUserMatch( auSet );
            action.setAdminGroupMatch( agSet );
            
            String result = invocation.invoke();
            return result;       
        } 
        
        // if false -> operation not permitted
        log.debug( "ACL Interceptor: ActionTargetVerify -> false" );
        if( operationName != null ){
            return ACL_OPER;
        }
        return ACL_PAGE;
    }
}
