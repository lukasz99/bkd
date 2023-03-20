package edu.ucla.mbi.bkd.servlet;

import java.io.*;
import java.util.regex.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class RoiServlet extends HttpServlet{
    
    public void init() throws ServletException {
        // Do required initialization
        
   }

    public void doGet( HttpServletRequest request,
                       HttpServletResponse response)
        throws ServletException, IOException {

        String pos = request.getParameter( "pos" );
        
        response.setContentType("text/plain");
        
        PrintWriter out = response.getWriter();
        //out.println(pos);

        // expected: NC_000001.10:181452685:3;NC_000001.10:181452685:2;NC_000001.10:181452685:1;
               
        String pattern = "NC_0*(.*)\\.\\d+:(.*):(.*)";
        Pattern r = Pattern.compile( pattern );
        
        // split on ';'

        String[] posArray = pos.split( ";" );

        for( String cpos : posArray ){

            // apply pattern            

            Matcher m = r.matcher(cpos);
            if( m.find() ){
                System.out.println("Found value: " + m.group(1) );
                System.out.println("Found value: " + m.group(2) );
                System.out.println("Found value: " + m.group(3) );
                String chr = "Chr" + m.group(1);
                if( m.group(1).equals("23") ){  
                    chr = "ChrX";
                }
                if( m.group(1).equals("24") ){  
                    chr = "ChrY";
                }
                long lpos  = Long.parseLong(m.group(2));
                long lspan = Long.parseLong(m.group(3));

                if( lspan >0 ){                    
                    String line =
                        chr + "\t" +
                        Long.toString( lpos ) +"\t" +
                        Long.toString( lpos + lspan );
                    out.println(line);
                } else {
                    String line =
                        chr + "\t" +
                        Long.toString( lpos + lspan ) +"\t" +
                        Long.toString( lpos );
                    out.println(line); 
                }
            }else {
                System.out.println("NO MATCH");
                out.println("chr1\t1\t2");
            }
        }   
    }
    
    public void destroy() {
        // do nothing.
    }
  
}
