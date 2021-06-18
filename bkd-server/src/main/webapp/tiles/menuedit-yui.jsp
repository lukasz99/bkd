<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<s:form action="edit" theme ="simple">
<s:hidden name="ret" value="menu"/>
<s:hidden name="mst" value="%{mst}"/>
<table width="100%" class="edit_menu">
 <tr>
  <td class="edit_menu_header">
   Item: <a href="edit">TOP</a>
   <s:set name="item" value="menuContext.jsonConfig.menu[0]" />
   <s:set name="level" value="0"/>
   <s:set name="itemid" value="-1"/>
   <s:if test="menuSel[0] > 0 ">  
     <s:set name="item" value="#item.menu[menuSel[0]-1]"/>
     <s:set name="itemid" value="menuSel[0]"/>
     <s:set name="level" value="#level+1"/> 
     <s:if test="menuSel[0] > 0">
       <s:set name="itemid" value="menuSel[0]"/> 
       >> 
       <a href="edit?mst=<s:property value='#itemid'/>">
         <s:property value="#item.label"/>
       </a>
       
       <s:if test="menuSel.size > 1" >
        <s:if test="menuSel[1] > 0"> 
         <s:set name="item" value="#item.menu[menuSel[1]-1]"/>    
         <s:set name="itemid" value="#itemid+':'+menuSel[1]"/>  
         <s:set name="level" value="#level+1"/> 
         >>
         <a href="edit?mst=<s:property value='#itemid'/>">
          <s:property value="#item.label"/>
         </a>
         <s:if test="menuSel.size > 2" >  
          <s:if test="menuSel[2] > 0">
           <s:set name="item" value="#item.menu[menuSel[2]-1]"/>
           <s:set name="itemid" value="#itemid+':'+menuSel[2]"/>
           <s:set name="level" value="#level+1"/>
           >>
           <a href="edit?mst=<s:property value='#itemid'/>">
            <s:property value="#item.label"/>
           </a>
          </s:if> 
         </s:if>
        </s:if>
       </s:if>
     </s:if>
   </s:if>
  </td>
 </tr>
 <tr>
  <td>
   <table width="100%" class="edit_menu_body" >
    <tr>
     <td>label</td>
     <td>
      <s:textfield theme="simple" name="item.label" 
                   value="%{#item.label}" size="75" maxlength="75" />
     </td>
    </tr> 
    <tr>
     <td>link</td>
     <td>
      <s:textfield theme="simple" name="item.link" 
                   value="%{#item.link}" size="75" maxlength="75" />
     </td>
    </tr> 
    <tr>
     <td>active</td>
     <td>
      <s:textfield theme="simple" name="item.active" disabled="true"
                   value="%{#item.active}" size="75" maxlength="75" />
     </td>
    </tr>
    <tr>
     <td colspan="2">
      <table width="100%" border="0">
       <tr>
        <td align="left">
          <s:submit type="input" name="opr.itemAttStore" value="STORE" theme="simple"/>
        </td>
        <td align="right">
         <s:submit type="input" name="opr.itemAttReset" value="RESET" theme="simple"/>          
        </td>
        </tr>
      </table>
     </td>
    </tr>
   </table>
  </td>
 </tr>
 <tr>
  <td colspan="2" class="edit_menu_header">Submenu Items</td>
 </tr>
 <tr>
  <td colspan="2">
   <table width="100%" class="edit_menu_body"> 
    <tr>
     <td colspan="2" align="left">
      <table border="0" width="100%" cellpadding="0" cellspacing="0">
       <tr>
        <td width="90%">
         <s:if test="#item.menu.size > 0">
          <table class="edit_menu_ilist">
           <tr> 
            <s:iterator value="#item.menu" status="mi">         
             <td align="center" class="edit_menu_item"> 
              <s:if test="#itemid == -1">
                <a href="edit?mst=<s:property value="#mi.count"/>&mdf=0:<s:property value="#mi.index"/>">
                 <s:property value="label" />
                </a>
              </s:if>
              <s:else>
                <a href="edit?mst=<s:property value="#itemid+':'+#mi.count"/>">
                 <s:property value="label" />
                </a>                
              </s:else>
             </td>
            </s:iterator>   
           </tr>
           <tr>
            <s:iterator value="#item.menu" status="mi">
             <td align="center">
              <s:submit type="input" name="dropid[%{#mi.index}]" value="DROP" theme="simple"/>
             </td>
            </s:iterator>
           </tr>
          </table>
         </s:if>
         <s:else>
           &nbsp;
         </s:else>
        </td>
        <td width="10%"> 
         <center>      
          <s:submit type="input" name="opr.itemSubAdd" value="ADD ITEM" theme="simple"/>
         </center>
        </td> 
       </tr>
      </table> 
     </td>
    </tr> 
   </table>
  </td>
 </tr>
</table>
</s:form>
<br/>