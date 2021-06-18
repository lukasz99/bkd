<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>User Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="useredit"/>
</s:if>
<s:else>
    
<!--  Navigation  -->
 <div id="mgr-tabs" class="main-width">
 <ul class="yui-nav"> 
       <li class="selected"><a href="#tab1"><em>Add User</em></a></li> 
       <li><a href="#tab2"><em>Users</em></a></li> 
 </ul>   
 <div class="yui-content">
     
<!--  First Tab  -->

<div id="tab1">

   <s:form theme="simple" action="usermgr" cssClass="align-label"> 
   <fieldset>
   <legend><h2>Add User</h2></legend>
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
     <div id="dt-pag-nav"></div>
     <div id="usermgr-table"></div>
    </div>
    
    <script type="text/javascript">
 
        var columnDefinitions = [
            {key:"id", label:"Id",  sortable:true, resizeable:true},
            {key:"login",label:"Login", sortable:true, resizeable:true},
            {key:"firstName",label:"First Name", sortable:true, resizeable:true},
            {key:"lastName",label:"Last Name", sortable:true, resizeable:true},
            {key:"email",label:"Email", sortable:true, resizeable:true},
            {key:"affiliation",label:"Affiliation", sortable:true, resizeable:true},
            {key:"Details", sortable:true, resizeable:true, formatter:"userDetails"}];
        
        var dataSourceLink = "usermgr?op.view=json&";
  
        var datasourceSchema = { 
            resultsList: "userList", 
            fields: ["id", "login", "firstName", "lastName", "email", 
                     "affiliation"],
            metaFields: {
	       totalRecords: "totalRecords",
               paginationRecordOffset : "firstRecord", 
               paginationRowsPerPage : "blockSize" 
            }
        }; 
        var container = "usermgr-table";

        YAHOO.imex.usermgr.init(columnDefinitions, dataSourceLink, datasourceSchema, container);
  
    </script>
   </div>
  </div>
</s:else>
