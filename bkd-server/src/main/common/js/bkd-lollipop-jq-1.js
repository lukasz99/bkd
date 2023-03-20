console.log("bkd-lollipop-jq: common");
class BkdLollipop{
    
    constructor( conf ){

        this.UIDTag = this.getUniqueID();
        
        if( conf !== undefined ){
            console.log("BkdLollipop(conf)-> ", this.conf );
            this.conf = conf;
            if( ! this.conf.anchor.startsWith("#") ){
                this.conf.anchor = "#" + this.conf.anchor;
            }
            this.conf.spinner = this.conf.anchor + "-spinner-" + this.UIDTag;
            this.conf.lpanel = this.conf.anchor + "-panel-" + this.UIDTag;
            this.conf.details = this.conf.anchor + "-details-" + this.UIDTag;

        } else {
            console.log("BkdLollipop(DEFAULT)-> ", this.conf );
            this.conf = {   // defaults
                url: "",
                anchor: "",
                id: "lpanel-0",
                format: {},
                fcolor: {},
                detailcbl: []
            };
        }
        
        this.data = { uid: null,
                      sequence: null,
                      raw: {},
                      formatted: {},
                      flist: [],
                      fdict: {}
                    };

        this.state = {
            datasrc:{ cvflag: true,     // ClinVar
                      snflag: false,    // dbSNP
                      bkflag: false },  // BKD
            fstate: {},
            ftypesel: {}
        };         
    }

    initialize( init ){
        console.log( "BkdLollipop: initialize");
        console.log( "BkdLollipop.init: ", init );

        if( init != undefined && init.sequence != undefined ){ 
            this.data.sequence = init.sequence;
        }
            
        // add/turn on spinner
        //--------------------
        
        $( this.conf.anchor ).append(
            "<div id='" + this.conf.spinner.replace("#","") + "'"
                + " class='bkd-lollipop-spinner'>"
                + "<img src='img/spinner.gif' class='bkd-spinner'>"
                + "</div>");
        $(this.conf.anchor).append(
            "<div id='" + this.conf.lpanel.replace("#","") + "'"
                + " class='bkd-lollipop-panel'></div>");

        $( this.conf.anchor ).append(
            "<div id='" + this.conf.details.replace("#","")
                + "' class='bkd-lollipop-details'"
                + " style='padding: 0px 10px;'></div>");
        
        $( this.conf.anchor + " .bkd-lollipop-spinner" ).show();
        
        // query for data
        //---------------

        function callback( target ){
            return function( data, textStatus, jqXHR ){
                $('#bkd-lolipop-spinner').hide();
                target.buildView( data );
            }
        }
        
        $.ajax( { url: this.conf.url.replace("FULL","FEATL")} )
            .done( function(target){ return function( data,
                                                      textStatus,
                                                      jqXHR ){
                target.buildView( data ); } }( this ) );        
    }


    // redisplay after data source change
    //-----------------------------------
    
    rebuildView(){
        console.log("rebuildView() called");
        this.buildView();
        
    }

    selReset(){       
        for(var k in this.state.fstate){
            this.state.fstate[k].on = false;
        }
    }
    
    buildView( data ){
        
        console.log( "BkdLollipop.buildView() called");

        // turn off spinner
        //-----------------

        $( this.conf.spinner ).hide();

        if( data != undefined && data != null) this.data.raw = data;

        // process data
        // ------------
        
        this.prepareData( data );

        // bulid lollipop panel
        //--------------------
        
        this.buildPanel();
        
        console.log( "BkdLollipop.buildView() DONE");
        
    }
    
    getVal( data, path ){ 
        var cval = data;
        //console.log(JSON.stringify(Object.keys(cval)));
        for(var j=0; j<path.length; j++){
            //console.log( "CVAL: " + path[j] + " :: " +
            //              JSON.stringify(cval[ path[j] ]) );
            cval = cval[ path[j] ];
        }
        return cval;            
    }

    prepareData( data ){
        
        if( data != undefined && data != null ){ 
            if( this.data.raw != null ){
                this.data.formatted = this.data.raw.node.node;
            }
            console.log(this.data.formatted);
            console.log(this.conf.format);
            this.data.flist = this.getVal( this.data.formatted,
                                           this.conf.format.vpath );

            this.data.cvDict = {};  // ClinVar
            this.data.snDict = {};  // dbSNP
            this.data.bkDict = {};  // bkd records
        
            var cvCntr = 0;
            var snCntr = 0;
            var bkCntr = 0;
        
            for( var i = 0; i < this.data.flist.length; i++ ){
                // go over features
            
                var cvStat = false;
                var snStat = false;
                var bkStat = false;
                
                var feat = this.data.flist[i];
                var range = feat.range[0];

                var upr = null;
                for(var j =0; j < feat.xref.length; j++ ){
                    if( feat.xref[j].ns=="upr"){
                        upr = feat.xref[j].ac;
                        break;
                    }
                }

                
                if( upr == this.conf.uprv       // correct seq variant
                    && range.start == range.stop ){  // point features
                
                    //console.log(i," value: ",JSON.stringify(feat));

                    var rstart = parseInt(range.start) - 1; 
                     
                    var posaa = this.data.sequence[ rstart ] +
                        range.start +
                        range.seq;
                    
                    var shrt = 'p.' + this.data.sequence[ rstart ] 
                        + range.start 
                        + range.seq;
                
                    var dsref = {};
                    var pos37 = "";
                    var pos38 = "";
                    var clinsig = [];
                    var cvref = {};
                    var mimref = [];
                    var cgref = [];
                    var gnref = [];

                    // detail table column values for a single feature 
                    var dtval = {}; 
                    
                    //console.log("dtcolumns:"
                    //     + JSON.stringify( this.conf.detailtable.column));
                    //console.log("********************>");
                    
                    for( var ci = 0; ci <  this.conf.detailtable.column.length;
                         ci ++){
                        dtval[this.conf.detailtable.column[ci]['cid']]=[];
                    }
                    //console.log("dtval:" + JSON.stringify(dtval) );

                    if( "csig-name" in feat ){
                        clinsig.push(feat["csig-name"]);
                    }else{
                        clinsig.push('unknown');  // default clinsig  
                    }
                    
                    for( var j = 0; j < feat.xref.length; j ++){
                        // go over feature xrefs
                        //console.log( "NS: " + feat.xrefs[j].ns );
                        
                        if( "GRCh37" == feat.xref[j].ns ){
                            pos37 = feat.xref[j].ac;                  
                        }
                        if( "GRCh37.p13" == feat.xref[j].ns ){
                            pos37 = feat.xref[j].ac;                 
                        }
                        if( "GRCh38" == feat.xref[j].ns ){
                            pos38 = feat.xref[j].ac;
                        }              
                        if( "GRCh38.p13" == feat.xref[j].ns ){
                            pos38 = feat.xref[j].ac;
                        }
                        
                        // detailtable column setup
                        //-------------------------
                        
                        //var dtval = [];
                        
                        for( var ci = 0;
                             ci <  this.conf.detailtable.column.length; ci ++){
                            var col = this.conf.detailtable.column[ci];
                            var cid=  col['cid'];
                            //console.log("####:" + JSON.stringify(cid));
                            if( col['xref-ns'] == null ){
                                if( 'shrt' == col.value ){
                                    dtval[cid].push( shrt );
                                } else if ('clinsig' == col.value ){
                                    dtval[cid].push( clinsig );
                                }
                            } else {
                                var cns =
                                    this.conf.detailtable.column[ci]['xref-ns'];
                                //console.log("####:"
                                //    + cns + "::" + feat.xref[j].ns );
                                if( cns == feat.xref[j].ns
                                    || cns == feat.xref[j].ns.toLowerCase() ){
                                    //console.log( "####: ac="
                                    //   + feat.xref[j].ac); 
                                    if( 'string' == col.type ){
                                        dtval[cid].push( feat.xref[j].ac );
                                    } else if ( 'hlink' == this.conf.detailtable.column[ci].type ){
                                        var clink = col.url + feat.xref[j].ac;
                                        var ctext = feat.xref[j].ac;
                                        if( col['xref-ns'] == 'clinvar' ){
                                            clink=clink.replace(/\.\d+$/,"");
                                            ctext=ctext.replace(/\.\d+$/,"");
                                        }
                                        var href = "<a href='"
                                            + clink
                                            + "' target='_blank'>"+ctext+"</a>";
                                        dtval[cid].push( href );
                                    }
                                } 
                            }
                        }                    
                        
                        if( "dbSNP" == feat.xref[j].ns ){
                            snStat = true;
                        }
                    
                        if( "clinvar" == feat.xref[j].ns.toLowerCase() ){
                            cvStat = true;
                        }

                        if( "bkd" == feat.xref[j].ns.toLowerCase() ){
                            bkStat = true;
                        }
                        
                        // detailtable column setup: DONE
                        //-------------------------------
                    }
                
                    //console.log("done with xrefs:" + JSON.stringify(dtval));
                
                    var mdta =
                        { "Hugo_Symbol": "PIK3CA",
                          "cvStat" : cvStat,
                          "snStat" : snStat,
                          "bkStat" : bkStat,
                          // LS: clinsig:  single value (for now)
                          "Clinical Significance": clinsig[0], 
                          "Variant": shrt,
                          "PosAA": posaa,
                          "Pos37": pos37,
                          "Pos38": pos38,
                          "Mutation_Class": feat.range[0].sequence,
                          "AA_Position": parseInt(feat.range[0].start),
                          "dtval": dtval
                        };
                    
                    //console.log( "mdta:" + JSON.stringify(mdta) );
                    
                    if( !( shrt in this.data.fdict ) ){
                        this.data.fdict[shrt] = [];
                    }
                
                    this.data.fdict[shrt].push( mdta );                
                    this.state.fstate[ feat.range[0].start ] =
                        { "on":false, "rep":{} };
                
                    if( cvStat ){
                        if( !(shrt in this.data.cvDict ) ){
                            this.data.cvDict[shrt] = [];
                        }
                        this.data.cvDict[shrt].push( mdta );
                    }
                
                    if( snStat ){
                        if( !(shrt in this.data.snDict) ){
                            this.data.snDict[shrt]= [];
                        }
                        this.data.snDict[shrt].push( mdta );
                    }
                
                    if( bkStat ){
                        if( !(shrt in this.data.bkDict) ){
                            this.data.bkDict[shrt]= [];
                        }
                        this.data.bkDict[shrt].push( mdta );
                    }                
                }            
            }
        
            console.log("cvDict.length", Object.keys(this.data.cvDict).length );
            console.log("snDict.length", Object.keys(this.data.snDict).length );
            console.log("bkDict.length", Object.keys(this.data.bkDict).length );
        }
        
        var mutList = [];
        var fDict = {};
        
        // merge cvDict, snDict & bkDict acording to status
        //-------------------------------------------------
        
        if( this.state.datasrc.cvflag ){
            for( var cmut in this.data.cvDict ){                
                if( !(cmut in fDict) ){ 
                    fDict[cmut] = [];
                }
                for( var f in this.data.cvDict[cmut]){
                    fDict[cmut].push( this.data.cvDict[cmut][f] );
                }
            }
        } 
        
        if( this.state.datasrc.snflag ){    
            for( var cmut in this.data.snDict ){                
                if( !(cmut in fDict) ){ 
                    fDict[cmut] = [];
                }
                for( var f in this.data.snDict[cmut]){
                    fDict[cmut].push( this.data.snDict[cmut][f] );
                }
            }
        }
        
        if( this.state.datasrc.bkflag ){    
            for( var cmut in bkDict ){                
                if( !(cmut in fDict) ){ 
                    fDict[cmut] = [];
                }
                for( var f in this.data.bkDict[cmut]){
                    fDict[cmut].push( this.data.bkDict[cmut][f] );
                }
            }
        }
        
        // convert fDict to list
        //----------------------

        this.data.plist = [];
        
        for( var cent in fDict ){            
            var cfeat =
                { snlink: [],
                  cvlink: [],
                  bklink: [],
                  cglink: [],
                  gnlink: [],
                  dtval: null };
            
            var sndict = {};
            var cvdict = {};
            var cgdict = {};
            var gndict = {};
            
            cfeat['name'] = cent;
            cfeat['pos'] = parseInt(fDict[cent][0]['AA_Position']);
            cfeat['res'] = fDict[cent][0]['PosAA'];
            cfeat['pos37'] = fDict[cent][0]['Pos37'];
            cfeat['pos38'] = fDict[cent][0]['Pos38'];
            cfeat['dtval'] = fDict[cent][0]['dtval'];
            
            for( var g in fDict[cent] ){
                cfeat['significance'] =
                    fDict[cent][g]['Clinical Significance'];  
            }
            
            this.data.plist.push( cfeat );             
        }   
    }

    buildPanel(){

        var mutation_data = this.data.plist;
                
        var mutation_data_default_settings = {
            x: "pos", // mutation position
            y: "name", // amino-acid changes
            factor: "significance", // classify mutations by a factor (optional)
        };
                        
        var pfam_data = {  
            "hgnc_symbol":"TP53",
            "protein_name":"tumor protein p53",
            "uniprot_id":"P04637",
            "length":this.data.sequence.length+1,
            "pfam":[  
                {  
                    "pfam_ac":"PF08563",
                    "pfam_start":1,
                    "pfam_end":this.data.sequence.length,
                    "pfam_id":"my protein"
                }
            ]
        }; 
        
        var pfam_data_default_settings = {
            domainType: "pfam",       // key to the domain annotation entries
            length: "length",         // protein length
            details: {
                start: "pfam_start",  // protein domain start position
                end: "pfam_end",      // protein domain end position
                name: "pfam_id",      // protein domain name
            }
        };
        console.log( "this.conf.lpanel-> ",this.conf.lpanel.replace("#","") );

        // cleanup
        
        $( "#" + this.conf.lpanel.replace("#","") +" *" ).remove();
        $( "#" + this.conf.details.replace("#","") +" *" ).remove();

        var lollipop = g3.Lollipop( this.conf.lpanel.replace("#","") );

        
        this.lollipop = lollipop;
        
        lollipop.options.chartMargin = {
            "left": 40, "right": 40, "top": 30, "bottom": 25
        };
        lollipop.options.titleFont = "normal 20px Sans";
        lollipop.options.yAxisLabel = "# of variants";
        lollipop.options.titleColor = "steelblue";
        lollipop.options.titleAlignment = "middle";
        lollipop.options.titleDy = "0.3em";
        lollipop.options.legendTitle = "Clinical Significance";
        lollipop.options.chartWidth = 1024;
        //lollipop.options.chartHeight = 200;
        lollipop.options.chartType = "pie";
        lollipop.options.tooltip = false;

        lollipop.options.seq = true;

        lollipop.options.lollipopPopInfoColor="#000";
        lollipop.options.lollipopPopMinSize = 8;
        lollipop.options.lollipopHook =
            { action: this.buildFDets,
              options: {
                  lpanel: this,
                  anchor: this.conf.details,
                  cols: this.conf.detailtable.column },
              fcolor: this.conf.fcolor
            };
        //lollipop.options.legendHook =
        //    { action: BKDnodeFeatures.loliLegend,
        //      options: {}
        //    };
        
        // add mutation list
        //lollipop.data.snvData = mutList;
        lollipop.data.snvData = mutation_data;

        var sd = [];
        for( var i=0; i < this.data.sequence.length; i++){
            sd.push({pos:i+1, aa: this.data.sequence[i]});
        }
        lollipop.data.seqData = sd;             
                
        // mutation data format settings
        lollipop.format.snvData = mutation_data_default_settings;
        
        // Pfam domain data
        lollipop.data.domainData = pfam_data;
        
        // Pfam data format settings
        lollipop.format.domainData = pfam_data_default_settings;

        console.log(mutation_data);
        
        // setup selection callback(s)
        //----------------------------

        //this.fselControl( this.conf.details,
        //                  this.conf.vclass,
        //                  this.flistSelEventAction );
                          
        // draw lollipops
        //---------------
        
        lollipop.draw();        
        
        
    }

    buildFDets( show, data, options ){

        // selection: feature table viewer
        //--------------------------------
        
        var lpanel = options.lpanel;
        var dtconf = options.lpanel.conf.detailtable;
                
        lpanel.state.fstate[data.position].on = show;
       
        //lpanel.data.plist - list of feaures
        //lpanel.state.fstate - map of states
        
        var rows = {};
        
        for( var x in lpanel.data.plist ){
            var pos = lpanel.data.plist[x].pos.toString(); 
            if(  pos in lpanel.state.fstate ){
                if( lpanel.state.fstate[pos].on){                   
                    if( ! (pos in rows) ){
                        rows[pos]= [];
                    }
                    rows[pos].push( lpanel.data.plist[x] );
                    console.log( "plist:" + x + " :: "
                                 + JSON.stringify( lpanel.data.plist[x] ) );
                }
            }
        }
        var html = "";
        
        console.log( "details: options.anchor: ", options.anchor );
        
        if( Object.keys(rows).length > 0 ){
            $( options.anchor ).hide();
            $( options.anchor + " table").remove();
            
            $( options.anchor )
                .append( "<table width='100%' class ='"
                         + dtconf['table_class'] + "'></table>");
            var head =
                "<th class='" + dtconf['head_class'] + "'>AA&nbsp;Position</th>";
            for(var h = 0; h < dtconf.column.length; h++){
                head += "<th class='" + dtconf['head_class']  + "'>" 
                    + dtconf.column[h]['name'] + "</th>";
            }
            $(options.anchor + " table").append( "<tr>" + head + "</tr>");
            
            console.log("RR:", rows);
            
            for( var r in rows){
                console.log( " row:", r );
                
                // topology panel - handle in dedicated action
                //console.log(r-1);
                //console.log("AA: " + '#aa'+(r-1).toString() + '_symbol');
                //console.log( $('#aa'+ (r-1).toString()  +'_symbol') );
                //$('#aa'
                //   + (r-1).toString()
                //   + '_symbol')[0].setAttribute('fill','#ff0000');
                
                for( var rr in rows[r]){
                    
                    //console.log( "row:: "
                    //   + rr + " :: "+JSON.stringify(rows[r][rr]) );
                    var hrow =""
                    if(rr == 0){
                        var cclass = dtconf['aapos_class'];
                        hrow = "<tr>"
                            + " <td align='center' class='" + cclass + "'"
                            + " rowspan='" + rows[r].length + "'>"
                            + r
                            + " </td>";
                    } else {
                        hrow = "<tr>";
                    }
                    for(var c =0; c < dtconf.column.length; c++ ){
                        //console.log( "row:: " + c +
                        //             " ::" +JSON.stringify(options.cols[c]));
                        
                        var vlst = rows[r][rr].dtval[dtconf.column[c]['cid']];
                        var cclass = dtconf.column[c]['data_class'];
                        if( vlst.length > 0) {
                            hrow += "<td class='"+ cclass +"'>"
                                + vlst[0] + "</td>";
                        } else {
                            hrow += "<td class='"+ cclass +"'>&nbsp;</td>";
                        }
                    }
                    hrow += "</tr>";
                    //console.log('hrow:' + hrow);
                    $(options.anchor + " table").append( hrow );
                }
            }
            //console.log("RR: done");
            $( options.anchor ).show();
        } else {
            $( options.anchor ).hide();
            $( options.anchor + " table" ).remove();
        }

        // NOTE: not used (class selections)
        var ftslist = lpanel.getfselist( lpanel.state.ftypesel );       
        console.log("ftslist", ftslist);
       
        console.log( BKDnodeFeatures.ftate );
        
        console.log("buildFDets:detailcbl-> ", lpanel.conf.detailcbl);
        for( var i =0; i < lpanel.conf.detailcbl.length; i ++ ){
            lpanel.conf.detailcbl[i]( lpanel.data.plist,
                                      lpanel.state.fstate,
                                      ftslist);
        }
    }
    
    getfselist( ftypesel ){
        
        console.log( "this", this );
        console.log( "getfselist", ftypesel );
        
        var tcnt = 0;
        for( var t in ftypesel ){
            if( ftypesel[t] == true ){
                tcnt +=1;
            }
        }
        
        var ccol = "#808080";
        
        var pdict = {}
        for( var t in ftypesel ){
            if( ftypesel[t] == true ){
                for( var i in this.data.plist ){
                    if( this.data.plist[i].significance == t ){
                        if( tcnt == 1 && ccol == "#808080" ){            
                            //for( var k in this.conf.vclass){
                            //    if( this.conf.vclass[k].value == t ){
                            //        ccol = this.conf.vclass[k].color;
                            //    }
                            //}
                            for( var k in this.conf.fcolor){
                                console.log(":" + k + "::" + t +":" );
                                if( k == t ){
                                    ccol = this.conf.fcolor[k];
                                    console.log("ccol->", ccol); 
                                }
                            }
                            
                        }
                        
                        pdict[ this.data.plist[i].pos] = {
                            pos: this.data.plist[i].pos,
                            col: ccol,
                            name: this.data.plist[i].pos
                        }

                        //pdict[ this.conf.plist[i].pos] = {
                        //    pos: this.conf.plist[i].pos,
                        //    col: ccol,
                        //    name: this.conf.plist[i].pos
                        //}
                    }
                }
            }
        }        
        return pdict;        
    }
    
    fselControl( anchor, clist, action ){
        
        if( ! d3.select( anchor  ).empty() ){                    
            d3.select( anchor + " *" ).remove();
        }

        d3.select( anchor )
            .html('&nbsp;&nbsp;&nbsp;&nbsp;');
        
        for( var s in clist ){
            d3.select(  anchor )
                .append("input")
                .attr( "type", "checkbox")
                .attr( "id", clist[s]['id'])
                .attr( "name", clist[s]["name"])
                .attr( "value", clist[s]["value"])
                .attr( "style", "accent-color: " + clist[s]["color"]+ ";");
            
            d3.select( anchor )
                .append( "label" )
                .attr( "for" , clist[s]["name"] )
                .html( clist[s]["label"] + " &nbsp;&nbsp;" );
            
            this.state.ftypesel[clist[s]["value"]]=false;            
        }        
        d3.selectAll( anchor + " input" ).on('click', action );        
    }
    
    flistSelEventAction( event ){

        console.log( "flistSelEventAction.event->", event );
       
        var lpanel = event.data.lpanel;
        var fselname = event.data.fselname;
        var fselstate = event.data.fselstate;
        
        //lpanel.state.ftypesel[event.target.value] = event.target.checked;

        fselstate[ event.target.value ] = event.target.checked;
        
        //var ftslist = lpanel.getfselist( lpanel.state.ftypesel );

        var ftslist = BKDnodeFeatures.getfselist( fselstate, this.data.plist );
        
        console.log("ftslist",ftslist);
        console.log("fselstate",fselstate);

        if( fselname == "topo" ){
            BKDnodeFeatures.setTopoSelScheme( BKDnodeFeatures.swmComp,
                                              lpanel.state.fstate, 
                                              ftslist );
        }

        if( fselname == "swm" ){
            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                             lpanel.state.fstate,  
                                             ftslist );
        }

        if( fselname == "str" ){
            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
                                             lpanel.state.fstate,  
                                             ftslist );
        }
        
        lpanel.lollipop.options.legendItems.forEach((d) => {
            //console.log(d.key +":"+d._status);
            d._status = BKDnodeFeatures.ftypesel[d.key];
        } );
        
        //console.log(BKDnodeFeatures.lollipop.options.legendItems);
        //console.log(BKDnodeFeatures.ftypesel);
        
    }
    
    // generate unique ID tag
    //-----------------------

    getUniqueID( left, right ){
        var left = left || 1e5;
        var right = right || 1e6 - 1;
        return Math.floor(Math.random() * (right - left) + left);
    }
    
    //--------------------------------------------------------------------------
    // END of update
}

console.log("bkd-lollipop-jq: loaded"); 

 
