<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<!--  equivalent from common-js.jsp -->
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

<div id="umgr" class="main-width">
  <div class="pub-edit-head ui-corner-all">
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
   </ul> 
  </div>
  <div id="uedit-tabs">
   <ul> 
    <li><a href="#uedit-tab-1">User Information</a></li> 
    <li><a href="#uedit-tab-2">Change Password</a></li> 
    <li><a href="#uedit-tab-3">Groups/Roles</a></li> 
    <li><a href="#uedit-tab-4">Curation Statistics</a></li> 
   </ul>    
   <div id="uedit-tab-1">
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
        <label for="usermgr_user_title"><strong>Title</strong></label>
        <s:textfield theme="simple" name="user.title" size="32" maxlength="64"/>
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
                  onclick="return uedit.userInfo('update');"/>
       </li>
      </ul>
     </fieldset>
    </s:form>
   </div>
   <div id="uedit-tab-2">
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
                  onclick="return uedit.userPass('update'); // YAHOO.imex.useredit.userPass('update'); "/>

        

       </li> 
      </ul>
     </fieldset>
    </s:form>
   </div>

   <div id="uedit-tab-3">
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
                   onclick="//return YAHOO.imex.useredit.userRole('drop');
                            return uedit.userRole('drop')"/>
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
                    onclick="//return YAHOO.imex.useredit.userRole('add');
                             return uedit.userRole('add');"/>
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
                    onclick="//return YAHOO.imex.useredit.userGroup('drop');
                             return uedit.userGroup('drop')"/>
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
                    onclick="//return YAHOO.imex.useredit.userGroup('add');
                             return uedit.userGroup('add')"/>
        </li>
       </li>
       </fieldset>
      </ul> 
     </s:form>
   </div>
   <div id="uedit-tab-4">
    <div id="uedit-records">
       N/A
    </div>
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
  <%--
  YAHOO.util.Event.addListener( window, "load", 
                                YAHOO.imex.useredit.init(
                                { uid:"<s:property value="user.id"/>",
                                  container:"useredit-tabs" }));
  --%>

   var uedit;
   console.log(uedit);

   $( function(){
     $('#uedit-tabs').tabs();
     
     uedit = new BkdUserEditor();
     //{ pager:"#umgr-pager",
     //  table:"#umgr-table" });
     console.log(uedit); 
     uedit.initialize( {uid: "<s:property value='user.id'/>" } );
   });
   
</script>

<style>
form#usermgr ul li {
  list-style: none;
}
</style>
