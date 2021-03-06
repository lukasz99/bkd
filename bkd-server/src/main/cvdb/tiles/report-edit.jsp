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
 </head>
 <body class="yui-skin-sam" onLoad="var nos = document.getElementById('noscript'); if ( nos !== null ) { nos.innerHTML='';}">
  <center>
  <s:if test="big">
   <t:insertTemplate template="/tiles/header.jsp" flush="true"/>
  </s:if>
  <table class="pagebody" width="100%" cellspacing="0" cellpadding="0">

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
        report !!!!!
      </td>
    </tr>
    
  </table>
  <s:if test="big">
   <t:insertTemplate template="/tiles/footer.jsp" flush="true"/>
  </s:if>
  </center>
 </body>
</html>
