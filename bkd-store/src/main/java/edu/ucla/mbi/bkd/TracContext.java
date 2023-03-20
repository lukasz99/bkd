package edu.ucla.mbi.bkd;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import org.json.*;

import edu.ucla.mbi.util.context.*;
import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

import edu.ucla.mbi.bkd.access.*;
import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.store.dao.*;

public class TracContext extends JsonContext {

    /*
    private IcPubDao pubDao;

    public IcPubDao getPubDao() {
        return pubDao;
    }

    public void setPubDao( IcPubDao dao ) {
        pubDao = dao;
    }
    */
    
    //--------------------------------------------------------------------------

    /*
    private IcJournalDao journalDao;

    public IcJournalDao getJournalDao() {
        return journalDao;
    }

    public void setJournalDao( IcJournalDao dao ) {
        journalDao = dao;
    }
    */

    //--------------------------------------------------------------------------

    /*
    private IcStatsDao icStatsDao;

    public IcStatsDao getIcStatsDao() {
        return icStatsDao;
    }

    public void setIcStatsDao( IcStatsDao dao ) {
        icStatsDao = dao;
    }
    */
    
    //--------------------------------------------------------------------------

    /*
    private IcAdiDao icAdiDao;

    public IcAdiDao getAdiDao() {
        return icAdiDao;
    }

    public void setAdiDao( IcAdiDao dao ) {
        icAdiDao = dao;
    }
    */
    
    //--------------------------------------------------------------------------

    /*
    private IcWorkflowDao icWorkflowDao;

    public IcWorkflowDao getWorkflowDao() {
        return icWorkflowDao;
    }

    public void setWorkflowDao( IcWorkflowDao dao ) {
        icWorkflowDao = dao;
    }
    */

    //--------------------------------------------------------------------------

    /*
    private SorelDao sorelDao;
    
    public SorelDao getSorelDao() {
        return sorelDao;
    }
    
    public void setSorelDao( SorelDao dao ) {
        sorelDao = dao;
    }
    */

    //--------------------------------------------------------------------------
    
    private BkdEorelDao eorelDao;
    
    public BkdEorelDao getEorelDao() {
        return eorelDao;
    }
    
    public void setEorelDao( BkdEorelDao dao ) {
        eorelDao = dao;
    }
    
    private ReportDao reportDao;
    
    public ReportDao getReportDao() {
        return reportDao;
    }
    
    public void setReportDao( ReportDao dao ) {
        reportDao = dao;
    }
    

    //--------------------------------------------------------------------------
    //  NCBI Proxy Access
    //-------------------

    /*
    private NcbiProxyClient ncbiProxy;

    public void setNcbiProxyClient( NcbiProxyClient proxy ) {
        this.ncbiProxy = proxy;
    }

    public NcbiProxyClient getNcbiProxyClient() {
        return this.ncbiProxy;
    }
    */
    
    //--------------------------------------------------------------------------
    //  NCBI Proxy Access
    //-------------------

    /*
    private NcbiClient ncbiClient;

    public void setNcbiClient( NcbiClient client ) {
        this.ncbiClient = client;
    }

    public NcbiClient getNcbiClient() {
        return this.ncbiClient;
    }
    */
    
    //--------------------------------------------------------------------------

    
    public void initialize() {
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "TracContext: initializing" );
        
    }
}
