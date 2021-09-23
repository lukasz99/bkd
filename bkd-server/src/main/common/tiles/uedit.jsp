<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>ImexCentral Acount Settings</h1>
<table width="98%">
 <tr>
  <td align="center">
   <table width="98%" class="form_descr">
    <tr>
     <td align="left">
       ImexCentral account modification.
     </td>
    </tr>
   </table>
  </td>
 </tr>
 <tr>
  <td align="center">
   <s:form action="uedit"><tr><td align="center">
    <s:hidden theme="simple" name="op" value="edit" />
    <table width="85%" cellpadding="0" cellspacing="2">
     <tr>
      <td class="clogin">
       <table width="100%">
        <tr>
         <td align="center"><b>
          User Account Settings</b>
         </td>
        </tr>
       </table>
      </td>
     </tr>

     <tr>
      <td align="center">
       <table width="95%" cellpadding="0" cellspacing="0">
        <tr>
         <td align="center" colspan="1" class="clogin1">
          <table width="98%" cellspacing="1" cellpadding="3">
           <tr>
            <td class="tcell" align="center" colspan="3">
             <b>User Name:
             <i><s:property value="user.login" /></i></b>

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
            </td>
           </tr>
           <tr>
            <td width="33%" align="center" nowrap>
               <b>Pass</b> (old)
               <s:password theme="simple"
                            name="pass0" size="16" maxlength="16" />
            </td>  
            <td width="34%" align="center" nowrap>
               <b>Pass</b> (new)
               <s:password theme="simple"
                            name="pass1" size="16" maxlength="16" />
            </td>  
            <td width="33%" align="canter" nowrap>
               <b>Pass</b> (retype) 
               <s:password theme="simple"
                           name="pass2" size="16" maxlength="16" />
            </td>
           <tr>
          </table>
         </td>
        </tr>
       </table>
      </td>  
     </tr>
      
     <tr>
      <td align="center">
       <table width="95%" cellpadding="0" cellspacing="0">    
        <tr>
         <td align="center" colspan="1" class="clogin1">
          <table width="98%" cellspacing="1" cellpadding="3">

           <s:textfield label="First Name" labelSeparator=""
                        name="user.firstName" size="32" maxlength="64" />
           <s:textfield label="Last Name" labelSeparator=""
                        name="user.lastName" size="32" maxlength="64" />
           <s:textfield label="Organization" labelSeparator=""
                        name="user.affiliation" size="32" maxlength="64" />
           <s:textfield label="E-Mail" labelSeparator=""
                        name="user.email" size="32" maxlength="64" />
           	
           <s:if test="hasFieldErrors()">
            <s:if test="fieldErrors['agree']!=null">  
             <tr>
              <td colspan="2" align="center">
               <div id="errorDiv" style="padding-left: 10px; margin-bottom: 5px">
                 <span class="error">
                  <span class="errorMessage">
                   <s:property value="fieldErrors['agree'][0]" />
                  </span>
                 </span>
               </div>
              </td>
             </tr>
            </s:if>
           </s:if>
          </table>
         </td>
        </tr>
       </table>
      </td>
     </tr>

     <tr>
      <td align="center" CLASS="clogin">
       <table cellpadding="5" width="100%">
        <tr>
         <td align="left">
          <s:submit theme="simple" name="uedit" value="SAVE" />
         </td>
         <td>
          <font size=-1>&nbsp;</font>
         </td>
         <td align="right">
          <s:submit theme="simple" name="uedit" value="RESET" />
         </td> 
        </tr>
       </table>
      </td>
     </tr>

    </table>
   </td></tr></s:form>      
  </td>
 </tr>
 <tr>
  <td> 
   <br/><br/><br/><br/>
   <br/><br/><br/><br/>
  </td>
 </tr>
</table>

