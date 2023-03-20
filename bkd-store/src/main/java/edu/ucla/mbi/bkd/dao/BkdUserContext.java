package edu.ucla.mbi.bkd.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import edu.ucla.mbi.util.context.UserContext;

import edu.ucla.mbi.bkd.dao.*;

public class BkdUserContext extends UserContext{
    
    BkdDaoContext daoContext;
    
    public void setDaoContext(BkdDaoContext context){
        this.daoContext = context;
    }

    public BkdDaoContext getDaoContext(BkdDaoContext context){
        return daoContext;
    }

    public void initialize() {

        Logger log = LogManager.getLogger( BkdUserContext.class );
        log.info( " BkdUserContext: initialize" );
        log.info( " BkdUserContext: DaoContext: "
                  + " State -> "+ daoContext.getState());        
        log.info( " BkdUserContext: DaoContext: "
                  + " SessionFactory ->" + daoContext.getSessionFactory());
        log.info( " BkdUserContext: setting role/group/usr session factories" );

        if( getRoleDao() != null ){
            log.info( " BkdUserContext: roleDao -> " + getRoleDao() );
            ( (BkdRoleDao) getRoleDao() )
                .setSessionFactory( daoContext.getSessionFactory() );
            log.info( " BkdUserContext: RoleDao SessionFactory set" );
        }
        
        if( getGroupDao() != null ){
            log.info( " BkdUserContext: groupDao -> " + getGroupDao() );
            ((BkdGroupDao) getGroupDao())
                .setSessionFactory( daoContext.getSessionFactory() );
            log.info( " BkdUserContext: GroupDao SessionFactory set" );            
        }
        
        
        if( getUserDao() != null ){
            log.info( " BkdUserContext: userDao -> " + getUserDao() );
            ((BkdUserDao) getUserDao())
                .setSessionFactory( daoContext.getSessionFactory() );
            log.info( " BkdUserContext: UserDao SessionFactory set" );           
        }
        log.info( " BkdUserContext: initializing UserContext" );
        super.initialize();
        log.info( " BkdUserContext: initializing UserContext: DONE" );
        
    }    


    // Role
    //-----
    
    BkdRoleDao roleDao;
    
    public void setRoleDao( BkdRoleDao dao ){
        this.roleDao = dao;
    }

    public BkdRoleDao getRoleDao(){
        roleDao.setSessionFactory( daoContext.getSessionFactory() );
        return roleDao;  
    }

    // Group
    //-----
    
    BkdGroupDao groupDao;
    
    public void setGroupDao( BkdGroupDao dao ){
        this.groupDao = dao;
    }

    public BkdGroupDao getGroupDao(){
        groupDao.setSessionFactory( daoContext.getSessionFactory() );
        return groupDao;  
    }

    // User
    //-----
    
    BkdUserDao userDao;
    
    public void setUserDao( BkdUserDao dao ){
        this.userDao = dao;
    }

    public BkdUserDao getUserDao(){
        userDao.setSessionFactory( daoContext.getSessionFactory() );
        return userDao;  
    }

       
}
