<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>CVDB: Node Search</title>

<t:insertDefinition name="htmlhead"/>  
   <script src="js/bkd-node-search-jq.js" type="text/javascript" language="JavaScript"></script>   
   <script type="text/javascript">
     console.log("node-search-view: inline");         
     $( function(){
        console.log("on loaded page...");
        
        $("#bkd-modal-div").hide();
     
        hhght =  $("#header").height(); 
        hwdth =  $("#header").width(); 

        fpos = $("#footer").position(); 
        fhght = $("#footer").height();
          
        $("#bkd-sidebar").css('padding-top',3);
        $("#bkd-main").css('margin-top',hhght);

        var qmode = "<s:property value='qmode'/>";
        var query = "<s:property value='query'/>";
     
        var total = "<s:property value='rstats.total'/>";

        $("#bkd-qmode").val(qmode);
        $("#bkd-squery").val(query);
     
        $( "#bkd-sidebar" ).hide(); 
        $( "#bkd-search-form" ).show();
     
        $("#bkd-head-search-go").on( 'click',
           function (event) {              
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

        $("#bkd-search-go").on( 'click',
           function (event) {              
              var qmode = $("#bkd-qmode").val();
              var query = $("#bkd-squery").val();

              console.log( "body search: " + qmode + ":" + query );
              if( query !== undefined ){
                 if(query.trim().length > 0 ){
                    var myurl = "search?qmode=node"
                              + "&ret=view"  
                              + "&query=" + query.trim();                   
                    window.location.href = myurl;
                 }
              }
           });
     
        BKDmodal.init( "#bkd-modal-div",
                       "#bkd-modal-help",
                       "page?id=help-simple-query&ret=body");
        BKDnodeSearch.doSearch( qmode, query );
    });
  </script>
  <style>
        .jbrowse {
            height: 300px;
            width: 600px;
            padding: 0;
            margin-left: 5em;
            border: 1px solid #ccc;
        }
  </style>  
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
       <div id="bkd-main-name"></div>
     </td>  
    </tr>
    <tr>
     <td colspan="3">
      <t:insertDefinition name="bkd-search"/>
     </td>
    </tr>
    <tr>
     <td colspan="3" align='center'>
      <div id="bkd-node-spinner" style="display: none;">
       <img src="img/spinner.gif" class="bkd-spinner">
      </div>
     </td>
    </tr>    
   </table>
  </div>
  <div id="modals">
    <div id="bkd-modal-div" class='bkd-modal-anchor'>
  </div>    
  </div>
  <s:if test="big">
   <t:insertTemplate template="/tiles/footer.jsp" flush="true"/>
  </s:if>
  </center>
  
 </body>
</html>
