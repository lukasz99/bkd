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
    <s:form theme="simple" action="journalmgr"> 
     <s:hidden name="id" value="%{id}"/>
     <s:hidden name="journal.id" value="%{id}"/>
     <tr>
      <th nowrap>JID:<s:property value="journal.id"/></th>
      <th align="left"  width="95%" nowrap><s:property value="journal.title"/></th> 
      <th>
        <s:submit theme="simple" name="op.del" value="DELETE" disabled="true"/>
      </th>
     </tr>
     <tr>
      <td colspan="2">
       <table width="100%" border="1">
        <tr>
         <td width="15%" align="right" nowrap>Title</td>
         <td align="left" width="95%"> 
          <s:textfield theme="simple" name="journal.title" size="64" maxlength="128"/>
         </td>
         <th rowspan="5">
          <s:submit theme="simple" name="op.jpup" value="UPDATE"/>
         </th>
        </tr>
        <tr>
         <td width="15%" align="right" nowrap>NLMID</td>
         <td align="left" width="95%">
          <s:textfield theme="simple" name="journal.nlmid" size="32" maxlength="64"/>
         </td>
        </tr>
        <tr>
         <td width="15%" align="right" nowrap>ISSN</td>
         <td align="left" width="95%">
          <s:textfield theme="simple" name="journal.issn" size="32" maxlength="64"/>
         </td>
        </tr>
        <tr>
         <td width="15%" align="right" nowrap>Journal Site</td>
         <td align="left" width="95%">
          <s:textfield theme="simple" name="journal.websiteUrl" size="32" maxlength="64"/>
         </td>
        </tr>
        <tr>
         <td width="15%" align="right" nowrap>Comments</td>
         <td align="left" width="95%"> 
          <s:textarea name="journal.comments" value="%{journal.comments}" cols="64" rows="4"/>
         </td>
        </tr>

        <tr>
         <th colspan="3" nowrap>Access Management</td>
        </tr>
        <tr>
         <th width="15%" align="right" nowrap>Owner</th>
         <td align="left" width="95%">
          <s:textfield theme="simple" name="journal.owner.login" size="32" maxlength="64"/>
         </td>
         <th rowspan="1">
          <s:submit theme="simple" name="op.oup" value="UPDATE"/>
         </th>
        </tr>
        <tr>
         <th rowspan="2" align="right" nowrap>Admin Users</th>
         <td colspan="1">
          <s:iterator value="journal.adminUsers" var="u" status="upos">
           <s:checkbox name="opp.jaudel" fieldValue="%{#u.id}"/>
           <s:property value="#u.login"/>
          </s:iterator>
         </td>
        <th>
          <s:submit theme="simple" name="op.jaudel" value="DROP"/>
         </th>
        </tr>
        <tr>
         <td colspan="1">
          <s:textfield theme="simple" name="opp.jauadd" size="32" maxlength="64"/>
         </td>
         <th>
          <s:submit theme="simple" name="op.jauadd" value="ADD"/>
         </th>
        </tr>

        <tr>
         <th rowspan="2" align="right" nowrap>Admin Groups</th>
         <td colspan="1">
          <s:iterator value="journal.adminGroups" var="g" status="gpos">
           <s:checkbox name="opp.jagdel" fieldValue="%{#g.id}"/>
           <s:property value="#g.label"/>
          </s:iterator>
         </td>
        <th>
          <s:submit theme="simple" name="op.jagdel" value="DROP"/>
         </th>
        </tr>
        <tr>
         <td colspan="1">
           <s:select name="opp.jagadd"  headerKey="-1" headerValue="---Select Group---"
                     list="groupAll" listKey="id" listValue="label" />
         </td>
         <th>
          <s:submit theme="simple" name="op.jagadd" value="ADD"/>
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
