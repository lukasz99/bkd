<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<div id="bkd-search-form">
 <table>
  <tr>
   <td colspan="2">
    <s:textfield id="bkd-squery" theme="simple" name="squery" size="80" maxlength="256"/>
    <s:submit id="bkd-search-go" theme="simple" name="search" value="Search" />
    <a id="bkd-modal-help" class="bkd-modal-trig" href='page?id=help-simple-query'>Help</a>
   </td>
  </tr>
 </table>
</div>
<div id="bkd-search-view"></div>

