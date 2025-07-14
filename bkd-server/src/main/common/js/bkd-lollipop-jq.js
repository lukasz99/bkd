console.log("bkd-lollipop-jq: common");
class BkdLollipop{

    constructor( conf ){

        this.UIDTag = this.getUniqueID();
        
        if( conf !== undefined ){
            console.log("BkdLol(conf)-> ", conf );
            this.conf = conf;
            if( ! this.conf.anchor.startsWith("#") ){
                this.conf.anchor = "#" + this.conf.anchor;
            }
            this.conf.spinner = this.conf.anchor + "-spinner-" + this.UIDTag;
            this.conf.lnavig = this.conf.anchor + "-navig-" + this.UIDTag;
            this.conf.lzoom = this.conf.anchor + "-zoom-" + this.UIDTag;
            this.conf.lpan = this.conf.anchor + "-pan-" + this.UIDTag;            
            this.conf.lpanel = this.conf.anchor + "-panel-" + this.UIDTag;
            this.conf.details = this.conf.anchor + "-details-" + this.UIDTag;

        } else {
            console.log("BkdLol(DEFAULT)-> ", this.conf );
            this.conf = {   // defaults
                
                dset:{
                    select:"all",
                    conf:{
                        all:{
                            url: ""
                        }
                    },  
                    seqname: "my protein"    
                },
                sftr:{
                    url: null
                },
                url: "",
                anchor: "",
                id: "lpanel-0",
                format: {},
                fcolor: {},
                chartWidth: 950,
                detailcbl: []
            };
        }

        this.A2AAA = {"A":"Ala","C":"Cys","D":"Asp","E":"Glu","F":"Phe",
                      "G":"Gly","H":"His","I":"Ile","K":"Lys","M":"Met",
                      "N":"Asn","P":"Pro","Q":"Gln","R":"Arg","S":"Ser",
                      "T":"Thr","V":"Val","W":"Trp","Y":"Tyr","F":"Phe"};
        
        this.data = { uid: null,
                      sequence: null,
                      dset:{},
                      vseq: {},
                      raw: {},
                      formatted: {},
                      flist: [],
                      fdict: {}
                    };

        this.poi_data = { color: '#CFFF7', pos:[]};
        
        this.state = {
            dset:{},
            dsel:{},
            vsel: null,
            feat:{},
            fload: {},
            
            datasrc:{ cvflag: true,     // ClinVar
                      snflag: false,    // dbSNP
                      bkflag: false },  // BKD
            fstate: {},
            ftypesel: {},
            listener:[]
        };         
    }

    initialize( init ){       
        console.log( "BkdLol.init: ", init );
        console.log( "BkdLol.conf: ", this.conf );
        console.log( "BkdLol.data: ", this.data );
        
         this.data.seqname=this.conf.seqname;

        for( var dts in this.conf.dset.conf ){            
            this.data.dset[dts] = null;  // dataset data goes here
            if(init != undefined
               && init.dset != undefined
               && init.dset.conf != undefined){
                this.state.dsel[dts] = init.dset.conf[dts].state;
            } else {
                this.state.dsel[dts] = false; // selected datasets
            }
        }        
        
        if( init != undefined ){
            if( init.sequence != undefined ){   // obsolete ?
                this.data.sequence = init.sequence;
            }
            // all/selected sequences
            //-----------------------

            if( init.vseq != undefined ) this.data.vseq = init.vseq;
            if( init.vsel != undefined ) this.state.vsel = init.vsel;            
        }
                        
        // add/turn on spinner
        //--------------------
        
        $( this.conf.anchor ).append(
            "<div id='" + this.conf.spinner.replace("#","") + "'"
                + " class='bkd-lollipop-spinner'>"
                + "<img src='img/spinner.gif' class='bkd-spinner'>"
                + "</div>");
        $(this.conf.anchor).append(
            "<div id='" + this.conf.lnavig.replace("#","") + "'"
                + " class='bkd-lollipop-navig'></div>" +
            "<div id='" + this.conf.lpanel.replace("#","") + "'"
                + " class='bkd-lollipop-panel'></div>");

        $( this.conf.anchor ).append(
            "<div id='" + this.conf.details.replace("#","")
                + "' class='bkd-lollipop-details'"
                + " style='padding: 0px 10px;'></div>");
        
        $( this.conf.anchor + " .bkd-lollipop-spinner" ).show();
        
        // query for data
        //---------------

        //function callback( target ){
        //    return function( data, textStatus, jqXHR ){
        //        $('#bkd-lolipop-spinner').hide();
        //        target.buildView( data );
        //    }
        //}

        var dsconf = this.conf.dset;

        var dsurl = null;
        for(var dst in dsconf.conf){
            if( dsconf.conf[dst].state ){
                dsurl = dsconf.conf[dst].url;                
                this.state.dsel[dst] = true;
                
                if( dsurl != null ){
                    console.log( "BkdLollipop: initialize dsurl->: ", dsurl );
                    this.state.fload[dst]=true;
                    $.ajax( { url: dsurl} )
                        .done( function(target,dst){ return function( data,
                                                                       textStatus,
                                                                       jqXHR ){
                            
                            console.log( "BkdLollipop: init : td->", target.data ); 
                            target.data.dset[dst] = data.node.feature;
                            target.state.fload[dst]= false;
                            //target.prepareData(...);
                            
                            target.buildView(); } }( this, dst ) );
                }
            }
        }

        // NOTE: possible race condition here... 
        
        this.buildView();
    }

    setPOI( poi ){
        this.poi_data = poi;
        this.updatePOI();
    }

    updatePOI(){
        if( this.lollipop != null ){
            this.lollipop.updatePOI( this.poi_data );
        }
    }
    
    setSeqName(name){
        $('.g3_lollipop_domain text').text(name);
    }
    
    // redisplay after datasets change
    //--------------------------------
    
    rebuildView(){
        console.log("BkdLol: rebuildView() called");

        for( var dst in this.state.dsel){
            console.log( "BkdLol.rebuildView()", dst,
                         "dsel->", this.state.dsel[dst], 
                         "dset->", this.data.dset[dst] ); 
            
            if( this.state.dsel[dst] == false) continue;
            if( this.data.dset[dst] == null ){
                
                var dsconf = this.conf.dset;
                var dsurl =  dsconf.conf[dst].url;
                
                if( dsurl != null ){
                    console.log( "BkdLol: load dsurl->: ", dsurl );
                    this.state.fload[dst]=true;
                    $.ajax( { url: dsurl} )
                        .done( function(target,dst){ return function( data,
                                                                      textStatus,
                                                                       jqXHR ){
                            
                            console.log( "BkdLollipop: init : td->", target.data ); 
                            target.data.dset[dst] = data.node.feature;
                            target.state.fload[dst]= false;
                            //target.prepareData(...);
                            
                            target.buildView(); } }( this, dst ) );
                }
            }
        }

        // NOTE: possible race condition here...         
        this.buildView();        
    }

    selReset(){       
        for(var k in this.state.fstate){
            this.state.fstate[k].on = false;
        }
    }
    
    buildView(){

        console.log( "BkdLollipop.buildView() called");        
        console.log( "BkdLollipop.buildView()-> data",this.data);
        console.log( "BkdLollipop.buildView()-> state",this.state);
        
        //if( data != undefined && data != null) this.data.raw = data;

        // process data
        // ------------
        
        this.prepareData();

        // turn off spinner
        //-----------------

        $( this.conf.spinner ).hide();
        
        // bulid lollipop panel
        //---------------------

        this.buildNavig();

        this.buildPanel();

        // call listeners

        console.log( "BkdLollipop: listeners->", this.state.listener); 
        for( var l in this.state.listener){
            console.log( "BkdLollipop: listener ->",l);
            console.log( "BkdLollipop: state.listener ->",this.state.listener);
            
            this.state.listener[l]();
        }
        console.log( "BkdLollipop.buildView() DONE");
        
    }

    addListener(l){
        console.log( "BkdLollipop: addListener: listener->", l);
        this.state.listener.push(l);
    }
    
    getVal( data, path ){ 
        var cval = data;
        console.log(JSON.stringify(Object.keys(cval)));
        for(var j=0; j<path.length; j++){
            console.log( "CVAL: " + path[j] + " :: "); 
            //              + JSON.stringify(cval[ path[j] ]) );
            cval = cval[ path[j] ];
        }
        return cval;            
    }

    prepareData(){

        console.log("BkdLollipop.prepareData() -> scan features");

        var fbypos = {};
        
        for( var s in this.state.dsel){

            console.log( "BkdLollipop.prepareData()", s,
                         "dsel->", this.state.dsel[s], 
                         "dset->", this.data.dset[s] ); 
                        
            if( this.state.dsel[s] == false
                || this.data.dset[s] == null ) continue;

            var cdts = this.data.dset[s];  
            console.log( "BkdLollipop.prepareData: ", s,  cdts.length );

            // dataset to include

            for( var i = 0; i < cdts.length; i++ ){        
                if( cdts[i]["var-seq"] == this.state.vsel){ 
                    if( cdts[i].range == undefined
                        || cdts[i].range.length != 1) continue;
                    if( cdts[i].range[0].pos == undefined) continue;                    

                    var cpos = cdts[i].range[0].pos;
                    var cvs = cdts[i].range[0].sequence;
                    
                    if( !( cpos in fbypos) ) fbypos[cpos] = {};
                    if( !(cvs in fbypos[cpos] ) ) fbypos[cpos][cvs] = [];

                    // ???
                    this.state.fstate[ cpos ] = { "on":false, "rep":{} };

                    // ???
                    
                    //console.log("this.state.vsel:", this.state.vsel);
                    //console.log( this.data.vseq[this.state.vsel].length );

                    var cseq = this.data.sequence[ parseInt(cpos)-1 ]
                    var shrt = 'p.' + cseq + cpos + cvs;
                    
                    //console.log( "shrt", parseInt(cpos)-1, cpos, cvs , shrt);
                    
                    cdts[i].range[0]["name"] = shrt;
                    cdts[i].name = this.A2AAA[cseq] + cpos;
                    //console.log(cdts[i].name, this.A2AAA[cseq]);
                    
                    fbypos[cpos][cvs].push( cdts[i] );
                    
                } else{
                    //console.log("skipping...");
                }
            }
        }

        // fbypos - features from selected datasets for current seq varaint
                
        this.data.plist = [];

        for( var cpos in fbypos ){
            for( var cvs in fbypos[cpos] ){                
                
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
                
                cfeat['name'] = fbypos[cpos][cvs][0].name;
                cfeat['pos'] = parseInt(cpos);
                cfeat['res'] = cvs;
                cfeat['significance'] = [];

                for( var cent in fbypos[ cpos][cvs] ){
                    cfeat['significance']
                        .push( fbypos[cpos][cvs][cent]["csig-name"] );
                    continue;  // NOTE: just single val !!! fix me !!!
                }
                cfeat['significance'] = [ cfeat['significance'][0] ];
                this.data.plist.push( cfeat );                
            }
        }        
    }

    getVarCnt(vnme){
        console.log("CSNP: getVarCnt -> vname:", vnme);

        var cnt = new Array(this.data.sequence.length)
            .fill( 0, 0, this.data.sequence.length);
        
        if(vnme == 'cvar'){
            // current varaints
            
            var dset = this.data.plist;

            for(var i in dset){
                cnt[dset[i].pos]+=1;
            }
            return cnt;
        }

        var dset = this.data.dset[vnme];
        
        //var cmap = new Map();
        
        console.log("CSNP: len->", dset.length);
        console.log("CSNP: getVarCnt -> cnt(init):", cnt);
                
        for( var i = 0; i < dset.length; i++){
            var pos = dset[i].range[0].pos;
            cnt[pos]+=1;
        }
        
        console.log("CSNP: getVarCnt -> cnt(final):", cnt);

        return cnt;
        

    }

    buildNavig(){
        console.log("buildNavig:", "#"+this.conf.lnavig.replace("#",""));
        
        $("#"+this.conf.lnavig.replace("#",""))
            .html( '<table class="bkd-lollipop-navig-table" width="100%" align="center">'
                   + '<tr><td colspan="2">Click on a lollipop to see variants at that position. '
                   + 'Click on <a id="bkd-lollipop-help-1" html="">Help</a>'
                   + '<a id="bkd-lollipop-help-2" html="">'
                   + '<img title="Help" width="16" height="16" src="img/icons8-info.svg"/></a>'
                   + ' for more details.</td></tr>'
                   + '<tr><td id="'+this.conf.lzoom.replace("#",'')+'"></td>'
                   + '<td id="'+this.conf.lpan.replace("#",'')+'"></td></tr>'
                   + '</table>'
                   + '</div>'
                 );

        BKDmodal.init( '#bkd-modal-div',
                       '#bkd-lollipop-help-1',
                       'page?id=help-lollipop&ret=body' ); 

        BKDmodal.init( '#bkd-modal-div',
                       '#bkd-lollipop-help-2',
                       'page?id=help-lollipop&ret=body' ); 


        this.buildCtrl( this.conf.lzoom, this.conf.lpan, this.zoomaction, this.panaction);
    }

    buildCtrl( zoomanchor, pananchor, zoomaction, panaction ){

        zoomanchor = '#' + zoomanchor.replace("#",'')
        pananchor = '#' + pananchor.replace("#",'')

        console.log('buildCtrl:',zoomanchor, pananchor)

        if( ! d3.select( zoomanchor  ).empty() ){                    
            d3.select( zoomanchor + " *" ).remove();
        }

        if( ! d3.select( pananchor  ).empty() ){                    
            d3.select( pananchor + " *" ).remove();
        }

        d3.select( zoomanchor )
            .html( '<input type="button" id="bkd-lollipop-zoom-plus" name="plus" value="+">'
                   + '&nbsp;'
                   + '<input type="button" id="bkd-lollipop-zoom-reset" name="zreset" value="Zoom reset">'
                   + '&nbsp;'       
                   + '<input type="button" id="bkd-lollipop-zoom-minus" name="minus" value="-">');
                                
        d3.select( pananchor )
            .html( '<input type="button" id="bkd-lollipop-pan-left" name="plus" value="<">'
                   + '&nbsp;'
                   + '<input type="button" id="bkd-lollipop-pan-reset" name="preset" value="Center">'
                   + '&nbsp;'       
                   + '<input type="button" id="bkd-lollipop-pan-right" name="minus" value=">">');                        


        var curry = function(self, action, value){
              return function(e){
                     return action(self,e,value);
              }
        }

        d3.select( "#bkd-lollipop-zoom-plus").on('click', curry(this,zoomaction,'+' ));
        d3.select( "#bkd-lollipop-zoom-reset").on('click', curry(this,zoomaction,'r'));
        d3.select( "#bkd-lollipop-zoom-minus").on('click', curry(this,zoomaction,'-'));

        d3.select( "#bkd-lollipop-pan-left").on('click', curry(this,panaction,'+'));
        d3.select( "#bkd-lollipop-pan-reset").on('click', curry(this,panaction,'r'));
        d3.select( "#bkd-lollipop-pan-right").on('click', curry(this,panaction,'-'));
        
    }

    zoomaction( self, e, val ){
        if( val == '+' ){
           self.lollipop.domainBrushTransform(0,0.95);  // (translate,zoom)
        }                                            
        if( val == '-' ){
           self.lollipop.domainBrushTransform(0,1.05);  // (translate,zoom)
        }                                            
        if( val == 'r' ){
           self.lollipop.domainBrushTransform(0,0);  // (translate,zoom)
        }                                            
    }   

     panaction(self,e,val){
        if( val == '+' ){
           self.lollipop.domainBrushTransform(-0.05,1.0);  // (translate,zoom)
        }                                            
        if( val == '-' ){
           self.lollipop.domainBrushTransform(0.05,1.0);  // (translate,zoom)
        }                                            
        if( val == 'r' ){
           self.lollipop.domainBrushTransform(0,1.0);  // (translate,zoom)
        }                                            
     }   

    buildPanel(){

        console.log("BkdLol: buildPanel -> data", this.data);

        var mutation_data = this.data.plist;
                
        var mutation_data_default_settings = {
            x: "pos", // mutation position
            y: "name", // amino-acid changes
            factor: "significance", // classify mutations by a factor (optional)
        };
                        
        var pfam_data = {  
            "hgnc_symbol":"",
            "protein_name":"",
            "uniprot_id":"P04637",
            "length":this.data.sequence.length,
            "pfam":[  
                {  
                    "pfam_ac":"PF08563",
                    "pfam_start":1,
                    "pfam_end":this.data.sequence.length,
                    "pfam_id":this.data.seqname
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
        console.log( "this.conf-> ",this.conf );

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

        
        console.log( "BkdLol: this.conf-> ",this.conf );
        
        lollipop.options.chartWidth = this.conf.chartWidth;
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

        lollipop.data.poiData = this.poi_data;

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
        lollipop.domainBrushTransform(0,0.98);  // initial zoom
    }
    
    buildFDets( show, data, options ){
        
        // data:
        // show: final state (true/false) at data.position
        
        // selection: feature table viewer
        //--------------------------------
        
        var lpanel = options.lpanel;
        var dtconf = options.lpanel.conf.detailtable;

        console.log( "buildFDets: show->", show, " data->", data );
        
        lpanel.state.fstate[data.position].on = show;  // toggle state

        // 
        // lpanel.data.plist - list of feaures
        // lpanel.state.fstate - map of states
        
        var nldp = {};  // details not loaded: index by seq position
        var lddx = [];  // details loaded: indices in lpanel.data.plist
        
        for( var x in lpanel.data.plist ){
            var pos = lpanel.data.plist[x].pos.toString();
            if(  pos in lpanel.state.fstate ){   
                if( lpanel.state.fstate[pos].on ){
                    if( lpanel.data.plist[x].loaded == undefined ){
                        if( ! (pos in nldp) ){
                            nldp[pos] =[];
                        }
                        nldp[pos].push( x );                     
                    } else {
                        lddx.push( x );
                    }
                }
            }
        }

        if( Object.keys(nldp).length == 0 ){
            // No new features
            console.log( "buildFDets: no new features");
            lpanel.buildFDTable( options, lpanel, lddx );
        } else {
            var cpos = Object.keys(nldp)[0];
            if( ! this.fdqbusy ){
                lpanel.fdqbusy = true;
                // Fetch new features
                var curl = lpanel.conf.fdet.url + cpos;
                console.log( "URL(feature fetch): " + curl );
                
                $.get( curl,
                       (data) => {
                           lpanel.readFDets( data,
                                             options,
                                             cpos,
                                             nldp[cpos],
                                             lpanel,
                                             lddx ) } // position & features
                     ); 

            } else {
                log.console("dedlock ?");
                lpanel.buildFDTable( options, lpanel, lddx );
            }
        }
    }

    readFDets( data, options, pos, idxl, lpanel, lddx ) {
        
        // process incoming details
        //-------------------------
        
        this.procFDet( data, options, pos, idxl );

        lpanel.fdqbusy = false;
        
        // build detail table
        //-------------------
        
        this.buildFDTable( options, lpanel, lddx);       
    }

    procFDet( data, options, pos, idxl ){

        var lpanel = options.lpanel;   
        var plist = lpanel.data.plist;
        
        var features = data.node.node.feature;

        var npl = {};
        
        for( var cf in features ){   // incoming details
            var feat = features[ cf ];

            if( feat["var-seq"] != lpanel.state.vsel ) continue; // skip
                        
            var wtseq = this.data.vseq[lpanel.state.vsel][ parseInt(pos)-1 ]
            
            var shrt = 'p.' +  wtseq
                + feat.range[0].pos 
                + feat.range[0].sequence;
            
            var clinsig = [];
            
            if( npl[pos] == undefined ){                
                npl[pos] = {};
            }
            
            if( npl[pos][feat.range[0].sequence] == undefined ){
                
                npl[pos][ feat.range[0].sequence ] =
                    { snlink: [],
                      cvlink: [],
                      bklink: [],
                      cglink: [],
                      gnlink: [],
                      mimiref: [],
                      pos37: [],
                      pos38: [],
                      dtval: null,
                      name: this.A2AAA[wtseq] + pos,
                      shrt:[],
                      pos: pos,
                      res: feat.range[0].sequence,
                      clinsig: [] 
                    }
            }
            
            var npe = npl[pos][ feat.range[0].sequence ];

            if( "csig-name" in feat ){
                if( ! npe.clinsig.includes( feat["csig-name"]) ){
                    npe.clinsig.push( feat["csig-name"] );
                }
            }else{
                if( ! npe.clinsig.includes( 'unknown' ) ){
                    npe.clinsig.push('unknown');  // default clinsig  
                }
            }     

            var shrt = "p." + wtseq + pos + feat.range[0].sequence;
            if( !npe.shrt.includes(shrt)){
                npe.shrt.push(shrt);
            }
            
            for( var j = 0; j < feat.xref.length; j ++){
                // go over feature xrefs
                
                if( "grch37" == feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.pos37.includes( feat.xref[j].ac ) ){
                        npe.pos37.push( feat.xref[j].ac );
                    }
                    continue;
                }
                
                if( "grch37.p13" == feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.pos37.includes( feat.xref[j].ac ) ){
                        npe.pos37.push( feat.xref[j].ac );                       
                    }
                    continue;
                }
                
                if( "grch38" == feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.pos38.includes( feat.xref[j].ac ) ){
                        npe.pos38.push( feat.xref[j].ac );                       
                    }
                    continue;
                }
                
                if( "grch38.p13" == feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.pos38.includes( feat.xref[j].ac ) ){
                        npe.pos38.push( feat.xref[j].ac );
                    }
                    continue;
                }
                
                if( "dbsnp"== feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.snlink.includes( feat.xref[j].ac ) ){
                        npe.snlink.push( feat.xref[j].ac );                    
                    }
                    continue;
                }
                
                if( "clinvar"== feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.cvlink.includes( feat.xref[j].ac ) ){
                        npe.cvlink.push( feat.xref[j].ac );                    
                    }
                    continue;
                }
                if( "clingen"== feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.cglink.includes( feat.xref[j].ac ) ){
                        npe.cglink.push( feat.xref[j].ac );                    
                    }
                    continue;
                }
                if( "gnomad"== feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.gnlink.includes( feat.xref[j].ac ) ){
                        npe.gnlink.push( feat.xref[j].ac );                    
                    }
                    continue;
                }
                if( "bkd"== feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.bklink.includes( feat.xref[j].ac ) ){ 
                        npe.bklink.push( feat.xref[j].ac );                    
                    }
                    continue;
                }
                if( "mim"== feat.xref[j].ns.toLowerCase() ){
                    if( ! npe.mimiref.includes( feat.xref[j].ac ) ){ 
                        npe.mimiref.push( feat.xref[j].ac );                    
                    }
                    continue;
                }
            }
            
            npe.loaded = true;
        }

        var ii = 0;

        for( var p in npl ){
            for( var aa in npl[p] ){
                if( ii < idxl.length ){
                    plist[idxl[ii]] = npl[p][aa];
                } else{
                    console.log("should nor happen!!!");
                }
                ii += 1;
            }
        }
    }
        
    buildFDTable( options, lpanel, lddx ){

        //var lpanel = options.lpanel;
        var dtconf = options.lpanel.conf.detailtable;

        var rows = {};
        
        for( var x in lpanel.data.plist ){
            var pos = lpanel.data.plist[x].pos.toString(); 
            if(  pos in lpanel.state.fstate ){
                if( lpanel.state.fstate[pos].on){                   
                    if( ! (pos in rows) ){
                        rows[pos]= [];
                    }
                    rows[pos].push( lpanel.data.plist[x] );                    
                }
            }
        }

        var html = "";
        
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
            
            for( var r in rows){
                for( var rr in rows[r]){
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

                    console.log("row", r, rr, rows[r][rr]);

                    for(var c=0; c < dtconf.column.length; c++ ){
                        
                        var vlst = rows[r][rr][dtconf.column[c].value];
                        var cclass = dtconf.column[c]['data_class'];
                        if( vlst != undefined && vlst.length > 0 ){
                            hrow += "<td class='"+ cclass +"'>";
                            for(var cc = 0; cc <vlst.length; cc++){

                                var cval = vlst[cc];
                                if( dtconf.column[c].trim != undefined){
                                    const re = new RegExp(dtconf.column[c].trim);
                                    cval = cval.replace(re,'');
                                }

                                if(dtconf.column[c].type == 'hlink'){
                                    var curl= dtconf.column[c].url + cval;
                                    hrow += "<a target='_bkd' href='"+curl+"'>"
                                        + cval
                                        + "</a> ";
                                } else {
                                    if( cc > 0 ){
                                        hrow += "/"+ cval;
                                    } else {
                                        hrow +=  cval;
                                    }
                                }
                            }
                            hrow += "</td>";
                        } else {
                            hrow += "<td class='"+ cclass +"'>&nbsp;</td>";
                        }
                    }
                    hrow += "</tr>";
                    $(options.anchor + " table").append( hrow );
                }
            }
            $( options.anchor ).show();
        } else {
            $( options.anchor ).hide();
            $( options.anchor + " table" ).remove();
        }

        // NOTE: not used (class selections)

        var ftslist = lpanel.getfselist( lpanel.state.ftypesel );       
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
