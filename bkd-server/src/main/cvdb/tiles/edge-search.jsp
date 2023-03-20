<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<div id="bkd-search-form">
 <s:form action="node" theme="simple">
  <table>
<!--
   <tr>
    <td>
     <s:radio name="smode" list="#{'node':'Protein/Gene','report':'Report'}"/>
    </td>
   </tr>
 -->
   <tr>
    <td colspan="2">
    <s:hidden name="smode" value="node" />
     <s:textfield id="bkdQuery"  theme="simple" name="squery" size="80" maxlength="256"/>
     <s:submit id="bkdQueryMode" theme="simple" name="rsearch" value="Search" />
     <a id="bkd-modal-help" class="bkd-modal-trig" href='page?id=help-simple-query'>Help</a>
    </td>
   </tr>
  </table>
 </s:form>
</div>
<div id="bkd-search-view"></div>
