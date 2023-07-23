class BkdTopo{
    
    constructor( config, data ){

        console.log(" BkdTopo: new-> ", config); //  data );

        this.config = config;
        this.data = data;
        console.log(" BkdTopo: new-> ", config); //  data );

        var anchor = this.config.anchor;
        
        // topology panel
        //---------------
        
        var purl = this.config.siteurl + "protter/"+ this.data.ac +".svg";
        
        console.log("BkdTopo: PROTTER:" + purl);      

        d3.select( anchor )
            .html( '<div id="topo-controls" class="bkd-select-controls">'
                   + '<table class="topo-controls-table" width="100%" align="center">'
                   + '<tr><td id="topo-select-controls" colspan="2"></td></tr>'
                   + '<tr><td id="topo-zoom-controls"></td><td id="topo-pan-controls"></td></tr>'
                   + '</table>'
                   + '</div>'
                 );
        
        d3.select( anchor )
            .append("div")
            .attr("id", "topo-view")
            .attr("class","xxbkd-topo-ovr xxbkd-stack-top");

        var curry = function( self, anchor, clist, cstate ){
            return function(){
                
                //console.log( "TOPO: width= " + $( "#topo-port > svg").width() );
                //console.log( "TOPO: height=" +  $( "#topo-port > svg").height() );
                //console.log( "TOPO: bb=" +  $( "#topo-port > svg") );
                
                var svgw = $( "#topo-view > svg").width();
                var svgh = $( "#topo-view > svg").height();
            
                var scl = 570.0 / svgh;
                var trX = 0;  //svgw/2.0;  //*(scl-1); 
                var trY = svgh/2.0*(scl-1);   

                //alert("TOPO: " + trX + ":" + trY + ":" + scl );
            
                $( " #topo-view > svg" ).attr(
                    'transform',
                    'translate('+trX+','+trY+') scale('+scl+')' );
                
                self.zoom = d3.zoom().on( 'zoom', self.handleMouseZoom );            
                d3.select( anchor + ' svg' ).call( self.zoom ); 
 
                self.svgcontrol( "topo-zoom-controls",
                                 "topo-pan-controls",
                                 self.handleButtonZoom,
                                 self.handleButtonPan);

                self.fselcontrol( "#topo-select-controls",
                                  clist,
                                  cstate,
                                  self.handleSelect);
            }
        };
        
        var callback = curry( this, anchor,
                              BKDnodeFeatures.vclass,
                              BKDnodeFeatures.state.fsel.topo );
        
        $( "#topo-view" ).load( purl, callback);       
    }
    
    fselcontrol( anchor, clist, cstate, action ){
        
        console.log( "BkdTopo:", anchor, clist, cstate, action);
        
        if( ! d3.select( anchor  ).empty() ){
            d3.select( anchor + " *" ).remove();
        }

        d3.select( anchor )
            .html('&nbsp;&nbsp;&nbsp;&nbsp;');

        for( var s in clist ){

            cstate[clist[s]["value"]]=false;

            var cid = "bkd-topo-" + clist[s]['id'];  

            d3.select(  anchor )
                .append("input")
                .attr( "type", "checkbox")
                .attr( "id", cid )
                .attr( "name", clist[s]["name"])
                .attr( "value", clist[s]["value"])
                .attr( "style", "accent-color: " + clist[s]["color"]+ ";");
            
            d3.select( anchor )
                .append( "label" )
                .attr( "for" , clist[s]["name"] )
                .html( clist[s]["label"] + " &nbsp;&nbsp;" );
            
            $( "#" + cid )
                .on( 'click',
                     { self: this },
                     (event) => {
                         console.log( 'BkdTopo: click: event->', event.target  );
                         this.handleSelect(event);
                     });                       
        }
    }

    svgcontrol( zoomanchor, pananchor, zoomaction, panaction ){
        
        if( ! d3.select( "#" + zoomanchor  ).empty() ){                    
            d3.select( "#" + zoomanchor + " *" ).remove();
        }

        if( ! d3.select( "#" + pananchor  ).empty() ){                    
            d3.select( "#" + pananchor + " *" ).remove();
        }

        d3.select( "#" + zoomanchor )
            .html( '<input type="button" id="zoom-plus" name="plus" value="+">'
                   + '&nbsp;'
                   + '<input type="button" id="zoom-reset" name="zreset" value="Zoom reset">'
                   + '&nbsp;'       
                   + '<input type="button" id="zoom-minus" name="minus" value="-">');
                                
        d3.select( "#" + pananchor )
            .html( '<input type="button" id="pan-left" name="plus" value="<">'
                   + '&nbsp;'
                   + '<input type="button" id="pan-reset" name="preset" value="Pan reset">'
                   + '&nbsp;'       
                   + '<input type="button" id="pan-right" name="minus" value=">">');                        

        d3.select( "#zoom-plus").on('click', zoomaction );
        d3.select( "#zoom-reset").on('click', zoomaction);
        d3.select( "#zoom-minus").on('click', zoomaction);

        d3.select( "#pan-left").on('click', panaction);
        d3.select( "#pan-reset").on('click', panaction);
        d3.select( "#pan-right").on('click', panaction);
        
    }
    
    handleSelect( e ){
        console.log( "BkdTopo -> handleSelect: ", e );
        console.log( "BkdTopo -> value,checked: ", e.target.value, e.target.checked );
        console.log( "BkdTopo -> this: " , this);

        BKDnodeFeatures.state.fsel.topo[e.target.value] = e.target.checked;
        
        console.log( "BkdTopo -> state.fsel:" , BKDnodeFeatures.state.fsel.topo);

        this.setColor(  BKDnodeFeatures.fstate );
    }

    setColor( fstate ){

        console.log( "BkdTopo -> setColor" );
        
        // reset all: white
        
        $( "svg circle[id$='_symbol']" ).attr('fill','#ffffff');
        
        var rmap = BKDnodeFeatures.buildvclist( {vcls: BKDnodeFeatures.state.fsel.topo } ); 
        console.log( "BkdTopo -> rmap: ", rmap);

        for( var i in rmap ){
            var pos = rmap[i].pos;
            var col = rmap[i].col;
            $('#aa' + (pos-1).toString() + '_symbol')[0].setAttribute('fill', col );
        }

        for( var i in fstate ){
            if( fstate[i].on){
                console.log("FSTATE ON:", i);
                if( $('#aa' + (i-1).toString() + '_symbol').length > 0){
                    $('#aa' + (i-1).toString() + '_symbol')[0].setAttribute('fill', "orange")
                }
            }
        }
    }

    handleMouseZoom( e ){
        d3.select('#topo-port svg g').attr('transform',e.transform); 
    }
    
    handleButtonZoom( e ){
        
        if( this.id == 'zoom-reset'){
            d3.select('#topo-port svg')
                .transition()
                .call(BKDnodeFeatures.zoom.transform, d3.zoomIdentity);           
        } else if( this.id == 'zoom-plus') {
            d3.select('#topo-port svg')
                .transition()
                .call(BKDnodeFeatures.zoom.scaleBy, 1.1);
        } else if (this.id == 'zoom-minus') {
            d3.select('#topo-port svg')
                .transition()
                .call(BKDnodeFeatures.zoom.scaleBy, 0.9);
        }                        
    }

    handleButtonPan( e ){        
        if( this.id == 'pan-reset'){
            d3.select('#topo-port svg')
                .transition()
                .call(BKDnodeFeatures.zoom.transform, d3.zoomIdentity);           
        } else if( this.id == 'pan-left') {
            d3.select('#topo-port svg')
                .transition()
                .call(BKDnodeFeatures.zoom.translateBy, -50, 0);
        } else if (this.id == 'pan-right') {
            d3.select('#topo-port svg')
                .transition()
                .call(BKDnodeFeatures.zoom.translateBy, 50, 0);
        }  
    }
}
