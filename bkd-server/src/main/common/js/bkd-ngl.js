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
                   + '<table class="bkd-ngl-controls-table" width="100%" align="center">'
                   + '</table>'
                   + '</div>'
                   + '<div id="'+ this.pfx + '-view" class="bkd-ngl-view"></div>' );
        
        console.log("BkdNGL: controls->", config.controls);
        
        for( var i in config.controls){
            console.log(i);
            var cname = this.pfx + "-controls-" + config.controls[i].name;

            d3.select( this.anchor + " .bkd-ngl-controls-table")
                .append("tr").append("td")
                .attr("class", cname)
                .attr("colspan","2");
            
            var osel = this.anchor + " .bkd-ngl-controls-table ." + cname;
            console.log( "BkdNGL: osel:", osel );

            var a  = d3.select( osel );                
            console.log( "BkdNGL: a: " , a);               
            
            if( config.controls[i].label != undefined ){
                a.html("&nbsp;" + config.controls[i].label + "&nbsp;&nbsp;");
            }
            
            for( var j in config.controls[i].options ){
                var copt = config.controls[i].options[j];
                console.log( "BkdNGL: copt:", copt, " copt.id->", cname + "-" + j );
                var oname = cname;
                if( config.controls[i].type != 'radio') oname = oname + "-" + j;
                
                a.append("input")
                    .attr( "type", config.controls[i].type)
                    .attr( "id", cname + "-" + j )
                    .attr( "name", oname )
                    .attr( "value", config.controls[i].name+":"+copt.value)
                    .attr( "style", "accent-color: " + copt.color+ ";");
                
                d3.select( osel )
                    .append( "label" )
                    .attr( "for" , cname + "-" + j )
                    .html( copt.label + " &nbsp;&nbsp;" );
                
                //BKDnodeFeatures.ftypesel[clist[s]["value"]]=false;

                $( "#" + cname + "-" + j )
                    .on( 'click',
                         { self: this },
                         (event) => { console.debug( 'click: event->', event.target  );
                                      var pv = event.target.value.split(':');
                                      console.debug( 'click: par->', pv[0],
                                                     ' val->', pv[1],
                                                     ' state->', event.target.checked);
                                      event.data.self.state[pv[0]][pv[1]] = event.target.checked;
                                      if( event.target.type == 'radio'){
                                          var cst = event.data.self.state[pv[0]];
                                          for(var i in cst ){
                                              if( i != pv[1] ) cst[i] = ! event.target.checked;
                                          }
                                      }
                                      
                                      console.debug( 'BkdNGL: state->', event.data.self.state );
                                      event.data.self.setstyle( pv[0], pv[1], event.target.checked );
                                      
                                      //event.data.lpanel.flistSelEventAction( event );

                                    });                               
            }
        }

        $( this.anchor ).show();   
        var phght = $( this.anchor ).height();
        var chght = $( '#' + this.pfx+'-controls' ).height();
        $( '#' + this.pfx + '-view' ).height( phght - chght );
        this.nglstage = new NGL.Stage( this.pfx + '-view' );
        $( this.anchor ).hide();
        
        //BKDnodeFeatures.state["swm"] = {"stage": BKDnodeFeatures.swmStage };
        //console.log("##### set stage",BKDnodeFeatures.state);

        //url = BKDnodeFeatures.siteurl;
        //id = BKDnodeFeatures.data.ac;

        console.log( "############SWM: PDB:" + config.url );
        
        var loadCallback = function( args ){

            console.log( "BkdNGL: currying loadCallback -> args:",args);
            
            return function( o ){            

                console.log( "BkdNGL: loadCallback -> args:",args);
                
                args.self.nglcomp = o;
                
                var selStr = "";
                var selQCut = args.cutQC;
                
                var rmap = {};
            
                o.structure.eachAtom( function(atom) {
                    var bf = atom.bfactor;
                    var cnm = atom.chainname;                   
                    var rno = atom.resno;
                    
                    if( bf > selQCut) {
                        if( rmap[cnm]  == undefined ) rmap[cnm] = {};
                        if( rmap[cnm][rno] == undefined ) rmap[cnm][rno] = true;
                    }
                    //console.log(cnm,rno,bf);                    
                });
                
                //var swmrmap = rmap;
                var rk = Object.keys( rmap );
                console.log("#### RK:", rk);
                
                for( var c in rk ){
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
                console.log("#### sel:",sel);

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
        
        this.nglstage.loadFile(  config.url ) // url+"swissmodel/"+id+"-1_swm.pdb")
            .then( loadCallback( { self: this,
                                   cutQC: 0.5 }));        
    }

    rerender(){

        console.log("rerender called");
        this.setstyle("vcls",null, null);            
    }
    
    //---------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    setstyle( par, value, state ){
        
        console.log( "setstyle called:", par, value, state);
        console.log( " data.fstate:",this._data.fstate);

        // handle selection
        
        if( par == 'sel'){
            var csel = "all"; 
            if( value == 'hiqc' && state ) csel = this.rsel.hiqc;
            
            this.nglcomp.setSelection( csel );
        }

        // handle vcls

        if( par == 'vcls' &&  this.getvcls != undefined ){
            // lolipop selections - see BKDnodeFeatures.fstate
            // this.state - see  BKDnodeFeatures.ftypesel[clist[s]["value"]]=false; - checkboxes 
            var rmap = this.getvcls( this.state );
            console.log("rmap:", rmap);

            var rlist = []; 
            
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
            
            if( rlist.length > 0 ){
                rlist.push( ["green","*"]);
            } else {
                rlist.push(["atomindex", "*"]);
            }

            console.log("rlist->",rlist);
            
            
            var colorScheme = NGL.ColormakerRegistry
                .addSelectionScheme( rlist,"features" );
            
            var newrep = this.nglcomp.addRepresentation(
                "cartoon",{color: colorScheme});
           
            this.nglcomp.removeRepresentation( this.currep );
            this.currep  = newrep;          
            this.nglcomp.autoView("all");                   
        }
        
    }

    //--------------------------------------------------------------------------
    /*        
    variantCtrl(){

                
    }
    
    selectCtrl( anchor,    
                fselname,    // swm / str
                nglstate,   // 
                clist,      // checkbox list
                fselstate,  // state
                lpanel,     // lolipop panel      
                action      // action (on struct viewer)
              ){
        
        console.log("##### fselectCtrl: anchor->",anchor, "name->", fselname ,"state->", nglstate)
        console.log("##### state['swp']: ", nglstate[fselname]);
        var nglstage = nglstate[fselname].stage;
        / * args
           "swm-select-controls",
        "swm",
        BKDnodeFeatures.state,
        BKDnodeFeatures.selections,
        BKDnodeFeatures.state.fsel.swm,
        BKDnodeFeatures.lollipanels['loli1'],
        BKDnodeFeatures.setNGLSelScheme
        * /
        
        console.log( "BKDnodeFeatures.fcolorCtrl:", lpanel,action);
        if( ! d3.select( "#" + anchor  ).empty() ){                    
            d3.select( "#" + anchor + " *" ).remove();
        }
        
        d3.select( "#" + anchor )
            .html('&nbsp;<b>Select:</b>&nbsp;&nbsp;');
        
        for( var s in clist ){
            d3.select( "#" + anchor )
                .append("input")
                .attr( "type", "checkbox")
                .attr( "id", anchor + "-" + s )
                .attr( "name", anchor + "-" + s )
                .attr( "value", clist[s]["value"])
                .attr( "style", "accent-color: " + clist[s]["color"]+ ";");
            
            d3.select( "#" + anchor )
                .append( "label" )
                .attr( "for" , anchor + "-" + s )
                .html( clist[s]["label"] + " &nbsp;&nbsp;" );
            
            BKDnodeFeatures.ftypesel[clist[s]["value"]]=false;

            $( "#" + anchor + "-" + s )
                .on( 'click', {lpanel: lpanel,
                               state: nglstate[fselname],
                               fselname: fselname,
                               fselstate: fselstate },
                     (event) => { console.log( 'click: data->', event.data );
                                  action( event );
                                } );
                        
        }
        console.log( "BKDnodeFeatures.fselectCtrl action: ", "#" + anchor + " input");
        console.log( "BKDnodeFeatures.fselectCtrl action: ", action );
        console.log( $( "#" + anchor + " input") );        
    }
    
    colorCtrl( anchor,     //
               clist,      //  checkbox list
               fselname,   //  swm / str
               fselstate,  // 
               lpanel,     // lollipop panel
               action      // action
             ){
        
        //"swm-select-controls",
        //BKDnodeFeatures.vclass,                                    
        //"swm",
        //BKDnodeFeatures.state.fsel.swm,
        //BKDnodeFeatures.lollipanels['loli1'],
        //BKDnodeFeatures.lollipanels['loli1'].flistSelEventAction );
            
        console.log( "BKDnodeFeatures.fcolorCtrl:", lpanel,action);
        if( ! d3.select( "#" + anchor  ).empty() ){                    
            d3.select( "#" + anchor + " *" ).remove();
        }

        //d3.select( "#" + anchor )
        //    .html('&nbsp;&nbsp;&nbsp;&nbsp;');

        d3.select( "#" + anchor )
            .html('&nbsp;<b>Variant:</b>&nbsp;');
        
        for( var s in clist ){
            d3.select( "#" + anchor )
                .append("input")
                .attr( "type", "checkbox")
                .attr( "id", anchor + "-" + s )
                .attr( "name", anchor + "-" + s )
                .attr( "value", clist[s]["value"])
                .attr( "style", "accent-color: " + clist[s]["color"]+ ";");
            
            d3.select( "#" + anchor )
                .append( "label" )
                .attr( "for" , anchor + "-" + s )
                .html( clist[s]["label"] + " &nbsp;&nbsp;" );
                
            BKDnodeFeatures.ftypesel[clist[s]["value"]]=false;

            $( "#" + anchor + "-" + s )
                .on( 'click', {lpanel: lpanel,
                               state: nglstate[fselname],
                               fselname: fselname,
                               fselstate: fselstate },
                     
                     
                     (event) => { console.log( 'click: data->', event.data );
                                  //event.data.lpanel.flistSelEventAction( event );
                                  action( event );
                                } );
                        
        }
        console.log( "BKDnodeFeatures.fcolorCtrl action: ", "#" + anchor + " input");
        console.log( "BKDnodeFeatures.fcolorCtrl action: ", lpanel.flistSelEventAction );
        console.log( $( "#" + anchor + " input") );        
    }

    */
}
