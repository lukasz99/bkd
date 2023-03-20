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

 <script type="text/javascript">
   $( function(){
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

