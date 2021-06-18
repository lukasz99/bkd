<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<script src="js/util-yui.js" type="text/javascript"></script>
<script src="js/record-edit-yui.js" type="text/javascript"></script>
<script src="js/stagemgr-yui.js" type="text/javascript"></script>

<!--    history   -->

  <h1><s:property value="stage"/> Manager</h1>

  <s:if test="opp.ou.length() > 0 ">
   <h2 class="pubmgr">Records submitted by: <i><s:property value="opp.ou"/></i></h2>
  </s:if>
  <s:elseif test="opp.au.length() > 0 ">
   <h2 class="pubmgr">Records curated by: <i><s:property value="opp.au"/></i></h2>
  </s:elseif>
  <s:elseif test="opp.encf.length() > 0 && opp.encf != '-1'">
   <h2 class="pubmgr">Records Flagged as: <i><s:property value="opp.encf"/></i></h2>
  </s:elseif>
  <s:elseif test="opp.wfl.length() > 0 && #session['USER_ID'] > 0" >
   <h2 class="pubmgr">Watched Records</h2>
  </s:elseif>
  <s:else></s:else>

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
   <s:form theme="simple" action="pubsrc">
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

 <script type="text/javascript">

  YAHOO.util.Event.addListener( window, "load", 
                                YAHOO.imex.stagemgr.init(
                                   { owner:"<s:property value="opp.ou"/>", 
                                     admus:"<s:property value="opp.au"/>",
                                     cflag:"<s:property value="opp.encf"/>",
				     stage:"<s:property value="stage"/>", 
                                     watch:"<s:property value="opp.wfl"/>",
                                     loginid:"<s:property value="#session['USER_ID']" />" }));

 </script>
