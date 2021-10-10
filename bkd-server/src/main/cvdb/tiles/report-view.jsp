<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>Report</title>

  <t:insertDefinition name="htmlhead"/>  
   <script src="jq/jquery-3.6.0.js" type="text/javascript" language="JavaScript"></script>

   <script src="js/bkd-config.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-links.js" type="text/javascript" language="JavaScript"></script>
   <!--script src="js/sequence-viewer.bundle.js" type="text/javascript" language="JavaScript"></script-->
   
   <script src="js/bkd-report-jq.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-site.js" type="text/javascript" language="JavaScript"></script>

   <script type="text/javascript">
         
    $( function(){
        var ns   = "<s:property value='ns'/>";
        var ac   = "<s:property value='ac'/>";
        var op   = "<s:property value='op'/>";
        var mode = "<s:property value='mode'/>"; // set to edit if editor mode
        if( ns.length > 0 && ac.length >0 ){     // show report
          myurl ="report?ns="+ns+"&ac="+ac+"&ret=data&format=json";
          if( op.length> 0){
           myurl += "&op=" + op;
          }
          $.ajax( { url: myurl} )
             .done( function(data, textStatus, jqXHR){                 
                       BKDrep.view( data.record,
                                    "#bkd-report-search",
                                    "#bkd-report-target",
                                    "#bkd-report-value" , mode) } );
                  
        } else {                               // show empty form
           BKDrep.view( null, "#bkd-report-search",
                              "#bkd-report-target",
                              "#bkd-report-value", "edit");
        }
    
       });
  </script>
  
 </head>
 <body class="yui-skin-sam" onLoad="var nos = document.getElementById('noscript'); if ( nos !== null ) { nos.innerHTML='';}">
  <center>
  <s:if test="big">
   <t:insertTemplate template="/tiles/header.jsp" flush="true"/>
  </s:if>
  <table class="pagebody" width="98%" cellspacing="0" cellpadding="0" border="0" >

    <s:if test="hasActionErrors()">
    <tr>
     <td colspan="3">
      <div  class="upage" id="errorDiv">
       <span class="pgerror">
        <s:iterator value="actionErrors">
         <span class="errorMessage"><s:property escapeHtml="false" /></span>
        </s:iterator>
       </span>
      </div>
      <br/>
     </td>
    </tr>
   </s:if>
    <tr>
      <td colspan="3">
        <br/><br/><br/><br/><br/><br/><br/>
        <h1>Report</h1>
        <br/>
    </tr>

<s:if test="ac == null || ac.length == 0">
    <tr>
      <td colspan="3">
 <t:insertDefinition name="report-search"/>
      </td>
    </tr>
</s:if>
    <tr>
      <td colspan="3">
        <div id="bkd-report-target"></div> 
      </td>
    </tr>    
    <tr>
      <td colspan="3">
        <div id="bkd-report-value"></div>        
      </td>
    </tr>    
  </table>
  <s:if test="big">
   <t:insertTemplate template="/tiles/footer.jsp" flush="true"/>
  </s:if>
  </center>
  
 </body>
</html>
