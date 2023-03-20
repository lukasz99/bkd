console.log("bkd-d3msa: common");
 
D3MSA = {

    anchor: null,
    target: null,
    msaurl: null,
    select: [1,10,100],
    
    svg: null,
    _svgH: 625,
    _svgW: 600,
    _msaW: 450,

    _palette1: { "A":"green", "C":"orange", "D":"red",   "E":"red",
                 "F":"green", "G":"green",  "H":"blue",  "I":"green",
                 "K":"blue",  "L":"green",  "M":"green", "N":"grey",
                 "P":"green", "Q":"grey",   "R":"blue",  "S":"grey",
                 "T":"grey",  "V":"green",  "W":"green", "Y":"grey",
                 "-":"white", "~": "white",  ".":"white"
               },                    
     
    config: {
        navig: true,
        tlist: [ 'slogo', 'msa']
    },    

    options: {
        className: "d3msaClass",
        viewID: "d3msaID",
        background: "white"
    },
    
    initialize: function( anchor, url ){
        this.anchor = anchor;
        this.msaurl = url;

        // load remote msa fasta       
        
        $.ajax( { url: this.msaurl,
                  beforeSend: function( xhr ) {
                      xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
                  }
                } )
            .done( function( data, textStatus, jqXHR ){
                // parse msa fasta                
                var lines = data.split('\n');
                
                D3MSA.msaHead = [];
                D3MSA.msaSeq = [];
                for( var i=0; i < lines.length; i++ ){
                    if( lines[i].startsWith('>') ){                        
                        D3MSA.msaHead.push( lines[i].replace(">","").split(";")[0] );
                        D3MSA.msaSeq.push("");
                    } else {
                        D3MSA.msaSeq[D3MSA.msaSeq.length-1]+= lines[i];
                    }
                }
                
                //render                
                setTimeout( D3MSA.render(), 1000 );
            } );
        
        this._initViz();
    },

    render: function(){

        // map sequences

        D3MSA.msaMap = [];
        D3MSA.msaRMap = {};
        
        for( var i=0; i <  D3MSA.msaSeq.length; i++ ){
            D3MSA.msaMap.push([]);
            var cp = 0;
            for( var j=0; j < D3MSA.msaSeq[i].length; j ++ ){
                if( "ACDEFGHIKLMNPQRSTVWY".includes( D3MSA.msaSeq[i][j] ) ){
                    cp +=1;
                    if( i==0 ){
                        D3MSA.msaRMap[cp] = j;
                    }    
                }
                D3MSA.msaMap[i].push( cp );
            }
        }

        // assumes msa already loaded

        D3MSA.msaRange = [0, D3MSA.msaSeq[0].length];

        D3MSA.msaScale = d3.scaleLinear()  //  1 -> 1
            .domain(D3MSA.msaRange)
            .range([0, D3MSA.msaSeq[0].length-1]);
        
        D3MSA.navScale = d3.scaleLinear()  //  100 ->  pixelWidth
            .domain([0, 100])
            .range([0, D3MSA._msaW]);
        
        D3MSA.nav2msaScale = d3.scaleLinear()  // 100 -> maxAA
            .domain([0, 100])
            .range(D3MSA.msaRange);        
        
        if( this.config.navig ){
            this.navView();
        }
        
        for( t in this.config.tlist ){
            if( this.config.tlist[t] == 'slogo' ){
                this.slogoView();
            } else if( this.config.tlist[t] == 'msa' ){
                this.msaView();
            }
        }        
    },

    _initViz: function(){

        var target = null;
        
        if (!this.target) {
            target = "d3msa_" + this.getUniqueID();
            d3.select( this.anchor ).append( "div" ).attr( "id", target );
        }

        svg = d3.select( "#" + target ).append("svg");
        svg.attr( "width", this._svgW ).attr( "height", this._svgH )
            .attr( "xmlns", "http://www.w3.org/2000/svg" )
            .attr( "xmlns:xlink", "http://www.w3.org/1999/xlink" );
        
        svg.classed( this.options.className, true)
            .attr("id", this.options.chartID )
            .style("background-color", this.options.background || "transparent");
        
        this.target = target;
        this.svg = svg;
        
    },

    navView: function(){
        
        D3MSA.displaystart = 0;
        D3MSA.displayend =  100;
               
        _navG = D3MSA.svg.append("g").attr( "id", "msanav" )
            .attr("transform", "translate(100, 10)");

        _msaAxis = d3.axisBottom( D3MSA.navScale );
        _msaAxis.ticks( 10 ).tickFormat('');
                
        D3MSA.navAxis = _navG.append('g')
            .attr('class', 'x axis')
            .call(_msaAxis);
        
        D3MSA.viewport = d3.brushX()
            .extent([ [0, 0], [D3MSA._msaW, 10] ])
            .on( "brush", (event) => {
                //console.log( event );               
                if( event.selection ){
                    D3MSA.displaystart =                        
                        D3MSA.navScale.invert(event.selection[0]);
                    D3MSA.displayend =
                        D3MSA.navScale.invert(event.selection[1]);

                    D3MSA.updatePolygon();
                    D3MSA.updateMSA();
                    D3MSA.updateSelect();
                }
            });
        
        D3MSA.navBrushG = _navG.append("g")
            .attr("class", "brush")
            .call(D3MSA.viewport);
        
        D3MSA.navBrushG 
            .call( D3MSA.viewport.move, [ D3MSA.navScale( D3MSA.displaystart ),
                                          D3MSA.navScale( D3MSA.displayend ) ] );
                    
        D3MSA.polygon = _navG.append("polygon")
            .attr('class', 'zoom-polygon')
            .attr('fill', '#777')
            .attr('fill-opacity','0.3');
        
        D3MSA.updateNavRuler();   
    },

    updateNavRuler: function(){
        D3MSA.updatePolygon();        
    },

    updateMSA() {
        var windowWidth = ( D3MSA.displayend - D3MSA.displaystart ) / 100 * (D3MSA.msaRange[1]);
        var windowCenter = 0.005 * ( D3MSA.displayend + D3MSA.displaystart ) * (D3MSA.msaRange[1]);        

        D3MSA.aaStep   =  ( D3MSA._msaW ) / windowWidth;   // [pixel/aa]
        D3MSA.aaOffset =  (windowCenter) * D3MSA.aaStep - D3MSA._msaW/2;

        D3MSA.msaOpa = 0.5;
        if( D3MSA.aaStep <= 16 ){
            D3MSA.msaOpa = 0.5 + 0.5* (16-D3MSA.aaStep)/16   ;
        }
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){
            
            d3.select( "#seqMSA_view #seqSeq" + i.toString() ).selectAll( "text" )
                .data( D3MSA.msaSeq[i].split('') ) 
                .each( function (d,j) {
                    var pos = 0.5 * D3MSA.aaStep + j * D3MSA.aaStep - D3MSA.aaOffset; 
                    if( pos > 0 && pos < D3MSA.aaStep){
                        //console.log("min: ",i, j,pos);
                        D3MSA.msaMin[i] = D3MSA.msaMap[i][j];
                    }
                    if( pos > D3MSA._msaW && pos < D3MSA._msaW + D3MSA.aaStep){
                        //console.log("max: ",i, j,pos);
                        D3MSA.msaMax[i] = D3MSA.msaMap[i][j];
                    }
                    D3MSA.msaPos[i][j] = pos;
                    D3MSA.rectPos[i][j] = pos - 0.5 * D3MSA.aaStep;;                     
                });


            d3.select( "#seqMSA_view #seqSeq" + i.toString() ).selectAll( "rect" )
                .data( D3MSA.msaSeq[i].split('') )                            
                .attr( "x",function (d,j) {
                    return  + j * D3MSA.aaStep - D3MSA.aaOffset;
                } )
                .attr( "fill-opacity", function (d) { 
                    return D3MSA.msaOpa                
                })
/*
                .attr( "x",function (d,j) {
                    return  + j * D3MSA.aaStep - D3MSA.aaOffset;
                } )
*/
                .attr( "x",function (d,j) {
                    return D3MSA.rectPos[i][j];
                    //return  + j * D3MSA.aaStep - D3MSA.aaOffset;
                } )


            
                .attr( "fill-opacity", function (d) {
                    if( D3MSA.aaStep > 16 ){
                        return 0.5;
                    } else {
                        return 0.5 + 0.5* (16-D3MSA.aaStep)/16   ;
                    }
                })
          
                .attr( "width", function (d) {  return D3MSA.aaStep } );

            
            d3.select( "#seqMSA_view #seqSeq" + i.toString() ).selectAll( "text" )
                .data( D3MSA.msaSeq[i].split('') ) 
/*                .attr( "x",function (d,j) {
                    var pos = 0.5 * D3MSA.aaStep + j * D3MSA.aaStep - D3MSA.aaOffset; 
                    if( pos > 0 && pos < D3MSA.aaStep){
                        //console.log("min: ",i, j,pos);
                        D3MSA.msaMin[i] = D3MSA.msaMap[i][j];
                    }
                    if( pos > D3MSA._msaW && pos < D3MSA._msaW + D3MSA.aaStep){
                        //console.log("max: ",i, j,pos);
                        D3MSA.msaMax[i] = D3MSA.msaMap[i][j];
                    }
*/
                .attr( "x", function (d,j) {
                    return D3MSA.msaPos[i][j];
                })
                .attr( "fill-opacity", function (d) {
                    if( D3MSA.aaStep > 16 ){
                        return 1;
                    } else {
                        var op = -1 + 2*D3MSA.aaStep/16;
                        if(op < 0){
                            return 0;
                        } else {
                            return op;
                        }                      
                    }
                });            

            if(D3MSA.msaMin){                
                d3.select( "#seqHead" + i.toString() + " .msa-min")
                    .text( D3MSA.msaMin[i] );
            }
            
            if(D3MSA.msaMax){
                d3.select( "#seqHead" + i.toString() + " .msa-max")
                    .text( D3MSA.msaMax[i] );
            }               
        }        
    },
    
    updatePolygon() {
        var max = D3MSA._msaW;
        if (D3MSA.polygon)
            D3MSA.polygon.attr(
                "points",
                `${D3MSA.navScale(D3MSA.displaystart)},10
        ${D3MSA.navScale(D3MSA.displayend)},10
        ${D3MSA._msaW},25
        0,25`
            );
    },
    
    msaView: function(){
        //console.log( D3MSA.msaSeq[0].split('') );
        D3MSA.msaMin = [];
        D3MSA.msaMax = [];
        D3MSA.msaPos = [];
        D3MSA.rectPos = [];

        for( var i = 0; i < D3MSA.msaSeq.length; i++){
            D3MSA.msaMin.push(1);
            D3MSA.msaMax.push(D3MSA.msaMap[i][D3MSA.msaSeq[i].length-1]);
            D3MSA.msaPos.push([]);
            D3MSA.rectPos.push([]);
        }
        
        offsetY = 10;
        if( D3MSA.config.navig ) offsetY += 30;
        if( D3MSA.config.slogo ) offsetY += 50;

        var _seqMSA = D3MSA.svg.append("g").attr( "id", "seqMSA" )
            .attr("transform", "translate(0, " + (offsetY) + ")");        
        _seqMSA.append("clipPath")
            .attr("id", "seqMSA_clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -6)
            .attr("width", D3MSA._msaW) // TODO
            .attr("height", 12*(D3MSA.msaHead.length+1));
        
        var _seqMSA_head = _seqMSA.append("g").attr( "id", "seqMSA_head" );
        
        var _seqMSA_port = _seqMSA.append("g").attr( "id", "seqMSA_port" )
            .attr("clip-path", "url(#seqMSA_clip)")
            .attr("transform", "translate(100, 0)");
        
        var _seqMSA_view = _seqMSA_port.append("g").attr( "id", "seqMSA_view" );
                        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){         
            _seqG = _seqMSA_head.append("g").attr( "id", "seq"+i.toString() )
                .attr("transform", "translate(0, " + (i+1)*12 + ")");
 
            _seqHG = _seqG.append("g").attr( "id", "seqHead"+i.toString() );
            _seqHG.append("text")
                .style( "font", "normal 12px Arial") 
                .text( D3MSA.msaHead[i] );
            
            _seqSG = _seqMSA_view.append("g")
                .attr( "id", "seqSeq" + i.toString() )
                .attr( "transform", "translate( 0, "+ (i+1)*12 + ")" );

            d3.select( "#seqSeq" + i.toString() ).selectAll( ".msa-rect" )
                .data( D3MSA.msaSeq[i].split('') )
                .enter()            
                .append( "rect" )
                .style( "fill", "grey" )
                .attr( "x",function (d,j) {
                    var pos = j * D3MSA.aaStep - D3MSA.aaOffset;
                    return pos;
                })
                .attr( "y", function (d) { return -10; } )
                .attr( "width", function (d) { return D3MSA.aaStep } )
                .attr( "height", function (d) { return 10; } )
                .attr( "class", "msa-rect")
                .style( "fill", function (d) { return D3MSA._palette1[d]} )
                .attr( "fill-opacity", function (d) {
                    if( D3MSA.aaStep > 16 ){
                        return 0.5;
                    } else {
                        return 1;
                    }
                })            
                    
            d3.select( "#seqSeq" + i.toString() ).selectAll( "text" )
                .data( D3MSA.msaSeq[i].split('') )
                .enter()            
                .append( "text")
                .attr( "class", "msa-aa")
                .style( "font", "bold 12px Arial")
                .style( "fill", function (d) { return D3MSA._palette1[d]} )
                .attr( "text-anchor", "middle") 
                .attr( "x",function (d,j) {
                    var pos = 0.5 * D3MSA.aaStep + j * D3MSA.aaStep - D3MSA.aaOffset; 
                    if( pos > 0 && pos < D3MSA.aaStep) D3MSA.msaMin[i] = D3MSA.msaMap[i][j]; 
                    if( pos > D3MSA._msaW && pos < D3MSA._msaW + D3MSA.aaStep) D3MSA.msaMax[i] = D3MSA.msaMap[i][j]; 
                    return  pos;
                })
                .attr( "y", function (d) { return 0; } )
                .attr( "i", function (d,j) { return j; } )
                .attr( "fill-opacity", function (d) {
                    if( D3MSA.aaStep > 16 ){
                        return 1;
                    } else {
                        return 0;
                    }
                })
                .text( function (d,j) {
                    if(j <= D3MSA.msaSeq[0].length - 1 ){
                        return d;
                    }
                } );

            d3.select( "#seqHead" + i.toString() )
                .append("text")
                .attr( "class", "msa-min")
                .attr( "x", 95)
                .attr( "y", 0 )
                .style( "font", "bold 12px Arial")
                .style( "fill", "grey")
                .attr( "text-anchor", "end")
                .text( D3MSA.msaMin[i] );
            
            d3.select( "#seqHead" + i.toString() )
                .append("text")
                .attr( "class", "msa-max")
                .attr( "x", 105 + D3MSA._msaW)
                .attr( "y", 0 )
                .style( "font", "bold 12px Arial")
                .style( "fill", "grey")
                .attr( "text-anchor", "start")
                .text( D3MSA.msaMax[i] );
            
            //console.log(D3MSA.msaMin,D3MSA.msaMax);
        }

        var _seqMSA_select= _seqMSA_view.append("g").attr( "id", "seqMSA_select" );        
        this.setSelect( _seqMSA_select );

        
    },

    setSelect: function( anchor ){
        for(var s in this.select ){
            
            anchor.selectAll( ".msa-select" )
                .data( this.select )
                .enter()
                .append( "rect" )
                .style( "fill", "orange" )
                .style( "fill-opacity", 0.25)
                .style( "stroke", "orange")
                .attr( "x",function(d) {

                    var mp = D3MSA.msaRMap[d];
                    var pos = mp * D3MSA.aaStep - D3MSA.aaOffset;
                    return pos;
                })
                .attr( "y", -2 )
                .attr( "pos", function(d) {
                    return d;
                })
                .attr( "width", D3MSA.aaStep )
                .attr( "height", 12*(D3MSA.msaSeq.length + 0.5) )
                .attr( "class", "msa-select" );            
        }
    },

    updateSelect:  function(){
        //console.log("updateSelect:", D3MSA.aaStep);
        //console.log(d3.select( "#seqSeq0" ).selectAll( ".msa-select" ));
        
        d3.selectAll( ".msa-select" )
            .data( this.select )
            .attr( "x",function (d,j) {
                var mp = D3MSA.msaRMap[d];
                var pos = mp * D3MSA.aaStep - D3MSA.aaOffset;
                return pos;
            })
            .attr( "width", D3MSA.aaStep );        
    },


    addSelect: function( anchor, d ){

        if( d in this.select ) return;
        var mp = D3MSA.msaRMap[d];
        var pos = mp * D3MSA.aaStep - D3MSA.aaOffset;
        
        anchor.selectAll( ".msa-select" )
            .append( "rect" )
            .style( "fill", "orange" )
            .style( "fill-opacity", 0.25)
            .style( "stroke", "orange")
            .attr( "x", pos )
            .attr( "y", -2 )
            .attr( "width", D3MSA.aaStep )
            .attr( "height", 12*(D3MSA.msaSeq.length + 0.5) )
            .attr( "class", "msa-select");

        this.select.push(d);        
    },

    dropSelect: function( anchor, d ){
        if( ! (d  in this.select) )  return;
        
        anchor.selectAll( ".msa-select" )
            .select( "rect[pos='"+d+"']")
            .remove();        
    },
    
    slogoView: function(){
        
    },
    
    getUniqueID: function(left, right) {
        left = left || 1e5;
        right = right || 1e6 - 1;
        return Math.floor(Math.random() * (right - left) + left);
    }
}
