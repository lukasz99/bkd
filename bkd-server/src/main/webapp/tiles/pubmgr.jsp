<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Publication Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="pubedit"/>
 <br/><br/>
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
     <s:form theme="simple" action="pubmgr"> 
      <tr>
       <th colspan="2" rowspan="2">PID</th>
       <th colspan="2" width="85%" rowspan="2">Publication</th>
       <th rowspan="2">PMID</th>
       <th rowspan="2">ImexId</th>
       <th rowspan="2">Status</th>
       <th nowrap colspan="2">Submission</th>
       <th rowspan="2">&nbsp</th>
      </tr>
      <tr>
       <th nowrap>Date</th>
       <th nowrap>Owner</th>
      </tr>
      <s:if test="publicationList!=null">
       <s:iterator value="publicationList" var="pub" status="ppos">
        <tr>
         <td align="center" rowspan="2">
          <s:checkbox name="opp.del" fieldValue="%{#pub.id}"/>
         </td>
         <td align="center" rowspan="2">
           <s:property value="#pub.id" />
         </td>
         <th align="right" width="5%">Author(s)</th>
         <td>
          <s:property value="#pub.author" />
         </td>
         <td align="center" rowspan="2">
          <s:property value="#pub.pmid" />
         </td>
         <td rowspan="2">
          <s:property value="#pub.imex" />
         </td>
         <td align="center" rowspan="2">
           <s:property value="#pub.state.name" />
         </td>
         <td align="center" rowspan="2">
          <s:property value="#pub.createDateString"/>
          <br/>
          <s:property value="#pub.createTimeString"/>
         </td>
         <td align="center" rowspan="2">
           <s:property value="#pub.owner.login" />
         </td>
         <td align="center" rowspan="2">
          <a href='pubmgr?id=<s:property value="#pub.id"/>'>details</a>
         </td>
        </tr>
        <tr>
         <th width="5%">Title</th>
         <td>
          <s:property value="#pub.title"/>
         </td>
        </tr>
       </s:iterator>
      </s:if>
      <tr>
       <td colspan="2" align="center">
        <s:submit theme="simple" name="op.ldel" value="DROP" />
       </td>
       <td colspan="7">
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
        <b>PMID:</b> <s:textfield theme="simple" name="pub.pmid" size="48" maxlength="64"/>
       </td>
       <td colspan="1" align="center">
        <s:submit theme="simple" name="op.eadd" value="ADD" />
       </td>
      </tr>
     </s:form>
    </table>
   </td>
  </tr>
 </table>
</s:else>
