<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<!-- <scr ipt src="js/accordion-yui.js" type="text/javascript"></script> -->
<tr>
 <td colspan="2">
  <s:form theme="simple" action="newsedit">
   <s:hidden name="site" value=""/>
   <s:hidden name="opp.date" value="%{opp.date}"/>
   <s:hidden name="opp.time" value="%{opp.time}"/>
   <dl id="acc-top" class="accordion">
    <s:if test="opp.date != null and opp.date !=''">
     <dt id="acc-top-tab">Update News Item</dt>
    </s:if>
    <s:else>
     <dt id="acc-top-tab">Add News Item</dt>
    </s:else>
    <dd class="close">
     <div class="bd">
      <center>
       <table cellpadding="3">
        <tr>
         <th align="left" nowrap>
          Title: <s:textfield size="64" value="%{opp.header}" name="opp.header"/>
         </th>
         <th align="right" nowrap>
          Submitted by: <s:textfield size="4" value="%{opp.aini}" name="opp.aini"/>
         </td>
        </tr>
        <tr>
         <td colspan="4" align="center">
          <s:textarea theme="simple" value="%{opp.body}" name="opp.body" cols="110" rows="12"/>
         </td>
        </tr>
        <tr>
         <td colspan="4">
          <table width="100%" cellpadding="3">
           <tr>     
            <td align="left">
             <s:if test="opp.date != null and opp.date !=''">
              <s:submit theme="simple" name="op.add" value="SAVE" />
             </s:if>
             <s:else>
               <s:submit theme="simple" name="op.add" value="ADD" />
             </s:else>
            </td> 
            <td align="right">
             <s:submit theme="simple" name="op.reset" value="RESET" />
            </td>
           </tr>
          </table>
         </td>
        </tr>
       </table>
      </center>
     </div>
    </dd>
   </dl>
  </s:form>
 </td>
</tr>

<script type="text/javascript">
  var ip = function() {
   <s:if test="opp.date != null and opp.date !=''">
    YAHOO.mbi.accordion.open();
   </s:if>
   <s:else>   
    YAHOO.mbi.accordion.init();
   </s:else>
  }
  YAHOO.util.Event.on( window,  "load", ip );
</script>

