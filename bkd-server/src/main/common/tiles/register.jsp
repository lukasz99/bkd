<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>

<s:if test="captcha != null and captcha.active">
 <script src="${dipsite.recaptcha.apiURL}" async defer></script>
</s:if>

 <div class="main-width">
 </br></br></br></br></br></br>
 <h1>Sign up for ${bkd.site} Account</h1>  

 <p>Already have an account? <a href="user">Log in</a></p>
 <p>Forgotten your password? <a href="mailto:${bkd.contact}">Contact Us</a></p>

 <s:form action="register">
  <s:hidden theme="simple" name="op" value="reg" />
  <s:hidden name="captchaResponse" value=""/>  
  <div class="pub-edit-head">
   <h2>User Registraton</h2>
  </div>
  <div class="top-padding">
   <fieldset>
    <legend><h3>Login</h3></legend>
    <div class="field-padding">
    <strong>User Name</strong>
    <s:if test="hasFieldErrors()">
     <s:if test="fieldErrors['user.login']!=null">  
      <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
       <span class="error">
        <span class="errorMessage">
         <s:property value="fieldErrors['user.login'][0]" />
        </span>
       </span>
       </div>
     </s:if>
    </s:if>
    <s:textfield theme="simple" 
                 name="user.login" size="32" maxlength="32" />
    <s:if test="hasFieldErrors()">
     <s:if test="fieldErrors['pass1']!=null">  
      <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
        <span class="error">
        <span class="errorMessage">
         <s:property value="fieldErrors['pass1'][0]" />
        </span>
       </span>
      </div>
     </s:if>
    </s:if>
   </div>
     
   <div class="field-padding"><strong>Password</strong>
     <s:password theme="simple"
          name="pass0" size="24" maxlength="24" />
   </div>
   <div class="field-padding"><strong>Password</strong> (retype) 
     <s:password theme="simple"
         name="pass1" size="24" maxlength="24" />
   </div>
   </fieldset>
  </div>
  
  <div class="top-padding">
   <fieldset>
    <legend><h3>Contact</h3></legend>
     
    <div class="field-padding"><strong>First Name</strong>
     <s:textfield labelSeparator="" theme="simple"
      name="user.firstName" size="32" maxlength="64" />
    </div>
    <div class="field-padding"><strong>Last Name</strong>            
     <s:textfield labelSeparator="" theme="simple"
       name="user.lastName" size="32" maxlength="64" />
    </div>
    <div class="field-padding"><strong>Organization</strong>
     <s:textfield labelSeparator="" theme="simple"
       name="user.affiliation" size="32" maxlength="64" />
    </div>
    <div class="field-padding"><strong>E-Mail</strong>
     <s:textfield labelSeparator="" theme="simple"
       name="user.email" size="32" maxlength="64" />
    </div>
   </fieldset>
  </div>

  <div class="top-padding">
   <fieldset>   
    <legend><h3>Terms of Use</h3></legend>

    <div class="field-padding">
     <s:if test="hasFieldErrors()">
      <s:if test="fieldErrors['agree']!=null"> 
       <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
        <span class="error">
         <span class="errorMessage">
          <s:property value="fieldErrors['agree'][0]" />
         </span>
        </span>
       </div>
      </s:if>
     </s:if>
     <s:checkbox theme="simple" name="agree" value="false"/>  
      I represent that I have read and accepted the  
      <a href="page?id=termsofuse&mdf=0:2:0&mst=3:0:0">Terms of Use</a>.
    </div>
    
    <s:if test="captcha != null and captcha.active">
    <div class="field-padding">
       <div class="center captcha-width">
         <s:if test="hasActionErrors()">
         <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
           <span class="error">
             <s:iterator value="actionErrors">
               <span class="errorMessage"><s:property default="" /></span>
             </s:iterator>
           </span>
         </div>
         </s:if>
         <div class="g-recaptcha" data-sitekey="${dipsite.recaptcha.publicKey}"></div> 
       </div>
    </div>  
    </s:if>
   </fieldset>
  </div>
  
  <div class="reg-submit">
  <p>You will be notified about account creation and the initial password by
      an <em>e-mail</em> sent to the address specified above.
  </p>
  <center> 
   <s:submit theme="simple" name="submit" value="Submit"
             onclick="var res = grecaptcha.getResponse(); $('#register_captchaResponse').val(res);"/>
  </center>
 </div>   
 </s:form>
</div>

