<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<h1>Activate ImexCentral Account</h1>
<table width="98%">
 <tr>
  <td align="left">
   <font size="-1"> 
    The activation key was sent to the e-mail address you used when creating 
    the account.  Please, 
    <A HREF="mailto:dip@mbi.ucla.edu">contact us</A> if the
    activation key has not arrived within a few minutes after
    account creation (did you check your spam/junk folder ?)   
   </font>
  </td>
 </tr>
 <tr>
  <td align="left">
   <br/>
   <table width="66%" cellspacing="1" cellpadding="3">
    <s:form theme="simple" action="user"> 
    <s:hidden theme="simple" name="op" value="act" />
    <tr>
     <td align="right" class="tcell">User Name</td>
     <td align="left" class="tcell">
      <s:textfield theme="simple" name="user.login" size="16" maxlength="16" /> (case sensitive)
     </td>
    </tr>
    <s:if test="hasFieldErrors()">
     <s:if test="fieldErrors['pass0']!=null">
       <tr><td colspan="2">
        <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
         <span class="error">
          <span class="errorMessage">
           <s:property value="fieldErrors['pass0'][0]" />
          </span>
         </span>
        </div>
       </td></tr>
     </s:if>
    </s:if>
    <tr>
     <td align="right" class="tcell">Password</td>
     <td align="left" class="tcell">
      <s:password theme="simple" name="pass0" size="48" maxlength="48" />
     </td>
    </tr>
    <s:if test="hasFieldErrors()">
     <s:if test="fieldErrors['user.activationKey']!=null">
       <tr><td colspan="2">
        <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
         <span class="error">
          <span class="errorMessage">
           <s:property value="fieldErrors['user.activationKey'][0]" />
          </span>
         </span>
        </div>
       </td></tr>
     </s:if>
    </s:if>
    <tr>
     <td align="right" class="tcell">Activation Key</td>
     <td align="left" class="tcell">
      <s:textfield theme="simple" name="user.activationKey" size="48" maxlength="48" />
     </td>
    </tr>
    <tr>
     <td align="right" class="tcell">&nbsp;</td>
     <td align="left" class="tcell">
       <s:submit theme="simple" name="activate" value="ACTIVATE" />
     </td>
    </tr>
    </s:form>
   </table>
   <br/><br/><br/><br/><br/>
   <br/><br/><br/><br/><br/>
   <br/><br/><br/><br/><br/>
   <br/><br/><br/><br/><br/>
  </td>
 </tr>
</table>
