<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<br/><br/><br/><br/><br/><br/>
<h1>Account Settings</h1>
<s:if test="#session['USER_ID'] > 0">  
  <s:form id="uprefmgr-form" class="main-width" action="userprefmgr"
          theme="simple" onsubmit="return false;">
    <div id="uprefmgr-form-data">
    </div>
    <div>
      <div style="display:inline-block; padding: 0 0 0 2em;" >
        <s:submit name="op.update" value="Update" theme="simple" 
           onclick="uprefmgr.submit()"/>
      </div>
      <div style="display:inline-block; padding: 0 0 0 2em;" >
        <s:submit name="op.defset" value="Restore Defaults" theme="simple" 
           onclick="uprefmgr.setDefaults()"/>
      </div>
    </div>
  </s:form>
 <div class="yui-skin-sam" width="100%">
 </div>

 <script type="text/javascript">
   //$('#umgr-tabs').tabs();
   
   var uprefmgr;

   $( function(){
      
         var init = { formid: "userpref-form",
                      owner:"<s:property value='opp.ou'/>",
                      admus:"<s:property value='opp.au'/>",
                      cflag:"<s:property value='opp.encf'/>", 
                      login:"<s:property value="#session['LOGIN']" />",
                      loginid:"<s:property value="#session['USER_ID']" />" };

         init['loginid']=41;
         init['login']='ADMIN';

         uprefmgr = new BkdUserPrefMgr( { url: "userprefmgr",
                                          form: "#uprefmgr-form",
                                          anchor: "#uprefmgr-form-data" });
         uprefmgr.initialize( init );
      });
        
  </script>
</s:if>
<s:else>
  You must be logged in to access user preferences editor.
</s:else>
</br></br></br>
