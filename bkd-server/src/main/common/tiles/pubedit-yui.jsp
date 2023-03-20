<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<%-- FROM: pubmgr-yui.js --%>

<!--
 <script src="js/util-yui.js" type="text/javascript"></script>
 <script src="js/calendar-yui.js" type="text/javascript"></script>
 <script src="js/pubedit-yui.js" type="text/javascript"></script>
 <script src="js/adi-yui.js" type="text/javascript"></script>
 <script src="js/attach-yui.js" type="text/javascript"></script>
-->

<%-- END --%>
 <h1>Publication Editor</h1>
 <div class="pub-edit-head main-width">
<%--
   <h2>IC-<s:property value="pub.id"/>-PUB</h2>   
   <p id="pub_ttl"><em><s:if test="pub.title.length()>78"><s:property value="pub.title.substring(0,75)"/>... </s:if>
                       <s:else><s:property value="pub.title"/></s:else></em></p>
--%>

 <h2><s:if test="pub.title.length()>78"><s:property value="pub.title.substring(0,75)"/>... </s:if><s:else><s:property value="pub.title"/></s:else></h2>

 <p id="pub_ttl"><em>IC-<s:property value="pub.id"/>-PUB</em></p>


 </div>
 <div class="yui-skin-sam">
    <div id="pubTab" class="yui-navset main-width">
       <ul class="yui-nav">
          <li class="selected"><a href="#tab1"><em>Publication Summary</em></a></li>
          <li><a href="#tab2"><em>Publication Update</em></a></li>
          <li><a href="#tab3"><em>Record Status</em></a></li>
          <li><a href="#tab4"><em>Curator Access</em></a></li>
          <li><a href="#tab5"><em>Comments</em></a></li>
          <li><a href="#tab6"><em>Attachments</em></a></li>          
          <li><a href="#tab7"><em>Watch Status</em></a></li>
          <li><a href="#tab8"><em>Record History</em></a></li>
       </ul>
       <div class="yui-content">
         <div class="yui-hidden">
           <fieldset>
               <legend><h3>Record Status</h3></legend>  
               <div id="rec_owner" style="float: left; width: 33%;">
                  <b>Requested/Submitted By:</b> <s:property value="pub.owner.login" />
               </div>
               <div id="rec_state" style="float: left; width: 33%; text-align: center;">
                  <b>Curation Status:</b> <s:property value="pub.stage.name" />/<s:property value="pub.state.name" />
               </div>

               <s:if test="pub.imexId.length() != 0">
                 <div id="rec_imexid" style="float: left; width: 33%;text-align: right;">
                  <b>Imex ID:</b> 
                     <s:property value="pub.imexId" />
                  </div>
               </s:if>
               <s:else>
                 <div id="rec_imexid" style="float: left; width: 33%;text-align: right;"><b>Imex ID:</b> N/A</div>
               </s:else>
           </fieldset> 
           <s:if test="pub.source.title.length() != 0">
             <fieldset>
               <legend><h3>Journal Citation</h3></legend>  
               <div id="rec_src_cite" style="float: left; width: 70%;">
                   <s:property value="pub.source.title" />

                   <s:if 
                     test="pub.volume.length() > 0"><b><s:property value="pub.volume" /></b></s:if><s:if 
                     test="pub.issue.length() > 0">(<s:property value="pub.issue" />)</s:if><s:if 
                     test="pub.pages.length() > 0">:<s:property value="pub.pages" /></s:if><s:if 
                     test="pub.year.length() > 0">, <s:property value="pub.year" />
                   </s:if>

               </div>
               <div id="rec_src_pmid" style="float: left; width: 30%; text-align: right;">
                 <s:if test="pub.pmid.length() != 0">
                   [PUBMED:<a target="icentral_outlink" href="http://www.ncbi.nlm.nih.gov/pubmed/<s:property value='pub.pmid'/>"><s:property value="pub.pmid"/></a>]
                 </s:if>
                 <s:else>
                 [PUBMED: N/A]
                 </s:else>
               </div>
             </fieldset>
           </s:if>
           <fieldset>
                <legend><h3>Author(s)</h3></legend>
                <div id="rec_src_author"><s:property value="pub.author" /></div>
           </fieldset>
           <fieldset class="box-fieldset">
                <legend><h3 >Abstract</h3></legend>
                <div id="rec_src_abstract" style="background: #e0e0e0; border: 1px; border-style: solid; border-color: #888888; padding: 10px;">
                   <s:property value="pub.abstract" />
                </div>
           </fieldset>         
         </div>
         <!--Publication Update Tab-->
          <div class="yui-hidden">
             <s:form id="pub-det-edit" theme="simple" action="pubedit" cssClass="align-label">
               <fieldset>
                <legend><h3>Identifiers</h3></legend>
                <ul>
                  <li>
                    <label for="pubedit_pub_pmid">PubMed</label>
                    <s:textfield theme="simple" name="pub.pmid" size="32" maxlength="64"/><s:submit id="sub-4" disabled="true" theme="simple" name="op.epmr" value="Synchronize" onclick="return YAHOO.imex.pubedit.pubIdent('epmr');"/>
                  </li>
                  <li>
                    <label for="pubedit_pub_doi">DOI</label>
                    <s:textfield theme="simple" name="pub.doi" size="32" maxlength="64"/>
                  </li>
                  <li>
                    <label for="pubedit_pub_journalSpecific">Internal</label> 
                    <s:textfield theme="simple" name="pub.journalSpecific" size="32" maxlength="64"/>
                  </li>
                  <li><s:submit id="sub-5" disabled="true" theme="simple" name="op.eidu" value="UPDATE" onclick="return YAHOO.imex.pubedit.pubIdent('update');"/></li>
               </fieldset>
               <fieldset>
                <legend>
                   <h3>Journal Title</h3>
                </legend>
                <ul>
                  <li>
                    <s:select name="opp.jid" headerKey="-1" headerValue="---Select Journal---" value="pub.source.id" list="journalList" listKey="id" listValue="title"/>
                  </li>
                  <li>
                    <s:submit id="sub-6" disabled="true" theme="simple" name="op.jset" value="UPDATE" />
                  </li>
                  </ul>
               </fieldset>
                   <fieldset>
                    <legend>
                       <h3>Authors/Title</h3>
                    </legend>
                    <ul>
                      <li>
                        <label for="pubedit_pub_author">Author(s)</label>
                        <s:textfield theme="simple" name="pub.author" size="90" maxlength="512" cssClass="limit-width"/>
                      </li>
                      <li>
                        <label for="pubedit_pub_title">Title</label>
                        <s:textfield theme="simple" name="pub.title" size="90"  maxlength="512" cssClass="limit-width"/>
                      </li>
                      <li>
                        <s:submit id="sub-7" disabled="true" theme="simple" name="op.eatu" value="UPDATE" onclick="return YAHOO.imex.pubedit.pubAuthTitle('update');"/>
                        </li>
                   </fieldset>
                  <fieldset>
                    <legend><h3>Abstract</h3></legend>
                    <ul>
                      <li><s:textarea cssClass="limit-width" name="pub.abstract" value="%{pub.abstract}" cols="75" rows="12"/></li>
                      <li><s:submit id="sub-8" disabled="true" theme="simple" name="op.pup" value="UPDATE"/></li>
                    </ul>
                  </fieldset>
             </s:form>
            </div>
            <div class="yui-hidden"> 
             <!--Record Status Tab-->
             <s:form id="pub-stat-edit" theme="simple" action="pubedit" cssClass="align-label">
                 <fieldset>
                    <legend><h3>Availability Status</h3></legend>
                    <ul>
                       <li><label for="pub-stat-edit_opp_epd">Publication Date (expected)</label> 
                        <s:hidden name="pub.expectedPubDateStr"/>
                        <s:textfield theme="simple" name="opp.epd" size="10" maxlength="10"/>
                        <button id="epd-show" title="Show Calendar" type="button"><img src="img/calbtn.gif" alt="Calendar" height="18" width="18"/> </button>
                       </li>
                       <li><label for="pub-stat-edit_opp_pd">Publication Date</label> 
                        <s:hidden name="pub.pubDateStr"/>
                        <s:textfield theme="simple" name="opp.pd" size="10" maxlength="10"/>
                        <button id="pd-show" title="Show Calendar" type="button"><img src="img/calbtn.gif" alt="Calendar" height="18" width="18"/> </button>
                       </li>
                       <li><label for="pub-stat-edit_opp_rd">Release Date</label>
                        <s:hidden name="pub.releaseDateStr"/>
                        <s:textfield theme="simple" name="opp.rd" size="10" maxlength="10"/>
                        <button id="rd-show" title="Show Calendar" type="button"><img src="img/calbtn.gif" alt="Calendar" height="18" width="18"/> </button>
                       </li>
                       <li><s:submit id="sub-1" disabled="true" theme="simple" name="op.edup" value="UPDATE" onclick="return YAHOO.imex.pubedit.pubDate('update');"/></li>
                    </ul>
                 </fieldset>
                 <fieldset>
              <legend><h3>Contact Email</h3></legend>
              <ul>
                <li id="td-contact-mail">
                  <s:if test="pub.contactEmail.length() > 0">
                    <s:a id="cm-link" href="%{'mailto:'+pub.contactEmail}">
                      <s:property value="pub.contactEmail"/>
                    </s:a>
                    <em>change to</em> 
                  </s:if>
                 <s:textfield theme="simple" name="opp.necm" size="32" maxlength="32"/>
                </li>
                <li><s:submit id="sub-2" disabled="true" theme="simple" name="op.emup" value="UPDATE" onclick="return YAHOO.imex.pubedit.pubContactMail('update');"/></li>
              </ul>
            </fieldset>
             
            <fieldset>
               <legend>
                  <h3>Curation Status</h3>
               </legend>
               <ul>
               <li>
                <span id="state-label" class="pub-state-label"></span> <em>change to</em>  <span id="state-button-container"></span> <s:hidden id="nsn" name="opp.nsn" value="%{pub.state.name}"/></p>
                <s:submit id="sub-3" disabled="true" theme="simple" name="op.esup" value="UPDATE" onclick="return YAHOO.imex.pubedit.pubState('update');"/>
                </li></ul>
            </fieldset>
            <fieldset>
              <legend>
                  <h3>IMEx ID</h3>
              </legend>
              <ul>
               <li>
                <span id="imex-button-container"></span> IMEx Records [---------]
               </li>
               <li>
                <s:submit theme="simple" name="op.pav" value="UPDATE" disabled="true"/>
               </li>
              </ul>
            </fieldset>
          </s:form>
          </div>
          <!-- access pane -->
          <div class="yui-hidden pub-edit-margin">
             <s:form id="pub-acc-edit" theme="simple" action="pubedit" cssClass="align-label">
                <ul>
                  <li>
                    <label for="pubedit_pub_owner_login">Submitted By:</label>
                    <s:hidden name="pub.owner.login"/><s:textfield theme="simple" name="pub.owner.login" size="32" maxlength="64" disabled="true"/>
                  </li>
                </ul> 
                <h3 class="pub-edit-sect">Curators</h3>
                   <ul>
                <fieldset>
                   <legend>Drop Curators</legend>
                   <li id="td-admin-user"><s:iterator value="pub.adminUsers" var="u" status="upos"><s:checkbox name="opp.eaudel" fieldValue="%{#u.id}" cssClass="admin-user-drop"/><s:property value="#u.login"/></s:iterator></li>
                   <li><s:submit id="sub-9" disabled="true" theme="simple" name="op.eaudel" value="DROP"
                                 onclick="return YAHOO.imex.pubedit.pubAdminUser('drop');"/></li>
                </fieldset>
                   </ul>
                     <ul>
                   <fieldset>
                     <legend>Add Curators</legend>
                     <li>Curator username:<s:textfield theme="simple" name="opp.eauadd" size="32" maxlength="64"/></li>
                      <li><s:submit id="sub-10" disabled="true" theme="simple" name="op.eauadd" value="ADD"
                                    onclick="return YAHOO.imex.pubedit.pubAdminUser('add');"/></li>
                   </fieldset>
                      </ul>
                <h3 class="pub-edit-sect">Curator Groups</h3>
                     <ul>
                <fieldset>
                   <legend>Drop Curator Group</legend>
                   <li id="td-admin-group"><s:iterator value="pub.adminGroups" var="g" status="gpos"><s:checkbox name="opp.eagdel" fieldValue="%{#g.id}" cssClass="admin-group-drop"/><s:property value="#g.label"/></s:iterator></li>
                   <li><s:submit id="sub-11" disabled="true" theme="simple" name="op.eagdel" value="DROP" 
                                 onclick="return YAHOO.imex.pubedit.pubAdminGroup('drop');"/></li>
                     </ul>
                </fieldset>
                <ul>
                   <fieldset>
                      <legend>Add Curator Group</legend>
                      <li><s:select name="opp.eagadd" headerKey="-1" headerValue="---Select Group---" list="groupAll" listKey="id" listValue="label"/></p>
                      <li><s:submit id="sub-12" disabled="true" theme="simple" name="op.eagadd" value="ADD" 
                                    onclick="return YAHOO.imex.pubedit.pubAdminGroup('add');"/></p>
                   </fieldset>
                </ul>
             </s:form></div>
          <!-- comments pane -->
          <div id="cmt-pane" class="yui-hidden">
            <s:form id="cmtmgr" theme="simple" action="attachmgr" cssClass="align-label">
              <s:hidden name="id" value="%{id}"/><s:hidden name="pub.id" value="%{id}"/>
              <s:if test="#session['USER_ID'] > 0">
                  <fieldset>
                    <legend>
                        <h3>Add a Comment</h3>
                    </legend>
                    <ul>
                   <li><label for="cmtmgr_opp_encs">Subject:</label> <s:textfield theme="simple" name="opp.encs" size="50" value=""/></li>
                    <%--  <p><label for="cmtmgr_format">Format:</label> --</li>%><%--  <li><s:radio label="Format" name="format" list="#{'0':'PLAIN','2':'WIKI'}" value="2"/> </li>--%>
                    <li><label for="cmtmgr_opp_encb">Body:</label> <s:textarea cssClass="limit-width" theme="simple" name="opp.encb" cols="50" rows="5" value=""/></li>
                    <li><label for="cmtmgr_opp_encf">Flag:</label> <%--               <label id="flag-label" class="flag-label">Flag</label> --%><s:select name="opp.encf" headerKey="-1" headerValue="----------" list="#{'1':'QControl','4':'Curation Request','5':'DSP','8':'CV19'}" value="-1"/></li>
                    <li><s:submit theme="simple" name="op.ecadd" value="ADD" disabled="false" onclick="return YAHOO.imex.adi.pubAttach('comment','add');"/></li>
                    <li><em><a onclick="return YAHOO.imex.adi.pubPreview('comment','preview');" href="">preview</a></em> <li>
                    
                     </ul>
                  </fieldset>
                </s:if>
              </s:form>
                <s:if test="#session['USER_ID'] > 0">
                   <div id="adi-comments" class="yui-hidden">
                     <h3 class="pub-edit-sect">Comments</h3>
                     <div id="com-tbview" class="tbview"></div>
                   </div>
                </s:if>
                <s:else>
                   <h3 class="pub-edit-sect">Add a Comment</h3>               
                   <p>Please <a href="javascript:YAHOO.mbi.login.sendUrlFragment();">Log in</a> to add a comment.</p>

                   <div id="adi-comments" class="yui-hidden">
                     <h3 class="pub-edit-sect">Comments</h3>
                     <div id="com-tbview" class="tbview"></div>
                   </div>

                </s:else>
             </div>
          <!-- attachment pane -->
          <div id="att-pane" class="yui-hidden">
             <s:if test="#session['USER_ROLE'].curator != null || #session['USER_ID'] == pub.owner.id">
                 <s:form id="attmgr" theme="simple" action="attachmgr" cssClass="align-label" method="post" enctype="multipart/form-data" onsubmit="return true;">
                   <fieldset>
                      <legend>
                         <h3>Add a File</h3>
                      </legend>
                      <s:hidden name="id" value="%{id}"/><s:hidden name="opp.pubid" value="%{id}"/>
                    <ul>
                      <li><label for="attmgr_opp_edafile">File</label> <s:file theme="simple" name="opp.edafile" accept="text/*" size="65"/></li>
                      <li><label for="attmgr_opp_edan">Name</label> <s:textfield theme="simple" name="opp.edan" size="50" value=""/></li>
                      <li><label for="attmgr_opp_edat">Format</label> <s:radio label="Format" name="opp.edat" list="#{'0':'TEXT','1':'MIF25','2':'MITAB'}" value="2"/></li>
                      <li><label for="attmgr_opp_edaf">Flag</label> <%--            <label id="flag-label" class="flag-label">Flag</label> --%><s:select name="opp.edaf" headerKey="-1" headerValue="----------" list="#{'2':'MIMIX','3':'IMEX'}" value="-1"/></li>
                      <s:hidden name="op.eada" value="ADD"/>
                      <li><s:submit id="sub-13" disabled="true" theme="simple" name="op.xx" value="Add" onclick="YAHOO.imex.attedit.nameSet( {'nf':'attmgr_opp_edan', 'ff':'attmgr_opp_edafile'}); YAHOO.imex.attedit.UploadFile(); return false;"/><%--                  onclick="return YAHOO.imex.attedit.pubAttach('adata','add');"/>  --%>
                    </ul>
                   </fieldset>
                </s:form>
             </s:if> 
             <s:if test="#session['USER_ROLE'].curator != null || #session['USER_ID'] == pub.owner.id">
               <div id="adi-attachments" class="yui-hidden">
                   <h3 class="pub-edit-sect">Attachments</h3>
                   <div id="adata-tbview" class="tbview"></div>
               </div>
               <div id="adi-scores" class="yui-hidden">
                   <h3 class="pub-edit-sect">Scores</h3>
                   <div id="score-tbview" class="tbview"></div>
               </div>
             </s:if>   
             <s:else>
             <h3 class="pub-edit-sect">Add a File</h3>               
                <p>If you are a curator or are the owner of this publication, please <a href="javascript:YAHOO.mbi.login.sendUrlFragment();">Log in</a> to add and view attachments. Attachments are not public.</p>
             </s:else>
          </div>
          <!-- watch pane -->
          <div id="watch-pane" class="yui-hidden">
            <s:if test="#session['USER_ID'] > 0">
             <s:form id="watchmgr" theme="simple" action="watchmgr">            
               <s:hidden name="id" value="%{id}"/><s:hidden name="pub.id" value="%{id}"/>
                <div class="top-padding">
                 <fieldset>
                   <legend>
                      <h3>Watch Status</h3>
                   </legend>
                   <p>Watch On <s:hidden name="flags.watch" value="%{flags.watch}"/>
                   <s:checkbox theme="simple" name="flags.watch" cssClass="watch-flag" 
                               fieldValue="true" value="%{flags.watch}"/>
                   <s:submit id="sub-14" disabled="true" theme="simple" name="op.wfls" value="UPDATE" 
                        onclick="return YAHOO.imex.pubedit.watchFlag('update');"/>
                </fieldset>
              </s:form></div>
              </s:if>
              <s:else>
               <h3 class="pub-edit-sect">Publication Watch</h3>
               <p>Please <a href="javascript:YAHOO.mbi.login.sendUrlFragment();">Log in</a> to set/remove a record watch.</p>
            </s:else>
          </div>
          <!-- log pane -->
          <div id="log-pane" class="yui-hidden ">
             <s:form id="cmtmgr" theme="simple" action="attachmgr">
             
                <s:hidden name="id" value="%{id}"/><s:hidden name="pub.id" value="%{id}"/>

               <div id="adi-history" class="yui-hidden">
                   <h3 class="pub-edit-sect">Record History</h3>
                   <div id="history-tbview" class="tbview"></div>
               </div>

             </s:form></div>
       </div>
    </div>
 </div>
 <br/>
 <br/>
 <br/>

<script type="text/javascript">

   // top-level tabs and content
   //---------------------------
   
   YAHOO.util.Event.addListener( 
      window, "load", YAHOO.imex.pubedit.init, 
      {id:"<s:property value="id"/>",
       pmid:"<s:property value="pub.pmid"/>",
       jSpec:"<s:property value="pub.journalSpecific"/>",
       imexACC:"<s:property value="pub.imexId"/>",
       login:"<s:property value="#session['LOGIN']"/>",
       prefs:"<s:property value="#session['PREFS']"/>"
      } 
   );

   YAHOO.util.Event.addListener( window, "load", YAHOO.imex.calendar.init );

   // comment tab table
   //------------------

   YAHOO.util.Event.addListener( window, "load", YAHOO.imex.adi.init, 
         {adid: "comment", tabno: 4, adipane:"adi-comments",
          aditable: "com-tbview", "meta": "attachMeta",
          url:"attachmgr?op.calg=calg&id=",
          rschema: { fields: ["id", "root","subject","body","date","author","flagName"],
                     resultsList: "attach"},
          coldefs: [
                //{key:"id", label:"ID"},
                { key:"author",   label:"Author" /* , width:100,*/ },
                { key:"date",     label:"Date"                            /* , width:240,*/ },
                { key:"subject",  label:"Subject" , formatter: "adi_subject" /* , width:240,*/ },
                { key:"flagName", label:"Flag",     formatter: "adi_flag"     /* , width:240,*/ }
            ],
          id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />",
          loginid:"<s:property value="#session['USER_ID']" />",
          curator:"<s:property value="#session['USER_ROLE'].curator != null" />",   
          owner:"<s:property value="#session['USER_ID'] == pub.owner.id" />"}   
      );


   // attachment tab table (attachments)
   //-----------------------------------
    
   YAHOO.util.Event.addListener( window, "load", YAHOO.imex.adi.init, 
         {adid: "eatt", tabno: 5, adipane:"adi-attachments",
          aditable: "adata-tbview", "meta": "attachMeta",
          url:"attachmgr?op.dalg=dalg&id=",
          rschema: { fields: ["id","aid","root","subject","body","date","author","bodyType","flagName"],
                     resultsList: "attach"},
          coldefs: [
                //{key:"id", label:"ID"},
                { key:"author",   label:"Author" /* , width:100,*/ },
                { key:"date",     label:"Date"                            /* , width:240,*/ },
                { key:"subject",  label:"Subject" , formatter: "adi_asubject" /* , width:240,*/ },
                { key:"bodyType", label:"Format",   formatter: "adi_btype"    /* , width:240,*/ },
                { key:"flagName", label:"Flag",     formatter: "adi_flag"     /* , width:240,*/ },
                { key:"aid",      label:"",         formatter: "adi_dll"      /* , width:240,*/ }
            ],
          id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />",
          loginid:"<s:property value="#session['USER_ID']" />",
          curator:"<s:property value="#session['USER_ROLE'].curator != null" />",   
          owner:"<s:property value="#session['USER_ID'] == pub.owner.id" />"}   
      );

   // attachment tab table (scores)
   //------------------------------

   YAHOO.util.Event.addListener( window, "load", YAHOO.imex.adi.init, 
         {adid:"escore", tabno:5, adipane:"adi-scores",
          aditable: "score-tbview", "meta": "scoreMeta",
          url:"attachmgr?op.dalg=dalg&id=",
          rschema: { fields: ["id","aid","root","date","author","name","value"],
                     resultsList: "score"},
          coldefs: [
                //{key:"id", label:"ID"},
                { key:"author", label:"Author"                          /* , width:100,*/ },
                { key:"date",   label:"Date"                            /* , width:240,*/ },
                { key:"name",   label:"Name",    formatter: "adi_name"  /* , width:240,*/ },
                { key:"value",  label:"Value",   formatter: "adi_value" /* , width:240,*/ }
            ],
          id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />",
          loginid:"<s:property value="#session['USER_ID']" />",
          curator:"<s:property value="#session['USER_ROLE'].curator != null" />",   
          owner:"<s:property value="#session['USER_ID'] == pub.owner.id" />"}   
      );


   // history tab table
   //------------------

   YAHOO.util.Event.addListener( window, "load", YAHOO.imex.adi.init, 
         {adid:"ehist", tabno:7, adipane:"adi-history",
          aditable: "history-tbview", "meta": "attachMeta",
          url:"attachmgr?op.halg=halg&id=",
          rschema: { fields: ["id","root","date","author","subject"],
                     resultsList: "attach"},
          coldefs: [
                //{key:"id", label:"ID"},
                { key:"author",  label:"User"                                 /* , width:100,*/ },
                { key:"date",    label:"Date"                                 /* , width:240,*/ },
                { key:"subject", label:"Operation", formatter: "adi_subject"  /* , width:240,*/ }
            ],
          id:"<s:property value="id"/>",
          imexACC:"<s:property value="pub.imexId"/>",
          login:"<s:property value="#session['LOGIN']" />",
          loginid:"<s:property value="#session['USER_ID']" />",
          curator:"<s:property value="#session['USER_ROLE'].curator != null" />",   
          owner:"<s:property value="#session['USER_ID'] == pub.owner.id" />"}   
     );


   //function attclear(){
   //  try{   
   //    YAHOO.util.Dom.get('attmgr_opp_edan').value='';
   //    YAHOO.util.Dom.get('attmgr_opp_edafile').value='';
   //  }catch(x){};
   //};
   //YAHOO.util.Event.addListener( window, "load", attclear );
 </script>
