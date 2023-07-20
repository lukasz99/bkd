console.log("bkd-ngl: common");
  
class BkdNGL{
    
    constructor( config, data ){

        console.log(" BkdNGL: new-> ", config );
        this._conf = config;
        this.anchor = config.anchor;
        this.name = config.name;
        
        this._data = data;  // BKDnodeFeatures
        
        this.pfx = "bkd-ngl-" + this.name;
        this._view = {};

        this.currep = null;
        
        this.rsel = { hiqc: null, chain: null, aset: null };
        this.rcol = { rain: null, asel: null,
                      cmsa: null, csnp: null };

        this.detail = false;
        this.poi = null;
        this.poiColor = "#674B70";

        this.state = { sel:{ hiqc: false, chain: false,
                             aset: false },
                       
                       col:{ rain: true, asel: false,
                             cmsa: false, csnp: false,
                             topo: false, sstr: false },
                       
                       vcls:{ ben: false, lben: false,
                              cevd: false, lpat: false,
                              pat: false}
                     };

        for( var i in  config.controls){
            if( config.controls[i].name =='vcls' ){
                this.getvcls = config.controls[i].getvcls;
                this.getsels = config.controls[i].getsels;
                break;
            }
        }

        d3.select( this.anchor )
            .html( '<div id="'+ this.pfx + '-controls" '
                   + ' class="bkd-ngl-controls" '
                   + ' style="background-color: black; color: white;">'
                   + '<table class="bkd-ngl-controls-table" width="100%" align="center"></table>'
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
                     event.data.self.toggleDetail();
                     
                 });
        
        var menu = [];
        
        for( var i in config.controls){
            var mitem = {children:[]};
            menu.push(mitem);
            console.log(i);
            var cname = this.pfx + "-controls-" + config.controls[i].name;
            mitem.title = config.controls[i].label;
            
            var osel = this.anchor + " .bkd-ngl-controls-table ." + cname;
            console.log( "BkdNGL: osel:", osel );
            
            if( config.controls[i].name == "vcls"){
                for( var j in config.controls[i].options ){
                    
                    var copt = config.controls[i].options[j];
                    
                    console.log( "BkdNGL: copt:", copt, " copt.id->", cname + "-" + j );
                    
                    var oname = cname;
                    mitem.children.push( { title: copt.label,
                                           action: function(d){ console.log("action!!!") }
                                         } );
                    
                    if( config.controls[i].type != 'radio') oname = oname + "-" + j;
                    
                    d3.select( '#' + this.pfx + '-controls-var' )
                        .append( "input" )
                        .attr( "type", config.controls[i].type)
                        .attr( "id", cname + "-" + j )
                        .attr( "name", oname )
                        .attr( "value", config.controls[i].name+":"+copt.value)
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
                                 event.data.self.setstyle( pv[0], pv[1],
                                                           event.target.checked );
                             });
                }      
                
            } else {
            
                var osel = this.anchor + " .bkd-ngl-controls-table ." + cname;
                console.log( "BkdNGL: osel:", osel );
                
                for( var j in config.controls[i].options ){
                    var copt = config.controls[i].options[j];
                    mitem.children.push( { title: copt.label,
                                           action: function(d){ console.log("action!!!") }
                                         } );                                        
                }                
            }
        }    
           
        /*

        for( var i in config.controls){
            var mitem = {children:[]};
            menu.push(mitem);
            console.log(i);
            var cname = this.pfx + "-controls-" + config.controls[i].name;
            mitem.title = config.controls[i].label;
            
            //d3.select( this.anchor + " .bkd-ngl-controls-table")
            //    .append("tr").append("td")
            //    .attr("class", cname)
            //    .attr("colspan","2");
            
            var osel = this.anchor + " .bkd-ngl-controls-table ." + cname;
            console.log( "BkdNGL: osel:", osel );
            
            var a  = d3.select( osel );                
            console.log( "BkdNGL: a: " , a);               
            
            if( config.controls[i].label != undefined ){
               //a.html("&nbsp;" + config.controls[i].label + "&nbsp;&nbsp;");
            }
            
            for( var j in config.controls[i].options ){
                var copt = config.controls[i].options[j];
                console.log( "BkdNGL: copt:", copt, " copt.id->", cname + "-" + j );
                var oname = cname;
                mitem.children.push( { title: copt.label,
                                       action: function(d){ console.log("action!!!") }
                                     } );
                
                if( config.controls[i].type != 'radio') oname = oname + "-" + j;
                
                //a.append("input")
                //    .attr( "type", config.controls[i].type)
                //    .attr( "id", cname + "-" + j )
                //    .attr( "name", oname )
                //    .attr( "value", config.controls[i].name+":"+copt.value)
                //    .attr( "style", "accent-color: " + copt.color+ ";");
                
                d3.select( osel )
                    .append( "label" )
                    .attr( "for" , cname + "-" + j )
                    .html( copt.label + " &nbsp;&nbsp;" );

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
                             event.data.self.setstyle( pv[0], pv[1],
                                                       event.target.checked );
                         });
            }         
            }

        */
        
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
                    //console.log(cnm,rno,bf);                    
                });
                
                
                //var swmrmap = rmap;
                var rk = Object.keys( rmap );
                console.log("#### RK:", rk);

                //var ckl = [];
                for( var c in rk ){    // chains
                    console.log("#### RM:",rk[c], rmap[rk[c]]);
                    var ckl = Object.keys( rmap[rk[c]] );
                    ckl.sort(function(a,b) { Number(a) > Number(b) } );
                    console.log("####:: ",rk[c], ":",ckl);                    
                };
                
                var sel = "";
                var prev = Number(ckl[0]);
                var lop = "";
                for( var c in ckl ){
                    var nc = Number( ckl[c] );
                    console.log("#### nc: ",nc, prev, nc - prev);
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
                
                args.self.rcol.aapos
                    = NGL.ColormakerRegistry
                    .addSelectionScheme( [["atomindex", "*"]] );
                
                args.self.currep =
                    o.addRepresentation( "cartoon",
                                         {color: args.self.rcol.aapos} );  
                o.autoView( "all" );
                console.log( "BkdNGL: loaded");
            };            
        }

        this.nglstage.loadFile(  config.url ) 
            .then( loadCallback( { self: this,
                                   cutQC: 0.5 }));        
    }
    
    rerender(){        
        console.log("rerender called");
        this.setstyle("vcls",null, null);            
    }

    setPOI( poi ){
        this.poi = poi;
        this.setstyle( 'poi', this.poi, null );
    }
    
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

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
                console.log("POI:",poi);
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
                console.log("#### RM:",rk[c], rmap[rk[c]]);
                var ckl = Object.keys( rmap[rk[c]] );
                ckl.sort(function(a,b) { Number(a) > Number(b) } );
                console.log("####:: ",rk[c], ":",ckl);                    
                
                var prev = Number(ckl[0]);
                var lop = "";
                for( var c in ckl ){
                    var nc = Number( ckl[c] );
                    console.log("#### nc: ",nc, prev, nc - prev);
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
            
            var newrep = this.nglcomp.addRepresentation( 
               "licorice", { color: "element" } );

            //var newrep = this.nglcomp.addRepresentation( 
            //    "surface", { color: cs, type: "dot" } );

            this.nglcomp.removeRepresentation( this.currep );
            this.currep  = newrep;
            this.nglcomp.setSelection( sel );
            
            this.nglcomp.autoView(sel);            
            
        } else {

            var newrep = this.nglcomp.addRepresentation(
                "cartoon",  { color: this.currentColorScheme } );

            this.nglcomp. setSelection( "all" );
            this.nglcomp.removeRepresentation( this.currep );
            this.currep  = newrep;
            this.nglcomp.autoView("all");
        }
            
        
    }
    
    setstyle( par, value, state ){
        
        console.log( "setstyle called:", par, value, state);
        console.log( " data.state:",this.state);
        console.log( " data.fstate:",this._data.fstate);

        // handle poi change
        //------------------

        if(  par == 'poi'){
            
            return;
        }
        
        // handle selection
        
        if( par == 'sel'){
            var csel = "all"; 
            if( value == 'hiqc' && state ) csel = this.rsel.hiqc;
            
            this.nglcomp.setSelection( csel );
        }
   
        // handle vcls

        var rlist = []; 
        
        if( par == 'vcls' &&  this.getvcls != undefined ){
            // lolipop selections - see BKDnodeFeatures.fstate
            // this.state - see:
            // BKDnodeFeatures.ftypesel[clist[s]["value"]]=false; - checkboxes 
            var rmap = this.getvcls( this.state );
            console.log("rmap:", rmap);
            
            for( var i in rmap ){
                var pos = rmap[i].pos;
                var col = rmap[i].col;                
                rlist.push([col,String(pos)]);
            }

            var sels = this.getsels( {} );
            console.log("sels:", sels);
            
            for( var k in sels ){
                if( sels[k].on ){
                    rlist.push(["orange",k]);
                }            
            }
        }

        if( rlist.length > 0 ){
            rlist.push( ["green","*"]);
        } else {

            var data = BKDnodeView.mymsa2a._data;
            console.log("  BkdNGL: data->", data.msaEnt);
            
            if( this.state.col.rain ) rlist.push(["atomindex", "*"]);

            if( this.state.col.cmsa ){
                
                var emax = 0;

                for( var i = 0; i < data.msaEnt.length; i++){
                    if( data.msaEnt[i] > emax  ) emax = data.msaEnt[i];                        
                }
                if( emax == 0) emax = 1;
                const interpolator = d3.interpolateRgb.gamma(2.1)("green", "magenta");
                for( var i = 0; i < data.msaEnt.length; i++){
                    var c = 2*(data.msaEnt[i]/emax)**1.5;
                    var col = d3.color(interpolator(c)).formatHex();
                    //console.log(col.r,col.g,col.b);
                    rlist.push([col,String(i)]);                   
                }
            }
        }
        
        console.log("rlist->",rlist);
        
        this.currentColorScheme = NGL.ColormakerRegistry
            .addSelectionScheme( rlist,"features" );
        
        var newrep = this.nglcomp.addRepresentation(
            "cartoon",{color: this.currentColorScheme });
        
        this.nglcomp.removeRepresentation( this.currep );
        this.currep  = newrep;          
        this.nglcomp.autoView("all");                   
    }    
}
