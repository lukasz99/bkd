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
 <s:if test="pub == null or pub.pmid == null or pub.pmid.length() == 0" >  
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
</s:if>
<s:else>
  <div>
    <s:form theme="simple" cssClass="stylized" action="pubedit"> 
     <s:hidden name="pub.pmid" value="%{pub.pmid}"/>
     <label>PMID:</label>
     <div><s:property  value="pub.pmid" /> </div>
     <label>Journal:</label>
     <div>
        <s:property value="pub.source.title" />

        <s:if test="pub.volume.length() != 0"><s:property value="pub.volume" /></s:if><s:if test="pub.issue.length() != 0">(<s:property value="pub.issue" />)</s:if><s:if test="pub.pages.length() != 0">:<s:property value="pub.pages" /></s:if><s:if test="pub.year.length() != 0">, <s:property value="pub.year" /></s:if>
     </div>
          
     <label>Author(s):</label>
     <div><s:property value="pub.author"/></div>
     
     <label>Title:</label>
     <div><s:property value="pub.title"/></div>
     
     <label>Abstract:</label>
     <div><s:property value="%{pub.abstract}"/></div>
     <button name="op.eadd" value="ADD">Add</button>
    </s:form>
  </div>
</s:else>
</div>
