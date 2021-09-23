<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<h1>Publication Search</h1>

<table width="100%" class="yui-skin-sam">
 <s:if test="hasActionErrors()">
  <tr>
   <td align="left" colspan="2">
    <br/>
     <table width="66%" cellspacing="1" cellpadding="3">
     <tr><td>
      <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
       <span class="error">
        <s:iterator value="actionErrors">
         <span class="errorMessage"><s:property default="" /></span>
        </s:iterator>
       </span>
      </div>
     </td></tr>
    </table>
   </td>
  </tr>
 </s:if>

 <tr>
  <td>
   <center>
    <s:form theme="simple" action="projsrc">
     <fieldset class="qfield">
      <legend class="qlegend">By Project Flag</legend>
      <table width="100%" class="qtable">
       <tr>
        <td class="pubsrc-td" align="left" valign="top" nowrap>
         <b>Flag:</b>
         <div class="acom">
          <s:hidden name="mst" value="1:1:1"/> 
          <s:select name="opp.encf" headerKey="-1" headerValue="-- select --"
                    list="#{'Curation Request':'Curation Request', 'CV19':'CV19','DSP':'DSP'}" 
                    value="-1" cssClass="pubsrc-flag"/>
          
          <s:submit theme="simple" name="op.eflt" value="SEARCH" onclick=""/>
         </div>
        </td>
       </tr>
      </table>
     </fieldset>
    </s:form>
   </center>
  </td>
 </tr>

</table>

<br/>
<br/>
<br/>
<br/>
<br/>

<script type="text/javascript">
   YAHOO.util.Event.addListener(
         window, "load", YAHOO.imex.autocom.init,
         { inp:"pubsrc_opp_au", cnt:"poc_cnt",opt:"curac" }
      );

   YAHOO.util.Event.addListener(
         window, "load", YAHOO.imex.autocom.init,
         { inp:"pubsrc_opp_ou", cnt:"poo_cnt",opt:"ownac" }
      );


</script>

