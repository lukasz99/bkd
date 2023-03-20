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

    msaPos: [],
    msaVon: [],
    rectPos:[],    
    rngOn: false,
    aasOn: false,
    
    config: {
        navig: true,
        tlist: [ 'slogo', 'msa'],
        brushLimit: 12,
        aaMaxStep: 20,
        aaMinStep:  5,
        taxid: [ [9606, 'Human'],
                 [9598, 'Chimpanzee'],
                 [9595, 'Gorilla'],
                 [9601, 'Orangutan'],
                 [9544, 'Rhesus'],
                 [10090, 'Mouse'],
                 [10116, 'Rat'],
                 [10141, 'Guinea pig'],
                 [9986, 'Rabbit'],
                 [8364, 'Xenopus'],
                 [7955, 'Zebrafish'] ],
        taxname: {'9606': 'Human',
                  '9598': 'Chimpanzee',
                  '9595': 'Gorilla',
                  '9601': 'Orangutan',
                  '9544': 'Rhesus',
                  '10090': 'Mouse',
                  '10116': 'Rat',
                  '10141': 'Guinea pig',
                  '9986': 'Rabbit',
                  '8364': 'Xenopus',
                  '7955': 'Zebrafish' },
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
                        hcols = lines[i].replace(">","").split(";")
                        D3MSA.msaHead.push( hcols );
                        D3MSA.msaSeq.push("");
                    } else {
                        D3MSA.msaSeq[D3MSA.msaSeq.length-1]+= lines[i];
                    }
                }
 
                D3MSA._brl = D3MSA.config.brushLimit;    // shortest brush range
                
               // brush range corresponding to longest aa step (aaMaxStep)
                
                var brlimit = D3MSA._msaW/D3MSA.config.aaMaxStep/D3MSA.msaSeq[0].length*D3MSA._msaW; 
                
                if( brlimit >D3MSA.config.brushLimit){   // no slope modification needed                  
                    D3MSA._brl = Math.floor( brlimit );
                    
                } 
                                
                //render                
                setTimeout( D3MSA.render(), 1000 );
            } );
        
        this._initViz();
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
    render: function(){

        // map sequences

        D3MSA.msaMap = [];
        D3MSA.seqRng = [];
        D3MSA.msaRMap = {};
        
        for( var i=0; i <  D3MSA.msaSeq.length; i++ ){
            D3MSA.msaMap.push([]);
            D3MSA.seqRng.push({"min":-1,"max":-1});
            var cp = 0;
            for( var j=0; j < D3MSA.msaSeq[i].length; j ++ ){
                if( "ACDEFGHIKLMNPQRSTVWY".includes( D3MSA.msaSeq[i][j] ) ){
                    cp +=1;
                    if( i==0 ){
                        D3MSA.msaRMap[cp] = j;
                    }
                    if(D3MSA.seqRng[D3MSA.seqRng.length-1]["min"]<0){
                        D3MSA.seqRng[D3MSA.seqRng.length-1]["min"]=j;
                    }
                    D3MSA.seqRng[D3MSA.seqRng.length-1]["max"]=j;
                }
                
                if( cp >0 ){
                    D3MSA.msaMap[i].push( cp );
                } else {
                    D3MSA.msaMap[i].push( "" );
                }
            }
        }

        // brushLimit         
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
                this.renderMSA();
            }
        }                
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

        //D3MSA.renderMSA();        
        
        D3MSA.viewport = d3.brushX()
            .handleSize(6)
            .extent([ [0, 0], [D3MSA._msaW, 10] ])
            .on( "brush", (event) => {
                brushLeft = event.selection[0];
                brushRight = event.selection[1];
                                
                if( event.selection[1] - event.selection[0] <  D3MSA._brl ){                    

                    brushCenter = 0.5 * (event.selection[1] + event.selection[0]);
                    brushLeft = brushCenter - D3MSA._brl/2;
                    brushRight = brushCenter + D3MSA._brl/2;

                    if( brushLeft < 1 ){
                        brushLeft  = 0;
                        brushRight = D3MSA._brl;  // /D3MSA._brRatio;
                    }

                    if( brushRight >  D3MSA._msaW ){ 
                        brushLeft = D3MSA._msaW - D3MSA._brl - 1; // /D3MSA._brRatio - 1;
                        brushRight = D3MSA._msaW ;
                    }
                    
                    D3MSA.navBrushG 
                        .call( D3MSA.viewport.move, [brushLeft, brushRight]);                    
                    
                } else {
                    if( brushLeft < 1 ){
                        brushLeft  = 0;
                    }
                    if( brushRight >  D3MSA._msaW ){
                        brushRight = D3MSA._msaW ;
                    }
                    
                    //D3MSA.navBrushG 
                    //    .call( D3MSA.viewport.move, [brushLeft, brushRight]);                    

                }

                D3MSA.brushLeft = brushLeft;
                D3MSA.brushRight = brushRight;
                
                //D3MSA.aastep = 1/((brushRight - brushLeft)/D3MSA._msaW); //*D3MSA.msaRange[1];
                
                if( event.selection ){
                    
                    D3MSA.displaystart = brushLeft/D3MSA._msaW*100;
                    D3MSA.displayend = brushRight/D3MSA._msaW*100;

                    console.log("update...");
                    D3MSA.updatePolygon();
                    D3MSA.updateMSA();              
                    D3MSA.updateSelect();
                }
            });

        
        D3MSA.displaystart =  D3MSA.navScale.invert( 0 );
        D3MSA.displayend =    D3MSA.navScale.invert( D3MSA._msaW );
        D3MSA.msaVon = [];
        
        for( var i = 0; i < D3MSA.rectPos.length; i++ ){
            D3MSA.msaVonpush(false);
        }
        
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

    getViewportParams(){
        var windowWidth = ( D3MSA.displayend - D3MSA.displaystart) / 100 * (D3MSA.msaRange[1]);
        var windowCenter = 0.005 * ( D3MSA.displayend + D3MSA.displaystart ) * (D3MSA.msaRange[1]) ;        
        
        D3MSA.aaStep   =  ( D3MSA._msaW ) / windowWidth;  // [pixel/aa]
        D3MSA.aaOffset =  (windowCenter) * D3MSA.aaStep - D3MSA._msaW/2;

        D3MSA.msaOpa = 0.5;
        if( D3MSA.aaStep <= 16 ){
            D3MSA.msaOpa = 0.5 + 0.5* (16-D3MSA.aaStep)/16;
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
    
    renderMSA: function(){
        D3MSA.getViewportParams();
        
        D3MSA.msaMin = [];  // one per sequence
        D3MSA.msaMax = [];
        
        D3MSA.msaPos = [];  // common to all seqs
        D3MSA.rectPos = [];

        for( var i = 0; i < D3MSA.msaSeq.length; i++){
            D3MSA.msaMin.push(1);
            D3MSA.msaMax.push(D3MSA.msaMap[i][D3MSA.msaSeq[i].length-1]);
        }
        
        D3MSA.offsetY = 10;
        if( D3MSA.config.navig ) D3MSA.offsetY += 30;
        if( D3MSA.config.slogo ) D3MSA.offsetY += 50;
        
        var _seqMSA = D3MSA.svg.append("g").attr( "id", "seqMSA" )
            .attr("transform", "translate(0, " + ( D3MSA.offsetY) + ")");        
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

        D3MSA.renderHeadMSA();
        //D3MSA.getViewportParams();
        
        if( D3MSA.aaStep > D3MSA.config.aaMinStep ){
            D3MSA.updateAA();   // XXXXXXXXXXXXX
        }
        
        if( D3MSA.aaStep < D3MSA.config.aaMinStep*5 ){            
            D3MSA.renderRange();
            D3MSA.rngOn = true;
        }
        
        D3MSA.setSelect();        
    },

    updateMSA() {        
        D3MSA.getViewportParams();
        D3MSA.updateHeadMSA();

        if( D3MSA.aaStep > D3MSA.config.aaMinStep ){
            if( D3MSA.aasOn ){
               D3MSA.updateAA();
                D3MSA.aasOn = true
            } else {
                D3MSA.updateAA();
                D3MSA.aasOn = true;
            }
        } else {
            D3MSA.removeAA();
            D3MSA.aasOn = false;
        }
        
        if( D3MSA.aaStep < D3MSA.config.aaMinStep*5 ){
            if( D3MSA.rngOn ){
                D3MSA.updateRange();
            } else {
                D3MSA.renderRange();
                D3MSA.rngOn = true;
            }
        } else {
            d3.selectAll( ".msa-range" ).remove();
            D3MSA.rngOn = false;
        }
    },
    
    renderRange() {        
        d3.selectAll( ".msa-range" ).remove();
        
        var opq = Math.min( 1, 1 - D3MSA.aaStep**1.5/ (D3MSA.config.aaMaxStep - D3MSA.aaStep*0.99)**2);

        for( var i = 0; i <D3MSA.msaHead.length; i++ ){
            
            var pos =  D3MSA.seqRng[i]["min"] * D3MSA.aaStep - D3MSA.aaOffset;
            d3.select( "#seqSeq" + i.toString() +"rn")
                .append( "rect" )
                .attr( "class", "msa-range")
                .style( "fill", "#D3D3D3" )
                .attr( "x", pos )
                .attr( "y", -10 )
                .attr( "width",  (D3MSA.seqRng[i]["max"] + D3MSA.aaStep - D3MSA.seqRng[i]["min"])*D3MSA.aaStep)
                .attr( "height", 10 )
                .attr( "fill-opacity", opq );            
        }     
    },

    updateRange() {

               
        var opq = Math.min( 1, 1- D3MSA.aaStep**1.5/ (D3MSA.config.aaMaxStep - D3MSA.aaStep*0.99)**2);
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){

            var pos = D3MSA.seqRng[i]["min"] * D3MSA.aaStep - D3MSA.aaOffset;
            
            d3.select( "#seqSeq" + i.toString() + "rn  .msa-range")
                .attr( "x", pos )
                .attr( "y", -10 )
                .attr( "width",  (D3MSA.seqRng[i]["max"] + D3MSA.aaStep - D3MSA.seqRng[i]["min"])*D3MSA.aaStep)
                .attr( "fill-opacity", opq);            
        }     
    },

    updateHeadMSA: function(){

        D3MSA.msaPosOld = D3MSA.msaPos;
        D3MSA.rectPosOld = D3MSA.rectPos;
        D3MSA.aaStepOld = D3MSA.aaStep;
        
        D3MSA.msaMin = [];     // one per sequence
        D3MSA.msaMax = [];  
        D3MSA.msaPos = [];     // one per aa
        D3MSA.rectPos = [];
        
        for( var j = 0; j < D3MSA.msaSeq[0].length; j++ ){   // j - sequence position
            var pos = 0.5 * D3MSA.aaStep + j * D3MSA.aaStep - D3MSA.aaOffset;
            
            try{
                if( pos > 0 && pos < D3MSA.aaStep){   // first AA visible
                    for( var i=0; i <D3MSA.msaHead.length; i++ ){                
                        D3MSA.msaMin.push(D3MSA.msaMap[i][j]);
                    }
                }
            
                if( pos > D3MSA._msaW-D3MSA.aaStep && pos < D3MSA._msaW ){   // last AA visible
                    for( var i=0; i <D3MSA.msaHead.length; i++ ){
                        D3MSA.msaMax.push( D3MSA.msaMap[i][j] );
                        if( j >= D3MSA.msaMap[i].length ){
                            D3MSA.msaMax[ i ] = D3MSA.msaMap[i][ D3MSA.msaMap[i].length-1 ];
                        } else {
                            D3MSA.msaMax[ i ] = D3MSA.msaMap[i][j];
                        }
                    }
                }
            } catch(e){
                console.log(e);
            }
            
            D3MSA.msaPos[j] = pos;
            D3MSA.rectPos[j] = pos - 0.5 * D3MSA.aaStep;
        }
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){                     
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

    renderHeadMSA: function(){
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){         
            _seqG = d3.select("g[id='seqMSA_head']").append("g").attr( "id", "seq"+i.toString() )
                .attr("transform", "translate(0, " + (i+1)*12 + ")");
 
            _seqHG = _seqG.append("g").attr( "id", "seqHead"+i.toString() );

            _seqHG.append("text")
                .style( "font", "normal 12px Arial") 
                .text( D3MSA.config.taxname[D3MSA.msaHead[i][2]] );
            _seqSG = d3.select("g[id='seqMSA_view']").append("g")
                .attr( "id", "seqSeq" + i.toString() )
                .attr( "transform", "translate( 0, "+ (i+1)*12 + ")" );

            d3.select("#seqSeq"+ i.toString() )
                .append("g")
                .attr( "id", "seqSeq" + i.toString() + "bk");
            d3.select("#seqSeq"+ i.toString() )
                .append("g")
                .attr( "id", "seqSeq" + i.toString() + "aa");
            d3.select("#seqSeq"+ i.toString() )
                .append("g")
                .attr( "id", "seqSeq" + i.toString() + "rn");

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
        }        
    },
    
    removeAA: function(){
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){
            d3.select("#seqSeq" + i.toString() + "bk").selectAll(".msa-rect")
                .remove();
            d3.select("#seqSeq" + i.toString() + "aa").selectAll(".msa-aa")
                .remove();
        }

        D3MSA.msaVon = [];   // XXXXXXX
        for( var i = 0; i < D3MSA.rectPos.length; i++ ){
            D3MSA.msaVon.push(false);
        }
    },
    
    renderAA2: function(){
        if( D3MSA.aasOn) return;
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){         
            
            d3.select( "#seqSeq" + i.toString() +"bk").selectAll( ".msa-rect" )
                .data( D3MSA.msaSeq[i].split('') )
                .enter()            
                .append( "rect" )                
                .attr( "i", function (d,j) { return j; } )
                .attr( "x", function (d,j) {
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
                });            
            
            d3.select( "#seqSeq" + i.toString() +"aa").selectAll( "text" )
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
        }        
        D3MSA.aasOn = true;        
    },

    renderAA() {
        //alert("renderaa: start");
        D3MSA.msaVon = [];
        
        for( var i = 0; i < D3MSA.rectPos.length; i++ ){
            D3MSA.msaVon.push( D3MSA.rectPos[i] < -D3MSA.aaStep  || D3MSA.rectPos[i] > D3MSA._msaW  ? false : true);
        }
        
        for( var i = 0; i < D3MSA.msaPos.length; i++ ){
            if( D3MSA.msaVon[i] ){  // add AAs
                for( var j = 0; j < D3MSA.msaHead.length; j++ ){
                    
                    console.log(j,i,aa,D3MSA.msaPosOld[i], D3MSA.rectPosOld[i]);
                        
                    // box
                    
                    var aa =  D3MSA.msaSeq[j][i];
                    
                    d3.select( "#seqSeq" + j.toString() +"bk")
                        .append( "rect" )                
                        .attr( "i", i )
                        .attr( "x", D3MSA.rectPosOld[i] )
                        .attr( "y", -10 )
                        .attr( "width", D3MSA.aaStepOld )
                        .attr( "height", 10 )
                        .attr( "class", "msa-rect")
                        .style( "fill", D3MSA._palette1[ aa ] )
                        .attr( "fill-opacity", D3MSA.aaStep > 16 ? 0.5 : 1 );                        
                    
                    // letter 
                    
                    d3.select( "#seqSeq" + j.toString() +"aa")
                        .append( "text" )
                        .attr( "class", "msa-aa" )
                        .style( "font", "bold 12px Arial")  
                        .style( "fill", D3MSA._palette1[ aa ] )
                        .attr( "text-anchor", "middle") 
                        .attr( "x", D3MSA.msaPosOld[i] )
                        .attr( "y", 0 )
                        .attr( "i", i )
                        .attr( "fill-opacity", D3MSA.aaStep > 16 ? 1 : 0 )
                        .text( aa );
                }                        
            } 
        }
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA.msaSeq[i].length; j++){
                d3.select( "#seqSeq" + i.toString() +"bk rect[i='"+j+"']")
                    .attr( "fill-opacity", D3MSA.msaOpa)
                    .attr( "x", D3MSA.rectPos[j] )
                    .attr( "width", D3MSA.aaStep )
                    .attr( "visiblity", (D3MSA.rectPos[j] <0 || D3MSA.rectPos[j] > D3MSA._msaW)  ? "hidden" : "visible" );                 
            }

        }
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA.msaSeq[i].length; j++){            
                d3.select( "#seqSeq" + i.toString() +"aa text[i='"+j+"']")
                    .attr( "x", D3MSA.msaPos[j])
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
                    })
                    .attr( "visiblity", ( D3MSA.msaPos[j] < 0 || D3MSA.rectPos[j] > D3MSA._msaW ) ? "hidden" : "visible");                                     
            }
        }
        //alert("updateA: done");
    },
    
    updateAA() {
        //alert("updateaa: start");
        var msaVonCurrent = [];
        
        for( var i = 0; i < D3MSA.rectPos.length; i++ ){
            msaVonCurrent.push( D3MSA.rectPos[i] < -D3MSA.aaStep  || D3MSA.rectPos[i] > D3MSA._msaW  ? false : true);
        }

        // drop/add AAs....

        for( var i = 0; i < D3MSA.msaPos.length; i++ ){
            if( D3MSA.msaVon[i] != msaVonCurrent[i] ){
                console.log("delta: ",i,"old=",D3MSA.msaVon[i] , " new=",msaVonCurrent[i]);
                if( msaVonCurrent[i] ){  // add AAs
                    for( var j = 0; j < D3MSA.msaHead.length; j++ ){
                        
                        console.log(j,i,aa,D3MSA.msaPosOld[i], D3MSA.rectPosOld[i]);
                        
                        // box
                        
                        var aa =  D3MSA.msaSeq[j][i];
                        
                        d3.select( "#seqSeq" + j.toString() +"bk")
                            .append( "rect" )                
                            .attr( "i", i )
                            .attr( "x", D3MSA.rectPosOld[i] )
                            .attr( "y", -10 )
                            .attr( "width", D3MSA.aaStepOld )
                            .attr( "height", 10 )
                            .attr( "class", "msa-rect")
                            .style( "fill", D3MSA._palette1[ aa ] )
                            .attr( "fill-opacity", D3MSA.aaStep > 16 ? 0.5 : 1 );                        
                        
                        // letter 
                        
                        d3.select( "#seqSeq" + j.toString() +"aa")
                            .append( "text" )
                            .attr( "class", "msa-aa" )
                            .style( "font", "bold 12px Arial")  
                            .style( "fill", D3MSA._palette1[ aa ] )
                            .attr( "text-anchor", "middle") 
                            .attr( "x", D3MSA.msaPosOld[i] )
                            .attr( "y", 0 )
                            .attr( "i", i )
                            .attr( "fill-opacity", D3MSA.aaStep > 16 ? 1 : 0 )
                            .text( aa );
                    }                        
                } else {  // drop AAs                    
                    d3.selectAll( "#seqMSA_view text[i='"+i+"']").remove();
                    d3.selectAll( "#seqMSA_view rect[i='"+i+"']").remove();                    
                }   
            }
        }
        
        D3MSA.msaVon = msaVonCurrent;

        for( var i = 0; i <D3MSA.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA.msaSeq[i].length; j++){
                d3.select( "#seqSeq" + i.toString() +"bk rect[i='"+j+"']")
                    .attr( "fill-opacity", D3MSA.msaOpa)
                    .attr( "x", D3MSA.rectPos[j] )
                    .attr( "width", D3MSA.aaStep )
                    .attr( "visiblity", (D3MSA.rectPos[j] <0 || D3MSA.rectPos[j] > D3MSA._msaW)  ? "hidden" : "visible" );                 
            }

        }
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA.msaSeq[i].length; j++){            
                d3.select( "#seqSeq" + i.toString() +"aa text[i='"+j+"']")
                    .attr( "x", D3MSA.msaPos[j])
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
                    })
                    .attr( "visiblity", ( D3MSA.msaPos[j] < 0 || D3MSA.rectPos[j] > D3MSA._msaW ) ? "hidden" : "visible");                                     
            }
        }
        //alert("updateA: done");
    },

    
    setSelect: function(){

        d3.select("#seqMSA_select").remove();
        d3.select("#seqMSA_view")
            .append( "g" )
            .attr("id","seqMSA_select");
        
        for(var s in this.select ){
            
            d3.select("#seqMSA_select").selectAll( ".msa-select" )
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
