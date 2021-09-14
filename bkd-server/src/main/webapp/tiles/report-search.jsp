<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<div id="bkd-report-search"> 
 <h2>Search</h2>
 <s:form action="report" theme="simple">
  <table>
   <tr>
    <td>
     <s:radio name="smode" list="#{'protein':'Protein','gene':'Gene','report':'Report'}"/>
    </td>
   </tr>
   <tr>
    <td colspan="2">
     <s:textfield id="bkdQuery"  theme="simple" name="squery" size="80" maxlength="256"/>
     <s:submit id="bkdQueryMode" theme="simple" name="rsearch" value="Search" />
    </td>
   </tr>
  </table>
 </s:form>
 </div>