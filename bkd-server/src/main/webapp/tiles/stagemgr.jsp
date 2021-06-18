<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>State Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="stateedit"/>
</s:if>
<s:else>

<!--  Navigation  -->
 <div id="mgr-tabs" class="main-width">
 <ul class="yui-nav"> 
       <li><a href="#tab1"><em>Add Stage</em></a></li> 
       <li class="selected"><a href="#tab2"><em>Stages</em></a></li> 
 </ul>   
 <div class="yui-content">
     
<!--  First Tab  -->
  <div id="tab1">
   <s:form theme="simple" action="statemgr" id="mgr-form" cssClass="align-label"> 
   <fieldset>
   <legend><h2>Add Stage</h2></legend>
    <ul>
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['user.login']!=null">
          <li id="errorDiv" >
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['user.login'][0]" />
            </span>
           </span>
          </li>
         </s:if>
        </s:if>
        <li>
         <label for="mgr-form_user_login"><strong>Login Name</strong> </label> 
        <s:hidden theme="simple" name="op" value="" />
        <s:textfield theme="simple" name="user.login" size="18" maxlength="32"/> 
       </li>
       
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['user.firstName']!=null">
          <li id="errorDiv" >
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['user.firstName'][0]" />
            </span>
           </span>
          </li>
         </s:if>
        </s:if>
        <li>
         <label for="mgr-form_user_firstName"><strong>First Name</strong> </label>  
         <s:textfield theme="simple" name="user.firstName" size="19" maxlength="64"/>
        </li>
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['user.lastName']!=null">
          <li id="errorDiv" >
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['user.lastName'][0]" />
            </span>
           </span>
          </li>
         </s:if>
        </s:if>
        <li>
         <label for="mgr-form_user_lastName"><strong>Last Name</strong> </label> 
         <s:textfield theme="simple" name="user.lastName" size="19" maxlength="64"/>
       </li>
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['user.email']!=null">
          <li id="errorDiv" >
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['user.email'][0]" />
            </span>
           </span>
          </li>
         </s:if>
        </s:if>
        <li>
         <label for="mgr-form_user_email"><strong>Email</strong> </label>
         <s:textfield theme="simple" name="user.email" size="25" maxlength="64"/>
        </li>
       <li>
        <s:submit theme="simple" name="op.add" value="Add" />
       </li>
     </ul>
     </s:form>
     </fieldset>
    </div>
    
<!--  Second Tab  -->

    <div id="tab2">
     <div id="statemgr-table"></div>
    </div>
    <script type="text/javascript">
 
        var columnDefinitions = [
            {key:"id", label:"Id",  sortable:true, resizeable:true},
            {key:"name",label:"Name", sortable:true, resizeable:true},
            {key:"desc",label:"Description", sortable:false, resizeable:true},
            {key:"dets", sortable:false, resizeable:true, formatter:"statDetails"}];
        
        var dataSourceLink = "statemgr?op.view=state";
  
        var datasourceSchema = { 
            resultsList: "stateList", 
            fields: ["id", "name", "desc", "dets"]
        }; 
        var container = "statemgr-table";
        YAHOO.imex.statusmgr.init(columnDefinitions, dataSourceLink, datasourceSchema, container);
        YAHOO.imex.statusmgr.tabView = new YAHOO.widget.TabView("mgr-tabs");
  
    </script>
   </div>
  </div>
</s:else>



<!--

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

-->