<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<s:if test="id > 0 ">
  <script src="js/record-edit-yui.js" type="text/javascript"></script>
  <script src="js/journalview-yui.js" type="text/javascript"></script>

  <h1 id="journal-header">Journal: <label id="journal-name"/></h1>
  <div class="yui-skin-sam" width="100%">
   <center>
      <div>
         <table width="100%" border="0">
           <tr>
            <td colspan="6" class="yvi-box">
             <table width="100%" border="0">
               <tr>
                 <td></td>
                 <td width="5%" class="yvi-name">Year</td>
                 <td></td>
                 <td></td>
                 <td width="5%"  class="yvi-name">Volume</td>
                 <td></td>
                 <td></td>
                 <td width="5%" class="yvi-name">Issue</td>
                 <td></td>
               </tr>
               <tr>
                 <td align="right">
                   <a id="year-first-container" href="">&lt;&lt;</a>
                   <a id="year-prev-container" href="">&lt;</a>
                 </td>
                 <td><label id="year-curr-container"/></td>
                 <td align="left">
                   <a id="year-next-container" href="">&gt;</a>
                   <a id="year-last-container" href="">&gt;&gt;</a>
                 </td>
                 <td align="right">
                   <a id="volume-first-container" href="">&lt;&lt;</a>
                   <a id="volume-prev-container" href="">&lt;</a>
                 </td>
                 <td><label id="volume-curr-container"/></td>
                 <td align="left">
                   <a id="volume-next-container" href="">&gt;</a>
                   <a id="volume-last-container" href="">&gt;&gt;</a>
                 </td>
                 <td align="right">
                   <a id="issue-first-container" href="">&lt;&lt;</a>
                   <a id="issue-prev-container" href="">&lt;</a>
                 </td>
                 <td><label id="issue-curr-container"/></td>
                 <td align="left">
                   <a id="issue-next-container" href="">&gt;</a>
                   <a id="issue-last-container" href="">&gt;&gt;</a>
                 </td>
               </tr>
             </table>
            </td>
           </tr>
           <tr>
             <td colspan="6">&nbsp;</td>
           </tr>
           <tr>
            <td colspan="3">&nbsp;</td>
            <td class="filter-name">By Stage</td>
            <td>&nbsp;</td>
            <td class="filter-name">By Status</td>
           </tr>
          <tr>
            <td><div id="dt-pag-nav"></div></td>
            <td width="95%">&nbsp;</td>
            <th width="1%">Filter:</th>
            <td class="filter-container"><label id="stage-button-container"/></td>
            <th width="1%">and</th>
            <td class="filter-container"><label id="state-button-container"/></td>
          </tr> 
         </table>
      </div> 
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

 <script type="text/javascript">

  YAHOO.util.Event.addListener( window, "load", 
                                YAHOO.imex.journalview.init(
                                   { jid:"<s:property value="id"/>",
                                     year:"<s:property value="IYear"/>",
                                     volume:"<s:property value="IVolume"/>",
                                     issue:"<s:property value="IIssue"/>",
				     stage:"<s:property value="IStage"/>",
				     status:"<s:property value="IStatus"/>",
                                     owner:"<s:property value="opp.ou"/>", 
                                     admus:"<s:property value="opp.au"/>",
                                     cflag:"<s:property value="opp.encf"/>",
                                     watch:"<s:property value="opp.wfl"/>",
                                     loginid:"<s:property value="#session['USER_ID']" />",
                                     prefStr:"<s:property value="#session['PREFS']"/>" }));

 </script>


</s:if>
<s:else>
 <!--<t:insertDefinition name="journaledit"/> -->
   
 <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
 redirect to journal manager...
 <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
 <br/><br/><br/><br/><br/><br/><br/><br/>
</s:else>
