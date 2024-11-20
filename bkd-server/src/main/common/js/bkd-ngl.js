console.log("bkd-ngl: common");
  
class BkdNGL{
     
    constructor( config, data, msa, lpop ){

        console.log(" BkdNGL: new-> ", config );
        this._conf = config;
        this.anchor = config.anchor;
        this.name = config.name;
        
        this._data = data;  // BKDnodeFeatures
        this._ham  = [];
        // msa: base + key list
        //   for now  [ {base: BkdView, key:'mymsa2a'},
        //              {base: BkdView, key:'mymsa2b'},
        //              {base: BkdView, key:'mymsa'}]

        this._msa = msa;    

        //this._msa[2].base[this._msa[2].key]
        
        console.log("TOPO: BkdNGL MSA:", this._msa);
        
        this._lpop = lpop;    
        
        this.pfx = "bkd-ngl-" + this.name;
        console.log("BkdNGL: prefix->", this.pfx );
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

        this.state = { str: { "swm":true },
                       sel:{ hiqc: false, chain: false,
                             aset: false, canon: false, smsa: false },
                       
                       col:{ rain: false, asel: false,
                             cmsa: false, csnp: false,
                             ctpo: false, sstr: false,
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
                  color: "#FFFFFF", opaq :0.8,
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
                  color: "#FF8000", opaq :1.0,  // dark orange ? 
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
                      "solid": { mode: "solid", color:"green", opaq: 1.0,
                                 legend: "Solid Legend"
                               },                            
                      "cdef": { mode: "grad", opaq: 1.0, val: "atomindex",
                                legend: "Solid Legend"
                              },
                      "cpos": { mode: "grad", opaq: 1.0, val: "atomindex",
                                legend: "Solid"
                              },
                      "cchn": { mode: "solid", opaq: 1.0,
                                clist:[ "#46AB21", "#80B192",
                                        "#6A8D92","#646890"],
                                legend: "Color By Chain Legend"
                              },
                      "cmsa": { mode: "grad", // valLo: 0, valHi: 1.0, 
                                colHi: "magenta", colLo:"gray",
                                //cbasis: ["red","yellow","blue"],
                                gamma: 4.8, opaq: 1.0,
                                msaNo: 0, msaSq: 0, val: "ent",
                                legend: "Color By Conservation(MSA) Legend"
                              },            
                      "csnp": {mode: "grad", variant: "dbsnp", 
                               colHi: "cyan", colLo: "gray",
                               //cbasis: ["magenta","gray","white"],
                               gamma: 4.0, opaq: 1.0, val: "ent",
                               legend: "Color By Conservation(SNP) Legend"
                              },                      
                      "ctpo": { mode: "grad", // valLo: 0, valHi: 1.0, 
                                colLo: "magenta", colHi:"#808080",
                                gamma: 4.8, opaq: 1.0,
                                trsel:{ "Extracellular": { "color":"#00cc66" },
                                        "Cytoplasmic": { "color":"#99ccff" },
                                        "Membrane": { "color":"#ffb266" } },
                                legend: "<table width='70%'><tr>"
                                +"<td width='10%' class='legend-cright'>Ribbon&nbsp;color:</td>"
                                +"<td width='20%' class='legend-cright'>Cytoplasm:</td><td width='8%' class='legend-cleft'><img width='50px' height='15px' src='img/10x10topoGreen.png'></td>"
                                +"<td width='21%' class='legend-cright'>Membrane:</td><td width='8%' class='legend-cleft'> <img width='50px' height='15px' src='img/10x10topoYellow.png'></td>"
                                +"<td width='20%' class='legend-cright'>Exstracellular:</td><td width='8%' class='legend-cleft'> <img width='50px' height='15px' src='img/10x10topoBlue.png'></td>"
                                +"</tr></table>",
                                msaNo: 2, msaSq: 0, val: "track"
                              },                      
                      "cbfc": {mode: "grad",valLo: 0, valHi: 1.0, 
                               colLo: "grey", colHi:"magenta",
                               cbasis: ["red","white","blue"],
                               gamma: 10.0, opaq: 1.0, val: "bfact",
                               legend: "Color By Topology Legend"
                              },
                      "squal": {mode: "grad", valLo: 0, valHi: 1.0, 
                                colLo: "grey", colHi:"magenta",
                                cbasis: ["red","white","blue"],
                                gamma: 2.2, opaq: 1.0, val: "bfact",
                                legend: "Color By Prediction Quality Legend"
                               },                      
                      "strsqS": {mode: "step", val: "bfact", vcut: 0.5,
                                 colLo: "green", opaqLo: 1.0, 
                                 colHi: "gray", opaqHi: 1.0,
                                 legend: "Color By Bfactor(S) Legend"
                                },
                      "strsqT": {mode: "step", val: "bfact", vcut: 0.5,
                                 colLo: "green", opaqLo: 1.0, 
                                 colHi: "gray", opaqHi:0.6,
                                 legend: "Color By Bfactor(T) Legend"
                                }
                  }, 
                  on: true, rep: [] }
        }

        d3.select( this.anchor )
            .html( '<div id="'+ this.pfx + '-controls" '
                   + ' class="bkd-ngl-controls" '
                   + ' style="background-color: black; color: white;">'
                   + ' <table class="bkd-ngl-controls-table" width="100%"'
                   + '  align="center"></table>'
                   + '</div>'
                   + '<div id="'+ this.pfx + '-legend" '
                   + ' class="bkd-ngl-lengend" '
                   + ' style="background-color: black; color: white;">'
                   + ' <table class="bkd-ngl-legend-table" width="100%"'
                   + '  align="center"></table>'                   
                   +' </div>'                  
                   + '<div id="'+ this.pfx + '-view" '
                   + ' class="bkd-ngl-view"></div>'
                 );

        console.log("BkdNGL: controls->", config.controls);
        var cname = this.pfx + "-controls";
        
        var crow = d3.select( this.anchor + " .bkd-ngl-controls-table")
            .append("tr");
        
        crow.append("td")
            .attr("class", cname)
            .attr("colspan","1")
            .attr("align","left")            
            .append("img")
            .attr("src","img/hamburger-menu-white.svg")
            .attr("id", this.pfx + "controls-ham")
            .classed("bkd-ngl-icon",true);
        
        crow.append("td")
            .attr("class", cname)
            .attr("colspan","1")
            .attr("width","95%")
            .attr("align", "center")
            .attr("id",this.pfx + '-controls-var');
        
        crow.append("td")
            .attr("class", cname)
            .attr("colspan","1")
            .attr("align","right")
            .style("padding-right","4px")
            .style("padding-top","3px")
            .append("img")
            .attr("src","img/search-plus-white.svg")
            .attr("id", this.pfx + "controls-detail")
            .classed("bkd-ngl-icon",true);

        var lname = this.pfx + "-legend";
        var lrow1 = d3.select( this.anchor + " .bkd-ngl-legend-table")
            .append("tr")
            .attr("class", lname + "-1" );
        
        lrow1.append("td")
            .attr("class", lname)
            .attr("colspan","1")
            .attr("width","40%")
            .attr("align","left")
            .attr("id",this.pfx + '-legend-src')
            .html("Source: Experiment(xray)");
            
        lrow1.append("td")
            .attr("class", lname)
            .attr("colspan","1")
            .attr("align","left")
            .attr("id",this.pfx + '-legend-str')
            .html("Structure: <a href=''>def</a> (Chain: A)");
            
        lrow1.append("td")
            .attr("class", lname)
            .attr("colspan","1")
            .attr("width","33%")
            .attr("align","right")
            .attr("id",this.pfx + '-legend-seq')
            .html("Sequence: <a href=''>def</a>");
        
        var lrow2 = d3.select( this.anchor + " .bkd-ngl-legend-table")
            .append("tr")
            .attr("class", lname+"-2");
       
        lrow2.append("td")
            .attr("class", lname)
            .attr("colspan","3")
            .attr("align","center")
            .html("Default Color Scheme Legend");
                
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

            var itemdef = config.controls.menu[i];
            var mitem =  BkdNGL.buildHAMitem(itemdef, this);
            
            //var mitem =  {children:[]};
            menu.push(mitem);            
        }
        this._ham = menu;
        console.log("HAM:",menu);

        var buildHAM = function( args ){
            console.log( "BkdNGL: currying buildHAM:" + args.menu );
            
            return function( o ){
                console.log( "BkdNGL: curried buildHAM(menu)", args.menu );
                console.log( "BkdNGL: curried buildHAM(this):", args.iself );
                
                var ham = d3.contextMenu(args.menu);
                ham(o);               
            }
        }
        
        //d3.select("#" + this.pfx + "controls-ham")
        //    .on('click', d3.contextMenu(menu));

        d3.select("#" + this.pfx + "controls-ham")
            .on('click', buildHAM({menu: this._ham, iself: this}));
        
        $( this.anchor ).show();
        
        var phght = $( this.anchor ).height();
        var chght = $( '#' + this.pfx+'-controls' ).height();
        $( '#' + this.pfx + '-view' ).height( phght - chght - 0 );


        this.nglstage = new NGL.Stage( this.pfx + '-view' );
        $( this.anchor ).hide();
        
        // Load PDB
        //---------
        
        console.log( "BkdNGL: PDB load:" + config.url );
        
        this.nglstage.loadFile(  config.url ) 
            .then( this.loadCallback( { self: this,
                                        cutQC: 0.5 }));                
    }
    
    loadCallback( args ){
            
        console.log( "BkdNGL: currying loadCallback -> args:",args);

        var self = this;
        
        return function( o ){            
                
            console.log( "BkdNGL: loadCallback -> args:",args);
                
            self.nglcomp = o;
                
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
                
                if( cnm in self.view.chains ){
                    //console.log( "ZZZZ: chain(o):",
                    //             cnm, args.self.view.chains);
                } else {
                    self.view.chains[cnm] = false;
                    //console.log( "ZZZZ: chain(+):",
                    //             cnm, args.self.view.chains);
                }
                
                //console.log(cnm,rno,bf);                    
            } );
            
            
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
            
            self.rsel.hiqc = sel;
            self.rsel.all = "all";
            
            o.setSelection( self.rsel.all );
            
            self.rerender();
            o.autoView( "all" );

            console.log( "BkdNGL: loadCallback -> state:",self.state);
            console.log( "BkdNGL: loaded");
        };            
    }
    
    static buildHAMitem( idef, iself ){
        
        var mitem = {};
        mitem.title = idef.label;
        
        var cname = this.pfx + "-controls-" + idef.name;
        var osel = this.anchor + " .bkd-ngl-controls-table ." + cname;
        
        var cctrl = idef.name;
        var ctype = idef.type;
        var clist= [];

        if( ctype == "list" ){
        
            for( var j in idef.options ){
                clist.push( BkdNGL.buildHAMitem( idef.options[j],
                                                 iself)
                          );    
            }
            
            if( clist.length > 0 ) mitem.children=clist;
            return mitem;
        }

        if( ctype == "pdb-list" ){
            
            //console.log("HAM: URL:",idef.url);            
            //console.log("HAM: URL(ns):",iself._data.data.ns);
            //console.log("HAM: URL(ac):",iself._data.data.ac);
            //console.log("HAM: iself:",iself);
            
            var curl=idef.url
                .replace('%%NS%%',iself._data.data.ns)
                .replace('%%AC%%',iself._data.data.ac);
            console.log("HAM: cURL:",curl);
            
            var buildPDBlist = function( args ){
                
                //console.log("HAM: buildPDBlist->args:",args);
                
                return function( data, textStatus, jqXHR ){
                    
                    var mode = args.mode;
                    var pfx = args.self.pfx;
                    var clist = [];
                    var mitem = args.mitem;
                    var strl = data.node.structure;

                    var buildPDBaction = function( aargs ){
                        return function(arg){
                            console.log( "BkdNGL: PDBaction -> args:",args);
                            //console.log( "BkdNGL: PDBaction -> arg:",arg);

                            var mode = aargs.mode; 
                            var method = aargs.method; 
                            var cchn = aargs.chain.split('_');
                            cchn = cchn[0].replace( new RegExp("[a-z]","g"),'');
                            var curl = aargs.url.split('/');
                            
                            var src = "Source: ";
                            if( mode == 'expt' ){
                                src += "Experiment";
                            } else {
                                src += "Prediction";
                            }
                            src += '('+ method +')';
                            
                            var str = 'Structure: '+
                                '<a href="'+aargs.url+'">'
                                + curl[curl.length-1].replace('.pdb','')
                                + '</a>';
                            str += ' (Chain:'+cchn[0]+')';
                            
                            var seq = 'Sequence: ';
                            seq += '<a href="'+aargs.sequence+'">'
                                + aargs.sequence
                                + '</a>';
                            
                            d3.select( "#" + pfx + '-legend-src' )
                                .html( src );
                            d3.select( "#" + pfx + '-legend-str' )
                                .html( str );
                            d3.select( "#" + pfx + '-legend-seq' )
                                .html( seq );

                            // load new structure
                            //-------------------
                            
                            if( args.self.nglstage != undefined ){
                                args.self.nglstage.removeAllComponents();
                                args.self.view.chn.rep = [];      
                                
                                args.self.nglstage.loadFile( aargs.url ) 
                                    .then( args.self.loadCallback( { self: args.self,
                                                                     cutQC: 0.5 }));                                
                            }
                        }
                    }
                    
                    for( var s in strl){
                        console.log( "BkdNGL: buildPDBlist -> str:",strl[s]);
                        
                        var cstr =strl[s];

                        if(cstr.mode == mode){

                            var curl = cstr.url.split('/');
                            var title = curl[curl.length-1].replace('.pdb','')
                                +'('+cstr.method+'/'+cstr.sequence+')';
                            
                            clist.push( { title: title,
                                          action: buildPDBaction( cstr ) });
                        }
                    }
                    if( clist.length > 0 ) mitem.children=clist;
                }
            }
            
            $.ajax( { url: curl} )
                .done( buildPDBlist( { "self": iself,
                                       "mode": idef.mode,
                                       "mitem": mitem } ));
            return mitem;
        }
        
        mitem.children=clist;
        for( var j in idef.options ){
            var copt = idef.options[j];  // eg: swmsel
            
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
            }( cctrl, copt, ctype, iself );
            
            var callback = function( ictrl, iopt, itype, iself ){
                return function(d) {
                    console.log( "HAMcallback:", ictrl, iopt, itype );
                    console.log( "HAMcallback: ictrl->", ictrl, ictrl in iself.state, iself.state );
                    
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
                        console.log( "HAMcallback statefull: ", ictrl ); 
                        iself.setStateLegend();
                        
                    } else {
                        console.log( "HAM: stateless" );
                    }
                    iself.menucallback(d, ictrl, iopt, iself);
                }
            }( cctrl, copt, ctype, iself );
            
            clist.push( { title: title,
                          action: callback
                        } );
        }            
        
        return mitem;        
    }


    setStateLegend(){
        console.log("HAMcallback: setStateLegend: ",this.state);
        
        var legend = 'Default';
        var cscheme ="";
        for( var s in this.state.col ){
            console.log( "HAMcallback:  s-> " + s + ":", this.state.col[s]);
            if( this.state.col[s] ){
                cscheme = s;
                console.log("HAMcallback: set->", cscheme);
            }
        }
        
        if( cscheme in this.view.chn.cstyle){
            console.log("setStateLegend: ",
                        this.view.chn.cstyle[cscheme].legend);
            legend = this.view.chn.cstyle[cscheme].legend;
        }

        console.log("HAMcallback: setStateLegend: legend-> ",legend);
        d3.select( this.anchor + " ."+this.pfx+"-legend-2")
            .html('<td colspan=3 align="center">'
                  + legend
                  +'</td>');        
    }
    
    rerender(){        
        console.log("HAM rerender called");

        this.setStateLegend();
        this.setHamStyle("vcls",undefined, null);
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

    renderChainOutline(){

        // show/hide outline. Returns:
        //   true - render chain  
        //   false - do not render chain
        
        var view = this.view;
    
        if( ! view.chn.on ){
            if( view.chn.rep.length > 0 ){
                for( var r in view.chn.rep ){
                    view.chn.rep[r].dispose();
                }
                view.chn.rep = [];
            }

            return false;
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


            if( this.nglcomp !== undefined){ 
                var chnOutRep = this.nglcomp.addRepresentation(
                    "cartoon", { color: chnOutScheme, 
                                 sele: "*",
                                 smoothSheet: true,
                                 quality: "high",
                                 metalness: 0.1,
                                 roughness: 0.0,
                                 opacity: 0.33 } );
            
                view.chn.rep.push( chnOutRep );
            }
            return true;
        }
    }

    buildChainSelect( opt ){

        console.log( "HAM setHamStyle called (buildChainSelect): opt->", opt );
        
        var state = this.state;
        var view = this.view;
        
        var chncol = view.chn.cstyle;
        var chnsel = view.chn.cselect;
        
        // main chain: selection
        //----------------------

        var selLst = [];
        var csconf = { mode: "all" };
        var selChn = "";
        console.log( "HAM: selection: ",  state.sel);

        var msaSelStr = "";
        
        if( state.sel.aset ){  // set of residues
            csconf = chnsel.aset;
        }

        if( state.sel.smsa ){  // msa subset
            console.log( "HAM: selection: ",  state.sel.smsa,
                         "state(on):", opt.states.on);

            var msan = opt.states.on.msa;
            var cmsa =this._msa[msan].base[this._msa[msan].key];

            var cref = opt.states.on.sref;
            var csel = opt.states.on.ssel;

            console.log( "HAM: selection: cref, csel, msa", cref, csel, cmsa );
            msaSelStr = cmsa.getTgtSeqSelStr( csel, cref ); 
            console.log( "HAM: selection: msaSelStr-> ", msaSelStr);
            
        } else {
            
            console.log( "HAM: selection: ",  state.sel.smsa,
                         "states:", opt);
            

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

        if( msaSelStr.length > 0){
            selStr = "(" + msaSelStr + ") and (" + selStr + ")";                 
        }
        console.log("HAM: selection: selStr", selStr);
        return selStr;        
    } 

    renderChainDetail( selStr ){

        // main chain: color
        //-----------------

        //col:{ rain: true, asel: false,
        //      cmsa: false, csnp: false,
        //      ctp: false, sstr: false,
        //      cbfc: false },

        var state = this.state;
        var view = this.view;

        var  chncol = view.chn.cstyle;
        var  chnsel = view.chn.cselect;
        
        console.log( "HAM: color: selStr",  selStr);
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
        } else if( state.col.ctpo ){      // color by topo
            ccs =  chncol.ctpo;                
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

        if( state.col.csnp ){
            
            console.log("CSNP: ccs->", ccs);
            console.log("CSNP: lpop->", this._lpop);
            var clpop = this._lpop.base[this._lpop.key];
            var snpCnt = clpop.getVarCnt(ccs.variant);
            
            var cmax = ccs.valHi;
            var cmin = ccs.valLo;

            if( cmax == undefined || cmin == undefined ){

                cmin =  1e10;
                cmax = -1e10;

                for( var p=1; p <snpCnt.length; p++ ){
                    if( snpCnt[p] < cmin ) cmin = snpCnt[p];
                    if( snpCnt[p] > cmax ) cmax = snpCnt[p];
                }
            }

            console.log("CSNP: cmin, cmax=", cmin,cmax);
            console.log("CVAL(snp):",snpCnt);
            var bfl = [];
            this.nglcomp.structure.eachAtom( function(atom) {

                if( atom.atomname == "CA" && atom.chainname == "A" ){
                    //var cnm = atom.chainname;                   
                    var rno = atom.resno;

                    var bf = 1 - ((snpCnt[rno] - cmin )/( cmax-cmin ))**(1/2);
                    bfl.push(bf);
                    //var c = 2*(data.msaEnt[i]/emax)**1.5;
                    var col = d3.color(binter(bf)).formatHex();
                    chnColLst.push([col,String(rno)]);
                }
            });
            console.log("BFL:", bfl);
        }

        
        if( state.col.cmsa ){

            var msaNo = ccs.msaNo;
            var msaSq = ccs.msaSq;

            var cmsa = this._msa[msaNo].base[this._msa[msaNo].key]
            var cval = [];

            if( ccs.val == "ent" ){   
                cval = cmsa.getEnt();  // entropy
            } else{
                cval = cmsa.getCnt();  // counts
            }
            console.log("CVAL(msa):",cval);
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

            var bfl = [];
            
            this.nglcomp.structure.eachAtom( function(atom) {

                if( atom.atomname == "CA" && atom.chainname == "A" ){
                    //var cnm = atom.chainname;                   
                    var rno = atom.resno;
                    
                    //var bf = 1 - ((cval[rno] - cmin )/( cmax-cmin ));  //**(1/2);
                    var bf =  ((cval[rno] - cmin )/( cmax-cmin ))**(1/2);
                    bfl.push(bf);

                    //var c = 2*(data.msaEnt[i]/emax)**1.5;
                    var col = d3.color(binter(bf)).formatHex();
                    chnColLst.push([col,String(rno)]);
                }
            });
            console.log("BFL:",bfl);
        }

        if( state.col.ctpo ){

            var msaNo = ccs.msaNo;
            var msaSq = ccs.msaSq;

            var trsel = ccs.trsel;
            
            var cmsa = this._msa[msaNo].base[this._msa[msaNo].key]

            var trlst = cmsa._data.dtrac;

            console.log("HAM topo: sel", trsel);
            console.log("HAM topo: lst", trlst);

            for(var i = 0; i < trlst.length; i ++){
                
                if( Object.keys(trsel).includes( trlst[i].name ) ){

                    var tselStr = "";

                    console.log( "HAM topo: key/track",
                                 trlst[i].name,
                                 trsel[trlst[i].name].color,
                                 trlst[i].dpos );

                    for( var j =0; j < trlst[i].dpos.length; j++ ){
                        tselStr += trlst[i].dpos[j].beg + "-" +
                            trlst[i].dpos[j].end + " or "; 
                    }
                    
                    if( tselStr.length > 0 ){
                        tselStr= tselStr.substring(0, tselStr.length-4);
                        console.log( "HAM topo: tselstr", tselStr);
                        
                        chnColLst.push( [ trsel[trlst[i].name].color,
                                          tselStr ] );                    
                    }                                        
                }   
            }            
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
                    .addSelectionScheme( [["gray","*"]],
                                         "chnColScheme" );
            }                        
        }

        // main chain: render
        //-------------------

        console.log( "HAM: chnColLst:", chnColLst ); 
        console.log( "HAM: selStr:", selStr ); 

        if(this.nglcomp !== undefined){
            var chnSelRep = this.nglcomp.addRepresentation( "cartoon",
                                                            repParam );
            view.chn.rep.push(chnSelRep);
        }
    }


    setHamStyle( par1, value1, menu1 ){
        
        console.log( "HAM setHamStyle called: par->", par1 );
        console.log( "HAM setHamStyle called: val->", value1 );
        console.log( "HAM setHamStyle called: men->", menu1);

        console.log( "HAM data.state:",this.state);

        console.log( "HAM data.fstate:",this._data.fstate);
                       
        console.log("HAM ngl._msa:", this._msa);
        
        var op = "change";
        var state = this.state;

        var  chncol = this.view.chn.cstyle;
        var  chnsel = this.view.chn.cselect;

        console.log("HAM chncol:", this.view.chn.cstyle);
        
        var view = this.view;
        
        console.log("HAM view (old):", view);
                
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
        
        // get variant classes (vcls)
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
        
        if( this.renderChainOutline() ){    // render/hide outline if needed

            var opt = {};
            
            if( value1 !== undefined ) opt = value1.opt;
            var selStr = this.buildChainSelect( opt );
            
            this.renderChainDetail( selStr );
        }

        
        // render: poi
        //------------

        console.log( "HAM view.poi.on:", view.poi.on );
        console.log( "HAM view.poi.rep:", view.poi.rep );

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
        
        // render: lolipops ok
        //--------------------
        
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
                    lpslist.push([view.lps.color,p]);
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
            
            if( this.nglcomp !==undefined){
                var lprep = this.nglcomp.addRepresentation(
                    view.lps.style,
                    { color: lpscheme,
                      sele: lpsel + " :A and .CA",
                      aspectRatio: 10.0  } );
            
                view.lps.rep.push(lprep);
            }
        }
        
        if( ! view.lps.on ){  
            if( view.lps.rep.length > 0 ){
                for( var r in view.lps.rep ){
                    view.lps.rep[r].dispose();
                }
                view.lps.rep = [];
            }
        }
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
