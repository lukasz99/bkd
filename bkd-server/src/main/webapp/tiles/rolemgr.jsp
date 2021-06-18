<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Role Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="roleedit"/>
</s:if>
<s:else>
 <s:if test="hasActionErrors()">
  <p id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">  
   <span class="error">
    <s:iterator value="actionErrors">
    <span class="errorMessage"><s:property escapeHtml="false" /></span>
    </s:iterator>
   </span>
  </p>
 </s:if>

<!--  Navigation  -->

 <div id="mgr-tabs" class="main-width">
  <ul class="yui-nav"> 
    <li class="selected"><a href="#tab1"><em>Add Role</em></a></li> 
    <li><a href="#tab2"><em>Roles</em></a></li> 
  </ul>
 
  <div class="yui-content">

   <div id="tab1">
    <s:form theme="simple" action="rolemgr" id="mgr-form" cssClass="align-label"> 
     
     <fieldset>
      <legend><h2>Add Role</h2></legend>
      <ul>
        <s:if test="hasFieldErrors()">
         <s:if test="fieldErrors['role.name']!=null">
          <p id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
           <span class="error">
            <span class="errorMessage">
             <s:property value="fieldErrors['role.name'][0]" />
            </span>
           </span>
          </p>
         </s:if>
        </s:if>
        <li>
        <label for="mgr-form_role_name" ><strong>Role Name:</strong> </label>
        <s:textfield theme="simple" name="role.name" size="24" maxlength="64"/>
       </li>
       <li>
        <s:submit theme="simple" name="op.add" value="Add" />
       </li>
      </ul>
     </fieldset>
    </s:form>
   </div>
     
   <div id="tab2">
      <div id="dt-pag-nav"></div>
      <div id="rolemgr-table">
   </div>
 
   
   <script type="text/javascript">
 
        var columnDefinitions = [
            {key:"id", label:"Id", menuLabel:"Group Id",
                 sortable:true, resizeable:true, hidden: true, hideable: true},
            {key:"name",label:"Name", trigger: true,
                 sortable:true, resizeable:true, hidden: false, hideable: false},
            {key:"Details", trigger: true, 
                 sortable:true, resizeable:true, hidden: false, hideable: false,
                 formatter:"roleDetails"}
           ];
        
        var dataSourceLink = "rolemgr?op.view=json&";
  
        var datasourceSchema = { 
            resultsList: "roleList", 
            fields: ["id", "name", "details"],
            metaFields: {
	       totalRecords: "totalRecords",
               paginationRecordOffset : "firstRecord", 
               paginationRowsPerPage : "blockSize" 
            }
        }; 
        var container = "rolemgr-table";
        
        YAHOO.imex.rolemgr.init(columnDefinitions, dataSourceLink, datasourceSchema, container);        
   </script>
  </div>
 </div>
</s:else>
