<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
  <meta charset="utf-8">
  <title><s:property value="page.title"/></title>

  <t:insertDefinition name="htmlhead"/>
  
  <%-- <script src="js/modal-yui.js" type="text/javascript" language="JavaScript"></script>      --%>
  <%-- <script src="js/help-yui.js" type="text/javascript" language="JavaScript"></script>       --%>
  <%-- <script src="js/side-panel-yui.js" type="text/javascript" language="JavaScript"></script> --%>
  <script src="jq/jquery-3.6.0.js" type="text/javascript" language="JavaScript"></script>
  <script src="js/bkd-news-jq.js" type="text/javascript" language="JavaScript"></script>
  <script src="js/bkd-node-search-jq.js" type="text/javascript" language="JavaScript"></script>
  
  <script type="text/javascript">
    $( function(){
        var hhght =  $("#header").height(); 
        // $("#bkd-sidebar").css('padding-top',3);
        $(".pagebody").css('margin-top',hhght);
    
        $("#bkd-head-search-go").on( 'click', function (event) {             
              var qmode = $("#bkd-head-qmode").val();
              var query = $("#bkd-head-squery").val();

              console.log( "head search: " + qmode + ":" + query );
              if( query !== undefined ){
                 if(query.trim().length > 0 ){
                    var myurl = "search?qmode=" + qmode
                              + "&ret=view"  
                              + "&query=" + query.trim();  
                    window.location.href = myurl;
                 }
              }   
        });
    });
  </script>  
  
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
   <s:if test="source!=null">
     <tr> 
      <s:if test="page.showindex">
       <td rowspan="2" id="index-panel">
       </td>
      </s:if>
      <td width="99%" class="pagettl">
       <s:if test="page.showtitle">
        <h1><s:property value="page.title"/></h1>
       </s:if>
      </td>
      <td class="pagecom">
       <s:if test="page.showcomment"> 
        <t:insertDefinition name="pagecomments" />
       </s:if>
      </td>
      <td align="right">  
         <s:if test="#session['USER_ROLE'].administrator != null or
               #session['USER_ROLE'].editor != null">
           <s:form theme="simple" action="page">
            <s:hidden name="id" value="newpage"/>
            <s:hidden name="site" value="%{site}"/>  
            <s:submit theme="simple" name="dummy" value="NEW PAGE" />
           </s:form>
         </s:if>
      </td>
     </tr>
     <tr>
      <td colspan="3" class="page-content">
       <div style="width: 95%; padding:0 0 0 4%;">
        <s:if test="id == 'relnotes'">
         <h1>ImexCentral Release Notes</h1> 
         <t:insertTemplate template="/tiles/relnotes.jsp"/> <!-- ignore="true" -->
        </s:if>
        <s:else>
         <s:property value="source" escapeHtml="false" />
        </s:else>
       </div>         
       <br/><br/><br/><br/><br/>
      </td>
     </tr> 
   </s:if>

  </table>
  <s:if test="big">
   <t:insertTemplate template="/tiles/footer.jsp" flush="true">
    <t:putAttribute name="edit" value="/tiles/pageedit-yui.jsp" />
   </t:insertTemplate>
  </s:if>
  </center>

  <s:if test="page.showindex">
   <script>
     YAHOO.util.Event.addListener( window, "load",
       YAHOO.mbi.view.panel.index("<s:property value="page.urlindex" escapeHtml="false" />", 
                                   document.getElementById("index-panel")));     
   </script>
  </s:if>
 </body>
</html>
