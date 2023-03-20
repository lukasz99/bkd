<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<div id="footer">
 <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
   <td>
    <table width="100%" class="footer" cellpadding="0" cellspacing="0">
     <s:if test="#session['USER_ROLE'].administrator != null or
                 #session['USER_ROLE'].editor != null" >
      <t:insertAttribute name="edit" ignore="true"/>
     </s:if>
     <tr>
      <td width= "1%" class="imexfooter" nowrap>      
        <table align="center" cellpadding="4" cellspacing="0">
         <tr>
          <td>
           <a href="" target="vpop">
            <img height="40" src="img/ucla-doe_logo75x75.png" alt="UCLA-DOE Logo" border="0">
           </a>
          </td>
          <td align="left" nowrap>
           Copyright ${bkd.site.copyright.date}<br/>UCLA-DOE&nbsp;IGP 
          </td>
         </tr>
        </table>      
      </td>

      <td class="cite">
        <b>Cite DIP:</b>
        Salwinski L, Miller CS, Smith AJ, Pettit FK, Bowie JU, Eisenberg D. (2004)
        The Database of Interacting Proteins: 2004 update.
        <i>NAR</i> <b>32</b>:D449-51.
        [<A HREF="http://www.ncbi.nlm.nih.gov:80/entrez/query.fcgi?cmd=Retrieve&amp;db=PubMed&amp;list_uids=14681454&amp;dopt=Abstract">Pubmed</A>]
        [<A HREF="http://nar.oupjournals.org/cgi/content/full/32/suppl_1/D449">Article</A>]
      </td>
      
       <td width="1%" class="imexfooter">
        <table align="center" cellpadding="4" cellspacing="0">
         <tr>
          <td>
           <a href="https://www.imexconsortium.org/" target="vpop">
            <img height="40" src="img/imex_logo75x75.png" alt="IMEx Logo" border="0">
           </a>
          </td>
          <td align="left" nowrap>
           A member of the IMEx Consortium<br />of Molecular Interaction providers
          </td>
         </tr>
        </table>
       </td>
     </tr>
    </table>
   </td>
  </tr>
  <tr>
   <td align="center" width="100%">
    <table width="98%" cellspacing="0">
     <tr>
      <td align="left" nowrap>
       <font size="-5">Ver: ${project.version} ($Build: ${project.timestamp}$)</font>
      </td>
      <td align="right" nowrap>
       <font size="-5">
         <i>Code &amp; Design: <A HREF="mailto:lukasz@mbi.ucla.edu">LS</A>.</i>
       </font>
      </td>
     </tr>
    </table>
   </td>
  </tr>
 </table>
</div>
