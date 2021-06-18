<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<h1>Journal Manager</h1>

<script src="js/journalmgr-yui.js" type="text/javascript"></script>

  <div class="yui-skin-sam" width="100%">
  <center>
   <table width="99%">
   <tr>
     <td colspan="3">&nbsp;</td>
     <td class="filter-name">Tracked By</td>
    </tr>
    <tr>
     <td><div id="dt-pag-nav"></div></td>
     <td width="95%">&nbsp;</td>
     <th width="1%">Filter:</th>
     <td class="filter-container"><label id="partner-button-container"/></td>
    </tr> 
   </table>
  </center>    
  <div id="journaltab" width="100%" class="joutab"></div>
  <table width="100%" cellpadding="5">
   <s:form theme="simple" action="journalmgr">
    <tr>
     <td align="center" width="5%">
      <%-- <s:submit theme="simple" name="op.ldel" value="DROP" /> --%>
     </td>
     <td align="right">
      <b>NLMID:</b> 
      <s:textfield theme="simple" name="journal.nlmid" size="24" maxlength="64"/>
     </td>
     <td colspan="1" align="center" width="5%">
      <s:submit theme="simple" name="op.jsrc" value="Search" />
     </td>
    </tr>
   </s:form>
  </table>
 </div>
 <br/><br/> 

 <script type="text/javascript">
  YAHOO.util.Event.addListener( window, "load",
                                YAHOO.imex.journalmgr.init({ 
                                    cflag:"<s:property value="opp.encf"/>",
                                    watch:"<s:property value="opp.wfl"/>",
                                    loginid:"<s:property value="#session['USER_ID']" />" })
                              );

 </script>
