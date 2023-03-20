<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<s:if test="captcha != null and captcha.active">
 <script src="${dipsite.recaptcha.apiURL}" async defer></script>
</s:if>
<br/><br/><br/><br/><br/><br/>
<h1>Contact Us</h1>
<table width="98%" cellspacing="10">
 <tr>
  <td align="left" colspan="2">
   To send us comments, please complete the form below<br/>
   or send them directly to:
   <A HREF="mailto:${bkd.contact}">${bkd.contact}</A>
   <br/>
  </td>
 </tr>
 <tr>
  <td colspan="1" align="center">
   <s:form id="feedback" action="feedback" theme ="simple">
    <s:hidden name="captchaResponse" value=""/>
    <table width="96%">
     <tr>
      <th width="10%"  align="right">Subject</th>
      <td width="90%"  align="left">
       <s:select name="about" list="#{'general':'General comment',
                                      'request':'Request a feature',
                                      'bug':'Bug report'}" />
      </td>
     </tr>
     <tr>
      <th width="10%" colspan="1" align="right">Comments</th>
      <td width="90%" colspan="2"  align="left">
       <s:if test="hasFieldErrors()">
        <s:if test="fieldErrors['comment']!=null">
         <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
          <span class="error">
           <span class="errorMessage">
            <s:property value="fieldErrors['comment'][0]" />
           </span>
          </span>
         </div>
        </s:if>
       </s:if>
       <s:textarea name="comment"  rows="8" cols="64"/>
      </td>
     </tr>
     <s:if test="#session['USER_ID'] <= 0" >
      <tr>
       <th width="10%"  align="right">Your E-mail</th>
       <td width="90%"  align="left">
        <s:textfield  name="email"  size="32" maxlength="80" />(optional)
       </td>
      </tr>
      <tr>
        <td colspan="2"><br/></td>
      </tr>

      <s:if test="captcha != null and captcha.active">
      <tr>
       <th align="right" valign="middle">
         Robot<br/>Test
       </th>
       <td align="left">
        <table cellpadding="0" cellspacing="0" >
         <tr>
          <s:if test="hasActionErrors()">
          <th align="left" class="tcell">                     
            <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
             <span class="error">
              <s:iterator value="actionErrors">
               <span class="errorMessage"><s:property escapeHtml="false" /></span>
             </s:iterator>
             </span>
            </div>
          </th>
          </s:if>
         </tr>
         <tr>
          <td align="left" valign="middle">
            <div class="g-recaptcha" data-sitekey="${dipsite.recaptcha.publicKey}"></div>
          </td>
         </tr>
        </table>
       </td>
      </tr>
      </s:if>       
     </s:if>
     <tr>
      <td align="left" colspan="2">
       <s:submit name="submit"
                 value="Submit"
                 onclick="var res = grecaptcha.getResponse(); $('#register_captchaResponse').val(res);"/>
      </td>
     </tr>
    </table>
   </s:form>
  </td>
 </tr>
</table>
<br/>
<br/>
