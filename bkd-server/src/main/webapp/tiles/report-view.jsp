<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>Report</title>

  <t:insertDefinition name="htmlhead"/>  
  <script src="js/modal-yui.js" type="text/javascript" language="JavaScript"></script>
  <%-- <script src="js/help-yui.js" type="text/javascript" language="JavaScript"></script> --%>
  <script src="jq/jquery-3.6.0.js" type="text/javascript" language="JavaScript"></script>
 
  <script type="text/javascript">
    $( function(){
           alert("loaded!!!");
           $.ajax({url:"cvdbdev0/report?ns=cvdb&ac=CVDB-2R"}).done(function(res){alert(res)});
           alert("completed");  
      });
  </script>

  
 </head>
 <body class="yui-skin-sam" onLoad="var nos = document.getElementById('noscript'); if ( nos !== null ) { nos.innerHTML='';}">
  <center>
  <s:if test="big">
   <t:insertTemplate template="/tiles/header.jsp" flush="true"/>
  </s:if>
  <table class="pagebody" width="98%" cellspacing="0" cellpadding="0" border="1">

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
        <h1>Phenotype Report</h1>
        <br/><br/><br/><br/>
      </td>
    </tr>
  </table>

  <div id="followme">follow me..</div>
  <s:if test="big">
   <t:insertTemplate template="/tiles/footer.jsp" flush="true"/>
  </s:if>
  </center>
 </body>
</html>
