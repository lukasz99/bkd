<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<script src="js/util-yui.js" type="text/javascript"></script>


<%-- LS
<s:if test="id > 0">
 <scr ipt src="js/calendar-yui.js" type="text/javascript"></script>
 <scr ipt src="js/pubedit-yui.js" type="text/javascript"></script>
 <scr ipt src="js/attach-yui.js" type="text/javascript"></script>

  <h1>Publication Editor</h1>

 <t:insertDefinition name="pubedit"/>
  <script type="text/javascript">
    YAHOO.util.Event.addListener( 
         window, "load", YAHOO.imex.pubedit.init, 
         {id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />"} 
      );

    YAHOO.util.Event.addListener( window, "load", YAHOO.imex.calendar.init );

    YAHOO.util.Event.addListener( window, "load", YAHOO.imex.attedit.init, 
         {aclass:"comment",
          apane:"com-tbview",tabno:3,
          url:"attachmgr?op.calg=calg&id=",
          cname:{"author":"Author","subject":"Subject","date":"Date", "flagName":"Flag"},
          id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />"}  
      );

    YAHOO.util.Event.addListener( window, "load", YAHOO.imex.attedit.init, 
         {aclass:"history",apane:"history-tbview",tabno:5,
          url:"attachmgr?op.halg=halg&id=",
          cname:{"author":"User","subject":"Operation","date":"Date"},
          id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />"}  
      );

    YAHOO.util.Event.addListener( window, "load", YAHOO.imex.attedit.init, 
         {aclass:"adata",apane:"adata-tbview",tabno:5,
          url:"attachmgr?op.dalg=dalg&id=",
          cname:{"author":"Author", "subject":"Name", "date":"Date", 
                 "bodyType":"Format", "flagName":"Flag", "aid":""},
          id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />",
          loginid:"<s:property value="#session['USER_ID']" />",
          curator:"<s:property value="#session['USER_ROLE'].curator != null" />",   
          owner:"<s:property value="#session['USER_ID'] == pub.owner.id" />"}   
      );
    function attclear(){
      try{   
        YAHOO.util.Dom.get('attmgr_opp_edan').value='';
        YAHOO.util.Dom.get('attmgr_opp_edafile').value='';
      }catch(x){};
    };
    YAHOO.util.Event.addListener( window, "load", attclear );
 </script>
</s:if>

<s:else>
--%>

  <script src="js/pubmgr-yui.js" type="text/javascript"></script>

  <!--    history   -->

  <h1>Publication Manager</h1>

  <s:if test="opp.ou.length() > 0 ">
   <h2 class="pubmgr">Records submitted by: <i><s:property value="opp.ou"/></i></h2>
  </s:if>
  <s:elseif test="opp.au.length() > 0 ">
   <h2 class="pubmgr">Records curated by: <i><s:property value="opp.au"/></i></h2>
  </s:elseif>
  <s:elseif test="opp.encf.length() > 0 ">
   <h2 class="pubmgr">Project: <i><s:property value="opp.encf"/></i></h2>
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
                                YAHOO.imex.pubmgr.init(
                                   { owner:"<s:property value="opp.ou"/>", 
                                     admus:"<s:property value="opp.au"/>",
                                     cflag:"<s:property value="opp.encf"/>",
                                     watch:"<s:property value="opp.wfl"/>",
                                     loginid:"<s:property value="#session['USER_ID']" />",
                                     prefs:"<s:property value="#session['PREFS']"/>" }));

 </script>

<%-- 
</s:else>
--%>
