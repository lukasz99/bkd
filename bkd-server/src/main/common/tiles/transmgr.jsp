<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Transition Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="transedit"/>
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
     <s:form theme="simple" action="transmgr"> 
      <tr>
       <th colspan="2" width="10%" >TID</th>
       <th>Name</th>
       <th width="15%">From</th>
       <th width="15%">To</th>
       <th width="5%">&nbsp</th>
      </tr>
      <s:if test="transList!=null">
       <s:iterator value="transList" var="trans" status="tpos">
        <tr>
         <td align="center">
          <s:checkbox name="opp.tdel" fieldValue="%{#trans.id}"/>
         </td>
         <td align="center">
           <s:property value="#trans.id" />
         </td>
         <td>
           <s:property value="#trans.name" />
         </td>
         <td align="center">
          <s:property value="#trans.fromState.name" />
         </td> 
         <td align="center">
           <s:property value="#trans.toState.name" />
         </td>
         <td align="center">
          <a href='transmgr?id=<s:property value="#trans.id"/>'>detail</a>
         </td>         
        </s:iterator>
       </tr>
      </s:if>
      <tr>
       <td colspan="2" align="center">
        <s:submit theme="simple" name="op.tldel" value="DROP" />
       </td>
       <td>
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['trans.name']!=null">
          <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['trans.name'][0]" />
            </span>
           </span>
          </div>
         </s:if>
        </s:if>
        <s:textfield theme="simple" name="trans.name" size="48" maxlength="64"/>
       </td>
       <td>
         <s:select name="opp.sfrom"  headerKey="-1" headerValue="---Select From State---"
                    list="stateList" listKey="id" listValue="name" />
       </td> 
       <td>
         <s:select name="opp.sto"  headerKey="-1" headerValue="---Select To State---"
                    list="stateList" listKey="id" listValue="name" />
       </td>
       <td align="center">
        <s:submit theme="simple" name="op.tadd" value="ADD" />
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