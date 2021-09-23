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
    <s:form theme="simple" action="pubsrc">
     <fieldset class="qfield">
      <legend align="left" class="qlegend">By Record Identifier</legend>
      <table width="100%" class="qtable">
       <tr>
        <td class="pubsrc-td" align="left" valign="top" nowrap>
         <b>Identifier:</b><br> 
         <s:select name="opp.ns" headerKey="-1" headerValue="-- select --"
                    list="#{'pmid':'pmid','doi':'doi','jint':'internal','imex':'imex'}" value="-1" cssClass="pubsrc-flag"/>
         <s:textfield name="opp.ac"  size="16" maxlength="128" />
         <s:submit theme="simple" name="op.esrc" value="SEARCH"/>
        </td>
       </tr>
      </table>
     </fieldset>
    </s:form>
   </center>
  </td>

  <td>
   <center>
    <s:form theme="simple" action="pubsrc">
     <fieldset class="qfield">
      <legend align="left" class="qlegend">By Comment Flag</legend>
      <table width="100%" class="qtable">
       <tr>
        <td class="pubsrc-td" align="left" valign="top" nowrap>
         <b>Flag:</b>
         <div class="acom">
          <s:hidden name="mst" value="1:1:1"/> 
          <s:select name="opp.encf" headerKey="-1" headerValue="-- select --"
                    list="#{'QControl':'QControl','Curation Request':'Curation Request','DSP':'DSP','CV19':'CV19'}" 
                    value="-1" cssClass="pubsrc-flag"/>
          <s:hidden name="opp.ftype" value="dao"/>          
          <s:submit name="op.eflt" theme="simple" value="SEARCH" onclick=""/>
         </div>
        </td>
       </tr>
      </table>
     </fieldset>
    </s:form>
   </center>
  </td>
 </tr>

 <tr>
  <td colspan="2">
   <center>
    <s:form theme="simple" action="pubsrc">
     <fieldset class="qfield">
      <legend align="left" class="qlegend">By Record Submitter</legend>
      <table width="100%" class="qtable">
       <tr>
        <td class="pubsrc-td" align="left" valign="top" nowrap>
         <b>Submitter:</b>
          <div class="acom">
           <s:hidden name="mst" value="1:1:1"/>
           <s:hidden name="opp.ftype" value="dao"/>          
           <s:textfield name="opp.ou"  size="32" maxlength="64"/>
           <s:submit theme="simple" name="op.eflt" value="SEARCH" cssClass="pubsrc-sub" onclick=""/>
           <div id="poo_cnt"></div>
         </div>
        </td>
       </tr>
      </table>
     </fieldset>
    </s:form>
   </center>
  </td>
 </tr>

 <tr>
  <td colspan="2">
   <center>
    <s:form theme="simple" action="pubsrc">
     <fieldset class="qfield">
      <legend align="left" class="qlegend">By Record Curator</legend>
      <table width="100%" class="qtable">
       <tr>
        <td class="pubsrc-td" align="left" valign="top" nowrap>
         <b>Curator:</b>
         <div class="acom">
          <s:textfield name="opp.au" size="32" maxlength="64"/>
          <s:hidden name="mst" value="1:1:1"/>
          <s:hidden name="opp.ftype" value="elastic"/>
          <s:submit name="op.eflt" theme="simple" value="SEARCH" cssClass="pubsrc-sub" onclick=""/>
          <div id="poc_cnt">
          </div>
        </td>
       </tr>
      </table>
     </fieldset>
    </s:form>
   </center>
  </td>
 </tr>


<tr>
 <td colspan="2">
   <center>
    <s:form theme="simple" action="pubsrc">
     <fieldset class="qfield">
      <legend align="left"  class="qlegend">By Text Query</legend>
      <table width="100%" class="qtable">
       <tr>
        <td class="pubsrc-td" align="left" valign="top" nowrap>
         <b>Query:</b>
         <div class="acom">
          <s:textfield name="opp.query" size="64" maxlength="256" />
          <s:hidden name="mst" value="1:1:1"/>
          <s:hidden name="opp.ftype" value="elastic"/>
          <s:submit name="op.eflt" theme="simple" value="SEARCH" cssClass="pubsrc-query" onclick=""/>
          <div id="poq_cnt">
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

