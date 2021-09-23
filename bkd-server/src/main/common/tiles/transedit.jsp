<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<table width="100%">
 <tr>
  <td align="left">
   <br/>
   <table width="66%" cellspacing="1" cellpadding="3">
    <s:if test="hasActionErrors()">
     <tr><td>  
      <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
       <span class="error">
        <s:iterator value="actionErrors">
         <span class="errorMessage"><s:property escapeHtml="false" /></span>
        </s:iterator>
       </span>
      </div>
     </td></tr>
    </s:if>
   </table>  
  </td>
 </tr>
 <tr>
  <td>
   <table width="100%" border="1">
    <s:form theme="simple" action="transedit"> 
     <s:hidden name="id" value="%{id}"/>
     <s:hidden name="trans.id" value="%{id}"/>
     <s:hidden name="trans.name" value="%{trans.name}"/>
     <tr>
      <th nowrap>TID:<s:property value="trans.id"/></th>
      
      <th nowrap>Name:<s:property value="trans.name"/></th>
      <td width="95%">&nbsp;</td> 
      <th>
        <s:submit theme="simple" name="op.del" value="REMOVE"/>
      </th>
     </tr>
     <tr>
      <td colspan="3">
       <table width="100%" border="1">
        <tr>
         <td align="right" nowrap>States</td>
         <td align="left" width="45%"> 
          From: 
          <s:select name="opp.sfrom"  headerKey="-1" headerValue="---Select From State---"
                    list="stateList" listKey="id" listValue="name" value="%{trans.fromState.id}"/>
         </td>
         <td align="left" width="45%"> 
          To:
          <s:select name="opp.sto"  headerKey="-1" headerValue="---Select To State---"
                    list="stateList" listKey="id" listValue="name" value="%{trans.toState.id}"/>
         </td>
         <th rowspan="1">
          <s:submit theme="simple" name="op.sup" value="UPDATE"/>
         </th>
        </tr>
        <tr>
         <td align="right" nowrap>Comments</td>
         <td align="left" width="95%" colspan="2"> 
          <s:textarea name="trans.comments" value="%{trans.comments}" cols="32" rows="4"/>
         </td>
         <th rowspan="1">
          <s:submit theme="simple" name="op.pup" value="UPDATE"/>
         </th>
        </tr>
       </table>
      </td>
      <td>&nbsp;</td>
     </tr> 
    </s:form>
   </table>
  </td>
 </tr>
</table>
