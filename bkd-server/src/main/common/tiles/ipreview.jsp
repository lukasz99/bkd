<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<center>
<table width="100%" cellspacing="0" cellpadding="0" class="image-preview-tbl">
 <tr>
  <td class="image-preview-th">
   <tt>&lt;img src="<s:property value="imageUrl"/>"/&gt;</tt>
  </td> 
 </tr>
 <tr>
  <td class="image-preview-td">
    <img src="<s:property value="imageUrl"/>" />
  </td>
 </tr>  
</table>
</center>


