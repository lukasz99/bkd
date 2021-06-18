<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Journal Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="journaledit"/>
 <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
 <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
 <br/><br/><br/><br/><br/><br/><br/><br/>
</s:if>
<s:else>
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
      <tr>
       <th colspan="2  width="5%"">JID</th>
       <th width="5%" nowrap>NLMID</th>
       <th width="85%" nowrap>Title</th>
       <th idth="5%" nowrap>&nbsp</th>
      </tr>
      <s:if test="journalList!=null">
       <s:iterator value="journalList" var="journal" status="jpos">
        <tr>
         <td align="center">
          <s:checkbox name="opp.del" fieldValue="%{#journal.id}"/>
         </td>
         <td align="center">
           <s:property value="#journal.id" />
         </td>
         <td>
           <s:property value="#journal.nlmid" />
         </td>
         <td>
           <s:property value="#journal.title" />
         </td>
         <td align="center">
          <a href='journalmgr?id=<s:property value="#journal.id"/>'>detail</a>
         </td>
        </s:iterator>
       </tr>
      </s:if>
      <tr>
       <td colspan="2" align="center">
        <s:submit theme="simple" name="op.ldel" value="DROP" />
       </td>
       <td colspan="2">
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['role.name']!=null">
          <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['role.name'][0]" />
            </span>
           </span>
          </div>
         </s:if>
        </s:if>
        <b>NLMID:</b> <s:textfield theme="simple" name="opp.jadd" size="48" maxlength="64"/>
       </td>
       <td align="center">
        <s:submit theme="simple" name="op.jadd" value="ADD" />
       </td>
      </tr>
     </s:form>
    </table>
   </td>
  </tr>
 </table>
 <br/>
 <br/>
</s:else>