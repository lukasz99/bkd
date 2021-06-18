<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>State Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="stateedit"/>
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
          <span class="errorMessage"><s:property default="" /></span>
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
     <s:form theme="simple" action="statemgr"> 
      <tr>
       <th colspan="2">SID</th>
       <th>Name</th>
       <th width="5%">&nbsp</th>
      </tr>
      <s:if test="stateList!=null">
       <s:iterator value="stateList" var="state" status="spos">
        <tr>
         <td align="center">
          <s:checkbox name="opp.sdel" fieldValue="%{#state.id}"/>
         </td>
         <td align="center">
           <s:property value="#state.id" />
         </td>
         <td>
           <s:property value="#state.name" />
         </td>
         <td align="center">
          <a href='statemgr?id=<s:property value="#state.id"/>'>detail</a>
         </td>
        </s:iterator>
       </tr>
      </s:if>
      <tr>
       <td colspan="2" align="center">
        <s:submit theme="simple" name="op.sldel" value="DROP" />
       </td>
       <td>
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['state.name']!=null">
          <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['dataState.name'][0]" />
            </span>
           </span>
          </div>
         </s:if>
        </s:if>
        <s:textfield theme="simple" name="dataState.name" size="48" maxlength="64"/>
       </td>
       <td align="center">
        <s:submit theme="simple" name="op.sadd" value="ADD" />
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