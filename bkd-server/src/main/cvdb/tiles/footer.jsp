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
            <img height="40" src="img/ucla-logo_425x200.png" alt="UCLA Logo" border="0">
           </a> 
          </td>
          <td align="left" nowrap>
           Copyright &copy;${bkd.site.copyright.date}<br/>UCLA-DGSOM 
          </td>
         </tr>
        </table>      
       </td>
       
       <td class="cite">
        <b>Cite CVUS:</b> Doe J, <i>et al</i>.
        CVUS Database: .....;
        <i>in preparation.</i> <b>?</b>:?-? (202?).
        [<a href="">Pubmed</a>]
        [<a href="">Article</a>]
       </td>
       
       <td width="5%" class="imexfooter" align="center" nowrap>
        <table align="center" cellpadding="4" cellspacing="0">
         <tr>
          <td>
           <a href="https://www.doe-mbi.ucla.edu" target="vpop">
            <img height="40" src="img/ucla-doe_logo75x75.png" alt="UCLA-DOE IGP Logo" border="0">
           </a> 
          </td>
          <td align="center" nowrap>
           Hosted&nbsp;by<br/>UCLA-DOE&nbsp;IGP
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
