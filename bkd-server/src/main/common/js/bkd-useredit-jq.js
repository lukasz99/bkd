console.log("bkd-useredit: common");

class BkdUserEditor {
    
    constructor( conf ){
        
        if( conf !== undefined ){
            this.conf = conf;
        } else {
            this.conf = {   // defaults
                url: "useredit?"
            };
        }
        
        this.anchor = "";
        this.data = {uid:null};        
    }

    initialize( init ){
        console.log( "bkd-usereditor: initialize");
        console.log( "init: ", init );
        if( init['uid'] !== undefined ) this.data.uid= init['uid'];
        
    }
/*    
    userPass(op) {
        
        var setPassCallback = { cache:false, timeout: 5000, 
                                 success: YAHOO.imex.useredit.passUpdate,
                                 failure: YAHOO.imex.useredit.passUpdateFail,
                                 argument:{ id:YAHOO.imex.useredit.uid } };
        try{            
            if( op === 'update' ) {
                YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.prs=update' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.pass1=' + YAHOO.util.Dom.get("usermgr_opp_pass1").value
                                   + '&opp.pass2=' + YAHOO.util.Dom.get("usermgr_opp_pass2").value, 
                                   setPassCallback );
            } 
            
        } catch (x) {
            alert("AJAX Error: " + x );
        }   
        return false; 
    }
    
    passUpdate( o ) {
        try {
            if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
                var messages = YAHOO.lang.JSON.parse( o.responseText );
                
                YAHOO.util.Dom.get("usermgr_opp_pass1").value = "";
                YAHOO.util.Dom.get("usermgr_opp_pass2").value = "";
            }
        } catch(x) {
            alert("AJAX Error: " + x );
        }
    }
    
    passUpdateFail( o ) {
        alert( "AJAX Error passUpdate update failed: id=" + o.argument.id ); 
    }
*/

    userPass(op) {
        if( op === 'update' ) {

            var payload = { 'op.prs':'update',
                            'id': this.data.uid,
                            'opp.pass1':$("#usermgr_opp_pass1").val(),
                            'opp.pass2':$("#usermgr_opp_pass2").val()
                          };
            
            $.post(this.conf.url, payload,
                   function(result){
                       //console.log(result);
                   });
        }  
        return false; 
    }
    
    userInfo(op) {

        var payload = { 'op.pup':'update',
                        'id': this.data.uid,
                        'user.activated': $('input[name="user.activated"]:checked').val(),
                        'user.enabled': $('input[name="user.enabled"]:checked').val(),
                        'user.firstName': $("#usermgr_user_firstName").val(),
                        'user.lastName': $("#usermgr_user_lastName").val(),
                        'user.title': $("#usermgr_user_title").val(),
                        'user.affiliation': $("#usermgr_user_affiliation").val(),
                        'user.email': $("#usermgr_user_email").val()
                      };
        
        $.post(this.conf.url, payload,
               function(result){
                   //console.log(result);
               });
        return false; 
    }

    userRole(op){
        console.log("userRole(op): " + op);
        if( op === 'add' ) {
            
            var payload = { 'op.radd':'add',
                            'id': this.data.uid,
                            'opp.radd': $("#usermgr_opp_radd").val()
                          };
            
            $.post(this.conf.url, payload,
                   function(result){
                       //console.log(result);
                   });
            return false; 
        }

        if( op === 'drop' ) {
            
            var drops = $(".user-role-drop");
            var rdel = ",";
            
            for( var i = 0; i < drops.length; i++ ) {
                console.log(drops[i].checked + ":" + drops[i].value);
               if( drops[i].checked ) {
                   rdel = rdel + drops[i].value + ",";
               }
            } 
            
            if( rdel !== "," ) {   
                rdel = rdel.substring(1,rdel.length-1)                  
            } else {
                rdel ="";
            }
            
            console.log("rdel:" + rdel);

            var payload = { 'op.rdel':'update',
                            'id': this.data.uid,
                            'opp.rdel': rdel
                          };
            
            $.post(this.conf.url, payload,
                   function(result){
                       //console.log(result);
                   });
            
            return false;
        }
        return false;
    }

    userGroup(op) {
        console.log("userGroup(op): " + op);
        if( op === 'add' ) {
            
            var payload = { 'op.gadd':'add',
                            'id': this.data.uid,
                            'opp.gadd': $("#usermgr_opp_gadd").val()
                          };
            
            $.post(this.conf.url, payload,
                   function(result){
                       //console.log(result);
                   });
            return false; 
        }

        if( op === 'drop' ) {
            
            var drops = $(".user-group-drop");
            var gdel = ",";
            
            for( var i = 0; i < drops.length; i++ ) {
                if( drops[i].checked ) {
                    rdel = rdel + drops[i].value + ",";
                }
            } 
            
            if( gdel !== "," ) {   
                gdel = gdel.substring(1,gdel.length-1)                  
            } else {
                gdel ="";
            }            
            console.log("gdel:" + gdel);
            var payload = { 'op.gdel':'update',
                            'id': this.data.uid,
                            'opp.gdel': gdel
                          };
            
            $.post(this.conf.url, payload,
                   function(result){
                       //console.log(result);
                   });
            return false;
        }
        return false; 
    }
    
/*        
    userRole(op) {
    
    
        var setRoleCallback = { cache:false, timeout: 5000, 
                                success: YAHOO.imex.useredit.roleUpdate,
                                failure: YAHOO.imex.useredit.roleUpdateFail,
                                argument:{ id:YAHOO.imex.useredit.uid } };
        try{            
            if( op === 'add' ) {
                YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.radd=add' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.radd=' + YAHOO.util.Dom.get("usermgr_opp_radd").value,
                                   setRoleCallback );
            }
            
            if( op === 'drop' ) {
                
                var drops = YAHOO.util.Dom.getElementsByClassName("user-role-drop");
                var rdel = ",";
                
                for( var i = 0; i < drops.length; i++ ) {
                    if( drops[i].checked ) {
                        rdel = rdel + drops[i].value + ",";
                    }
                } 
                
                if( rdel === "," ) {               
                    if(drops.checked) {
                        rdel = rdel + drops.value + ",";
                    }
                }
                
                if( rdel !== "," ) {   
                    rdel = rdel.substring(1,rdel.length-1)                  
                    YAHOO.util.Connect
                        .asyncRequest( 'GET', 
                                       'useredit?op.rdel=update' 
                                       + '&id=' + YAHOO.imex.useredit.uid
                                       + '&opp.rdel=' + rdel,
                                       setRoleCallback );
                }
            }
            
        } catch (x) {
            alert("AJAX Error: " + x );
        }   
        return false; 
    }
    
    roleUpdate( o ) {
        try {
            if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
                var messages = YAHOO.lang.JSON.parse( o.responseText );
                
                var lur = YAHOO.util.Dom.get( "li-user-role" );
                var nih = "";
                
                for( var i = 0; i < messages.user.roles.length; i++ ) {
                    
                    nih = nih + '<input type="checkbox" id="pub-acc-edit_opp_eaudel" value="' + 
                        messages.user.roles[i].id +
                        '" name="opp.eaudel" class="user-role-drop">';
                    
                    nih = nih + messages.user.roles[i].name;
                }              
                lur.innerHTML = nih;
                YAHOO.util.Dom.get("usermgr_opp_radd").value =-1;
            }
        } catch(x) {
            alert("AJAX Error: " + x );
        }
    }
    
    roleUpdateFail( o ) {
        alert( "AJAX Error roleUpdate update failed: id=" + o.argument.id ); 
    }
    
    userGroup(op) {
        
        var setGroupCallback = { cache:false, timeout: 5000, 
                                 success: YAHOO.imex.useredit.groupUpdate,
                                 failure: YAHOO.imex.useredit.gropuUpdateFail,
                                 argument:{ id:YAHOO.imex.useredit.uid } };
        try{            
            if( op === 'add' ) {
                YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.gadd=add' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.gadd=' + YAHOO.util.Dom.get("usermgr_opp_gadd").value,
                                   setGroupCallback );
            } 
            if( op === 'drop' ) {
                
                var drops = YAHOO.util.Dom.getElementsByClassName("user-group-drop");
                var gdel = ",";
                
                for( var i = 0; i < drops.length; i++ ) {
                    if( drops[i].checked ) {
                        gdel = gdel + drops[i].value + ",";
                    }
                } 
                
                if( gdel === "," ) {               
                    if(drops.checked) {
                        gdel = gdel + drops.value + ",";
                    }
                }
                if( gdel !== "," ) {   
                    gdel = gdel.substring(1,gdel.length-1)
                    YAHOO.util.Connect
                        .asyncRequest( 'GET', 
                                       'useredit?op.gdel=update' 
                                       + '&id=' + YAHOO.imex.useredit.uid
                                       + '&opp.gdel=' + gdel,
                                       setGroupCallback );
                }
            }
            
        } catch (x) {
            alert("AJAX Error: " + x );
        }   
        return false; 
    }
    
    groupUpdate( o ) {
        try {
            if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
                var messages = YAHOO.lang.JSON.parse( o.responseText );
                
                var lug = YAHOO.util.Dom.get( "li-user-group" );
                var nih = "";

                for( var i = 0; i < messages.user.groups.length; i++ ) {
                    
                    nih = nih + '<input type="checkbox" id="pub-acc-edit_opp_eaudel" value="' + 
                        messages.user.groups[i].id +
                        '" name="opp.eaudel" class="user-group-drop">';
                    
                    nih = nih + messages.user.groups[i].name;
                }              
                lug.innerHTML = nih;
                YAHOO.util.Dom.get("usermgr_opp_gadd").value = -1;
            }
        } catch(x) {
            alert("AJAX Error: " + x );
        }
    }
    
    groupUpdateFail( o ) {
        alert( "AJAX Error groupUpdate update failed: id=" + o.argument.id ); 
    }
*/
}






/*

YAHOO.namespace("imex");

YAHOO.imex.useredit = {

    pubId: 0,
    pubPmid: null,
    pubJSpec: null,
    stateButton: null,
    prefs: null,
    aidx: -1,
    subCnt: 14,

    init: function( obj ){

        //tabView = new YAHOO.widget.TabView("mgr-tabs");
        //console.log( obj.prefs );

        var myself = YAHOO.imex.useredit;
        
        myself.uid = obj.uid;
        myself.container = obj.container;

        
        // main tab panel
        //---------------

        console.log( "useredit-yui.js: container=" + myself.container );

        myself.tabs = new YAHOO.widget.TabView( myself.container );
        
        myself.tabs.addListener( "activeTabChange", 
                                 YAHOO.imex.useredit.handleHistoryNavigation); 

        myself.tabs.addListener("activeTabChange", 
                                 YAHOO.imex.useredit.refresh); 
                                          
        myself.historyInit();

    },

    refresh: function ( o ) {
       console.log( "refresh: called" );
       var idx = YAHOO.imex.useredit.tabs.get('activeIndex');
       console.log( "reloadTabPane: active index " + idx );

    },  

    historyInit: function(){
      var bookmarkedTabViewState = YAHOO.util.History.getBookmarkedState("useredit");
      var initialTabViewState = bookmarkedTabViewState || "tab0";
      var tabManager = YAHOO.imex.useredit;
      YAHOO.util.History.register("useredit", initialTabViewState, this.historyReadyHandler);      
      YAHOO.util.History.onReady( tabManager.historyReadyHandler );
      try {
        YAHOO.util.History.initialize("yui-history-field", "yui-history-iframe");
      } catch (x) {
        alert(x);
      }
    },

    historyReadyHandler: function(){
        var tabManager = YAHOO.imex.useredit;
        
        //gets the curent state in the yui history. 
        var state =  YAHOO.util.History.getCurrentState("useredit"); 

        //sets the active tab by index number
        tabManager.tabs.set("activeIndex", state.substr(3)); 

        //hack to remove focus from the last clicked button staying highlighted on back navigation
        document.getElementsByClassName("selected")[0].firstChild.focus();

    },
    
    handleHistoryNavigation: function(state){
        var tabManager = YAHOO.imex.useredit;
        var currentState, newState,newTab;
        //gets the state of the tab from the object passed from the click listener
        var newTab =  tabManager.tabs.getTabIndex(state.newValue);
        if( newTab === null ){
            YAHOO.util.History.navigate("useredit", "tab0");
        }
        var newState = "tab" + newTab;
        
        try {
            currentState = YAHOO.util.History.getCurrentState("useredit");
            // The following test is crucial. Otherwise, we end up circling forever.
            // Indeed, YAHOO.util.History.navigate will call the module onStateChange
            // callback, which will call this handler and it keeps going from here...
            if (newState != currentState && newState != "tabnull") {
                YAHOO.util.History.navigate("useredit", newState);
            }
        } catch (e) {
            alert(e);
        } 
     },
     
     aclErrorTest: function(responseText){
        var acl = /ACL Violation/; 
        if( acl.test( responseText ) ) {
            var aclViolation = {};
            aclViolation.title = "ACL Violation";
            
            var start = responseText.indexOf("<center>");
            var end = responseText.indexOf("</center>") + "</center>".length;
            var inject = responseText.slice(start, end );
            aclViolation.body = inject;
            YAHOO.mbi.modal.spcstat( aclViolation );
            return true;
        }
        return false;
     },

     userPass: function(op) {
        
        var setPassCallback = { cache:false, timeout: 5000, 
                                 success: YAHOO.imex.useredit.passUpdate,
                                 failure: YAHOO.imex.useredit.passUpdateFail,
                                 argument:{ id:YAHOO.imex.useredit.uid } };
        try{            
            if( op === 'update' ) {
                YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.prs=update' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.pass1=' + YAHOO.util.Dom.get("usermgr_opp_pass1").value
                                   + '&opp.pass2=' + YAHOO.util.Dom.get("usermgr_opp_pass2").value, 
                                   setPassCallback );
            } 

        } catch (x) {
            alert("AJAX Error: " + x );
        }   
        return false; 
     },

     passUpdate: function ( o ) {
        try {
            if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
                var messages = YAHOO.lang.JSON.parse( o.responseText );
                
                YAHOO.util.Dom.get("usermgr_opp_pass1").value = "";
                YAHOO.util.Dom.get("usermgr_opp_pass2").value = "";
            }
        } catch(x) {
            alert("AJAX Error: " + x );
        }
     },

     passUpdateFail: function ( o ) {
        alert( "AJAX Error passUpdate update failed: id=" + o.argument.id ); 
     },

     userInfo: function(op) {
        
        var setInfoCallback = { cache:false, timeout: 5000, 
                                 success: YAHOO.imex.useredit.infoUpdate,
                                 failure: YAHOO.imex.useredit.infoUpdateFail,
                                 argument:{ id:YAHOO.imex.useredit.uid } };
        try{            
            if( op === 'update' ) {
                YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.pup=update' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&user.firstName=' + YAHOO.util.Dom.get("usermgr_user_firstName").value
                                   + '&user.lastName=' + YAHOO.util.Dom.get("usermgr_user_lastName").value 
                                   + '&user.affiliation=' + YAHOO.util.Dom.get("usermgr_user_affiliation").value
                                   + '&user.email=' + YAHOO.util.Dom.get("usermgr_user_email").value,                                   
                                   setInfoCallback );                                   
            } 

        } catch (x) {
            alert("AJAX Error: " + x );
        }   
        return false; 
     },

     infoUpdate: function ( o ) {
       try{
         if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
           var messages = YAHOO.lang.JSON.parse( o.responseText );
                
           uactivated = "";
           uenabled = "";
                 
           var aele = document.getElementsByName('user.activated');
           for( i = 0; i < aele.length; i++ ){
             if( aele[i].checked ){
               uactivated = aele[i].value; 
             }
           }

           var eele = document.getElementsByName('user.enabled');
             for( i = 0; i < eele.length; i++ ){
               if (eele[i].checked ){
                 uenabled = eele[i].value; 
               }
           }

           var setActEnCallback = { cache:false, timeout: 5000, 
                                    success: YAHOO.imex.useredit.actEnUpdate,
                                    failure: YAHOO.imex.useredit.actEnUpdateFail,
                                    argument:{ id:YAHOO.imex.useredit.uid } };

           YAHOO.util.Connect.asyncRequest( 'GET', 
                                            'useredit?op.sup=update' 
                                            + '&id=' + YAHOO.imex.useredit.uid
                                            + '&user.activated=' + uactivated
                                            + '&user.enabled=' + uenabled,
                                            setActEnCallback );                               
            }
        }catch( x ){
            alert("AJAX Error: " + x );
        }
     },

     infoUpdateFail: function ( o ) {
        alert( "AJAX Error userInfo update failed: id=" + o.argument.id ); 
     },

     actEnUpdate: function ( o ) {
       try{
         if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
           var messages = YAHOO.lang.JSON.parse( o.responseText );

         }
       }catch( x ){
         alert("AJAX Error: " + x ); 
       }
     },

     actEnUpdateFail: function ( o ) {
        alert( "AJAX Error userActEn update failed: id=" + o.argument.id ); 
     },

     userRole: function(op) {
        
        var setRoleCallback = { cache:false, timeout: 5000, 
                                 success: YAHOO.imex.useredit.roleUpdate,
                                 failure: YAHOO.imex.useredit.roleUpdateFail,
                                 argument:{ id:YAHOO.imex.useredit.uid } };
        try{            
            if( op === 'add' ) {
                YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.radd=add' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.radd=' + YAHOO.util.Dom.get("usermgr_opp_radd").value,
                                   setRoleCallback );
            }
            
            if( op === 'drop' ) {
                
                var drops = YAHOO.util.Dom.getElementsByClassName("user-role-drop");
                var rdel = ",";
                
                for( var i = 0; i < drops.length; i++ ) {
                    if( drops[i].checked ) {
                        rdel = rdel + drops[i].value + ",";
                    }
                } 

                if( rdel === "," ) {               
                    if(drops.checked) {
                        rdel = rdel + drops.value + ",";
                    }
                }

                if( rdel !== "," ) {   
                  rdel = rdel.substring(1,rdel.length-1)                  
                  YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.rdel=update' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.rdel=' + rdel,
                                   setRoleCallback );
                }
            }

        } catch (x) {
            alert("AJAX Error: " + x );
        }   
        return false; 
     },

     roleUpdate: function ( o ) {
        try {
            if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
                var messages = YAHOO.lang.JSON.parse( o.responseText );

                var lur = YAHOO.util.Dom.get( "li-user-role" );
                var nih = "";

                for( var i = 0; i < messages.user.roles.length; i++ ) {
                    
                    nih = nih + '<input type="checkbox" id="pub-acc-edit_opp_eaudel" value="' + 
                        messages.user.roles[i].id +
                        '" name="opp.eaudel" class="user-role-drop">';
                
                    nih = nih + messages.user.roles[i].name;
                }              
                lur.innerHTML = nih;
                YAHOO.util.Dom.get("usermgr_opp_radd").value =-1;
            }
        } catch(x) {
            alert("AJAX Error: " + x );
        }
     },

     roleUpdateFail: function ( o ) {
        alert( "AJAX Error roleUpdate update failed: id=" + o.argument.id ); 
     },

     userGroup: function(op) {
        
        var setGroupCallback = { cache:false, timeout: 5000, 
                                 success: YAHOO.imex.useredit.groupUpdate,
                                 failure: YAHOO.imex.useredit.gropuUpdateFail,
                                 argument:{ id:YAHOO.imex.useredit.uid } };
        try{            
            if( op === 'add' ) {
                YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.gadd=add' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.gadd=' + YAHOO.util.Dom.get("usermgr_opp_gadd").value,
                                   setGroupCallback );
            } 
            if( op === 'drop' ) {

                var drops = YAHOO.util.Dom.getElementsByClassName("user-group-drop");
                var gdel = ",";
                
                for( var i = 0; i < drops.length; i++ ) {
                    if( drops[i].checked ) {
                        gdel = gdel + drops[i].value + ",";
                    }
                } 

                if( gdel === "," ) {               
                    if(drops.checked) {
                        gdel = gdel + drops.value + ",";
                    }
                }
                if( gdel !== "," ) {   
                   gdel = gdel.substring(1,gdel.length-1)
                   YAHOO.util.Connect
                    .asyncRequest( 'GET', 
                                   'useredit?op.gdel=update' 
                                   + '&id=' + YAHOO.imex.useredit.uid
                                   + '&opp.gdel=' + gdel,
                                   setGroupCallback );
                }
            }

        } catch (x) {
            alert("AJAX Error: " + x );
        }   
        return false; 
     },

     groupUpdate: function ( o ) {
        try {
            if( YAHOO.imex.useredit.aclErrorTest( o.responseText ) == false ) {
                
                var messages = YAHOO.lang.JSON.parse( o.responseText );

                var lug = YAHOO.util.Dom.get( "li-user-group" );
                var nih = "";

                for( var i = 0; i < messages.user.groups.length; i++ ) {
                    
                    nih = nih + '<input type="checkbox" id="pub-acc-edit_opp_eaudel" value="' + 
                        messages.user.groups[i].id +
                        '" name="opp.eaudel" class="user-group-drop">';

                    nih = nih + messages.user.groups[i].name;
                }              
                lug.innerHTML = nih;
                YAHOO.util.Dom.get("usermgr_opp_gadd").value = -1;
            }
        } catch(x) {
            alert("AJAX Error: " + x );
        }
     },

     groupUpdateFail: function ( o ) {
        alert( "AJAX Error groupUpdate update failed: id=" + o.argument.id ); 
     }

};
*/
