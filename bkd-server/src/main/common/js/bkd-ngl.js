console.log("bkd-ngl: common");
 
class BkdNGL{
    
    constructor( config, data, msa ){

        console.log(" BkdNGL: new-> ", config );
        this._conf = config;
        this.anchor = config.anchor;
        this.name = config.name;
        
        this._data = data;  // BKDnodeFeatures

        // msa: base + key list
        //   for now  [ {base: BkdView, key:'mymsa2a'},
        //              {base: BkdView, key:'mymsa2b'},
        //              {base: BkdView, key:'mymsa'}]

        this._msa = msa;    
        
        console.log("TOPO: BkdNGL MSA:", this._msa);
        
        
        this.pfx = "bkd-ngl-" + this.name;
        this._view = {};

        this.currep = [];
        
        this.rsel = { all: "all", hiqc: "all", chain: "all", aset: "all" };
        this.rcol = { rain: null, asel: null,
                      cmsa: null, csnp: null };

        this.detail = false;
        this.detailState = 0;
        this.detailList = [{ name:'out',
                             icon:'img/search-plus-white.svg' },
                           { name:'shade1',
                             icon:'img/search-d1-white.svg' },
                           { name:'shade2',
                             icon:'img/search-d2-white.svg' },
                           { name:'shade3',
                             icon:'img/search-d3-white.svg' },
                           { name:'in',
                             icon:'img/search-minus-white.svg' },
                           { name:'shade3',
                              icon:'img/search-d3-white.svg' },
                           { name:'shade2',
                              icon:'img/search-d2-white.svg' },
                           { name:'shade1',
                              icon:'img/search-d1-white.svg' }
                          ]
        this.poi = null;
        this.poiColor = "#674B70";

        this.state = { sel:{ hiqc: false, chain: false,
                             aset: false, canon: false },
                       
                       col:{ rain: true, asel: false,
                             cmsa: false, csnp: false,
                             topo: false, sstr: false,
                             bfac: false, cchn: false },
                       
                       vcls:{ ben: false, lben: false,
                              cevd: false, lpat: false,
                              pat: false}
                     };

        this.getvcls = config.controls.vcls.getvcls;
        this.getsels = config.controls.vcls.getsels;
        this.getpois = config.controls.vcls.getpois;

        this.view = {
            chains: { A: true},
            poi:{ style: "ball+stick", scale: 20.0,
                  color: "#C0C0C0", opaq :0.75,
                  detail: "none",
                  dstyle: {
                      none: { style: "" },
                      ba00: { dstyle: "ball+stick",  dr: 0.0,  dcolor: "",
                              cstyle: "ball+stick", ccolor: ""},
                      ba10: { dstyle: "ball+stick", dr: 10.0, dcolor: "",
                              cstyle: "ball+stick", ccolor: ""}
                          },                  
                  on: false, rep: [] },
            
            var:{ style: "ball+stick", scale: 10.0,
                  on: false, rep: [] },

            lps:{ style: "ball+stick", scale: 10.0,
                  on: false, rep: [] },
            
            chn:{ style: "cartoon", scale: 10.0, color: "solid",

                  cselect:{
                      all:   { mode:"all" },
                      chain: { mode:"chain", clist:['A'] },                      
                      hiqc:  {
                          mode: "step",
                    //states: [{ val: "bfact", vmin: -1000, vmax: 0.5 },
                    //         { val: "bfact", vmin: -1000, vmax: 0.5 } ]
                          states: [{ val: "bfact", vmin: 0.5, vmax: 1000.0 }]
                      },
                      aset:  { mode:"aset", rlist:[1,2,3,4] }
                  },
                  
                  cstyle: {
                      "solid": {mode: "solid", color:"green", opaq: 1.0 },
                            
                      "cdef": {mode: "grad", opaq: 1.0, val: "atomindex" },

                      "cpos": {mode: "grad", opaq: 1.0, val: "atomindex" },

                      "cchn": {mode: "solid", opaq: 1.0,
                               clist:[ "#46AB21", "#80B192",
                                       "#6A8D92","#646890"] },
                      
                      "cmsa": { mode: "grad", // valLo: 0, valHi: 1.0, 
                                colLo: "magenta", colHi:"#808080",
                                //cbasis: ["red","yellow","blue"],
                                gamma: 2.0, opaq: 1.0,
                                msa: this._msa[0], val: "ent" },
                            
                      "csnp": {mode: "grad", 
                               colLo: "grey", colHi:"magenta",
                               cbasis: ["red","white","blue"],
                               gamma: 5.0, opaq: 1.0, val: "bfact" },
                            
                      "cbfc": {mode: "grad",valLo: 0, valHi: 1.0, 
                               colLo: "grey", colHi:"magenta",
                               cbasis: ["red","white","blue"],
                               gamma: 10.0, opaq: 1.0, val: "bfact" },
                      
                      "squal": {mode: "grad", valLo: 0, valHi: 1.0, 
                                colLo: "grey", colHi:"magenta",
                                cbasis: ["red","white","blue"],
                                gamma: 2.2, opaq: 1.0, val: "bfact" },
                      
                      "strsqS": {mode: "step", val: "bfact", vcut: 0.5,
                                 colLo: "green", opaqLo: 1.0, 
                                 colHi: "gray", opaqHi: 1.0 },
                      
                      "strsqT": {mode: "step", val: "bfact", vcut: 0.5,
                                 colLo: "green", opaqLo: 1.0, 
                                 colHi: "gray", opaqHi:0.6 }
                  }, 
                  on: true, rep: [] }
        }

        d3.select( this.anchor )
            .html( '<div id="'+ this.pfx + '-controls" '
                   + ' class="bkd-ngl-controls" '
                   + ' style="background-color: black; color: white;">'
                   + '<table class="bkd-ngl-controls-table" width="100%"'
                   + ' align="center"></table>'
                   + '</div>'
                   + '<div id="'+ this.pfx + '-view" '
                   + ' class="bkd-ngl-view"></div>');

        console.log("BkdNGL: controls->", config.controls);

        var row = d3.select( this.anchor + " .bkd-ngl-controls-table")
            .append("tr");
        
        row.append("td")
            .attr("class", cname)
            .attr("colspan","1")
            .attr("align","left")            
        //.style("padding-left","3px")
        //.style("padding-top","3px")
            .append("img")
            .attr("src","img/hamburger-menu-white.svg")
            .classed("bkd-ngl-icon",true);
        
        row.append("td")
            .attr("class", cname)
            .attr("colspan","1")
            .attr("width","95%")
            .attr("align", "center")
            .attr("id",this.pfx + '-controls-var');
        
        row.append("td")
            .attr("class", cname)
            .attr("colspan","1")
            .attr("align","right")
            .style("padding-right","4px")
            .style("padding-top","3px")
            .append("img")
            .attr("src","img/search-plus-white.svg")
            .attr("id", this.pfx + "controls-detail")
            .classed("bkd-ngl-icon",true);

        $( "#" + this.pfx + "controls-detail")
            .on( 'click',
                 { self: this },
                 (event) => {
                     console.log( 'click: event->', event.target  );
                     console.log( 'click: data->', event.data  );
                     event.data.self.rollDetail(! event.shiftKey );
                     
                 });

        d3.select( "#" + this.pfx + "controls-detail")
            .style("visibility", "hidden");
        
        // vcls selections
        //----------------

        this.getvcls = config.controls.vcls.getvcls;
        this.getsels = config.controls.vcls.getsels;
        
        for( var j in config.controls.vcls.options ){
                    
            var copt = config.controls.vcls.options[j];
            
            console.log( "BkdNGL: copt:", copt," copt.id->", cname + "-" + j );
            
            var oname = cname;
            //mitem.children.push( { title: copt.label,
            //                       action: function(d){
            //                         console.log("action:",d) }
            //                     } );
                    
            if( config.controls.vcls.type != 'radio') oname = oname + "-" + j;
                    
            d3.select( '#' + this.pfx + '-controls-var' )
                .append( "input" )
                .attr( "type", config.controls.vcls.type)
                .attr( "id", cname + "-" + j )
                .attr( "name", oname )
                .attr( "value", config.controls.vcls.name+":"+copt.value)
                .attr( "style", "accent-color: " + copt.color+ ";");
                    
            d3.select( '#' + this.pfx + '-controls-var' )
                .append( "label" )
                .attr( "for" , cname + "-" + j )
                .html( copt.label + " &nbsp;&nbsp;" ); //  \&#x2611;"
                    
            $( "#" + cname + "-" + j )
                .on( 'click',
                     { self: this },
                     (event) => {
                         console.debug( 'click: event->', event.target  );
                         var pv = event.target.value.split(':');
                         console.debug( 'click: par->', pv[0],
                                        ' val->', pv[1],

                                        ' state->', event.target.checked);
                         event.data.self.state[pv[0]][pv[1]]
                             = event.target.checked;
                         if( event.target.type == 'radio'){
                             var cst = event.data.self.state[pv[0]];
                             for(var i in cst ){
                                 if( i != pv[1] ){
                                     cst[i] = ! event.target.checked;
                                 }
                             }
                         }
                         
                         console.debug( 'BkdNGL: state->',
                                        event.data.self.state );
                         event.data.self.setHamStyle( pv[0], pv[1],
                                                      event.target.checked );
                     });
        }      
        
        
        // hamburger menu
        //---------------
        
        var menu = [];
        
        for( var i in config.controls.menu){
            var mitem = {children:[]};
            menu.push(mitem);            
            var cname = this.pfx + "-controls-" + config.controls.menu[i].name;

            mitem.title = config.controls.menu[i].label;
            var osel = this.anchor + " .bkd-ngl-controls-table ." + cname;
            
            var cctrl = config.controls.menu[i].name;
            var ctype = config.controls.menu[i].type;
                
            for( var j in config.controls.menu[i].options ){
                var copt = config.controls.menu[i].options[j];  // eg: swmsel
                               
                var title = function( ictrl, iopt, itype, iself  ){
                    return function(d){                        
                        var prefix ="";
                        var label = iopt.label;
                        if( ictrl in iself.state ){
                            var icst = iself.state[ictrl][iopt.value];
                            
                            if(itype == "cbox"){
                                if( icst ){                                
                                    prefix = "&#9745; ";
                                } else {
                                    prefix = "&#9744; ";
                                }
                            }
                            
                            if(itype == "radio" || itype == "radio-off"){
                                if( icst ){                                
                                    prefix = "&#9673; "; // fisheye
                                } else {
                                    prefix = "&#9678; "; // bullseye;
                                    // "&#8857; ";  // dotted dircle
                                }
                            }
                        }
                        
                        return prefix + label;                        
                    }                    
                }( cctrl, copt, ctype, this );
                
                var callback = function( ictrl, iopt, itype, iself ){
                    return function(d) {
                        console.log( "HAM: callback:", ictrl, iopt, itype );
                        
                        if( ictrl in iself.state ){
                            var icst = iself.state[ictrl][iopt.value];
                            
                            if( itype== "radio"  ){ // ON: always one

                                if( iself.state[ictrl][iopt.value] == false ){
                                    // toggle only to true
                                    iself.state[ictrl][iopt.value] =
                                        !(iself.state[ictrl][iopt.value]);
                                    for( var k in iself.state[ictrl]){
                                        if( k != iopt.value ){
                                            iself.state[ictrl][k] = false;
                                        }
                                    }                                    
                                }
                                
                            } else if( itype == "radio-off" ) {
                                // ON: none or one

                                // always toggle
                                iself.state[ictrl][iopt.value] =
                                    !(iself.state[ictrl][iopt.value]);
                                
                                if( iself.state[ictrl][iopt.value] == true ){
                                    // toggle others
                                    for( var k in iself.state[ictrl]){
                                        if( k != iopt.value ){
                                            iself.state[ictrl][k] = false;
                                        }
                                    }                                    
                                }
                              
                            } else {
                                // checkbox: ON: any  
                                iself.state[ictrl][iopt.value] =
                                    !(iself.state[ictrl][iopt.value]);
                            }
                            console.log( "HAM: statefull: ", ictrl ); 
                        } else {
                            console.log( "HAM: stateless" );
                        }
                        iself.menucallback(d, ictrl, iopt, iself);
                    }
                }( cctrl, copt, ctype, this );
                                
                mitem.children.push( { title: title,
                                       action: callback
                                     } );
            }                
        }    
        
        d3.select(".bkd-ngl-icon")
            .on('click', d3.contextMenu(menu));
        
        $( this.anchor ).show();
        
        var phght = $( this.anchor ).height();
        var chght = $( '#' + this.pfx+'-controls' ).height();
        $( '#' + this.pfx + '-view' ).height( phght - chght - 0 );
        this.nglstage = new NGL.Stage( this.pfx + '-view' );
        $( this.anchor ).hide();
        
        console.log( "BkdNGL: PDB load:" + config.url );
        
        var loadCallback = function( args ){

            console.log( "BkdNGL: currying loadCallback -> args:",args);
            
            return function( o ){            

                console.log( "BkdNGL: loadCallback -> args:",args);
                
                args.self.nglcomp = o;
                
                var selStr = "";
                var selQCut = args.cutQC;
                
                var rmap = {};  //  eg rmap[A][123];
            
                o.structure.eachAtom( function(atom) {
                    var bf = atom.bfactor;
                    var cnm = atom.chainname;                   
                    var rno = atom.resno;
                    
                    if( bf > selQCut) {
                        if( rmap[cnm]  == undefined ) rmap[cnm] = {};
                        if( rmap[cnm][rno] == undefined ){
                            rmap[cnm][rno] = true;
                        }
                    }
                    
                    if( cnm in args.self.view.chains ){
                        //console.log( "ZZZZ: chain(o):",
                        //             cnm, args.self.view.chains);
                    } else {
                        args.self.view.chains[cnm] = false;
                        //console.log( "ZZZZ: chain(+):",
                        //             cnm, args.self.view.chains);
                    }
                    
                    //console.log(cnm,rno,bf);                    
                });
                
                
                //var swmrmap = rmap;
                var rk = Object.keys( rmap );
                //console.log("#### RK:", rk);

                //var ckl = [];
                for( var c in rk ){    // chains
                    //console.log("#### RM:",rk[c], rmap[rk[c]]);
                    var ckl = Object.keys( rmap[rk[c]] );
                    ckl.sort(function(a,b) { Number(a) > Number(b) } );
                    //console.log("####:: ",rk[c], ":",ckl);                    
                };
                
                var sel = "";
                var prev = Number(ckl[0]);
                var lop = "";
                for( var c in ckl ){
                    var nc = Number( ckl[c] );
                    //console.log("#### nc: ",nc, prev, nc - prev);
                    if( nc > prev ){
                        if( nc - prev == 1 ){ // seq
                            if( lop != "-"){
                                lop = "-";
                                sel = sel + "-";
                            }
                            prev = nc;
                        } else {  // cont or gap                            
                            if( lop == "-" ){ // gap starts
                                lop = "";
                                sel = sel + prev + " or " + nc;
                            } else{  // next gap 
                                sel = sel + " or " + nc;
                            }
                            prev = nc;
                        }                            
                    } else {
                        sel = String(nc);
                        prev = nc;
                    }
                }


                args.self.rsel.hiqc = sel;
                args.self.rsel.all = "all";
                
                o.setSelection( args.self.rsel.all );
                
                args.self.rerender();
                o.autoView( "all" );
                console.log( "BkdNGL: loaded");
            };            
        }

        this.nglstage.loadFile(  config.url ) 
            .then( loadCallback( { self: this,
                                   cutQC: 0.5 }));        
    }
    
    rerender(){        
        console.log("HAM rerender called");
        this.setHamStyle("vcls",null, null);
        console.log("HAM rerender DONE");
    }

    setPOI( poi ){
        console.log("ZZZZ setPOI called");
        this.poi = poi;

        if( this.poi.pos.length > 0){
            this.view.poi.on = true;

            // show detail
            
            d3.select( "#" + this.pfx + "controls-detail")
                .style("visibility", "visible")
            
        } else {
            this.view.poi.on = false;

            // hide detail

            d3.select( "#" + this.pfx + "controls-detail")
                .style("visibility", "hidden");

            
        }                       
        
        this.setHamStyle( 'poi', this.poi, null );
        console.log("ZZZZ setPOI DONE");
    }
    
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    rollDetail( forward ){
        console.log( " rollDetail: ", this.detailState, " Forward:", forward );

        var nstate = this.detailState;

        if(forward){
            nstate = nstate+1;
            if( nstate >= this.detailList.length) nstate = 0;            
        } else {
            nstate = nstate-1;
            if( nstate < 0) nstate = this.detailList.length - 1;
        }
        console.log( "New Detail State: ", nstate);
        
        var sname= this.detailList[nstate].name;
        var sicon= this.detailList[nstate].icon;

        d3.select( "#" + this.pfx + "controls-detail")
            .attr("src", sicon);
        this.detailState = nstate;

        if( sname=='out' ){
            this.setOutStyle();
            return;
        }

        if( sname=='in' ){
            this.setInStyle();
            return;
        }

        if( sname=='shade1' ){
            this.setShade1Style();
            return;
        }
        
        if( sname=='shade2' ){
            this.setShade2Style();
            return;
        }
        
        if( sname=='shade3' ){
            this.setShade3Style();
            return;
        }
        
    }
    
    setOutStyle(){

        // var newrep = this.nglcomp.addRepresentation(
        //     "cartoon",  { color: this.currentColorScheme } );
        
        // this.nglcomp.setSelection( "all" );
        
        //for(var r in this.currep){
        //    this.nglcomp.removeRepresentation( this.currep[r] );
        //}
        
        //this.currep.push(newrep);
        this.rerender();
        //this.nglcomp.autoView("all");
        
    }
    
    setShade1Style(){

        var poiSel = this.getPoiSelection( this.poi ); 
        if( poiSel == null ) return;
                
        var spos = String(this.poi.pos[0]);
        var pclr = this.poiColor;
        
        if( this._conf.poiColor != undefined ) pclr = this._conf.poiColor;  
        
        var cs = NGL.ColormakerRegistry
            .addSelectionScheme( [ [ pclr, spos + " and _C"],
                                   ["element","*"] ],"poi" );

        //var newOutRep = this.nglcomp.addRepresentation(
        //    "cartoon",  { color: this.currentColorScheme, sele: "all" } );

        
        var newPoiRep = this.nglcomp.addRepresentation( 
            "ball+stick", { color: "magenta", sele: spos + ":A and _C" } );
        
        //var newLicRep = this.nglcomp.addRepresentation( 
        //    "cartoon", { color: "darkmagenta", sele: poiSel.sel } );
        
        for(var r in this.currep){
            this.nglcomp.removeRepresentation( this.currep[r] );
        }
        this.currep = [];
        
        //this.currep.push( newOutRep );
        //this.currep.push( newLicRep );
        this.currep.push( newPoiRep );
        
        this.nglcomp.autoView(poiSel.sel);                
    }

    setShade2Style(){

        var poiSel = this.getPoiSelection( this.poi ); 
        if( poiSel == null ) return;
                
        var spos = String(this.poi.pos[0]);
        var pclr = this.poiColor;
        
        if( this._conf.poiColor != undefined ) pclr = this._conf.poiColor;  
        
        var cs = NGL.ColormakerRegistry
            .addSelectionScheme( [ [ pclr, spos + " and _C"],
                                   ["element","*"] ],"poi" );

        //var newOutRep = this.nglcomp.addRepresentation(
        //    "cartoon",  { color: this.currentColorScheme, sele: "all" } );

        
       var newPoiRep = this.nglcomp.addRepresentation( 
            "ball+stick", { color: "magenta", sele: spos + ":A and _C" } );
        
        var newLicRep = this.nglcomp.addRepresentation( 
            "licorice", { color: "element", sele: poiSel.sel } );

        var newBASRep = this.nglcomp.addRepresentation( 
            "ball+stick", { color: "magenta", sele: spos } );
                
        
        for(var r in this.currep){
            this.nglcomp.removeRepresentation( this.currep[r] );
        }

        this.currep = [];
        
        //this.currep.push( newOutRep );
        this.currep.push( newLicRep );
        this.currep.push( newBASRep );
        this.currep.push( newPoiRep );
        
        this.nglcomp.autoView(poiSel.sel);                
    }
    
    setShade3Style(){

        var poiSel = this.getPoiSelection( this.poi ); 
        if( poiSel == null ) return;
                
        var spos = String(this.poi.pos[0]);
        var pclr = this.poiColor;
        
        if( this._conf.poiColor != undefined ) pclr = this._conf.poiColor;  
        
        var cs = NGL.ColormakerRegistry
            .addSelectionScheme( [ [ pclr, spos + " and _C"],
                                   ["element","*"] ],"poi" );

        //var newOutRep = this.nglcomp.addRepresentation(
        //    "cartoon",  { color: this.currentColorScheme, sele: "all" } );

        
       var newPoiBasRep = this.nglcomp.addRepresentation( 
           "ball+stick", { color: "element", sele: spos + ":A" } );
        
       var newPoiSurRep = this.nglcomp.addRepresentation( 
           "surface", { color: "darkmagenta", surfaceType: "av",
                        opacity: 0.1, sele: spos + ":A" } );
        
        //var newLicRep = this.nglcomp.addRepresentation( 
        //    "cartoon", { color: "darkmagenta", sele: poiSel.sel } );
        
        for(var r in this.currep){
            this.nglcomp.removeRepresentation( this.currep[r] );
        }
        this.currep = [];
        
        //this.currep.push( newOutRep );
        //this.currep.push( newLicRep );
        this.currep.push( newPoiBasRep );
        this.currep.push( newPoiSurRep );
        
        this.nglcomp.autoView(poiSel.sel);                
    }
    
    setInStyle(){
        
        var poiSel = this.getPoiSelection( this.poi ); 
        if( poiSel == null ) return;
        console.log( "SEL:" , poiSel.sel );
        
        var spos = String(this.poi.pos[0]);
        var pclr = this.poiColor;
        
        if( this._conf.poiColor != undefined ) pclr = this._conf.poiColor;  
        
        var cs = NGL.ColormakerRegistry
            .addSelectionScheme( [ [ pclr, spos + " and _C"],
                                   ["element","*"] ],"poi" );
        
        var newLicRep = this.nglcomp.addRepresentation( 
            "licorice", { color: "element", sele: poiSel.sel } );
        
        var newBasRep = this.nglcomp.addRepresentation( 
            "ball+stick", { color: "magenta", sele: spos + ":A and _C" } );

       var newPoiSurRep = this.nglcomp.addRepresentation( 
           "surface", { color: "darkmagenta", surfaceType: "av",
                        opacity: 0.1, sele: spos + ":A" } );

        
        for(var r in this.currep){
            this.nglcomp.removeRepresentation( this.currep[r] );
        }
        this.currep = [];
        
        this.currep.push( newLicRep );
        this.currep.push( newBasRep );
        this.currep.push( newPoiSurRep );
        
        this.nglcomp.autoView(poiSel.sel);        
    }
        
    toggleDetail(){
        console.log( " detail: ", this.detail );

        this.detail =   ! this.detail ;
        
        if( this.detail ){
            d3.select( "#" + this.pfx + "controls-detail")
                .attr("src","img/search-minus-white.svg");
        } else {
            d3.select( "#" + this.pfx + "controls-detail")
                .attr("src","img/search-plus-white.svg");            
        }

        if( this.detail ){
            
            var mst = this.nglcomp.structure;
            var rmap = {};
            
            var xr = null;
            var yr = null;
            var zr = null;

            var poi = this.poi;
            
            mst.eachAtom( function(atom) {                            
                var cnm = atom.chainname;                   
                var rno = atom.resno;
                // console.log("POI:",poi);
                if(cnm == 'A' && poi.pos.includes( Number(rno) ) ){
                    xr = atom.x;
                    yr = atom.y;                   
                    zr = atom.z;
                    console.log( xr, yr, zr );
                }
            });

            if( xr == null) {
                return;
            }
            
            mst.eachAtom( function(atom) {
                var x = xr - atom.x;
                var y = yr - atom.y;
                var z = zr - atom.z;
                var cnm = atom.chainname;
                var rno = atom.resno;
                
                if( x*x + y*y + z*z < 300 ){                    
                    if( rmap[cnm]  == undefined ) rmap[cnm] = {};
                    if( rmap[cnm][rno] == undefined ){
                        rmap[cnm][rno] = true;
                    }
                }               
            });
            
            var rk = Object.keys( rmap );
            
            var sel = "";
           
            for( var c in rk ){ // go over chains
                // console.log("#### RM:",rk[c], rmap[rk[c]]);
                var ckl = Object.keys( rmap[rk[c]] );
                ckl.sort(function(a,b) { Number(a) > Number(b) } );
                // console.log("####:: ",rk[c], ":",ckl);                    
                
                var prev = Number(ckl[0]);
                var lop = "";
                for( var c in ckl ){
                    var nc = Number( ckl[c] );
                    // console.log("#### nc: ",nc, prev, nc - prev);
                    if( nc > prev ){
                        if( nc - prev == 1 ){ // seq
                            if( lop != "-"){
                                lop = "-";
                                sel = sel + "-";
                            }
                            prev = nc;
                        } else {  // cont or gap                            
                            if( lop == "-" ){ // gap starts
                                lop = "";
                                sel = sel + prev + " or " + nc;
                            } else{  // next gap 
                                sel = sel + " or " + nc;
                            }
                            prev = nc;
                        }                            
                    } else {
                        sel = String(nc);
                        prev = nc;
                    }
                }
            }
            
            console.log( "SEL:" , sel[sel.length-1] );

            if( sel[sel.length-1] == '-') sel = sel.substring(0,sel.length-1);

            console.log( "SEL:" , sel );
            
            var spos = String(this.poi.pos[0]);
            var pclr = this.poiColor;
            
            if( this._conf.poiColor != undefined ) pclr = this._conf.poiColor;  

                        
            var cs = NGL.ColormakerRegistry
                .addSelectionScheme( [ [ pclr, spos + " and _C"],
                                       ["element","*"] ],"poi" );
            
            var newLicRep = this.nglcomp.addRepresentation( 
                "licorice", { color: "element", sele: sel } );

            var newBASRep = this.nglcomp.addRepresentation( 
                "ball+stick", { color: "magenta",
                                sele: String(poi.pos[0]) + ":A and _C" } );
            
            //var newrep = this.nglcomp.addRepresentation( 
            //    "surface", { color: cs, type: "dot" } );

            for(var r in this.currep){
                this.nglcomp.removeRepresentation( this.currep[r] );
            }
            
            this.currep.push( newLicRep );
            this.currep.push( newBASRep );
            //this.nglcomp.setSelection( sel );
            
            this.nglcomp.autoView(sel);            
            
        } else {

            var newrep = this.nglcomp.addRepresentation(
                "cartoon",  { color: this.currentColorScheme } );

            this.nglcomp.setSelection( "all" );
            
            for(var r in this.currep){
                this.nglcomp.removeRepresentation( this.currep[r] );
            }
            
            this.currep.push(newrep);
            this.nglcomp.autoView("all");
        }                    
    }
    
    setHamStyle( par1, value1, menu1 ){
        
        //console.log( "HAM setHamStyle called:", par, value, menu);
        console.log( "HAM data.state:",this.state);

        console.log( "HAM data.fstate:",this._data.fstate);
        //console.log( "HAM ngl._data:",this._data);
               
        console.log("HAM ngl._msa:", this._msa);
        //console.log( "HAM ngl._msa[0].ent:",  this._msa[0].getEnt() );


        //console.log("HAM component:", this.nglcomp);
        
        var op = "change";
        var state = this.state;

        var  chncol = this.view.chn.cstyle;
        var  chnsel = this.view.chn.cselect;

        console.log("HAM chncol:", this.view.chn.cstyle);
        
        var view = this.view;
        console.log("HAM view (old):", view);
        
        //{ poi:{ style: "ball+stick", on: false,
        //        detail: false, dstyle: "ball+stick",
        //        rep: [] },
        //  var:{ style: "ball+stick", on: false,
        //        rep: [] },
        //  lps:{ style: "ball+stick", on: false,
        //        rep: [] },
        //  chn:{ style: "cartoon", on: true,
        //        rep: [] }
        //      }
        
        // get lpops
        //----------

        var lpops = this.getsels( {} );
        console.log("HAM: lpops:", lpops  );

        this.view.lps.on = false;
         
        for( var p in lpops ){ 
            if( lpops[p].on ){
                this.view.lps.on = true;
                break;
            } 
        }

        console.log( "HAM lps.on:", this.view.lps.on );

        // get varaint classes (vcls)
        //---------------------------

        this.view.var.on = false;
        
        for( var v in state.vcls ){
            if( state.vcls[v] ){
                this.view.var.on = true;
                break;
            }
        }
        
        console.log( "HAM var.on:", this.view.var.on );
        
        // render: main chain
        //-------------------

        /*
        chn:{ style: "cartoon", scale: 10.0, color: "solid",
              cstyle: { "solid": {mode: "solid", color:"green", opaq: 1.0 },
                        "sqpos": {mode: "grad", opaq: 1.0, val: "atomindex" },
                        "sqmsa": {mode: "grad", colL: "grey", colH:"magenta", 
                                  gamma: 2.1, opaq: 1.0, val: "msa" },
                        "squal": {mode: "grad", colL: "grey", colH:"magenta", 
                                  gamma: 2.1, opaq: 1.0, val: "bfact" },
                        "strsq": {mode: "step", colL: "green", opaqL: 1.0, 
                                  colL:"gray", opaqH:0.6, val: "bfact", 
                                  vcut: 0.5 }
                      } 
              on: true, rep: [] }
        */
        
        if( ! view.chn.on ){
            if( view.chn.rep.length > 0 ){
                for( var r in view.chn.rep ){
                    view.chn.rep[r].dispose();
                }
                view.chn.rep = [];
            }
        } else {
        
            // only if op == "change" ?
            
            if( view.chn.rep.length > 0 ){
                for( var r in view.chn.rep ){
                    view.chn.rep[r].dispose();
                }
                view.chn.rep = [];
            }


            if( this.currep.length > 0 ){
                for( var r in this.currep ){
                    this.currep[r].dispose();
                }
                this.currep = [];
            }
           
            // main chain: outline
            //--------------------
            
            var chnOutScheme = NGL.ColormakerRegistry
                .addSelectionScheme( [[ "white", "*" ]], "chainOut" );
            
            var chnOutRep = this.nglcomp.addRepresentation(
                "cartoon", { color: chnOutScheme, 
                             sele: "*",
                             smoothSheet: true,
                             quality: "high",
                             metalness: 0.1,
                             roughness: 0.0,
                             opacity: 0.33 } );
            
            view.chn.rep.push( chnOutRep );
            
            // main chain: selection
            //----------------------

            var selLst = [];
            var csconf = { mode: "all" };
            var selChn = "";
            console.log( "HAM: selection: ",  state.sel);
                        
            if( state.sel.aset ){  // set of residues
                csconf = chnsel.aset;
            }
            
            if( state.sel.chain ){  // set of chains
                var csconf = chnsel.chain;
                for( var c in csconf.clist){
                    selChn = selChn +":" + csconf.clist[c] + " or ";
                }
                selChn = "(" + selChn.substring(0,selChn.length-3)+")";
            }

            if( state.sel.hiqc ){   //  bfact cutoff  
                var csconf = chnsel.hiqc;
                        
                if( csconf.mode == "step" ){
                    for( var s in csconf.states ){
                        var cst = csconf.states[s];
                        var stateLst = [];
                        if( cst.val == "bfact" ){
                            this.nglcomp.structure.eachAtom( function(atom) {
                                
                                if( atom.atomname == "CA" &&
                                    atom.chainname == "A" ){

                                    var bf = atom.bfactor;
                                    var rno = atom.resno;
                                    
                                    if( bf >= cst.vmin && bf < cst.vmax ){
                                        stateLst.push(String(rno));
                                    }                                 
                                }
                            });                            
                        }
                        selLst.push(stateLst);
                    }
                }
            }
            
            if( csconf.mode == "all" ){
                selLst = [];
            }
            
            var selStr = "";

            if( selLst.length == 0){
                selStr = "*";
            } else {
                
                selStr = "";

                var rlst = []; 
                for(var s in selLst){
                    var csel = selLst[s]; 
                    rlst = rlst.concat(csel);
                }
                rlst.sort(function(a,b) { Number(a) > Number(b) } );

                console.log("HAM:", rlst);
                
                if(rlst.length == 0 ){
                    selStr = "*"
                } else {
                    
                    var prev = Number(rlst[0]);
                    var lop = "";
                    var nc = 0;
                    for( var c in rlst ){
                        nc = Number( rlst[c] );
                        // console.log("#### nc: ",nc, prev, nc - prev);
                        if( nc > prev ){
                            if( nc - prev == 1 ){ // seq
                                if( lop != "-"){
                                    lop = "-";
                                    selStr = selStr + "-";
                                }
                                prev = nc;
                            } else {  // cont or gap                            
                                if( lop == "-" ){ // gap starts
                                    lop = "";
                                    selStr = selStr + prev + " or " + nc;
                                } else{  // next gap 
                                    selStr = selStr + " or " + nc;
                                }
                                prev = nc;
                            }                            
                        } else {
                            selStr = String(nc);
                            prev = nc;
                        }
                    }
                
                    //if( selStr[selStr.length-1] == '-'){
                    //    selStr = selStr.substring(0,selStr.length-1);
                    //}
                    if( selStr[selStr.length-1] == '-') selStr = selStr + nc;
                }
            }

            if( selChn.length > 0){
                selStr = selChn + " and (" + selStr + ")";                 
            }

            
            // main chain: color
            //-----------------

            //col:{ rain: true, asel: false,
            //      cmsa: false, csnp: false,
            //      topo: false, sstr: false,
            //      cbfc: false },


            console.log( "HAM: color: ",  state.col);
            
            var chnColLst = [];
            var ccs =  chncol.cdef;   // curent color style;
            
            if( state.col.rain ){      // color by position
                chnColLst = [["atomindex", "*"]];
            }
            
            if( state.col.cmsa ){        // color by msa
                ccs =  chncol.cmsa;                   
            } else if( state.col.csnp ){ // color by snp count
                ccs =  chncol.csnp;                   
            } else if( state.col.cbfc ){      // color by bfact
                ccs =  chncol.cbfc;                
            } 

            console.log( "HAM: color ccs: ",  ccs);

            var binter = null;
            
            if( state.col.cmsa || state.col.csnp || state.col.cbfc ){
   
                if( ccs.cbasis !== undefined ){                
                    binter = d3.interpolateRgbBasis( ccs.cbasis );
                    console.log("HAM: RGBbasis: ", ccs.cbasis );
                } else {
                    binter = d3.interpolateRgb.gamma(ccs.gamma)( ccs.colLo,
                                                                 ccs.colHi );
                }
            }

            if( state.col.cmsa || state.col.csnp ){

                var cval = [];
                
                if( ccs.val == "ent" ){
                    cval = ccs.msa.getEnt();
                } else{
                    cval = ccs.msa.getCnt();
                }
                
                var cmax = ccs.valHi;
                var cmin = ccs.valLo;

                if( cmax == undefined || cmin == undefined ){

                    cmin = +1e20;
                    cmax = -1e10;

                    for( var p=0; p <cval.length; p++ ){
                        if( cval[p] < cmin ) cmin = cval[p];
                        if( cval[p] > cmax ) cmax = cval[p];
                        
                    }
                }
                
                console.log("HAM: cmin, cmax=", cmin,cmax);
                
                this.nglcomp.structure.eachAtom( function(atom) {
                    
                    if( atom.atomname == "CA" && atom.chainname == "A" ){
                        //var cnm = atom.chainname;                   
                        var rno = atom.resno;
                        
                        var bf = 1 - ((cval[rno] - cmin )/( cmax-cmin ))**(1/2);
                        
                        //var c = 2*(data.msaEnt[i]/emax)**1.5;
                        var col = d3.color(binter(bf)).formatHex();
                        chnColLst.push([col,String(rno)]);
                    }
                });
                
            }
            
            if( state.col.cbfc ){  // bfactor

                var cmax = ccs.valHi;
                var cmin = ccs.valLo;

                if( cmax == undefined || cmin == undefined ){

                    cmin = +1e20;
                    cmax = -1e10;
                    
                    this.nglcomp.structure.eachAtom(
                        function(atom) {                            
                            if( atom.bfactor < cmin ) cmin = atom.bfactor;
                            if( atom.bfactor > cmax ) cmax = atom.bfactor;
                        }
                    );
                }

                console.log("HAM: cmin, cmax=", cmin,cmax);
                
                this.nglcomp.structure.eachAtom( function(atom) {
                    
                    if( atom.atomname == "CA" && atom.chainname == "A" ){
                        var bf = (atom.bfactor - cmin )/( cmax-cmin );
                        //var cnm = atom.chainname;                   
                        var rno = atom.resno;
                                
                        //var c = 2*(data.msaEnt[i]/emax)**1.5;
                        var col = d3.color(binter(bf)).formatHex();
                        chnColLst.push([col,String(rno)]);
                    }
                });                
            }

                       
            if( state.col.step ){
                //colLst = [["atomindex", "*"]];
            }

            if( state.col.topo ){
                //colLst = [["atomindex", "*"]];

                console.log("TOPO:", this._msa);
                
                var msa_bk = this._msa[2];
                var tpo = msa_bk.base[msa_bk.key]._dtrac;

                console.log("TOPO:", tpo);
                


            }

            var repParam = {
                sele: selStr,
                smoothSheet: true,
                quality: "high",
                opacity: 1.0
            };
            
            if( chnColLst.length > 0){ 

                repParam.color = NGL.ColormakerRegistry
                    .addSelectionScheme( chnColLst,
                                         "chnColScheme" );                
            } else {
                if( state.col.cchn ){
                    repParam.colorScheme = "chainindex";                    
                } else {                
                    repParam.color = NGL.ColormakerRegistry
                        .addSelectionScheme( [["green","*"]],
                                             "chnColScheme" );
                }                        
            }

            
            // main chain: render
            //-------------------

            console.log( "HAM: chnColLst:", chnColLst ); 
            console.log( "HAM: selStr:", selStr ); 
            
            var chnSelRep = this.nglcomp.addRepresentation( "cartoon",
                                                            repParam );
            
            view.chn.rep.push(chnSelRep);
            
                     
            /*
            
            // details override
            //-----------------
            
            if( view.poi.on || view.var.on || view.lps.on){  
                // residue selections

                var cstyle = view.chn.cstyle[view.chn.color];

                if( cstyle.mode == "solid" ){
                    
                    var chnrlist = [];
                    chnrlist.push( [cstyle.color,"*"] );
                    
                    var chnscheme = NGL.ColormakerRegistry
                        .addSelectionScheme( chnrlist,"chnsolid" );
                    
                    var chnrep = this.nglcomp.addRepresentation(
                        view.chn.style, { color: chnscheme,
                                          opacity: cstyle.opaq } );
                    
                    view.chn.rep.push( chnrep );                    
                }
                
                if( cstyle.mode == "grad" ){

                    var chnrlist = [];

                    if( cstyle.val == "atomindex" ){
                        chnlist.push(["atomindex", "*"]);
                    }
 
                    if( cstyle.val == "msa" ){
                        
                        var data = BKDnodeView.mymsa2a._data;
                        console.log("  BkdNGL: data->", data.msaEnt);

                        var emax = 0;
                    
                        for( var i = 0; i < data.msaEnt.length; i++){
                            if( data.msaEnt[i] > emax  ) emax = data.msaEnt[i];
                        }
                        if( emax == 0) emax = 1;
                        const interpolator = d3.interpolateRgb
                              .gamma(cstyle.gamma)( cstyle.colLo, 
                                                    cstyle.colHi );
                        for( var i = 0; i < data.msaEnt.length; i++){
                            var c = 2*(data.msaEnt[i]/emax)**1.5;
                            var col = d3.color(interpolator(c)).formatHex();
                            //console.log(col.r,col.g,col.b);
                            chnlist.push([col,String(i)]);                   
                        }
                    }

                    if( cstyle.val == "bfact" ){
                        
                        const binter = d3.interpolateRgb
                              .gamma(cstyle.gamma)( cstyle.colLo, 
                                                    cstyle.colHi );
                        
                        this.nglcomp.structure.eachAtom( function(atom) {
                            
                            if( atom.atomname == "CA" 
                                && atom.chainname == "A" ){
                                
                                var bf = atom.bfactor;
                                //var cnm = atom.chainname;                   
                                var rno = atom.resno;
                                
                                //var c = 2*(data.msaEnt[i]/emax)**1.5;
                                var col = d3.color(binter(bf)).formatHex();
                                chnlist.push([col,String(i)]);
                            }
                        });
                    }
                     
                    var chnscheme = NGL.ColormakerRegistry
                        .addSelectionScheme( chnrlist,"chain" );
                    
                    var chnrep = this.nglcomp.addRepresentation(
                        view.chn.style, { color: chnscheme } );
                    
                    view.chn.rep.push(chnrep)
                }
                         
                if( cstyle.mode == "step" ){
                    
                    var chnlistLo = [];
                    var chnlistHi = [];

                    if( cstyle.val == "bfact" ){
                        
                        this.nglcomp.structure.eachAtom( function(atom) {
                        
                            if( atom.atomname == "CA" 
                                && atom.chainname == "A" ){
                                var bf = atom.bfactor;
                                var rno = atom.resno;
                                
                                if( bf > cstyle.vcut ){
                                    chnlistHi.push([cstyle.colHi, String(rno)]);
                                } else {
                                    chnlistLo.push([cstyle.colLo, String(rno)]);
                                }
                                
                            }
                        });
                    }
                    
                    var chnLoScheme = NGL.ColormakerRegistry
                        .addSelectionScheme( chnlistLo,"chainLo" );
                    
                    var chnLoRep = this.nglcomp.addRepresentation(
                        view.chn.style, { color: chnLoScheme } );
                    
                    view.chn.rep.push(chnLoRep);
                    
                    var chnHiScheme = NGL.ColormakerRegistry
                        .addSelectionScheme( chnlistHi,"chainHi" );
                    
                    var chnHiRep = this.nglcomp.addRepresentation(
                        view.chn.style, { color: chnHiScheme } );
                    
                    view.chn.rep.push(chnHiRep);
                }
                
            } else {
 
                // no details: show chain select
                //------------------------------
                console.log("ZZZZ chain select", this.state['sel']);

                if( this.state['sel']['hiqc'] ){
                    console.log("ZZZZ chain select: hiqc");

                    // retrive from menu def
                    var cstyle = { mode: "step", val: "bfact", vcut: 0.5,
                                   colLo: "#FFFFFF", opaqLo: 0.33, 
                                   colHi: "green", opaqHi: 1.0   };
                    
                    var chnlistLo = [];
                    var chnlistHi = [];

                    if( cstyle.val == "bfact" ){

                        console.log("ZZZZ col hi/lo:",  
                           cstyle.colHi,cstyle.colLo );
                        
                        this.nglcomp.structure.eachAtom( function(atom) {
                            
                            if( atom.atomname == "CA" 
                                && atom.chainname == "A" ){
                                
                                var bf = atom.bfactor;
                                var rno = atom.resno;
                                
                                if( bf >= cstyle.vcut ){
                                    chnlistHi.push([cstyle.colHi, String(rno)]);
                                } else {
                                    chnlistLo.push([cstyle.colLo, String(rno)]);
                                }
                                
                            }
                        });
                    }

                    var betaLoSel = this.getBetaSelection( -100, cstyle.vcut );
                    var betaHiSel = this.getBetaSelection( cstyle.vcut, 
                                                           1000.0 );
                    
                    for( var rr in this.nglcomp.reprList){
                        this.nglcomp.reprList[rr].dispose();
                    }
                    
                    var chnLoScheme = NGL.ColormakerRegistry
                        .addSelectionScheme( chnlistLo,"chainLo" );
                    
                    var chnLoRep = this.nglcomp.addRepresentation(
                        view.chn.style, { color: chnLoScheme, 
                                          //sele: betaLoSel.sel,
                                          smoothSheet: true,
                                          quality: "high",
                                          opacity: cstyle.opaqLo } );
                    
                    view.chn.rep.push(chnLoRep);
                    
                    var chnHiScheme = NGL.ColormakerRegistry
                        .addSelectionScheme( chnlistHi,"chainHi" );
                    
                    var chnHiRep = this.nglcomp.addRepresentation(
                        view.chn.style, { color: chnHiScheme,
                                          sele: betaHiSel.sel,
                                          smoothSheet: true,
                                          quality: "high",
                                          opacity: cstyle.opaqHi } );
                    
                    view.chn.rep.push(chnHiRep);
                    
                    //var poirep = this.nglcomp.addRepresentation(
                    //    view.poi.style, { color: poischeme,
                    //                      opacity: 0.75,
                    //                      sele: psel + ":A and .CA",
                    //                      aspectRatio: view.poi.scale  });
                }
                             
                //  default: rainbow
                var chnlist = [];
                chnlist.push(["atomindex", "*"]);
                
                //var chnscheme = NGL.ColormakerRegistry
                //    .addSelectionScheme( chnlist,"chain" );
                    
                //var chnrep = this.nglcomp.addRepresentation(
                //    view.chn.style,{color: chnscheme });

                //view.chn.rep.push(chnrep);
                               
            }

            */            
        }
        
        // render: poi
        //------------

        if( view.poi.on && op == "change" ){
            
            if( view.poi.rep.length > 0 ){
                for( var r in view.poi.rep ){
                    view.poi.rep[r].dispose();
                }
                view.poi.rep = [];
            }

            var pois = this.getpois( {} );
            console.log("HAM pois.pos:", pois.pos);
            
            var poirlist = [];

            var psel = "("
            
            for( var k in pois.pos ){
                psel = psel + " " + pois.pos[k] + " or";  
            }            
               
            if( psel.length > 1 ){
                psel = psel.substring(0,psel.length-3) + ")"
            } else {
                psel = "";
            }

            console.log("ZZZZ pois psel:", psel );

            var poilist = [];
            poilist.push( [view.poi.color,"*"] );
            
            var poischeme = NGL.ColormakerRegistry
                .addSelectionScheme( poilist,"pois" );
            
            console.log("ZZZZ psel", psel);
            var poirep = this.nglcomp.addRepresentation(
                view.poi.style, { color: poischeme,
                                  opacity: 0.75,
                                  sele: psel + ":A and .CA",
                                  aspectRatio: view.poi.scale  });
            //poirep.opacity = 0.5;
            view.poi.rep.push(poirep);        
        }

        if( ! view.poi.on ){

            console.log("ZZZZ poi.off");
            
            if( view.poi.rep.length > 0 ){
                for( var r in view.poi.rep ){
                    view.poi.rep[r].dispose();
                }
                view.poi.rep = [];
            }
        }        


        // render: variants
        //-----------------
        
        if( view.var.on && op == "change" ){
            
            if( view.var.rep.length > 0 ){
                for( var r in view.var.rep ){
                    view.var.rep[r].dispose();
                }
                view.var.rep = [];
            }
           
            var varlist = [];

            var rmap = this.getvcls( this.state );

            console.log("ZZZZ view.var rmap:", rmap);
            
            for( var i in rmap ){
                var pos = rmap[i].pos;
                var col = rmap[i].col;                
                varlist.push([col,String(pos)]);
            }


            var varscheme = NGL.ColormakerRegistry
                .addSelectionScheme( varlist,"var" );
            
            var varsel = "("
            
            for( var p in varlist ){
                varsel = varsel + " " + varlist[p][1] + " or";                 
            }
        
            if( varsel.length > 1 ){
                varsel = varsel.substring(0,varsel.length-3) + " )"
                
                console.log("ZZZZ vew.var varsel:", varsel);
            
                var varrep = this.nglcomp.addRepresentation(
                    view.var.style,
                    { color: varscheme,
                      sele: varsel + " :A and .CA",
                      aspectRatio: 10.0  } );
                
                view.var.rep.push( varrep );
                
            } 
        }
        
        if( ! view.var.on ){

            console.log("ZZZZ var.off");
            
            if( view.var.rep.length > 0 ){
                for( var r in view.var.rep ){
                    view.var.rep[r].dispose();
                }
                view.var.rep = [];
            }
        }        

        
        // render: lolipops  ok
        //---------------------
        
        if( view.lps.on && op == "change" ){
            
            if( view.lps.rep.length > 0 ){
                for( var r in view.lps.rep ){
                    view.lps.rep[r].dispose();
                }
                view.lps.rep = [];
            }
            
            //var lpops = this.getsels( {} );
            console.log("ZZZZ lpops:", lpops);

            var lpslist = [];
            
            for( var p in lpops ){
                if( lpops[p].on ){
                    lpslist.push(["orange",p]);
                }            
            }

            console.log("ZZZZ lpslist:", lpslist);
            
            var lpscheme = NGL.ColormakerRegistry
                .addSelectionScheme( lpslist,"lps" );
            
            var lpsel = "("
            
            for( var p in lpops ){
                if( lpops[p].on ){
                    lpsel = lpsel + " " + p + " or";  
                }            
            }
        
            if( lpsel.length > 1 ){
                lpsel = lpsel.substring(0,lpsel.length-3) + " )"
            } else {
                lpsel = "";
            }

            console.log("ZZZZ lpsel:", lpsel);
            var lprep = this.nglcomp.addRepresentation(
                view.lps.style,
                { color: lpscheme,
                  sele: lpsel + " :A and .CA",
                  aspectRatio: 10.0  } );
            
            view.lps.rep.push(lprep);
        }
        
        if( ! view.lps.on ){

            console.log("ZZZZ lps.off");
            
            if( view.lps.rep.length > 0 ){
                for( var r in view.lps.rep ){
                    view.lps.rep[r].dispose();
                }
                view.lps.rep = [];
            }
        }
        
        console.log("ZZZZ view (new):", view);
        
    }


    getPoiSelection( poi ){

        if(poi == null ) return null;
        
        var mst = this.nglcomp.structure;
        var rmap = {};
            
        var xr = null;
        var yr = null;
        var zr = null;
                
        console.log("POI:",poi);
        mst.eachAtom( function(atom) {                            
            var cnm = atom.chainname;                   
            var rno = atom.resno;
            
            if(cnm == 'A' && poi.pos.includes( Number(rno) ) ){
                xr = atom.x;
                yr = atom.y;                   
                zr = atom.z;
                console.log( xr, yr, zr );
            }
        });
        
        if( xr == null) {
            return;
        }
        
        mst.eachAtom( function(atom) {
            var x = xr - atom.x;
            var y = yr - atom.y;
            var z = zr - atom.z;
            var cnm = atom.chainname;
            var rno = atom.resno;
                
            if( x*x + y*y + z*z < 300 ){                    
                if( rmap[cnm]  == undefined ) rmap[cnm] = {};
                if( rmap[cnm][rno] == undefined ){
                    rmap[cnm][rno] = true;
                }
            }               
        });
        
        var rk = Object.keys( rmap );
        
        var sel = "";
        
        for( var c in rk ){ // go over chains
            // console.log("#### RM:",rk[c], rmap[rk[c]]);
            var ckl = Object.keys( rmap[rk[c]] );
            ckl.sort(function(a,b) { Number(a) > Number(b) } );
            // console.log("####:: ",rk[c], ":",ckl);                    
            
            var prev = Number(ckl[0]);
            var lop = "";
            var nc = 0;
            for( var c in ckl ){
                nc = Number( ckl[c] );
                // console.log("#### nc: ",nc, prev, nc - prev);
                if( nc > prev ){
                    if( nc - prev == 1 ){ // seq
                        if( lop != "-"){
                            lop = "-";
                            sel = sel + "-";
                        }
                        prev = nc;
                    } else {  // cont or gap                            
                        if( lop == "-" ){ // gap starts
                            lop = "";
                            sel = sel + prev + " or " + nc;
                        } else{  // next gap 
                            sel = sel + " or " + nc;
                        }
                        prev = nc;
                    }                            
                } else {
                    sel = String(nc);
                    prev = nc;
                }
            }
        }
        
        //if( sel[sel.length-1] == '-') sel = sel.substring(0,sel.length-1;)
        if( sel[sel.length-1] == '-') sel = sel + nc;
        return { sel: sel }        
    }

    getSpliceSelection( sind, mind=2, rsind=0 ){ 

        // select these in sind only: assume structure correspond to rsind
        // format: 1-20 or 40-50 or 55-70

        var msa = this._msa[mind]; // splice msa 

        var seq = msa[sind];

        var gp = True;
        var cp = 0;
        var bp = 0; // start pos (msa)
        var ep = 0; // end pos )msa) 

        var sel = ""
        
        for( var p=0; p < seq.length; p++ ){
            if( seq[p] = '-' ){
                // gap
                if( gp ){ // gap extend
                    // nothing to do ? 
                } else { // gap start

                    // add segment
                    console.log("segment: b-e:", bp,ep);

                    // tranaslate into  sind seq pos 

                    sel += bp + "-" + ep + " or ";
                    
                }

                gp = False; 
                
            } else {
                // sequence
                if( gp ){ // sequence start
                    bp = p;
                    ep = p;
                    
                } else { // sequence extend
                    ep = p;    
                }

                gp = False;
                    
            }
        }
        
        if( gp == False ){
            sel += bp + "-" + ep;
        } else {
            sel = sel.substring(0, sel.length-4);

        }
        console.log("SEL:" , sel);
                 
    }
    


    
    
    getBetaSelection( bmin, bmax ){

        if( bmin == null | bmax == null) return null;
        
        var mst = this.nglcomp.structure;
        var rmap = {};
        
        mst.eachAtom( function(atom) {
            var cnm = atom.chainname;
            var rno = atom.resno;
            var bf = atom.bfactor;
            if( bf >= bmin && bf <= bmax ){                    
                if( rmap[cnm]  == undefined ) rmap[cnm] = {};
                if( rmap[cnm][rno] == undefined ){
                    rmap[cnm][rno] = true;
                }
            }               
        });
        
        var rk = Object.keys( rmap );
        
        var sel = "";
        
        for( var c in rk ){ // go over chains
            // console.log("#### RM:",rk[c], rmap[rk[c]]);
            var ckl = Object.keys( rmap[rk[c]] );
            ckl.sort(function(a,b) { Number(a) > Number(b) } );
            // console.log("####:: ",rk[c], ":",ckl);                    
            
            var prev = Number(ckl[0]);
            var lop = "";
            var nc = 0;
            for( var c in ckl ){
                nc = Number( ckl[c] );
                // console.log("#### nc: ",nc, prev, nc - prev);
                if( nc > prev ){
                    if( nc - prev == 1 ){ // seq
                        if( lop != "-"){
                            lop = "-";
                            sel = sel + "-";
                        }
                        prev = nc;
                    } else {  // cont or gap                            
                        if( lop == "-" ){ // gap starts
                            lop = "";
                            sel = sel + prev + " or " + nc;
                        } else{  // next gap 
                            sel = sel + " or " + nc;
                        }
                        prev = nc;
                    }                            
                } else {
                    sel = String(nc);
                    prev = nc;
                }
            }
        }
        
        //if( sel[sel.length-1] == '-') sel = sel.substring(0,sel.length-1);
        if( sel[sel.length-1] == '-') sel = sel + nc;
        return { sel: sel }        
    }
    
    menucallback( d, cctrl, opt, self ){
        console.log( "HAM: menucallback:", d, cctrl, opt );
        if( cctrl == 'help' ){
            var anchor = "#bkd-modal-div";
            var url = "page?ret=body&id="+opt;
            
            return BKDmodal.showurl( anchor, url );            
        }

        if( cctrl == 'exp' ){
            console.log( "HAM: menucallback: export" );
            if( opt.value == "ngl-export-pdb" ){
                console.log( "HAM: menucallback: export pdb" );
                return;
            }
            if( opt.value == "ngl-export-img" ){
                console.log( "HAM: menucallback: export image" );

                var blob = self.nglstage.makeImage(
                    { //onProgress: onProgress,
                      factor: 4,
                      antialias: true,
                      trim: true,
                        transparent: false });
                NGL.download(blob, 'screenshot.png');
                return;
            }
        }
        
        console.log("HAM state:", self.state);
        self.setHamStyle( cctrl, opt, self.state );        
    }        
}
