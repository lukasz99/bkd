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
    <div  class="pub-edit-head"> 
    <h2>Group</h2>
      <p>
       <label for="groupedit_group_id"><strong>GID:</strong></label>
       <s:property value="group.id"/>
      </p>
      <p>
       <label for="groupedit_group_label"><strong>Label:</strong></label>
       <s:property value="group.label"/>
      </p>
    </div>
 <ul class="yui-nav"> 
       <li class="selected"><a href="#tab1"><em>Group Information</em></a></li> 
       <li><a href="#tab2"><em>Group's Roles</em></a></li> 
 </ul>   
 <div class="yui-content">
 
<!--  First Tab  -->
 <div id="tab1">
  <s:form theme="simple" action="groupedit" cssClass="align-label">
   <s:hidden name="id" value="%{id}"/>
   <s:hidden name="group.id" value="%{id}"/>
   <s:hidden name="group.label" value="%{group.label}"/>
    
  <fieldset>
  <legend><h3>Group Details</h3></legend>
  <ul>
  
   <s:if test="hasFieldErrors()">
    <s:if test="fieldErrors['group.name']!=null">
    <li>
     <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
      <span class="error">
       <span class="errorMessage">
        <s:property value="fieldErrors['group.name'][0]" />
       </span>
      </span>
     </div>
     </li>
    </s:if>
   </s:if>
  
   <li>
    <label for="groupedit_group_name"><strong>Group Name: </strong></label>
    <s:textfield theme="simple" name="group.name" size="30" maxlength="64"/>
   </li>
  
   <s:if test="hasFieldErrors()">
    <s:if test="fieldErrors['opp.alogin']!=null">
     <li>
     <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
      <span class="error">
       <span class="errorMessage">
        <s:property value="fieldErrors['opp.alogin'][0]" />
       </span>
      </span>
     </div>
     </li>
    </s:if>
   </s:if>
   
   <li>
    <label for="groupedit_opp_alogin"><strong>Admin User: </strong></label>
    <s:textfield theme="simple" name="opp.alogin" 
                       value="%{group.adminUser.login}" size="30" maxlength="64"/>
   </li>
      <s:if test="hasFieldErrors()">
       <s:if test="fieldErrors['opp.clogin']!=null">
        <li>
        <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
         <span class="error">
          <span class="errorMessage">
           <s:property value="fieldErrors['opp.clogin'][0]" />
          </span>
         </span>
        </div>
        </li>
       </s:if>
      </s:if>
      
   <li>
    <label for="groupedit_opp_clogin"><strong>Contact User: </strong></label>
    <s:textfield theme="simple" name="opp.clogin" 
                       value="%{group.contactUser.login}" size="30" maxlength="64"/>
   </li>
   <li>
    <label for="groupedit_group_comments"><strong>Comments: </strong></label><br />
    <s:textarea name="group.comments" value="%{group.comments}" cols="64" rows="4"/>
   </li>
       
   <li>
     <s:submit theme="simple" name="op.pup" value="Update"
               onclick="return YAHOO.imex.groupedit.groupInfo('update');"/>
   </li>
  </ul>
  </fieldset>
    </s:form>
    </div>
    
<!--  Second Tab  -->
    <div id="tab2">
     <s:form theme="simple" action="groupedit"  cssClass="align-label">
      <s:hidden name="id" value="%{id}"/>
      <s:hidden name="group.id" value="%{id}"/>
      <s:hidden name="group.label" value="%{group.label}"/>

     <h3 class="header-grey-highlight">Roles</h3>
    <ul>
     <li>
     <fieldset>
      <legend>Current Roles</legend>
      <li id="li-group-role">
      <s:iterator value="group.roles" var="r" status="rpos">
        <s:checkbox name="opp.rdel" fieldValue="%{#r.id}"
                    cssClass="group-role-drop"/>
        <s:property value="#r.name"/>
      </s:iterator>
      </li>
     <li>
      <s:submit theme="simple" name="op.rdel" value="Drop"
                onclick="return YAHOO.imex.groupedit.groupRole('drop');"/>     
     </li> 
     </fieldset>
     </li>
    </ul>
    <ul>
     <li>
     <fieldset>
      <legend>Add Roles</legend>
      <li>
      <s:select name="opp.radd"  headerKey="-1" headerValue="---Select Role---"
                list="roleAll" listKey="id" listValue="name" />
      </li>
      <li>
       <s:submit theme="simple" name="op.radd" value="Add"
                 onclick="return YAHOO.imex.groupedit.groupRole('add');"/>     
      </li>
      </li> 
     </fieldset>
    </ul> 
   </s:form>
    </div>
 </div>
</div>
<script>
  // top-level tabs and content
  //---------------------------
   
  YAHOO.util.Event.addListener( 
    window, "load",
    YAHOO.imex.groupedit.init, 
    { gid:"<s:property value="id"/>",
      tabName: "mgr-tabs",
      login: "<s:property value="#session['LOGIN']"/>",
      prefs: "<s:property value="#session['PREFS']"/>"
    } 
  );

</script>

<style>
  form#groupedit ul li {
    list-style: none;
  }
</style>
