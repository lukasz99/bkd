<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<script src="js/journalstat-yui.js" type="text/javascript"></script>

<s:if test="id > 0 ">

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
               </tr>
             </table>
            </td>
           </tr>
           <tr>
             <td colspan="6">&nbsp;</td>
           </tr>
         </table>
      </div> 
   </center>    

  <div class="yui-skin-sam">
    <div id="stageTab" class="yui-navset"></div>
  </div>
  <br/><br/><br/><br/>
 <script type="text/javascript">
  YAHOO.util.Event.addListener( window, "load", 
                                YAHOO.imex.journalstat.init(
                                   { jid:"<s:property value="id"/>",
                                     jsyear:"<s:property value="IYear"/>",
                                     jsvolume:"<s:property value="IVolume"/>",
                                     loginid:"<s:property value="#session['USER_ID']" />",
                                     prefStr:"<s:property value="#session['PREFS']"/>" }));
 </script>


</s:if>

<s:else>
 <!--<t:insertDefinition name="journaledit"/> -->
 <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
 Journal ID missing...
 <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
 <br/><br/><br/><br/><br/><br/><br/><br/>
</s:else>
