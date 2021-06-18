<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Watch Manager</h1>

<s:if test="#session['USER_ID'] > 0">
 <script type="text/javascript">
   YAHOO.util.Event.addListener( window, "load",
                                 YAHOO.imex.watchmgr.init(
                                    { owner:"<s:property value="opp.ou"/>",
                                      admus:"<s:property value="opp.au"/>",
                                      cflag:"<s:property value="opp.encf"/>",
                                      login:"<s:property value="#session['LOGIN']" />",
                                      loginid:"<s:property value="#session['USER_ID']" />"}));

  </script>

  <div class="yui-skin-sam" width="100%">
  <center>
   <table width="99%">
    <tr>
     <td colspan="3">&nbsp;</td>
      <td class="filter-name">By Status</td>
     <td>&nbsp;</td>
     <td class="filter-name">By Partner</td>
    </tr>
    <tr>
     <td><div id="dt-pag-nav"></div></td>
     <td width="95%">&nbsp;</td>
     <th width="1%">Filter:</th>
     <td class="filter-container"><label id="state-button-container"/></td>
     <th width="1%">and</th>
     <td class="filter-container"><label id="partner-button-container"/></td>
    </tr>
   </table>
  </center>
  <div id="pubtab" width="100%" class="pubtab"></div>
  <table width="100%" cellpadding="5">
   <s:form theme="simple" action="pubmgr">
    <tr>
     <td align="center" width="5%">
      <%-- <s:submit theme="simple" name="op.ldel" value="DROP" /> --%>
     </td>
     <td align="right">
      <b>PMID:</b>
      <s:textfield theme="simple" name="pub.pmid" size="24" maxlength="64"/>
     </td>
     <td colspan="1" align="center" width="5%">
      <s:submit theme="simple" name="op.esrc" value="Search" />
     </td>
    </tr>
   </s:form>
  </table>
 </div>
</s:if>
<s:else>
  Must be logged in to access watch list.
</s:else>
