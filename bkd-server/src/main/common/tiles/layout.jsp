<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
 <meta charset="utf-8" />
 <title>
  <t:getAsString name="title"/>
 </title>
 <t:insertDefinition name="htmlhead"/>
 </head>
 <body class="yui-skin-sam">
 <!--[if IE]>
 <iframe id="yui-history-iframe" src="img/imex_central_logo_small.png"></iframe>
 <![endif]-->
 <input id="yui-history-field" type="hidden">
  <div id="page">
   <t:insertDefinition name="header"/>
   <table class='center' width="95%" cellspacing="0" cellpadding="0">
    <tr>
     <td id="content">
       <t:insertAttribute name="body" />
     </td>
    </tr>
   </table>
   <t:insertAttribute name="footer" />
  </div>
 </body>
</html>

