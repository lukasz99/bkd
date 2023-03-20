package edu.ucla.mbi.bkd;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.*;
import java.io.*;
import java.util.regex.PatternSyntaxException;

import java.util.GregorianCalendar;
import java.util.Calendar;

import edu.ucla.mbi.bkd.*;
import edu.ucla.mbi.util.struts.*;
import edu.ucla.mbi.util.data.*;
import edu.ucla.mbi.util.data.dao.*;

public class BkdNewsManager {
    
    public BkdNewsManager() {
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "NewsManager: creating news manager" );
    }
    
    public String buildMailMessage( String date, String time,
                                    String header, String body,
                                    String email ){
        
        Logger log = LogManager.getLogger( this.getClass() );
        log.info( "BkdNewsManager: buildMailMessage: " );

        StringBuffer anno = new StringBuffer();
        
        anno.append( "Subject: " + header + "\n");
        anno.append( "--------\n\n");
        anno.append( body + "\n");
        anno.append( "\n");
        anno.append( "Contact: " + email + "\n");
        
        return anno.toString();
   
    }
}
