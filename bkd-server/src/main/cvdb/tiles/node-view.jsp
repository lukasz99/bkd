<!doctype html>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>CVDB: Node</title>

<t:insertDefinition name="htmlhead"/>  
<!-- <script src="js/d3.min.js" type="text/javascript" language="JavaScript"></script>  -->
<!-- <script src="https://d3js.org/d3.v4.min.js" type="text/javascript" language="JavaScript"></script> -->
   
   <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
   <script src="https://cdn.jsdelivr.net/npm/d3-collection@1"></script>   
<!--
<script src="https://cdn.jsdelivr.net/npm/d3-color@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-dispatch@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-ease@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-interpolate@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-selection@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-timer@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-transition@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-drag@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-zoom@3"></script>
-->

   <script src="js/g3-lollipop.js" type="text/javascript" language="JavaScript"></script> 
   <script src="js/feature-viewer.bundle.js" type="text/javascript" language="JavaScript"></script> 
   <script src="js/ngl.js"></script> 
   <script src="js/igv.js" type="text/javascript" charset="utf-8"></script>
   
   <script src="js/bkd-d3msa.js"></script>  
   <script src="js/bkd-ngl.js"></script>  

   <script src="js/bkd-node-search-jq.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-node-view-jq.js" type="text/javascript" language="JavaScript"></script>
   <script src="js/bkd-node-features-jq.js" type="text/javascript" language="JavaScript"></script>
   
   <script type="text/javascript">
     console.log("node-view: inline");         
     $( function(){
       console.log("node-view: on load");

       $("#bkd-search-go").on( 'click',
          function (event) {                           
              var query = $("#bkd-squery").val();
              console.log( "body search: " + query );
              if( query !== undefined ){
                 if(query.trim().length > 0 ){
                    var myurl = "node?qmode=node"  
                             + "&query=" + query.trim();                   
                    window.location.href = myurl;
                 }
              }
           });
     
       $("#bkd-head-search-go").on( 'click', function (event) {            
           var qmode = "node";
           var query = $("#bkd-head-squery").val();

           if( query !== undefined ){
              if(query.trim().length > 0 ){
                 var myurl = "search?qmode=" + qmode
                           + "&ret=view"  
                           + "&query=" + query.trim();
                 window.location.href = myurl;
              }
           }     
         });
     

       //alert("!!!");
     
       $("#bkd-modal-div").hide();
     
        hhght =  $("#header").height(); 
        hwdth =  $("#header").width(); 

        sbwdth = $("#bkd-sidebar").width();
     
        fpos = $("#footer").position(); 
        fhght = $("#footer").height();
          
        $("#bkd-sidebar").css('padding-top',3);
        $("#bkd-main").css('margin-top',hhght);
        $("#bkd-main").css('margin-left',sbwdth+10);
     
        var ns   = "<s:property value='ns'/>";
        var ac   = "<s:property value='ac'/>";
        var mode = "<s:property value='mode'/>"; // set to edit if editor mode

         
     

     
        if( ns.length > 0 && ac.length >0 ){     // show node

            BKDnodeView.init( ns, ac,
                               "#bkd-node-search", "#bkd-search-view",
                               "#bkd-node-view", BKDconf["node"], mode );
     
        } else {
            // hide node view
            $( "#bkd-node-view" ).hide(); 
            $( "#bkd-sidebar" ).hide(); 
            
            //$("#bkd-search-go").on( 'click', function (event) {
            //   console.log("search clicked");
            //   BKDnodeSearch.doSearch();
            //});
            // show node search
            //$("#bkd-search-form").show();
        }
             
        BKDmodal.init("#bkd-modal-div","#bkd-modal-help","page?id=help-simple-query&ret=body");
        console.log("node-view: inline: DONE");    
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
<s:if test="ac == null || ac.length == 0">
    <tr>
     <td colspan="3">
       <!--  insertDefinition name="node-search"  -->
       <t:insertTemplate template="/tiles/node-search.jsp" flush="true"/>
     </td>
    </tr>
</s:if>    
    <tr>
     <td colspan="3">
      <div id="bkd-main-name"></div>
     </td>  
    </tr>
    <tr>
     <td colspan="3" align='center'>
       <div id="bkd-node-spinner" style="display: none;">
       <img src="img/spinner.gif" class="bkd-spinner">
      </div>
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
