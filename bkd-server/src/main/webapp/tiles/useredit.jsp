<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<!--
 <scr ipt src="js/util-yui.js" type="text/javascript"></script>
 <scr ipt src="js/useredit-yui.js" type="text/javascript"></script>
-->
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
 <div id="useredit-tabs" class="main-width">
 

 <div class="pub-edit-head">
  <h2>User</h2>
  <ul>
   <p>
    <label for="usermgr_user_id"><strong>UID:</strong></label>
    <s:property value="user.id"/>
   </p>
   <p>
    <label for="usermgr_user_login"><strong>Login:</strong></label>
    <s:property value="user.login"/>
    </p>
  </div>
 <ul class="yui-nav"> 
       <li class="selected"><a href="#tab1"><em>User Information</em></a></li> 
       <li><a href="#tab2"><em>Change Password</em></a></li> 
       <li><a href="#tab3"><em>Groups/Roles</em></a></li> 
       <li><a href="#tab4"><em>Curation Statistics</em></a></li> 
 </ul>   
 <div class="yui-content">
 
 <div id="tab1">
 
 <s:form theme="simple" action="usermgr" cssClass="align-label">
  <s:hidden name="id" value="%{id}"/> 
  <s:hidden name="user.id" value="%{id}"/> 
  <s:hidden name="user.login" value="%{user.login}"/> 
   
  <fieldset>
  <legend><h3>Account</h3></legend>
  <h3 class="header-grey-highlight">Details</h3>
  <ul>
   <li>
    <label for="usermgr_user_firstName"><strong>First Name</strong></label>
    <s:textfield theme="simple" name="user.firstName" size="32" maxlength="64"/>
   </li>
   <li>
    <label for="usermgr_user_lastName"><strong>Last Name</strong></label>
    <s:textfield theme="simple" name="user.lastName" size="32" maxlength="64"/>
   </li>
   <li>
    <label for="usermgr_"><strong>Affilation</strong></label>
    <s:textfield theme="simple" name="user.affiliation" size="32" maxlength="64"/>
    </li>
   <li>
    <label for="usermgr_user_email"><strong>E-mail</strong></label>
    <s:textfield theme="simple" name="user.email" size="32" maxlength="64"/>
   </li>
  </ul>
  <h3 class="header-grey-highlight">Status</h3>
  <ul> 
   <li>
    <label for="usermgr_user_activated"><strong>Activated</strong></label>
    <s:if test="%{user.activated}">
     <strong><s:radio name="user.activated" label="True" value="%{user.activated}" list="#{'true':'True'}"/></strong>  
     <s:radio name="user.activated" label="False" value="%{user.activated}" list="#{'false':'False'}"/> 
    </s:if>
    <s:else>
     <s:radio name="user.activated" label="True" value="%{user.activated}" list="#{'true':'True'}"/> 
     <strong><s:radio name="user.activated" label="False" value="%{user.activated}" list="#{'false':'False'}"/> </strong>
    </s:else> 
   </li>
   <li>
    <label for="usermgr_user_enabled"><strong>Enabled</strong></label>
    <s:if test="%{user.enabled}">
     <strong><s:radio name="user.enabled" label="True" value="%{user.enabled}" list="#{'true':'True'}"/></strong>  
     <s:radio name="user.enabled" label="False" value="%{user.enabled}" list="#{'false':'False'}"/> 
    </s:if>
    <s:else>
     <s:radio name="user.enabled" label="True" value="%{user.enabled}" list="#{'true':'True'}"/> 
     <strong><s:radio name="user.enabled" label="False" value="%{user.enabled}" list="#{'false':'False'}"/> </strong>
    </s:else> 
   </li>
   <li>
     <s:submit theme="simple" name="op.pup" value="Update"
               onclick="return YAHOO.imex.useredit.userInfo('update');"/>
   </li>
  </ul>
  </s:form>
  </fieldset>
  </div>
  <div id="tab2">
   <s:form theme="simple" action="usermgr" cssClass="align-label">
       <s:hidden name="id" value="%{id}"/> 
       <s:hidden name="user.id" value="%{id}"/> 
       <s:hidden name="user.login" value="%{user.login}"/> 
    
    <fieldset>
     <legend><h3>Change Password</h3></legend>
     <ul>
      <li>
       <label for="usermgr_opp_pass1"><strong>New Password</strong></label>
       <s:password theme="simple" name="opp.pass1" value="" size="16" maxlength="128"/>
      </li>
      <li>
       <label for="usermgr_opp_pass2"><strong>Confirm Password</strong></label>
       <s:password theme="simple" name="opp.pass2" value="" size="16" maxlength="128"/>
      </li>
      <li>
       <s:submit theme="simple" name="op.prs" value="Update"
                 onclick="return YAHOO.imex.useredit.userPass('update');"/>
      </li> 
     </ul>
    </fieldset>
   </s:form>
  </div>

  <div id="tab3">
   <s:form theme="simple" action="usermgr" cssClass="align-label">
    <s:hidden name="id" value="%{id}"/> 
    <s:hidden name="user.id" value="%{id}"/> 
    <s:hidden name="user.login" value="%{user.login}"/> 

    <h3 class="header-grey-highlight">Roles</h3>
    <ul>
     <li>
      <fieldset>
       <legend>Current Roles</legend>
       <li id="li-user-role">
        <s:iterator value="user.roles" var="r" status="rpos"> 
         <s:checkbox name="opp.rdel" fieldValue="%{#r.id}" cssClass="user-role-drop"/>
         <s:property value="#r.name"/>
        </s:iterator>
      </li>
      <li>
        <s:submit theme="simple" name="op.rdel" value="Drop"
                  onclick="return YAHOO.imex.useredit.userRole('drop');"/>
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
                   onclick="return YAHOO.imex.useredit.userRole('add');"/>
       </li>
       </li> 
      </fieldset>
     </ul>
     <h3 class="header-grey-highlight">Groups</h3>
     <ul>
      <li>
      <fieldset>
       <legend>Current Groups</legend>
       <li id="li-user-group">
        <s:iterator value="user.groups" var="g" status="gpos"> 
         <s:checkbox name="opp.gdel" fieldValue="%{#g.id}" cssClass="user-group-drop"/>
         <s:property value="#g.label"/>
        </s:iterator>
       </li>
       <li>
          <s:submit theme="simple" name="op.gdel" value="Drop"
                    onclick="return YAHOO.imex.useredit.userGroup('drop');"/>
       </li> 
      </li>
      </fieldset>
     </ul>
     <ul>
      <li>
      <fieldset>
       <legend>Add Groups</legend>
       <li>
         <s:select name="opp.gadd"  headerKey="-1" headerValue="---Select Group---"
                   list="groupAll" listKey="id" listValue="label" />
       </li>
       <li>
         <s:submit theme="simple" name="op.gadd" value="Add"
                   onclick="return YAHOO.imex.useredit.userGroup('add');"/>
       </li>
      </li>
      </fieldset>
     </ul> 
   </s:form>
  </div>

  <div id="tab4">
    <h3 class="header-grey-highlight">Curation Progress</h3>
    <div id="curation-tbl" />
  </div>

 </div>
</div>
<script type="text/javascript">
  //var tabView = new YAHOO.widget.TabView("mgr-tabs");
  <%--
  YAHOO.util.Event.addListener( window, "load", 
                                YAHOO.imex.curstat.init(
                                   { uid:"<s:property value="user.id"/>",
                                     container:"curation-tbl" }));
--%>
  YAHOO.util.Event.addListener( window, "load", 
                                YAHOO.imex.useredit.init(
                                { uid:"<s:property value="user.id"/>",
                                  container:"useredit-tabs" }));


</script>

<style>
form#usermgr ul li {
  list-style: none;
}
</style>
