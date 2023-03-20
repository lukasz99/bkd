package edu.ucla.mbi.bkd.struts;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.*;
import java.util.*;

import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.context.*;

public class BkdAclValidator{
    
    private JsonContext aclContext;

    public void setAclContext( JsonContext context ) {
        aclContext = context;
    }

    public JsonContext getAclContext(){
        return aclContext;
    }
    
    public void initialize(){

        Logger log = LogManager.getLogger( this.getClass() );
        
        log.info( "Initilizing BkdAclValidator..." );
        if ( aclContext.getJsonConfigObject() == null ) {            
            log.info( " Initilizing ACL context..." );

            FileResource fr = (FileResource) aclContext.getConfig().get("json-source");
            log.debug( "  AclContext: file resource->" + fr);
            try {
                aclContext.readJsonConfigDef( fr.getInputStream() );
            } catch ( Exception e ){
                log.info( "BkdAclValidator: ACL context file json-source error" );
            }

            log.debug("  AclContext:" + aclContext.getJsonConfig());
            log.info( " Initilizing ACL context: DONE" );
        }

        log.info( "Initilizing BkdAclValidator: DONE" );

    }
    
    //--------------------------------------------------------------------------
    // action-based control: no target
    //--------------------------------
    
    public boolean verify( String action, String op,
                           String login, Set<String> role, Set<String> group ){

        return verify( action, op, login, role, group, null, null, null);
        
    }

    //--------------------------------------------------------------------------
    // action-based control: target
    //-----------------------------
    
    public boolean verify( String action, String op, 
                           String login, Set<String> role, Set<String> group,
                           String town, Set<String> tadm, Set<String> tgrp ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( action + ":" +  op + ":" + login );
        Set<String> tol = null;
        if( town !=null ){
            tol = new HashSet<String>();
            tol.add( town );
        }

        Map<String,Object> acl =
            (Map<String,Object>) aclContext.getJsonConfig().get( "acl" );

        Map<String,Object> aca = (Map<String,Object>) acl.get( action );
        if ( aca == null ) return true; // action not under ACL
        
        List<String> control  = (List<String>) aca.get( "control" );
        
        // validate through allow block
        //-----------------------------
        
        boolean status = false;
        
        if( control != null && control.contains("allow") ){ 
            
            Map<String,Object> allow  = (Map<String,Object>) aca.get( "allow" );
            log.debug( " ACL verify: action allow= " + allow );
            
            status =  allowMatch( allow, login, role, group );
            
        }
        
        if( status ) return true;       // accepth through allow block

        
        Map<String,Object> operations  = (Map<String,Object>) aca.get( "operation" );
        Map<String,Object> aco = (Map<String,Object>) operations.get( op );


        // validated through operation
        //----------------------------
        
        if ( op != null ){
            
            if( aco == null ) return true; // operation not under ACL
        
            List oorder = (List) aco.get( "order" ); // operation order
            log.debug( " ACL verify: order= " + oorder);
            
            for( Iterator oi = oorder.iterator(); oi.hasNext(); ) {
                String crt = (String) oi.next();
                log.debug( " crt: " + crt );
                if( crt.equalsIgnoreCase( "ANY" ) ){
                    return true;
                }

                if( crt.equalsIgnoreCase( "DENY" ) ){
                    Map denyAcr = (Map) aco.get( crt );
                    
                    if( actionMatch( denyAcr, login, role,  group ) ){
                        return false;
                    }
                }

                if( crt.equalsIgnoreCase( "ALLOW" ) ){
                    Map allowAcr = (Map) aco.get( crt );
                    
                    if( actionMatch( allowAcr, login, role,  group ) ){
                        return true;
                    }
                }
                
                if( crt.equalsIgnoreCase( "TARGET-DENY" ) ){
                    Map dtgtAcr = (Map) aco.get( crt );
                    
                    if( tol != null 
                        && targetMatch( dtgtAcr, login, role, group,
                                        tol, tadm, tgrp ) ){
                        return false;
                    }
                }
                
                if( crt.equalsIgnoreCase( "TARGET" ) ){
                    Map tgtAcr = (Map) aco.get( crt );
                    
                    if( targetMatch( tgtAcr, login, role, group,
                                     tol, tadm, tgrp ) ){
                        return true;
                    }
                }
            } 
        } else {
            return false; // no operation, did not pass allow list
        }

        return false;
    }

    //--------------------------------------------------------------------------
    // action-based control: test target
    //-----------------------------------

    public boolean isActionTargetVerify( String action, String op ){
        
        Map<String,Object> acl =
            (Map<String,Object>) aclContext.getJsonConfig().get( "acl" );
        
        Map<String,Object> aca = (Map<String,Object>) acl.get( action );
        if ( aca == null ) return false; // action not under ACL
        
        Map<String,Object> operations  = (Map<String,Object>) aca.get( "operation" );
        Map<String,Object> aco = (Map<String,Object>) operations.get( op );

        return ( aco != null && aco.get("target") !=null );        
    }

    
    public boolean checkTargetVerify( String action, String op,  String login,
                                      Set<String> role, Set<String> group ){


        Logger log = LogManager.getLogger( this.getClass() );
        log.info(" ACL verify: action = " + action + " op=" + op);
        
        Map<String,Object> acl =
            (Map<String,Object>) aclContext.getJsonConfig().get( "acl" );

        Map<String,Object> aca = (Map<String,Object>) acl.get( action );
        if ( aca == null ) return false; // action not under ACL
        
        List<String> control  = (List<String>) aca.get( "control" );
        
        // validate through allow block
        //-----------------------------
        
        boolean status = false;
        
        if( control != null && control.contains("allow") ){ 
            
            Map<String,Object> allow  = (Map<String,Object>) aca.get( "allow" );            
            status =  allowMatch( allow, login, role, group );
            
        }
        
        if( status ) return false;       // accepth through allow block

        
        Map<String,Object> operations  = (Map<String,Object>) aca.get( "operation" );
        Map<String,Object> aco = (Map<String,Object>) operations.get( op );
        
        // validated through operation
        //----------------------------
        
        if ( op != null ){
            
            if( aco == null ) return true; // operation not under ACL
        
            List oorder = (List) aco.get( "order" ); // operation order
            log.debug(" ACL verify: order= " + oorder);
                
            for( Iterator oi = oorder.iterator(); oi.hasNext(); ) {
                String crt = (String) oi.next();
                log.debug( " crt: " + crt );
                if( crt.equalsIgnoreCase( "ANY" ) ){
                    return false;
                }

                if( crt.equalsIgnoreCase( "DENY" ) ){
                    Map denyAcr = (Map) aco.get( crt );
                    
                    if( actionMatch( denyAcr, login, role,  group ) ){
                        return false;
                    }
                }

                if( crt.equalsIgnoreCase( "ALLOW" ) ){
                    Map allowAcr = (Map) aco.get( crt );
                    
                    if( actionMatch( allowAcr, login, role,  group ) ){
                        return false;
                    }
                }
                
                if( crt.equalsIgnoreCase( "TARGET-DENY" ) ){
                    return true;                    
                }
                
                if( crt.equalsIgnoreCase( "TARGET" ) ){
                    return true;
                }
            } 
        } else {
            return false; // no operation, did not pass allow list
        }
        return false;
    }
    
    //--------------------------------------------------------------------------
    // action-based control: test target
    //-----------------------------------
    
    public boolean checkNoTargetVerify( String action, String op,  String login,
                                        Set<String> role, Set<String> group ){

        Logger log = LogManager.getLogger( this.getClass() );
        log.info( " ACL: checkNoTargetVerify: action = " + action + " op=" + op);
        
        Map<String,Object> acl =
            (Map<String,Object>) aclContext.getJsonConfig().get( "acl" );

        Map<String,Object> aca = (Map<String,Object>) acl.get( action );
        log.debug( "action control list: " + aca );
        
        if ( aca == null ) return true; // action not under ACL
        
        List<String> control  = (List<String>) aca.get( "control" );
        log.debug( "action control: " + control );
        
        // validate through allow block
        //-----------------------------
        
        boolean status = false;
        
        if( control != null && control.contains("allow") ){ 
            
            Map<String,Object> allow  = (Map<String,Object>) aca.get( "allow" );
            log.debug( " allow block: " + allow );
            
            status =  allowMatch( allow, login, role, group );
            log.debug( " allow block status: " + status );
        }
        
        if( status ) return true;       // accepted through allow block
        
        log.debug( " operation: " + op );
        
        Map<String,Object> operations  = (Map<String,Object>) aca.get( "operation" );
        Map<String,Object> aco = (Map<String,Object>) operations.get( op );
                
        log.debug( " operations block: " +aco );

        // validate through operation
        //----------------------------

        log.debug(" ACL verify: action op= " + op);

        /*
        if( op == null && operations != null && operations.size() >0 ){
            log.debug( " no opration, non-empty operations block -> false "  );
            return false; 
        }
        */

        if( op == null ) return true;
        
        if ( op != null ){
            
            if( aco == null ) return true; // operation not under ACL
            
            List oorder = (List) aco.get( "order" ); // operation order
            log.debug(" ACL verify: order= " + oorder);

            for( Iterator oi = oorder.iterator(); oi.hasNext(); ) {
                String crt = (String) oi.next();
                log.debug( " crt: " + crt );
                
                if( crt.equalsIgnoreCase( "ANY" ) ){
                    return true;
                }

                if( crt.equalsIgnoreCase( "DENY" ) ){
                    Map denyAcr = (Map) aco.get( crt );
                    
                    if( actionMatch( denyAcr, login, role,  group ) ){
                        log.debug( "   actionMatch -> true" );
                        return false;
                    }
                    log.debug( "   actionMatch -> false" );
                }

                if( crt.equalsIgnoreCase( "ALLOW" ) ){
                    Map allowAcr = (Map) aco.get( crt );
                    
                    if( actionMatch( allowAcr, login, role,  group ) ){
                        log.debug( "   actionMatch -> true" );
                        return true;
                    }
                    log.debug( "   actionMatch -> false" ); 
                }
                
                if( crt.equalsIgnoreCase( "TARGET-DENY" ) ){
                    return false;                    
                }
                
                if( crt.equalsIgnoreCase( "TARGET" ) ){
                    return false;
                }
            }
            log.debug( "   crt: DONE" );
            return false;
        } else {
            return true; // no operation, did not pass allow list
        }
        //return true;
    }

    
    public Set<String> getTgtOwnerSet( String actionName, String operationName,
                                       String login,
                                       Set<String> roles, Set<String> groups ){

        Logger log = LogManager.getLogger( this.getClass() );
        
        Set<String> result = new HashSet<String>();
        
        log.debug(" ACL: getTgtOwnerSet: action = " + actionName +
                  " op=" + operationName );
        
        Map<String,Object> acl =
            (Map<String,Object>) aclContext.getJsonConfig().get( "acl" );

        Map<String,Object> aca = (Map<String,Object>) acl.get( actionName );
        if ( aca == null ) return result; // action not under ACL
        
        Map<String,Object> ops  = (Map<String,Object>) aca.get( "operation" );
        if( ops == null ) return result; // opertions missing

        Map<String,Object> cop = (Map<String,Object>) ops.get( operationName );   
        if( cop == null ) return result; // operation not under ACL

        Map target = (Map) cop.get( "target" );
        if( target == null ) return result; // operation not under ACL
        
        List ousr = (List) target.get( "ousr" );   // owner rule
            
        if ( ousr != null ) {
            for ( Iterator ii = ousr.iterator(); ii.hasNext(); ) {
                
                String  os = (String) ii.next();
                if ( os.equals( "__LOGIN" ) && login != null ) {
                    os = login;
                }
                result.add( os );
            }
        }        
        return result; 
    }
    
    public Set<String> getTgtUserSet( String actionName, String operationName,
                                      String login,
                                      Set<String> roles, Set<String> groups ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        Set<String> result = new HashSet<String>();
        
        log.debug(" ACL: getTgtOwnerSet: action = " + actionName +
                  " op=" + operationName );
        
        Map<String,Object> acl =
            (Map<String,Object>) aclContext.getJsonConfig().get( "acl" );
        
        Map<String,Object> aca = (Map<String,Object>) acl.get( actionName );
        if ( aca == null ) return result; // action not under ACL
        
        Map<String,Object> ops  = (Map<String,Object>) aca.get( "operation" );
        if( ops == null ) return result; // opertions missing

        Map<String,Object> cop = (Map<String,Object>) ops.get( operationName );   
        if( cop == null ) return result; // operation not under ACL

        Map target = (Map) cop.get( "target" );
        if( target == null ) return result; // target not under ACL
        
        List ausr = (List) target.get( "ausr" );   // admin user rule
            
        if ( ausr != null ) {
            for ( Iterator ii = ausr.iterator(); ii.hasNext(); ) {
                
                String  os = (String) ii.next();
                if ( os.equals( "__LOGIN" ) && login != null ) {
                    os = login;
                }
                result.add( os );
            }
        }        
        return result;     
    }
    
    public Set<String> getTgtGroupSet( String actionName, String operationName,
                                       String login,
                                       Set<String> roles, Set<String> groups ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        
        Set<String> result = new HashSet<String>();
        
        log.debug(" ACL: getTgtOwnerSet: action = " + actionName +
                  " op=" + operationName);
        
        Map<String,Object> acl =
            (Map<String,Object>) aclContext.getJsonConfig().get( "acl" );
        
        Map<String,Object> aca = (Map<String,Object>) acl.get( actionName );
        if ( aca == null ) return result; // action not under ACL
        
        Map<String,Object> ops  = (Map<String,Object>) aca.get( "operation" );
        if( ops == null ) return result; // opertions missing

        Map<String,Object> cop = (Map<String,Object>) ops.get( operationName );   
        if( cop == null ) return result; // operation not under ACL

        Map target = (Map) cop.get( "target" );
        if( target == null ) return result; // target not under ACL
        
        List agrp = (List) target.get( "agrp" );  // admin group rule
        
        if ( agrp != null ) {
            for ( Iterator ii = agrp.iterator(); ii.hasNext(); ) {
                String  os = (String) ii.next();
                if ( os.equals( "__LOGIN" ) && groups != null ) {
                    // NOTE: copy logged user groups
                    
                    result.addAll( groups );

                } else {
                    result.add( os );                    
                }
            }
        }

        return result;
    }

    
    //--------------------------------------------------------------------------
    
    private boolean allowMatch( Map allow, String login, 
                                 Set<String> roles, 
                                 Set<String> groups ) {
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( " ACL: allowMatch ");
        
        try {
        
            // user:["lukasz97"],
            // role:["administrator"],
            // group:["ADMIN"]

            log.debug( "ACL: user=" + login );
            
            List userl = (List) allow.get( "user" );
            log.debug( "   ACL: userl=" + userl );            
            if ( userl.contains( login ) ) {
                log.debug( "ACL: aclVerify -> by user=" + login );                
                return true; 
            }
            
            log.debug( "ACL: roles=" + roles );

            if( roles != null) {
                List rolel = (List) allow.get( "role" );
                for ( Iterator ii = roles.iterator(); ii.hasNext(); ) {
                    Object o = ii.next();
                    if ( rolel.contains( o ) ) {
                        log.debug( "ACL: aclVerify -> by role=" + roles );
                        return true;
                    }
                }
            }

            log.debug( "ACL: groups=" + groups );

            if( groups != null) { 
                List groupl = (List) allow.get( "group" );
                for ( Iterator ii = groups.iterator(); ii.hasNext(); ) {
                    Object o = ii.next();
                    if ( groupl.contains( o ) ) {
                        log.debug( "ACL: aclVerify -> by group=" + groups );                    
                        return true;
                    }
                }
            }
        } catch( Exception ex ) {
            log.info( ex );
            ex.printStackTrace();
        }
        return false;
    }

    //--------------------------------------------------------------------------
    
    private boolean actionMatch( Map allow, String login, 
                                 Set<String> roles, 
                                 Set<String> groups ) {
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug( " ACL: actionMatch ");       
        try {
        
            // user:["lukasz97"],
            // role:["administrator"],
            // group:["ADMIN"]

            log.debug( "   ACL: user=" + login );
            
            List userl = (List) allow.get( "user" );
            log.debug( "   ACL: userl=" + userl );
            
            if ( userl.contains( login ) || userl.contains( "ANY" )) {
                log.debug( "   ACL: aclVerify -> by user=" + login );
                return true; 
            }
            
            log.debug( "   ACL: roles=" + roles );

            if( roles != null ){
                List rolel = (List) allow.get( "role" );
                for ( Iterator ii = roles.iterator(); ii.hasNext(); ) {
                    Object o = ii.next();
                    if ( rolel.contains( o ) || rolel.contains( "ANY" )) {
                        log.debug( "   ACL: aclVerify -> by role=" + roles );
                        return true;
                    }
                }
            }

            log.debug( "   ACL: groups=" + groups );

            if( groups != null ){
                List groupl = (List) allow.get( "group" );
            
                for ( Iterator ii = groups.iterator(); ii.hasNext(); ) {
                    Object o = ii.next();
                    if ( groupl.contains( o ) || groupl.contains( "ANY" ) ) {
                        log.debug( "   ACL: aclVerify -> by group=" + groups );
                        return true;
                    }
                }
            }
        } catch( Exception ex ) {
            log.info( ex );
        }
        return false;
    }

    //--------------------------------------------------------------------------

    private boolean operationVerify( Map acr, String login,
                                     Set<String> roles,
                                     Set<String> groups ) {
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        List order = (List) acr.get( "order" );
        
        for( Iterator oi = order.iterator(); oi.hasNext(); ) {
            String crt = (String) oi.next();

            if( crt.toUpperCase().equals( "ANY" ) ) {
                break;
            }
            
            if( crt.toUpperCase().equals( "ALLOW" ) ) {
                if ( login == null || acr.get( "allow" ) == null ) {
                    return false; // no login or allow definition missing
                }
                
                Map allow = (Map) acr.get( "allow" );
                
                if ( ! actionMatch( allow, login, roles, groups ) ) {
                    return false;
                } else {
                    break;
                }
            }

            if( crt.toUpperCase().equals( "DENY" ) ) {
                // NOTE: not implemented
            }

        }
        return true;
    }

    //--------------------------------------------------------------------------
    
    private boolean targetMatch( Map target, String login, 
                                 Set<String> roles, Set<String> groups,
                                 Set<String> town, 
                                 Set<String> tadm, 
                                 Set<String> tgrp ){
        
        Logger log = LogManager.getLogger( this.getClass() ); 
        log.debug("LOGIN="+login+ " r="+roles+" g="+groups);
        log.debug("TGT="+town+ " au="+tadm+" ag="+tgrp);
        
        if( town == null ) return true;

        if( target.get("ousr") != null ){
            for( Iterator icou = ((List) target.get("ousr")).iterator();
                 icou.hasNext(); ){
                
                String cou = (String) icou.next();
        
                if( cou.equals("__LOGIN") && login != null ){
                    if( town.contains( login ) ) return true; 
                } else {
                    if( town.contains( cou ) ) return true;
                }
            }
        }

        if( target.get("ausr") != null ){
            for( Iterator icau = ((List)target.get("ausr")).iterator();
                 icau.hasNext(); ){
                
                String cau = (String) icau.next();
        
                if( cau.equals("__LOGIN") && login != null ){
                    if( tadm.contains( login ) ) return true;
                } else {
                    if( tadm.contains( cau ) ) return true;
                }
            }
        }

        if( target.get("agrp") != null ){
            for( Iterator icag = ((List)target.get("agrp")).iterator();
                 icag.hasNext(); ){
                
                String cag = (String) icag.next();
                
                if( cag.equals("__LOGIN") && groups != null ){
                    for( Iterator<String> igrp = groups.iterator();
                         igrp.hasNext(); ){

                        String cgrp = igrp.next();
                        log.debug("acl(agrp)="+ cgrp + " tgrp=" + tgrp);
                        if( tgrp.contains( cgrp ) ) return true;
                    }
                } else {
                    
                    log.debug("acl(grp)="+ cag + " tgrp=" + tgrp);
                    if( tgrp.contains( cag ) ) return true;
                }
            }
        }
        return false;      
    }
}
