<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Index Manager</h1>

<s:if test="#session['USER_ID'] > -100">
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
<!--
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
-->
  <table width="100%" cellpadding="5" celspacing="1" border="0">
   <s:form theme="simple" action="indexmgr">

    <tr><td colspan="4"><hr/></td></tr>
    <tr>
     <td align="center" width="5%">
      <nbsp/>
     </td>
     <td align="right" colspan="2">
      ES Server URL:
      <s:textfield theme="simple" name="opp.esurl" size="36" maxlength="64"/>
     </td>
     <td colspan="1" align="left" width="65%">
      <s:submit theme="simple" name="op.seturl" value="Reset Url" />
     </td>
    </tr>

    <tr><td colspan="4"><hr/></td></tr>
    <tr>
     <td align="center" width="5%">
      <nbsp/>
     </td>
     <td align="right">
      <s:textfield theme="simple" name="opp.recid" size="12" maxlength="64"/>
     </td>
     <td colspan="2" align="left" width="65%">
      <s:submit theme="simple" name="op.idxid" value="Index Record" />
     </td>
    </tr>

    <tr><td colspan="4"><hr/></td></tr>
    <tr>
     <td align="center" width="5%">
      <nbsp/>
     </td>
     <td align="right">
      <s:textfield theme="simple" name="opp.nrec" size="12" maxlength="64"/>
     </td>
     <td colspan="2" align="left" width="65%">
      <s:submit theme="simple" name="op.idxnold" value="Index Oldest" />
     </td>
    </tr>

    <tr><td colspan="4"><hr/></td></tr>

    <tr>
     <td align="center" width="5%">
      <nbsp/>
     </td>
     <td align="right">
      <b>From:</b>
      <s:textfield theme="simple" name="opp.recmin" size="12" maxlength="64"/>
     </td>
     <td align="right">
      <b>To:</b>
      <s:textfield theme="simple" name="opp.recmax" size="12" maxlength="64"/>
     </td>

     <td colspan="1" align="left" width="65%">
      <s:submit theme="simple" name="op.idxrng" value="Index Range" />
     </td>
    </tr>

    <tr><td colspan="4"><hr/></td></tr>

    <tr>
     <td align="center" width="5%">
      <nbsp/>
     </td>     
     <td colspan="3" align="left" width="65%">
      <s:submit theme="simple" name="op.idxall" value="Index All" />
     </td>
    </tr>

    <tr><td colspan="4"><hr/></td></tr>

   </s:form>
  </table>
 </div>
</s:if>
<s:else>
  Must be logged in to access watch list.
</s:else>
