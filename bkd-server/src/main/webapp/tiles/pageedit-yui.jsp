<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<script src="js/accordion-yui.js" type="text/javascript"></script>
<script src="js/image-edit-yui.js" type="text/javascript"></script>
<tr>
 <td colspan="2">
  <dl id="acc-top" class="accordion">
   <dt id="acc-top-tab">Edit Page</dt>
   <dd class="close">
    <div class="bd">
     <dl class="accordion">
      <dt class="acc-sub-tab" id="edit-att">Edit Page Attributes</dt>
      <dd class="open">
       <div class="bd">
        <br/>
        <center> 
         <s:form theme="simple" action="edit">
          <s:hidden name="mst" value="%{mst}"/>
          <s:hidden name="pageid" value="%{id}"/>
          <s:hidden name="site" value="%{site}"/>
          <s:hidden name="skn" value="%{skn}"/>
          <table cellpadding="3" width="50%">
           <tr>
            <td nowrap>Page Id</td>
            <td colspan="10">
             <s:textfield size="86" value="%{id}" name="newid"/>
            </td>
           </tr>
           <tr>
            <td>&nbsp;</td>
            <td width="15%" align="right" valign="middle" nowrap>Show Title</td>
            <td align="left" valign="middle" nowrap>
             <s:checkbox value="%{page.showtitle}" name="page.showtitle"/>
            </td>
            <td width="5%" valign="middle" nowrap>||</td> 
            <td width="15%" align="right" valign="middle" nowrap>Show Comments</td>
            <td align="left" valign="middle" nowrap>
             <s:checkbox value="%{page.showcomment}" name="page.showcomment"/>
            </td>

            <td width="5%" valign="middle" nowrap>||</td>
            <td width="15%" align="right" valign="middle" nowrap>Show Index</td>
            <td align="left" valign="middle" nowrap>
             <s:checkbox value="%{page.showindex}" name="page.showindex"/>
            </td>
            <td nowrap>Index URL</td>
            <td>
             <s:textfield size="24" value="%{page.urlindex}" name="page.urlindex"/>
            </td>

           </tr>
           <tr>
            <td nowrap>Page Source</td>
            <td colspan="10">
             <s:textfield size="86" value="%{page.viewpath}" name="page.viewpath"/>
            </td>
           </tr>
           <tr>
            <td nowrap>Page Format</td>
            <td colspan="10">
             <s:textfield size="86" value="%{page.viewtype}" name="page.viewtype" disabled="true"/>
            </td>
           </tr>
           <tr>
            <td nowrap>Page Title</td>
            <td colspan="10">
             <s:textfield size="86" value="%{page.title}" name="page.title" />
            </td>
           </tr>
           <tr>
            <td nowrap>Menu Selection</td>
            <td colspan="10">
             <s:textfield size="86"  value="%{mst}" name="page.menusel"/>
            </td>
           </tr>
           <tr>
            <td colspan="11">
             <table width="100%" cellpadding="3">
              <tr>     
               <td align="left">
                <s:submit theme="simple" name="opr.pageAttStore" value="STORE" />
               </td> 
               <td align="right">
                <s:submit theme="simple" name="opr.pageAttReset" value="RESET" />
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
         </s:form>
        </center>  
       </div>
      </dd>
      <dt class="acc-sub-tab" id="edit-src">Edit Page Source</dt>
      <dd class="open"> 
       <div class="bd">
        <br/>
        <center> 
         <s:form theme="simple" action="edit">
          <s:hidden name="mst" value="%{mst}"/>
          <s:hidden name="pageid" value="%{id}"/>
          <s:hidden name="site" value="%{site}"/>
          <s:hidden name="skn" value="%{skn}"/>
          <table cellpadding="3"> 
           <tr>
            <td align="center">
             <s:textarea theme="simple" name="source" value="%{source}" cols="110" rows="12"/>
            </td>
           </tr> 
           <tr>
            <td>
             <table width="100%" cellpadding="3">
              <tr>     
                <td align="left">
                <s:submit theme="simple" name="opr.pageSrcStore" value="STORE" />
               </td> 
               <td align="center">
                <s:submit theme="simple" name="opr.pageSrcPrev" value="PREVIEW" disabled="true"/>
               </td> 
               <td align="right">
                <s:submit theme="simple" name="opr.pageSrcReset" value="RESET" />
               </td>
              </tr>
             </table>
             </td>
           </tr>
          </table>
         </s:form>
        </center> 
       </div>
      </dd>
      <dt class="acc-sub-tab" id="edit-src">Edit Page Images</dt>
      <dd class="open" align="center">
       <div class="bd" width="100%">
        <center>
         <s:form action="image" theme="simple" method="post" enctype="multipart/form-data">
          <s:hidden name="mst" value="%{mst}"/>
          <s:hidden name="pageid" value="%{id}"/>
          <s:hidden name="site" value="%{site}"/>
          <s:hidden name="skn" value="%{skn}"/>
          <table width="100%" border="1" class="img-lst-tbl">
            <tr>
             <td class="img-lst-tbl-td">
              <table width="100%">
               <tr>
                <td align="right" width="34%" nowrap>Image ID <s:textfield size="16" value="" name="opp.name"/></td>
<%--      
                <td align="right" width="10%" nowrap>|| Portal <s:checkbox name="opp.portal" disabled="true"/> |</td>
                <td align="right" width="5%" nowrap>| Skin <s:checkbox name="opp.skin"  disabled="true"/>||</td>
--%>
                <td align="right" width="30%" nowrap>File <s:file name="upload"/></td>
                <td align="left" width="20%"><s:submit theme="simple" name="op.upload" value="Upload" /></td>
               </tr>
              </table>  
             </td>
            </tr>
            <tr>
             <td class="img-lst-tbl-bd">
              <div id="image-table"></div>
             </td>
            </tr> 
          </table>
         </s:form>
        </center>         
       </div>
      </dd>
     </dl>
    </div>
   </dd>    
  </dl>
 </td>
</tr> 

<script type="text/javascript">
  var ip = function() {
    YAHOO.mbi.imgedit.init( 
        "<s:property value='site' escapeHtml='false'/>",
        "<s:property value='skn' escapeHtml='false'/>",
        document.getElementById( "image-table" ) );
    YAHOO.mbi.accordion.init();
  }
  YAHOO.util.Event.on(window,"load", ip);
</script>
