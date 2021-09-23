<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<script src="js/pubnew-yui.js" type="text/javascript"></script>

<div width="100%">
<h1>Publication Add</h1>
 <s:if test="hasActionErrors()">    
   <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
       <span class="error">
        <s:iterator value="actionErrors">
         <span class="errorMessage"><s:property default="" /></span>
        </s:iterator>
       </span>
   </div>     
 </s:if>
   <div style="display: block;">
    <s:form theme="simple" action="pubsrc" cssClass="stylized" style="display:inline-block">
     <label>PMID:</label>
     <s:textfield theme="simple" name="pub.pmid" size="16" maxlength="16"/>                         
     <button name="op.esrc" value="ADD">Add</button>
    </s:form>
   </div>
   <br/>
   <div style="display: inline-block;">
    <h2>OR</h2>
   </div>
   <br/>
   <div style="display: block;">
    <s:form theme="simple" action="pubadd" cssClass="stylized" style="display:inline-block">
     <label>Author(s):</label>
     <s:textfield theme="simple" name="pub.author" size="90" maxlength="256"/>                         
     <label>Title:</label>
     <s:textfield theme="simple" name="pub.title" size="90" maxlength="128"/>                 
     <button name="op.eadd" value="ADD">Add</button>
   </s:form>
  </div>
</div>
