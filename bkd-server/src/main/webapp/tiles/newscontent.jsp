<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<table cellpadding="5" width="100%">
 <s:iterator value="news" var="item">
  <tr>
   <td align="left">
    <s:form theme="simple" action="newsedit">
     <table cellpadding="5" width="100%">
      <tr>
       <td>
        <table cellpadding="5" width="100%">
         <tr>
          <td Align="left" CLASS="newstitle" width="5%">
           <s:property value="#item.date"/>
          </td>
          <td CLASS="newstitle">
           <s:property value="#item.header" default=""/>
          </td> 
          <td CLASS="newsauth">
           (Added by <i><A HREF="mailto:<s:property value='amail'/>"><s:property value='aini'/></A></i> )
          </td>
          <s:if test="#session['USER_ROLE'].administrator != null or  
                      #session['USER_ROLE'].editor != null" >
           <td width="1%" nowrap>
            <s:hidden name="opp.date" value="%{#item.date}"/> 
            <s:hidden name="opp.time" value="%{#item.time}"/> 
            <s:submit theme="simple" name="op.edit" value="EDIT" />
            <s:submit theme="simple" name="op.drop" value="DROP" />       
           </td>
          </s:if>
         </tr>
        </table>
       </td>
      </tr>
      <tr>
       <td>
        <s:property escapeHtml="false" value="#item.body" default=""/>
       </td>
      </tr>
     </table>
    </s:form>
   </td>
  </tr>
 </s:iterator>
</table>
