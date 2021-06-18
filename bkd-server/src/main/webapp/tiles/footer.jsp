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
      <td class="copyright2" nowrap>
       Copyright ${site.copyright}<br/>UCLA DGSOM
      </td>
      <td class="cite">
        <b>Cite CVUS:</b> Doe J, <i>et al</i>.
        CVUS Database: .....;
        <i>in preparation.</i> <b>?</b>:?-? (202?).
        [<a href="">Pubmed</a>]
        [<a href="">Article</a>]
      </td>
      <td width="5%" class="copyright3" align="center" nowrap>
       <A HREF="">Source</br>Code</A>.
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
