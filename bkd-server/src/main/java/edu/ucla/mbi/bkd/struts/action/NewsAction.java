package edu.ucla.mbi.bkd.struts.action;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.opensymphony.xwork2.ActionSupport;
import org.apache.struts2.interceptor.SessionAware;
import org.apache.struts2.interceptor.CookiesAware;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.util.ServletContextAware;

import javax.servlet.http.Cookie;
import javax.servlet.ServletContext;

import java.util.*;
import java.text.SimpleDateFormat;

import java.util.concurrent.*;
import java.io.*;

import org.json.*;

import edu.ucla.mbi.util.context.*;
import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.struts.action.*;
import edu.ucla.mbi.util.struts.interceptor.*;

import edu.ucla.mbi.bkd.BkdNewsManager;

public class NewsAction extends ManagerSupport {

    //--------------------------------------------------------------------------
    // configuration
    //---------------

    JsonContext newsContext;
    
    public JsonContext getNewsContext() {
        return newsContext;
    }
    
    public void setNewsContext( JsonContext context ) {
        this.newsContext = context;
    }

    //--------------------------------------------------------------------------

    BkdNewsManager newsManager;
    
    public BkdNewsManager getNewsManager() {
        return newsManager;
    }
    
    public void setNewsManager( BkdNewsManager manager ) {
        this.newsManager = manager;
    }
    
    //--------------------------------------------------------------------------
    // action parameters
    //------------------
    
    String ret = SUCCESS;

    public void setRet( String ret) {
        this.ret = ret;
    }
   
    public String getRet() {
        return this.ret;
    }
    
    int year;
    
    public int  getYear() {
        return year;
    }

    public void setYear( int year ) {
        this.year = year;
    }


    public void setYear( String year ) {

        try{            
            this.year = Integer.parseInt( year );
        } catch( NumberFormatException nfx ){
            // ignore format violation
        }
    }

    Object[] years;
    
    public Object[]  getYears() {
        return years;
    }

    public void setYears( Object[] years ) {
        this.years = years;
    }

    public void setYears( String[] years ) {
        this.years = years;
    }

    List<Map> news;

    public List<Map> getNews() {
        return news;
    }
    
    public void setNews( List<Map> news ) {
        this.news = news;
    }

    List<Map> nbox;

    public List<Map> getNbox() {
        return nbox;
    }
    
    public void setNbox( List<Map> nbox ) {
        this.nbox = nbox;
    }

    //--------------------------------------------------------------------------

    Logger log = LogManager.getLogger( this.getClass() );

    private void initialize( boolean force ) {
    
        Map<String,Object> jpd = newsContext.getJsonConfig();
        
        if ( jpd == null || force ) {
            log.info( " initilizing page defs..." );
            String jsonPath = 
            (String) newsContext.getConfig().get( "json-config" );
            log.info( "JsonPageDef=" + jsonPath );
        
            if ( jsonPath != null && jsonPath.length() > 0 ) {
            
                String cpath = jsonPath.replaceAll("^\\s+","" );
                cpath = jsonPath.replaceAll("\\s+$","" );

                try {
                    InputStream is = 
                    getServletContext().getResourceAsStream( cpath );
                    newsContext.readJsonConfigDef( is );
                    
                    jpd = newsContext.getJsonConfig();
                    
                } catch ( Exception e ){
                    log.info( "JsonConfig reading error" );
                }
            }
        }
    }
        
    private void initialize() {  // default: non-forced call
        initialize( false );
    }
    
    
    //--------------------------------------------------------------------------

    public String execute() throws Exception {

        log.info( "ret=" + ret );
	
	initialize();

        //----------------------------------------------------------------------
        // operations
        //-----------

        if( getOp() != null ) {

            // test ACL compliance
            //--------------------

            if( getOp().get("add") != null ) {
                
                String date = getOpp().get( "date" );
                String time = getOpp().get( "time" );
                String year = "";

                if( date == null || date.equals( "" ) ) {
                
                    Date now = new Date();
                    
                    SimpleDateFormat 
                        yearFormat = new SimpleDateFormat( "yyyy" );
                    SimpleDateFormat 
                        dateFormat = new SimpleDateFormat( "yyyy-MM-dd" );
                    SimpleDateFormat 
                        timeFormat = new SimpleDateFormat( "HH-mm-ss" );
                    
                    year = yearFormat.format( now );
                    date = dateFormat.format( now );
                    time = timeFormat.format( now );
                } else {
                    year = date.substring( 0, 4 );
                }
                
                String header = getOpp().get( "header" );
                String aini = getOpp().get( "aini" );
                String body = getOpp().get( "body" );
                
                int uid = 0;
                String email = "";
                if( getSession() != null 
                    && getSession().get("USER_ID") != null ) {
                    String sid = Integer
                        .toString( (Integer) getSession().get("USER_ID") );
                    try {
                        uid = Integer.parseInt( sid );
                        email = getUserContext().getUserDao()
                            .getUser( uid ).getEmail();
                    } catch( Exception nfe ) {
                        // Ignore: should not happen
                    }
                    log.debug( "\n DATE: " + date + " TIME: " + time + 
                              " ID: " + uid + " EMAIL: " + email +
                              "\n TTL: " + header + "\n INT: "+ aini + 
                              "\n MSG: " + body );
                    //----------------------------------------------------------

                    String mailNewsMessage = getNewsManager()
                        .buildMailMessage( date, time, header, body, email );
                    
                    log.debug( "News Mail Message" );

                    //----------------------------------------------------------

                    
                    List  newsTab = getNewsTab( year );
                    Map item = getNewsItem( newsTab, date, time );
                    
                    if( item == null ) {
                        item = new HashMap();
                        item.put( "date", date );
                        item.put( "time", time );
                        item.put( "auid", Integer.toString(uid) );
                        item.put( "amail", email );
                        newsTab.add( 0, item );
                    }

                    item.put( "aini", aini );
                    item.put( "header", header );
                    item.put( "body", body );
                    
                    saveContext( getNewsContext() );
                    setOpp( new HashMap<String,String>() ); // clean params
                    initialize( true );
                }
            }
            
            if( getOp().get("edit") != null && getOpp() != null ) {
                
                String date = (String) getOpp().get("date");
                String time = (String) getOpp().get("time");

                List newsTab = getNewsTab( date.substring(0,4) );
                Map item = getNewsItem( newsTab, date, time );
                
                if( item != null ) {
                    getOpp().put( "header", (String) item.get( "header" ) );
                    getOpp().put( "aini", (String) item.get( "aini" ) );
                    getOpp().put( "body", (String) item.get( "body" ) );
                }
            }

            if( getOp().get( "drop" ) != null ) {

                String date = (String) getOpp().get("date");
                String time = (String) getOpp().get("time");

                List newsTab = getNewsTab( date.substring(0,4) );
                Map item = getNewsItem( newsTab, date, time );

                if( newsTab != null  && item != null ) {
                    newsTab.remove( item );
                }

                saveContext( getNewsContext() );
                setOpp( new HashMap<String,String>() ); // clean params
                initialize( true );
            }

            if( getOp().get( "reset" ) != null ) {
                setOpp( new HashMap<String,String>() ); // clean params
            }
        }
	
	Map<String,Object> newsConf = newsContext.getJsonConfig();
	
	Map ymap = (Map) ((Map) newsConf.get("news") );
	int maxYear = 0;
	
	NavigableSet<Integer> ssy = new TreeSet<Integer>();
	for ( Iterator ii = ymap.keySet().iterator();
	      ii.hasNext(); ) {

	    String key = (String) ii.next();
            //log.info( "key: " + key );
	    try {
		int iyear = Integer.parseInt( key );
		if ( iyear > maxYear ) {
		    maxYear = iyear;
		}
		if ( iyear == year ) {
		    news = (List) ymap.get( key ); 
		}
		ssy.add( iyear );
	    } catch ( NumberFormatException ne ) {
		// ignore
	    }   
	}
	
	if ( ssy.size() > 0 ) {
	    years = ssy.descendingSet().toArray();            
	}
	
	if ( news == null ) {
	    if ( maxYear > 0 ) {
		news = (List<Map>) ymap.get( Integer.toString( maxYear ) );	
		year = maxYear;
	    } else {
		news = new ArrayList<Map>();
	    }
	}
        
        if( ret.equals( "nbox" ) ) {
            if ( ymap.get( Integer.toString( year ) ) != null ) {
                nbox = (List<Map>) ymap.get( Integer.toString( year ) );
            }  else {
                nbox = new ArrayList<Map>();
            }
        }
        return ret;
    }
    
    //--------------------------------------------------------------------------

       
    private List getNewsTab( String year ) {
        
        Map cnf = getNewsContext().getJsonConfig();
        Map news = (Map) cnf.get("news");
        List newsTab = (List) news.get(year);
        if ( newsTab == null ) {
            newsTab = new ArrayList();
            news.put(year, newsTab);
        }
        return newsTab;
    }

    private Map getNewsItem( List newsTab,  String date, String time ) {

        Map item = null;
        
        for( Iterator li = newsTab.iterator(); li.hasNext(); ) {
            Map ii = (Map) li.next();
            if( date.equals(ii.get("date")) && 
                time.equals(ii.get("time")) ){
                item = ii;
                break;
            }
        }
        return item;
    }
    
    //--------------------------------------------------------------------------

    private void saveContext( JsonContext context )
        throws IOException {

        String jsonConfigFile =
            (String) context.getConfig().get( "json-config" );

        String srcPath =
            getServletContext().getRealPath( jsonConfigFile );
        log.info( " srcPath=" + srcPath );

        File sf = new File( srcPath );
        PrintWriter spw = new PrintWriter( sf );
        context.writeJsonConfigDef( spw );
        spw.close();
    }

    //--------------------------------------------------------------------------

    public void validate() {
	
	/*
	
        */
    }

    //--------------------------------------------------------------------------

    public String buildMailMessage( String date, String time, 
                                    String header, String body,
                                    String email ){

        StringBuffer anno = new StringBuffer();
                        
        anno.append( "RE: " + header + "\n");
        anno.append( "--------------------------------------------------\n");
        anno.append( body + "\n");
        anno.append( "--------------------------------------------------\n");
        anno.append( "Contact: " + email + "\n");
        
        return anno.toString();  
    }    
}
