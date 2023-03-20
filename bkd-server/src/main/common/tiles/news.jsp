<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<script src="jq/jquery-3.6.0.js" type="text/javascript" language="JavaScript"></script> 
<script src="js/bkd-news-jq.js" type="text/javascript"></script>

<link rel="stylesheet" type="text/css" media="screen" href = "css/tabs-no-images.css"/>
<%--
<s:if test="#session['USER_ROLE'].administrator != null" >
   <script type="text/javascript">    
    $(document).ready( function(){
      var edtnews = jqnewsedit( {edt:"<s:text name='#session.EDT'/>"} );
      edtnews.start();
    });
   </script>
</s:if>
--%>
<s:if test="hasActionErrors()">
 <table width="95%" cellspacing="0" cellpadding="0">
  <tr><td>
      <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
       <span class="error">
        <s:iterator value="actionErrors">
         <span class="errorMessage"><s:property default="" /></span>
        </s:iterator>
       </span>
      </div>
      <br/>
  </td></tr>
</table>
</s:if>
<center>
</br></br></br></br></br>
<table width="100%" cellspacing="0" cellpadding="0">
 <tr>
  <td class="page yui-skin-sam">
   <h1>CVUS Database News </h1>  
   <table id="newstabs" class="news-table">
    <tr id="newsyear" class="news-header">
<!--     <td class='news-tab-on'>2023</td> -->
<!--     <td class='news-tab-off'>2022</td> -->
    </tr>
    <tr id="newsdata" class="news-data-panel"></tr>
   </table>
  </td>
 </tr>  
</table>
</center>
<script>

  <!-- YAHOO.util.Event.addListener( window, "load", -->
  <!-- YAHOO.mbi.news.tabs.build("news"));           -->

 $(function(){ BkdNews.tabinit( '#newstabs', 'news' )});

</script>


