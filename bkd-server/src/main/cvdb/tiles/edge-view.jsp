<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>CVDB: Node</title>

  <t:insertDefinition name="htmlhead"/>  
   <script src="jq/jquery-3.6.0.js" type="text/javascript" language="JavaScript"></script>

   <script src="js/bkd-config.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-links.js" type="text/javascript" language="JavaScript"></script>

   <script src="js/bkd-node-jq.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-site.js" type="text/javascript" language="JavaScript"></script>

   <script type="text/javascript">
         
     $( function(){

       $("#bkd-head-search-go").on( 'click', function (event) {           
           //BKDnodeSearch.doHeadSearch();
           var qmode = $("#bkd-head-qmode").val();
           var query = $("#bkd-head-squery").val();

           console.log("head search:" +  qmode + ":" + query );
           if( query !== undefined ){
              if(query.trim().length > 0 ){
                 var myurl = "search?qmode=" + qmode
                           + "&ret=view"  
                           + "&query=" + query.trim();  
                 window.location.href = myurl;
              }
           }     
         });
       
       $("#bkd-modal-div").hide();

     
        hhght =  $("#header").height(); 
        sbwdth = $("#bkd-sidebar").width();
     
        fpos = $("#footer").position(); 
        fhght = $("#footer").height();

        $("#bkd-sidebar").css( 'padding-top', 3 );
        $("#bkd-main").css( 'margin-top', hhght );
        $("#bkd-main").css( 'margin-left', sbwdth+10 );

        var ns   = "<s:property value='ns'/>";
        var ac   = "<s:property value='ac'/>";
        var mode = "<s:property value='mode'/>"; // set to edit if editor mode
        if( ns.length > 0 && ac.length >0 ){     // show node
           myurl ="node?ns="+ns+"&ac="+ac+"&ret=data&format=json";          
           $.ajax( { url: myurl} )
              .done( function(data, textStatus, jqXHR){                  
                 BKDnode.view( data.node,
                               "#bkd-search", "#bkd-search-view",
                               "#bkd-node-view", BKDconf["node"], mode) } );
        } else {
            // hide node view
            $( "#bkd-node-view" ).hide(); 
            $( "#bkd-sidebar" ).hide(); 
            
            $("#bkd-search-go").on( 'click', function (event) {
               console.log("search clicked");
               BKDnode.doSearch();
            });
            // show node search
            $( "#bkd-node-search" ).show();
        }
        $("#bkd-head-search-go").on( 'click', function (event) { 
           console.log("search clicked");
           BKDnode.doHeadSearch();
        });     
    
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
<s:if test="ac == null || ac.length == 0">
    <tr>
     <td colspan="3">
 <t:insertDefinition name="bkd-search"/>
     </td>
    </tr>
</s:if>
    <tr>
     <td colspan="3">
      <div id="bkd-main-name"></div>
     </td>  
    </tr>
    <tr>
     <td colspan="3">
      <div id="bkd-node-view">
       <div id="bkd-hv-field"></div>
       <div id="bkd-nv-field"></div>          
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
