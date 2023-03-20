console.log("bkd-usermgr: common");

class BkdUserMgr {
    
    constructor( conf ){
        
        if( conf !== undefined ){
            this.conf = conf;
        } else {
            this.conf = {   // defaults
                
            };
        }
        
        this.anchor = "";
        this.data = {};        
    }

    initialize( init ){
        console.log( "bkd-usermgr: initialize");
        console.log( "init: ", init );
        console.log("table anchor: ", this.conf.table);
        var dtbl = $( this.conf.table ).DataTable( {
            "ajax": {
                url: "usermgr?op.view=json&opp.off=0&opp.max=10&opp.skey=id&opp.sdir=asc",
                dataSrc: 'userList'
            },
            "autoWidth": false,
            "columns": [{ "data": 'id', "title": "UID", "width": "10%" },
                        { "data": 'login',"title": "Login", "width": "10em" },
                        { "data": 'firstName',"title": "First Name", "width": "200px"},
                        { "data": 'lastName', "title": "Last Name" , "width": "300px"},
                        { "data": 'affiliation',"title": "Affiliation", "width": "10em" },
                        { "data": 'email',"title": "EMail", "width": "10em"  },
                        { "data": 'id', "render": function ( data, type, row, meta ) {
                            return '<a href="usermgr?id='+data+'">Edit</a>';} }
                       ]
        });

        dtbl.columns.adjust().draw();
        
    }
}


console.log("bkd-usermgr: loaded");


/*
YAHOO.namespace("imex");

YAHOO.imex.usermgr = {

    myCD: {},
    myCL: [],

    myDataSource: null,
    myPaginator: null,

    defPageSize: 50,

    myLogLevel: "none",

    myColumnDefs: [],

    init: function( columnDefinitions, dataSourceLink, datasourceSchema, container ){
        var UMGR  = YAHOO.imex.usermgr;
        
	UMGR.formatterInit();
        
        UMGR.myColumnDefs = columnDefinitions;

	for( var i =0; i< columnDefinitions.length-1; i++ ){
	    
	    var key = columnDefinitions[i].key;
	    UMGR.myCD[key]=columnDefinitions[i];
	    UMGR.myCL[UMGR.myCL.length] = key;
	}
	
	// set/restore usermgr cookie
	//---------------------------
	/ / *

	try{
            var cookie = YAHOO.util.Cookie.get("usermgr");
            if( cookie == null ){
                cookie = UMGR.getDefaultCookie();
		YAHOO.util.Cookie.set( "usermgr", cookie );
            }
            
            if( cookie !== null ){
                UMGR.buildCDefs( cookie );                
            }
        } catch (x) {
            console.log("INIT: ex="+ x);
        }
	* / /

	// create data source
	//-------------------

        UMGR.myDataSource = new YAHOO.util.DataSource( dataSourceLink ); 
        UMGR.myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON; 
        
        UMGR.myDataSource.responseSchema = datasourceSchema;
 
	//Tossing in some css to remove bottom paginator. and some other stuff
	//-------------------------------------------------------------------
	
	var sheet = document.createElement('style');
        sheet.innerHTML = "#yui-dt0-paginator1 {display: none;} " +
            "#" + container + " table {border: 1px solid #888888; width: 100%;} " + 
            document.body.appendChild(sheet); 
        
        UMGR.myDataSource.my = { myState: null };
        
        // create paginator
        //-----------------
        
        UMGR.myPaginator = new YAHOO.widget.Paginator(
            {rowsPerPage: 10, 
	     template: YAHOO.widget.Paginator.TEMPLATE_ROWS_PER_PAGE, 
	     rowsPerPageOptions: [5,10,20,50,100], 
	     pageLinks: 5,
	     containers: ["dt-pag-nav"]  
            }
        );
        
        // datatable configuration
        //------------------------

	var initReq = "opp.off=0&opp.max=50";
        // + "&opp.ffv=" + YAHOO.imex.pubmgr.cflag;   ???
	
        var myConfig = {
            paginator : UMGR.myPaginator,
	    initialLoad: false,
            dynamicData : true,
            draggableColumns: true
        };
       
        
        // Instantiate DataTable
        //----------------------
    
        UMGR.myDataTable = new YAHOO.widget.DataTable(
            container, UMGR.myColumnDefs, 
            UMGR.myDataSource, myConfig
        );
                
	UMGR.myPaginator
            .unsubscribe( "changeRequest", 
                          UMGR.myDataTable.onPaginatorChangeRequest );
        UMGR.myPaginator
            .subscribe( "changeRequest", 
                        UMGR.handlePagination, UMGR.myDataTable, true );
	
	UMGR.myDataTable.sortColumn = UMGR.handleSorting;

        UMGR.myDataTable.my = { 
            requestBuilder: UMGR.requestBuilder
        };

	// Show loading message while page is being rendered
	//--------------------------------------------------

        UMGR.myDataTable
            .showTableMessage( UMGR.myDataTable.get("MSG_LOADING"), 
                               YAHOO.widget.DataTable.CLASS_LOADING);
	
        UMGR.myDataTable.doBeforeLoadData = 
            function( oRequest, oResponse, oPayload ){
		
		var UMGR  = YAHOO.imex.usermgr;
                
                try{
                    var meta = oResponse.meta;
                    oPayload.totalRecords 
                        = meta.totalRecords || oPayload.totalRecords;
                    
                    var oPayloadOld = oPayload;
                
		    
		    if( UMGR.myLogLevel == 'debug' ){
			console.log( YAHOO.lang.JSON.stringify( meta ) );
		    }
		    
                    oPayload.pagination = {
                        rowsPerPage: meta.paginationRowsPerPage || 10,
                        recordOffset: meta.paginationRecordOffset || 0
                    };
                    
                    if( meta.sortKey !== undefined ){
                        oPayload.sortedBy = { key: meta.sortKey,
                                              dir: "yui-dt-" + meta.sortDir };
                    }

		    if( UMGR.myLogLevel == 'debug' ){                    
			alert( "dbld:\n payload(old)=" + YAHOO.lang.JSON.stringify( oPayloadOld ) +
                               "\n meta=" + YAHOO.lang.JSON.stringify( meta ) +
                               "\n payload(new)=" + YAHOO.lang.JSON.stringify( oPayload  ));
                    }
		    
                } catch (x) {
                    console.log(x);
                }
		
                return true;
            },
	
        UMGR.myDataTable.handleLayoutChange =
            function( ev, o ){
		
		var UMGR = YAHOO.imex.usermgr;
		
                try{
                    UMGR.myDataTable.my.configmenu.destroy();
                    UMGR.contextMenuInit( UMGR );
                    
                    //var nCookie = UMGR.buildCookie();
                    //UMGR.updateUserTablePref(nCookie);
                    //YAHOO.util.Cookie.set("usermgr", nCookie );                                      
                } catch (x) { }
            };
        
        UMGR.contextMenuInit( UMGR );
	
        UMGR.myDataTable.on( "columnReorderEvent",
                             UMGR.myDataTable.handleLayoutChange );     
        
        UMGR.myDataTable.on( "columnHideEvent",
                             UMGR.myDataTable.handleLayoutChange );     
        
        UMGR.myDataTable.on( "columnShowEvent",
                             UMGR.myDataTable.handleLayoutChange );     
	
	// initialize tab view 
	//--------------------

	UMGR.tabView = new YAHOO.widget.TabView("mgr-tabs");
	
	UMGR.tabView
	    .subscribe( "activeIndexChange",
			UMGR.handleActiveTabChange, UMGR.tabView, true );


	// initialize history
	//-------------------
	
        var defstate = {
            startIndex: 0,
            pageSize: UMGR.defPageSize,
            //filter:{ stage: "",
            //         status: "",
            //         partner:"",
            //         editor:PMGR.admus,
            //         owner: PMGR.owner,
            //         cflag: PMGR.cflag},
            //watch: PMGR.watch,
            scol: "id",
            sdir: "asc",
	    stab: 0
	};
                 
        //if(  init !== undefined && init.watch !== undefined ){
        //    defstate.watch = init.watch;
        //}

        var dst = YAHOO.lang.JSON.stringify( defstate );
        
        var bState = YAHOO.util.History.getBookmarkedState( "usermgr" );
        var iState = bState || dst;
        
        YAHOO.util.History.register( "usermgr", iState, 
                                     UMGR.handleHistoryNavigation ); 
        
        YAHOO.util.History.onReady( UMGR.historyReadyHandler );    
        
        try{
            YAHOO.util.History.initialize( "yui-history-field", 
                                           "yui-history-iframe" );
        } catch (x) {
            console.log(x);
        }                

	if( UMGR.myLogLevel == 'debug'){
	    console.log('usrmgr initialized');
	}
	
        return { 
            ds: UMGR.myDataSource, 
            dt: UMGR.myDataTable 
        };
        
    },

    handleActiveTabChange: function( e, oTabView ){
	try{

	    var UMGR = YAHOO.imex.usermgr;
            var newState = UMGR.myDataSource.my.myState;
	    
	    newState.stab = e.newValue;

            YAHOO.util.History
                .navigate( "usermgr",
                           UMGR.generateStateString( newState ) );

	    console.log("atcstate: " + UMGR.generateStateString( newState ));

	}catch(x){
	    console.log(x);
	}	
    },

    
    contextMenuInit: function( o ){
        
        try{
            
            o.myDataTable.my.colmenu = new YAHOO.widget.Menu( "colmenu" );
            
            var defaultTableLayout = function( o ){
                var UMGR = YAHOO.imex.usermgr;
                / / *
		if( typeof UMGR.loginId  != "undefined" && UMGR.loginId != "" ){
                    var Success = function( response ){ 

                    };
                    var Fail = function ( o ) {
                        console.log( "AJAX Error update failed: id=" + o.argument.id ); 
                    };
                    var callback = { cache:false, timeout: 5000, 
                                     success: Success,
                                     failure: Fail
                                     }; 
                    
                    try{
                        YAHOO.util.Connect
                        .asyncRequest( 'GET', 
                                       'userprefmgr?id=' + pubmgr.loginId +'&op.defaultTableLayout=true',
                                       callback );        
                    } catch (x) {
                        console.log("AJAX Error:"+x);
                    }
                }
		* / /

		/ / *
                var cookie = UMGR.getDefaultCookie();
                UMGR.buildCDefs(cookie);
                
                YAHOO.util.Cookie.set( "usermgr", cookie );
                var myDataTable = UMGR.myDataTable;
                
                UMGR.init(
                    {admus: pubmgr.admus,
                     owner: pubmgr.owner,
                     cflag: pubmgr.cflag,
                     watch: pubmgr.watch,
                     loginid:pubmgr.loginId });
		* / /
            };
            
            var oConfMenu = [[{text:"Preferences", disabled: true }],
                             [{text: "Show Columns", 
                               submenu: o.myDataTable.my.colmenu }],
                             [{text:"Restore Default Layout",onclick: {fn: defaultTableLayout } }
                               ],
                             [{text:"Save...", disabled: true}]
                            ];        
            
            var clist=[];
            var trigger=[];
            
            for( var i = 0;  i < o.myColumnDefs.length; i++ ) {
                if( o.myColumnDefs[i].menuLabel !== undefined ) {

                    var trg = o.myDataTable.getColumn( 
                        o.myColumnDefs[i].key ); 
		    
                    var item= {text: o.myColumnDefs[i].menuLabel,
                               checked: !trg.hidden, disabled:  !o.myColumnDefs[i].hideable,
                               onclick: { fn: o.hiddenColToggle,
                                          obj: { tbl: o.myDataTable ,col: trg } } };
                    clist.push( item );

                        
                    //alert( myColumnDefs[i].key+ "::" + trg);
                    if( trg !== null ) {
                        trigger.push( trg.getThEl() );
                        //alert(trg.getThEl());
                    }
                }
            }
            
            o.myDataTable.my.colmenu.addItems( clist );
            
            o.myDataTable.my.configmenu = new YAHOO.widget.ContextMenu(
                "configmenu", { trigger: trigger } );
            
            o.myDataTable.my.configmenu.addItems( oConfMenu );
            //o.myDataTable.my.configmenu.render("pubtab");
	    o.myDataTable.my.configmenu.render( container );
            
        } catch (x) {
            console.log(x);
        }
    },

    / / *
    getDefaultCookie: function(){
        var cookie = "";
        var UMGR = YAHOO.imex.usermgr;

	try{
            for( var i = 0; i < usermgr.myCL.length; i++ ){

		var hidden = false;
		if(  UMGR.myCD[UMGR.myCL[i]].hidden === true ){
                    hidden = true;
		}
		cookie += UMGR.myCD[UMGR.myCL[i]].key + ":" + hidden +"|";
            }
        } catch (x) {
            console.log(x);
        }
	    
        //alert( cookie );

        return cookie;
    },
    
    * / /

    / / *

    buildCDefs: function( cookie ){

        var UMGR = YAHOO.imex.usermgr;
	
        //alert("buildCDefs:"+cookie );
        var col = cookie.split("|");
        
        if(col.length > 0){
            UMGR.myColumnDefs=[];
            
            for( var i =0; i < col.length-1; i++ ){
                try{
                    
                    var cs = col[i].split(":");
                    if( UMGR.myCD[cs[0]] !== undefined ){
                        
                        UMGR.myColumnDefs.push(UMGR.myCD[cs[0]]);
                        if(cs[1] === 'true'){
                            UMGR.myColumnDefs[UMGR.myColumnDefs.length-1].hidden = true;
                        } else {
                            UMGR.myColumnDefs[UMGR.myColumnDefs.length-1].hidden = false;
                        }
                    }
                    
                } catch (x) {
                    console.log( "I:"+ i + "-> " + cs[0] + " ex=" + x );
                }
            }        
        }
    },

    * / /

    buildRequest: function ( state ){
      
        //alert("buildRequest->state" +YAHOO.lang.JSON.stringify(state));

        var req = "opp.off=" + state.startIndex + 
            //"&opp.wfl=" + state.watch + 
            "&opp.max=" + state.pageSize + 
	    //"&opp.gfv=" + state.filter.stage +
            //"&opp.sfv=" + state.filter.status +
            //"&opp.pfv=" + state.filter.partner +
            //"&opp.efv=" + state.filter.editor +
            //"&opp.ofv=" + state.filter.owner +
            //"&opp.ffv=" + state.filter.cflag +
            "&opp.skey=" + state.scol +
            "&opp.sdir=" + state.sdir;
        
        return encodeURI( req );
        
    },
    
    requestBuilder: function( oState, oSelf ) {
        
        //alert("requestBuilder->oState=" + YAHOO.lang.JSON.stringify(oState) );

        // get state (or use defaults)
        //----------------------------

        oState = oState || {pagination:null, sortedBy:null};
        var sort = (oState.sortedBy) ? oState.sortedBy.key : "id";
        var dir = 
            (oState.sortedBy 
             && oState.sortedBy.dir === YAHOO.widget.DataTable.CLASS_DESC)
            ? "false" : "true";
        var startIndex = (oState.pagination) 
            ? oState.pagination.recordOffset : 0;
        var results = (oState.pagination) 
            ? oState.pagination.rowsPerPage : 10;

        // LS: also get watch flag here ?
        // <        
        // filters
        //--------

        //oSelf.my.stageFlt.my.value;
        //var gfVal = YAHOO.imex.pubmgr.stageBtn.my.value;
        
	//oSelf.my.stateFlt.my.value;
        //var sfVal = YAHOO.imex.pubmgr.stateBtn.my.value;
        
        // oSelf.my.partnerFlt.my.value;
        //var pfVal = YAHOO.imex.pubmgr.partnerBtn.my.value;
        
        //if( gfVal === undefined ){
        //    gfVal = "";
        //}
        //if( sfVal === undefined ){
        //    sfVal = "";
        //}
        //if( pfVal === undefined ){
        //    pfVal = "";
        //}

        //alert("stateButton: name="+ YAHOO.imex.pubmgr.stateBtn.my.name 
        //      + " value=" + YAHOO.imex.pubmgr.stateBtn.my.value);
        
        //var efVal = oSelf.my.admusFlt;
        //var ofVal = oSelf.my.ownerFlt;
        //var ffVal = oSelf.my.cflagFlt;


        // watch flag 
        
        //var wtFlg = oSelf.my.watchFlg;
        //if( wtFlg === undefined ){
        //    wtFlg = "";
        //}

        var req = 
	    "opp.skey=" + sort +
            //"&opp.wfl=" + wtFlg +
	    //"&opp.gfv=" + gfVal + 
            //"&opp.sfv=" + sfVal +
            //"&opp.pfv=" + pfVal +
            //"&opp.efv=" + efVal +
            //"&opp.ofv=" + ofVal +
            //"&opp.ffv=" + ffVal +
            "&opp.sdir=" + dir +
            "&opp.off=" + startIndex +
            "&opp.max=" + results; 
        
        req = encodeURI(req);

	if( UMGR.myLogLevel == 'debug'){
            console.log("request: " + req);
	}


        // build custom request
        //---------------------

        return req;
    },

    tableReload: function( o, dt ) {
        try {
            
            var state = dt.get('paginator').getState();
	    
	    if( UMGR.myLogLevel == 'debug'){
		console.log( "tableReload: dt.state=" + YAHOO.lang.JSON.stringify( state ) );
	    }
	    
            dt.get('paginator').setState( state );
            
            var reloadCallback = {
                success: dt.onDataReturnInitializeTable,
                failure: dt.onDataReturnInitializeTable,
                scope: dt,
                argument: dt.getState()
            };
                
            var reloadRequest = 
                dt.my.requestBuilder( dt.getState(), dt );
                
            dt.getDataSource().sendRequest( reloadRequest, 
                                            reloadCallback );
        } catch (x) {   
            console.log(x);
        }
    },

    / / *
    getDefaultCookie: function(){
        var cookie = "";
        var UMGR = YAHOO.imex.usermgr;
	//var myCD = UMGR.myColumnDefs;

        for(var i = 0; i < UMGR.myCL.length; i++ ){

            var hidden= false;
            if(  UMGR.myCD[UMGR.myCL[i]].hidden === true ){
                hidden= true;
            }
            cookie += UMGR.myCD[UMGR.myCL[i]].key + ":" + hidden +"|";
        }
        //alert( cookie );

        return cookie;
    },
    * / /

    handlePagination: function( oState, oDatatable ){
        
	try{
	    oDatatable.get('paginator').setState( oState );
	    
	    var UMGR = YAHOO.imex.usermgr;
            var newState = UMGR.myDataSource.my.myState;

            newState.startIndex = oState.recordOffset;
            newState.pageSize = oState.rowsPerPage;
            
            YAHOO.util.History
		.navigate( "usermgr", 
			   UMGR.generateStateString( newState ) );
	    
	} catch(x){
	    console.log(x);
	}
    },
    
    handleSorting: function( column ){
	
        var UMGR = YAHOO.imex.pubmgr;
        var newState = UMGR.myDataSource.my.myState;
        try{
            var sdir = this.getColumnSortDir( column );
            newState.startIndex = 0;
            //alert( "HS: col=" + column.key + " dir=" + sdir );

            if( column.key !== undefined && sdir !==undefined ){
                
                newState.scol = column.key;
                newState.sdir = sdir.substr( 7 );
		
                //alert( "new sort=(" + newState.scol 
                //       + "," + newState.sdir + ")" );
            }

            YAHOO.util.History
                .navigate( "usermgr", 
                           UMGR.generateStateString( newState ) );
        } catch (x) {
            console.log(x);
        }
        
    },

    generateStateString: function( state ){            
        return YAHOO.lang.JSON.stringify( state );
    },
    
    parseStateString: function( statStr ){
        return YAHOO.lang.JSON.parse( statStr );
    },

    historyInit: function( init ){

        var UMGR = YAHOO.imex.usermgr;
	
        var defstate = {
            startIndex: 0,
            pageSize: UMGR.defPageSize,
            //filter:{ stage: "",
            //         status: "",
            //         partner:"",
            //         editor:PMGR.admus,
            //         owner: PMGR.owner,
            //         cflag: PMGR.cflag},
            //watch: PMGR.watch,
            scol: "id",
            sdir: "asc" };
                 
        if(  init !== undefined && init.watch !== undefined ){
            defstate.watch = init.watch;
        }

        var dst = YAHOO.lang.JSON.stringify( defstate );
        
        var bState = YAHOO.util.History.getBookmarkedState( "usermgr" );
        var iState = bState || dst;
        
        YAHOO.util.History.register( "usermgr", iState, 
                                     UMGR.handleHistoryNavigation ); 
        
        YAHOO.util.History.onReady( UMGR.historyReadyHandler );    
        
        try{
            YAHOO.util.History.initialize( "yui-history-field", 
                                           "yui-history-iframe" );
        } catch (x) {
            console.log(x);
        }                
    },
    
    handleHistoryNavigation: function( state ){
        
        var UMGR = YAHOO.imex.usermgr;      
        var parsed = UMGR.parseStateString( state );      
        var request = UMGR.buildRequest( parsed );
        
        UMGR.myDataSource.my.myState = parsed;
        
        // update filters
        //---------------
/ / *
        var flt, 
        sflt = "";
        
        //for( flt in parsed.filter){
        //    sflt += "{" + flt + "=" + parsed.filter[flt] + "}";
        //}
        //alert( sflt );

        // reset filter buttons/menus
        //---------------------------
        
        
        var stageLabel = "---ANY---";
        //PMGR.stateSel[0].text = statusLabel;

        var statusLabel = "---ANY---";
        //PMGR.partnerSel[0].text = partnerLabel;

        var partnerLabel = "---ANY---";
        //PMGR.partnerSel[0].text = partnerLabel;


        if( parsed.filter.stage !== ""){
            stageLabel = parsed.filter.stage;
        }

        if( parsed.filter.status !== ""){
            statusLabel = parsed.filter.status;
        }

        if( parsed.filter.partner !== ""){
            partnerLabel = parsed.filter.partner;
        }
        

        if( PMGR.stageBtn.set !== undefined ){           
            PMGR.stageBtn.set( "label", 
                               ("<em class=\"yui-button-label\">" + 
                                stageLabel + "</em>"));
        }else{
            PMGR.stageSel[0].text = stageLabel;
        }

        if( PMGR.stateBtn.set !== undefined ){           
            PMGR.stateBtn.set( "label", 
                               ("<em class=\"yui-button-label\">" + 
                                statusLabel + "</em>"));
        }else{
            PMGR.stateSel[0].text = statusLabel;
        }

        
        if( PMGR.partnerBtn.set!== undefined ){
            PMGR.partnerBtn.set( "label", 
                                 ("<em class=\"yui-button-label\">" + 
                                  partnerLabel + "</em>"));
        }else{
            PMGR.partnerSel[0].text = partnerLabel;
        }
       
* / /
 
        // reload data
        //------------
        
        var mdt = UMGR.myDataTable;
        
        UMGR.myDataSource
            .sendRequest( request, {
                success: mdt.onDataReturnSetRows,
                failure: mdt.onDataReturnSetRows,
                scope: mdt,
                argument: {}
            });

	// select tab
	//-----------

	if( UMGR.myLogLevel == 'debug' ){
	    console.log("handle history: stab=" + parsed.stab);
	    console.log("handle history: UMGR.tabView=" + UMGR.tabView);
	}

	if( UMGR.tabView !== undefined ){
	    UMGR.tabView.set('activeIndex', parsed.stab );
	}
	
    },

    historyReadyHandler: function(){
        try{
            var cState = YAHOO.util.History.getCurrentState( "usermgr" );
            YAHOO.imex.usermgr.handleHistoryNavigation( cState );
        } catch (x) {
            console.log(x);
        }
    },
    
   //-----------------------------
    // Create the custom formatters 
    //-----------------------------

    UserDetailsFormatter: function(elLiner, oRecord, oColumn, oData) {
        elLiner.innerHTML = '<a href="usermgr?id=' + 
            oRecord.getData( "id" ) + 
            '">Edit</a>';
    },
    groupDetailsFormatter: function(elLiner, oRecord, oColumn, oData) {
        elLiner.innerHTML = '<a href="groupmgr?id=' + 
            oRecord.getData( "id" ) + 
            '">Edit</a>';
    },
    roleDetailsFormatter: function(elLiner, oRecord, oColumn, oData) {
        elLiner.innerHTML = '<a href="rolemgr?id=' + 
            oRecord.getData( "id" ) + 
            '">Edit</a>';
    },
    
    //--------------------------
    // Add the custom formatters 
    //--------------------------
    formatterInit: function(){
        
        var YDTF = YAHOO.widget.DataTable.Formatter;

        YDTF.userDetails = this.UserDetailsFormatter; 
        YDTF.groupDetails = this.groupDetailsFormatter; 
        YDTF.roleDetails = this.roleDetailsFormatter; 
       
    }
};
*/
