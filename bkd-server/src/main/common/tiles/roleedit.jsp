<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<s:if test="hasActionErrors()">
 <p>  
  <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
   <span class="error">
    <s:iterator value="actionErrors">
     <span class="errorMessage"><s:property escapeHtml="false" /></span>
    </s:iterator>
   </span>
  </div>
 </p>
</s:if>

<div id="mgr-tabs" class="main-width">

   <div class="pub-edit-head">
    <h2>Role</h2>
   <p>
     <label for="roleedit_role_id"><strong>RID:</strong></label>
     <s:property value="role.id"/>
    </p>
    <p>
     <label for="roleedit_role_name"><strong>Name:</strong></label>
     <s:property value="role.name"/>
    </p>
  </div>
  
 <ul class="yui-nav"> 
  <li class="selected"><a href="#tab1"><em>Role Information</em></a></li> 
 </ul>   
<div class="yui-content">

 <div id="tab1">
  <s:form theme="simple" action="roleedit" cssClass="align-label">
   <s:hidden name="id" value="%{id}"/>
   <s:hidden name="role.id" value="%{id}"/>
   <s:hidden name="role.name" value="%{role.name}"/>
  <fieldset>
   <legend><h3>Comments</h3></legend>
   <ul>                                          
    <li>
     <label for="roleedit_role_comments"><strong>Comments</strong></label><br />
     <s:textarea name="role.comments" value="%{role.comments}" cols="64" rows="4"/> 
    </li>
    <br/>
    <li>
     <label for="roleedit_role_grpEx"><strong>Group-Unique</strong></label>
       <s:if test="%{role.grpEx}">
       <strong><s:radio name="role.grpEx" label="True" value="%{role.grpEx}" list="#{'true':'True'}"/></strong>
       <s:radio name="role.grpEx" label="False" value="%{role.grpEx}" list="#{'false':'False'}"/>
     </s:if>
     <s:else>
       <s:radio name="role.grpEx" label="True" value="%{role.grpEx}" list="#{'true':'True'}"/>
       <strong><s:radio name="role.grpEx" label="False" value="%{role.grpEx}" list="#{'false':'False'}"/> </strong>
     </s:else>
    </li>
    <li><s:submit theme="simple" name="op.pup" value="Update"/></li>
   </ul>
   </fieldset>
  </s:form>
 </div>
</div>

<script>
    var tabView = new YAHOO.widget.TabView("mgr-tabs");
</script>

<style>
form#roleedit ul li {
  list-style: none;
}
</style>
