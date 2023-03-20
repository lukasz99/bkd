<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<!--pubmgr-tb-yui.jsp -->
<!--
<scr ipt src="js/record-edit-yui.js" type="text/javascript"></script>
<scr ipt src="js/util-yui.js" type="text/javascript"></script>
<scr ipt src="js/pubmgr-yui.js" type="text/javascript"></script>
-->
<!--    history   -->

  <h1>Publication Manager</h1>

  <s:if test="journalName.length() > 0 ">
   <h2 class="pubmgr">Journal: <i><s:property value="journalName"/></i></h2>
  </s:if>

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

  <s:if test="opp.query.length() > 0 ">
    <s:form theme="simple" action="pubsrc">
       <b>Query:</b>
       <s:textfield name="opp.query" size="64" maxlength="256" />
       <s:hidden name="opp.ftype" value="elastic"/>
       <s:submit name="op.eflt" theme="simple" value="SEARCH" cssClass="pubsrc-query" onclick=""/>
    </s:form>
  </s:if>
  
 <div class="yui-skin-sam" width="100%">
  <center>
   <img id="spinner" src="img/waiting-1.gif" height="100" width="100" class="">
   <table id="pubflt" width="99%" class="ic-hidden">
    <tr>
     <td colspan="3">&nbsp;</td>
     <td class="filter-name">By Stage</td>
     <td>&nbsp;</td>
     <td class="filter-name">By Status</td>
     <td>&nbsp;</td>
     <td class="filter-name">By Partner</td>
    </tr>
    <tr>
     <td><div id="dt-pag-nav"></div></td>
     <td width="95%">&nbsp;</td>
     <th width="1%">Filter:</th>
     <td class="filter-container"><label id="stage-button-container"/></td>
     <th width="1%">and</th>
     <td class="filter-container"><label id="state-button-container"/></td>
     <th width="1%">and</th>
     <td class="filter-container"><label id="partner-button-container"/></td>
    </tr> 
   </table>
  </center>    
  <div id="pubtab" width="100%" class="pubtab ic-hidden"></div>
  <table id="pubsrch" width="100%" cellpadding="5" class="ic-hidden">
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
                                YAHOO.imex.pubmgr.init(
                                   { owner:"<s:property value="opp.ou"/>", 
                                     admus:"<s:property value="opp.au"/>",
                                     query:"<s:property value="opp.query"/>",
                                     cflag:"<s:property value="opp.encf"/>",
                                     watch:"<s:property value="opp.wfl"/>",
                                     jid:"<s:property value="jid"/>",
                                     stage:"<s:property value="stage"/>",
                                     status:"<s:property value="status"/>",
                                     loginid:"<s:property value="#session['USER_ID']" />" }));

 </script>
