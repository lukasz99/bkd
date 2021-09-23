<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Group Manager</h1>
<s:if test="id > 0">
 <t:insertDefinition name="groupedit"/>
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
 
  <div id="mgr-tabs" class="main-width">
 <ul class="yui-nav"> 
       <li class="selected"><a href="#tab1"><em>Add Group</em></a></li> 
       <li><a href="#tab2"><em>Groups</em></a></li> 
 </ul>   
 <div class="yui-content">

<!--  First Tab  -->

<div id="tab1">
     
   <s:form theme="simple" action="groupmgr" id="mgr-form" cssClass="align-label">
   <fieldset>
   <legend><h2>Add Group</h2></legend>
 <ul>
  <s:hidden theme="simple" name="op" value="" />
    <s:if test="hasFieldErrors()">
     <s:if test="fieldErrors['group.label']!=null">
      <li id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
       <span class="error">
        <span class="errorMessage">
         <s:property value="fieldErrors['group.label'][0]" />
        </span>
       </span>
      </li>
     </s:if>
    </s:if>
    <li>
     <label for="mgr-form_group_label" ><strong>Group Label:</strong></label>
     <s:textfield theme="simple" name="group.label" size="16" maxlength="32"/> 
   </li>
    <s:if test="hasFieldErrors()">
     <s:if test="fieldErrors['group.name']!=null">
      <li id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
       <span class="error">
        <span class="errorMessage">
         <s:property value="fieldErrors['group.name'][0]" />
        </span>
       </span>
      </li>
     </s:if>
    </s:if>
   <li>
    <label for="mgr-form_group_name" ><strong>Group Name:</strong></label>
    <s:textfield theme="simple" name="group.name" size="48" maxlength="64"/>
   </li>
   <li>
    <s:submit theme="simple" name="op.add" value="Add" />
   </li>
   </ul>
   </fieldset>
 </s:form>
 </div>
 
<!--  Second Tab  -->

<div id="tab2">
   <div id="dt-pag-nav"></div>
   <div id="groupmgr-table"></div>
  </div>
  
 <script type="text/javascript">

    var columnDefinitions = [
        {key:"id", label:"Id",  menuLabel:"Group Id",
                   sortable:true, resizeable:true, hidden: true, hideable: true },
        {key:"label",label:"Label", trigger: true,
                   sortable:true, resizeable:true, hidden: false, hideable: false },
        {key:"name",label:"Name", trigger: true,
                   sortable:true, resizeable:true, hidden: false, hideable: false },
        {key:"details", label:"", trigger: true,
                   sortable:true, resizeable:true, hidden: false, hideable: false,
                   formatter:"groupDetails" }
       ];
    
    var dataSourceLink = "groupmgr?op.view=json&";

    var datasourceSchema = { 
        resultsList: "groupList", 
        fields: ["id", "label", "name", "details"],
        metaFields: {
	       totalRecords: "totalRecords",
               paginationRecordOffset : "firstRecord", 
               paginationRowsPerPage : "blockSize" 
            }

    }; 
    var container = "groupmgr-table";
    
    YAHOO.imex.groupmgr.init(columnDefinitions, dataSourceLink, datasourceSchema, container);

 </script>
</s:else>
