<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>Node</title>

  <t:insertDefinition name="htmlhead"/>  
   <%--<script src="js/modal-yui.js" type="text/javascript" language="JavaScript"></script> --%>
   <%-- <script src="js/help-yui.js" type="text/javascript" language="JavaScript"></script> --%>
   <script src="jq/jquery-3.6.0.js" type="text/javascript" language="JavaScript"></script>

   <script src="js/bkd-config.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-links.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-node-jq.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/sequence-viewer.bundle.js" type="text/javascript" language="JavaScript"></script>

   <script type="text/javascript">
         
    $( function(){
        var ns   = "<s:property value='ns'/>";
        var ac   = "<s:property value='ac'/>";
        var mode = "<s:property value='mode'/>"; // set to edit if editor mode
        if( ns.length > 0 && ac.length >0 ){     // show node
           myurl ="node?ns="+ns+"&ac="+ac+"&ret=data&format=json";          
           $.ajax( { url: myurl} )
             .done( function(data, textStatus, jqXHR){
                BKDnode.view( data.node,
                              "#bkd-node-search", "#bkd-node-view",
                              BKDconf["node"],
                              mode) } );
                  
        }
    
       });
  </script>
  
 </head>
 <body class="yui-skin-sam" onLoad="var nos = document.getElementById('noscript'); if ( nos !== null ) { nos.innerHTML='';}">
  <center>
  <s:if test="big">
   <t:insertTemplate template="/tiles/header.jsp" flush="true"/>
  </s:if>
 
  <div id="bkd-sidebar"></div>  
  <div id="bkd-main">    
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
           <h1 id="bkd-main-name"></h1>           
       </tr>

   <s:if test="ac == null || ac.length == 0">
       <tr>
         <td colspan="3">
    <t:insertDefinition name="node-search"/>
         </td>
       </tr>
   </s:if>
       <tr>
         <td colspan="3">
           <div id="bkd-node-view">
              <div id="bkd-hv-field"></div>
              <div id="bkd-nv-field"></div>
              <div id="bkd-fv-field"></div>             
           </div> 
         </td>
       </tr>    
     </table>
  </div>

  <s:if test="big">
   <t:insertTemplate template="/tiles/footer.jsp" flush="true"/>
  </s:if>
  </center>
  
 </body>
</html>
