console.log("bkd-d3msa: common");
 
D3MSA = {

    anchor: null,
    target: null,
    msaurl: null,
    select: {},
    
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
        brushLimit: 15,
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
                 [9651, 'Dog'],
                 [9031, 'Chicken'],
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
                  '9615': 'Dog',
                  '9031': 'Chicken',
                  '8364': 'Xenopus',
                  '7955': 'Zebrafish',
                  '9557':'Baboon',
                  '10029':'Hamster',
                  '9986':'Rabbit',
                  '9823':'Pig',
                  '9913':'Cow',
                  '9685':'Cat',
                  '9796':'Horse',
                  '9940':'Sheep',
                  '13616':'Opossum',
                  '9258':'Platypus'
                 },
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

        _left = D3MSA.navButton(D3MSA.svg, "msaleft", 5, 13, "<")
            .on( "click", (event) => {                
                D3MSA.setNavBrush( 2*D3MSA.brushLeft-D3MSA.brushRight, D3MSA.brushLeft);                
                D3MSA.navBrushG.call( D3MSA.viewport.move,
                                      [D3MSA.brushLeft, D3MSA.brushRight]);
            });

        _plus = D3MSA.navButton(D3MSA.svg, "msaplus", 27, 13, "+")
            .on( "click", (event) => {
                var center = (D3MSA.brushLeft + D3MSA.brushRight)/2;
                var delta = 0.75 * (D3MSA.brushRight - D3MSA.brushLeft)/2;
                D3MSA.setNavBrush( center-delta, center+delta);                
                D3MSA.navBrushG.call( D3MSA.viewport.move,
                                      [D3MSA.brushLeft, D3MSA.brushRight]);
            });

        _minus = D3MSA.navButton(D3MSA.svg, "msaminus", 50, 13, "-", -1 )
            .on( "click", (event) => {
                var center = (D3MSA.brushLeft + D3MSA.brushRight)/2;
                var delta = 1.5 * (D3MSA.brushRight - D3MSA.brushLeft)/2;
                D3MSA.setNavBrush( center-delta, center+delta);                
                D3MSA.navBrushG.call( D3MSA.viewport.move,
                                      [D3MSA.brushLeft, D3MSA.brushRight]);
            });
        
        _right = D3MSA.navButton(D3MSA.svg, "msaright", 73, 13, ">")
            .on( "click", (event) => {
                D3MSA.setNavBrush( D3MSA.brushRight, 2*D3MSA.brushRight-D3MSA.brushLeft);                
                D3MSA.navBrushG.call( D3MSA.viewport.move,
                                      [D3MSA.brushLeft, D3MSA.brushRight]);
            });        


        _full =  D3MSA.navButton(D3MSA.svg, "msafull", 560, 13, "Full")
            .on( "click", (event) => {
                D3MSA.setNavBrush( 0, D3MSA._msaW);                
                D3MSA.navBrushG.call( D3MSA.viewport.move,
                                      [D3MSA.brushLeft, D3MSA.brushRight])
            });
        
        _full.select("rect").attr("width",32);
        _full.select("text").style("font-size","14px")
            .attr("x",15).attr("y",15);        
               
        _navG = D3MSA.svg.append("g").attr( "id", "msanav" )
            .attr("transform", "translate(100, 10)");

        _msaAxis = d3.axisBottom( D3MSA.navScale );
        _msaAxis.ticks( 10 ).tickFormat('');
                
        D3MSA.navAxis = _navG.append('g')
            .attr('class', 'x axis')
            .call(_msaAxis);

        
        D3MSA.brushLeft = 0;
        D3MSA.displaystart = D3MSA.navScale.invert( 0 );
        
        D3MSA.brushRight = D3MSA._brl;       
        D3MSA.displayend = D3MSA.navScale.invert( D3MSA._brl );
        
        D3MSA.viewport = d3.brushX()
            .handleSize(6)
            .extent([ [0, 0], [D3MSA._msaW, 10] ])            
            .on( "brush", (event) => {
                
                D3MSA.setNavBrush( event.selection[0], event.selection[1]);

                D3MSA.displaystart = D3MSA.brushLeft/D3MSA._msaW*100;
                D3MSA.displayend = D3MSA.brushRight/D3MSA._msaW*100;
                                                
                D3MSA.updatePolygon();
                D3MSA.updateMSA();              
                D3MSA.updateSelect();                
            });
                
        D3MSA.navBrushG = _navG.append("g")
            .attr("class", "brush")
            .call(D3MSA.viewport);
        
        D3MSA.navBrushG .call( D3MSA.viewport.move, [ 0, D3MSA._brl ] );
        
        D3MSA.polygon = _navG.append("polygon")
            .attr('class', 'zoom-polygon')
            .attr('fill', '#777')
            .attr('fill-opacity','0.3');
        
        D3MSA.updateNavRuler();   
    },
    
    setNavView: function( center, width ){
        
        D3MSA.setNavBrush( center-width/2, center+width/2 );                
        D3MSA.navBrushG.call( D3MSA.viewport.move,
                              [D3MSA.brushLeft, D3MSA.brushRight] );
    },

    updateNavRuler: function(){
        D3MSA.updatePolygon();        
    },

    navButton: function( parent, id, x, y, char, choffset ){
        
        if( choffset == undefined) choffset = 0;          
        
        var _button = parent.append("g").attr( "id", id )
            .attr( "transform", "translate(" + (x) +"," + (y) + ")" );
        _button.append("rect")
            .attr("width",20)
            .attr("height",20)
            .style( "stroke", "black")
            .style( "stroke-width", "0.5px")
            .attr("fill","#ccc");
        _button.append("text")
            .style( "font-size", "16px")
            .style( "font-family", "Arial")
            .attr( "text-anchor", "middle")
            .attr("x", 10).attr("y", 16+choffset)
            .attr("fill","#000").text(char);
        return _button;
    },

    setNavBrush: function( left, right ){
        
        brushLeft = left;
        brushRight = right;
        
        if( right - left <  D3MSA._brl ){           
            brushCenter = 0.5 * (left + right);
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

            D3MSA.navBrushG.call( D3MSA.viewport.move,
                                  [brushLeft, brushRight] );
            
        } else {
            if( brushLeft < 1 ){
                brushLeft  = 0;                
            }
            if( brushRight >  D3MSA._msaW ){
                brushRight = D3MSA._msaW ;                
            }
        } 

        D3MSA.brushLeft = brushLeft;
        D3MSA.brushRight = brushRight;        
    },
    
    getViewportParams(){
        var windowWidth = ( D3MSA.displayend - D3MSA.displaystart) / 100 * (D3MSA.msaRange[1]);   // [AA]
        var windowCenter = 0.005 * ( D3MSA.displayend + D3MSA.displaystart ) * (D3MSA.msaRange[1]) ;        
        
        D3MSA.aaStep   =  ( D3MSA._msaW ) / windowWidth;  // [pixel/aa]
        D3MSA.aaOffset =  (windowCenter) * D3MSA.aaStep - D3MSA._msaW/2;

        D3MSA.windowWidth = windowWidth;
        D3MSA.windowCenter = windowCenter;

        if( D3MSA.displayend - D3MSA.displaystart <50 ){        
            D3MSA.alpha = ( D3MSA.msaRange[1]/2 - D3MSA._msaW/D3MSA.config.aaMaxStep )/ 100 / (1 - D3MSA._brl/D3MSA._msaW - 0.5);
            D3MSA.beta = D3MSA.msaRange[1]/2 - 50 * D3MSA.alpha;

            D3MSA.ww = D3MSA.alpha * ( D3MSA.displayend - D3MSA.displaystart) + D3MSA.beta;

            D3MSA.aaStep =  D3MSA._msaW /D3MSA.ww ;
            D3MSA.aaOffset =  (windowCenter) * D3MSA.aaStep - D3MSA._msaW/2;
        }

        D3MSA.msaOpa = 0.5;
        if( D3MSA.aaStep <= 16 ){
            D3MSA.msaOpa = 0.5 + 0.5* (16-D3MSA.aaStep)/16;
        }

        if( D3MSA.displaystart < 100 - D3MSA.displayend ) {
            D3MSA.aaOffset = + D3MSA.aaStep * D3MSA.displaystart/100 *D3MSA.msaRange[1];
        } else {
            D3MSA.aaOffset = - D3MSA._msaW + D3MSA.aaStep * D3MSA.displayend/100 *D3MSA.msaRange[1];            
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

        D3MSA.msaVon = [];        
        D3MSA.msaMin = [];  // one per sequence
        D3MSA.msaMax = [];
        
        D3MSA.msaPos = [];  // common to all seqs
        D3MSA.rectPos = [];

        for( var i = 0; i < D3MSA.rectPos.length; i++ ){
            D3MSA.msaVon.push(false);
        }
        
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
            .attr("height", 14*(D3MSA.msaHead.length+1));
        
        var _seqMSA_head = _seqMSA.append("g").attr( "id", "seqMSA_head" );
        
        var _seqMSA_port = _seqMSA.append("g").attr( "id", "seqMSA_port" )
            .attr("clip-path", "url(#seqMSA_clip)")
            .attr("transform", "translate(100, 0)");
        
        var _seqMSA_view = _seqMSA_port.append("g").attr( "id", "seqMSA_view" );

        D3MSA.renderHeadMSA();
        
        if( D3MSA.aaStep >= D3MSA.config.aaMinStep ){
            //D3MSA.updateAA();
            D3MSA.renderAA();
        }
        
        if( D3MSA.aaStep < D3MSA.config.aaMinStep*5 ){            
            D3MSA.renderRange();
            D3MSA.rngOn = true;
        }
        
        D3MSA.setSelectList( [] );  // set to empty selection        
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
                .attr( "height", 10 );

            if( opq > 0 ){
                d3.select( "#seqSeq" + i.toString() +"rn")
                    .attr( "fill-opacity", opq )
                    .style("visibility", "visible");
            } else {
                d3.select( "#seqSeq" + i.toString() + "rn  .msa-range")
                    .attr( "fill-opacity", 0)
                    .style("visibility", "hidden");
            }                   
        }     
    },

    updateRange() {

        var opq = Math.min( 1, 1- D3MSA.aaStep**1.5/ (D3MSA.config.aaMaxStep - D3MSA.aaStep*0.99)**2);
        
        for( var i = 0; i <D3MSA.msaHead.length; i++ ){

            var pos = D3MSA.seqRng[i]["min"] * D3MSA.aaStep - D3MSA.aaOffset;

            d3.select( "#seqSeq" + i.toString() + "rn  .msa-range")
                .attr( "x", pos )
                .attr( "y", -10 )
                .attr( "width",  (D3MSA.seqRng[i]["max"] + D3MSA.aaStep - D3MSA.seqRng[i]["min"])*D3MSA.aaStep);
            
            if( opq > 0 ){
                d3.select( "#seqSeq" + i.toString() + "rn  .msa-range")
                    .attr( "fill-opacity", opq)
                    .style("visibility", "visible");                
            } else {
                d3.select( "#seqSeq" + i.toString() + "rn  .msa-range")
                    .attr( "fill-opacity", 0)
                    .style("visibility", "hidden");
            }                
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
            _seqG = d3.select("g[id='seqMSA_head']").append("g").attr( "id", "seq"+i.toString() )
                .attr("transform", "translate(0, " + (i+1)*14 + ")");
 
            _seqHG = _seqG.append("g").attr( "id", "seqHead"+i.toString() );
            _seqHGA = _seqHG.append("a")
                .attr('href','https://www.uniprot.org/uniprotkb/' + D3MSA.msaHead[i][0])
                .attr('target','_cvdb_target');
            _seqHGAT= _seqHGA.append("text")                
                .style( "font", "normal 12px Arial")               
                //.style( "fill", "blue")
                //.attr("text-decoration","underline")
                .text( D3MSA.config.taxname[D3MSA.msaHead[i][2]] );
            _seqHGAT.append("title").text("UniprotKB: " + D3MSA.msaHead[i][0] + " (" + D3MSA.msaHead[i][1] +")");
            
            if( i > 0 ){
                _seqHGAT.style( "fill", "blue")
                    .attr("text-decoration","underline");
            } else {
                _seqHGAT.style( "font", "bold 12px Arial")
            }
            
            _seqSG = d3.select("g[id='seqMSA_view']").append("g")
                .attr( "id", "seqSeq" + i.toString() )
                .attr( "transform", "translate( 0, "+ (i+1)*14 + ")" );

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
    
    renderAA() {
               
        D3MSA.msaVon = [];
        
        for( var i = 0; i < D3MSA.rectPos.length; i++ ){
            D3MSA.msaVon.push( D3MSA.rectPos[i] < -D3MSA.aaStep  || D3MSA.rectPos[i] > D3MSA._msaW  ? false : true);
        }
        
        for( var i = 0; i < D3MSA.msaPos.length; i++ ){
            if( D3MSA.msaVon[i] ){  // add AAs
                for( var j = 0; j < D3MSA.msaHead.length; j++ ){
                                            
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
                        .attr( "fill-opacity", D3MSA.aaStep > 16 ? 0.5 : 1 )                        
                        .append("title").text(aa + (D3MSA.msaMap[j][i]));
                    
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
                        .text( aa )
                        .append("title").text(aa + (D3MSA.msaMap[j][i]));

                    ;
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
                
                if( msaVonCurrent[i] ){  // add AAs
                    for( var j = 0; j < D3MSA.msaHead.length; j++ ){
                        
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
                            .attr( "fill-opacity", D3MSA.aaStep > 16 ? 0.5 : 1 )
                            .append("title").text(aa + (D3MSA.msaMap[j][i]));
                        
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
                            .text( aa )
                            .append("title").text(aa + (D3MSA.msaMap[j][i]));
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

    dropAllSelect: function(){
        d3.select("#seqMSA_select").remove();
        d3.select("#seqMSA_view")
            .append( "g" )
            .attr("id","seqMSA_select");
        D3MSA.select = {};
    },

    setSelectList: function( slist ){
        
        for( pc in D3MSA.select ){ // go over existing elements
            if( pc in slist ){ // no selection change, remove from slist
                for(i=0; i < slist.length; i++){
                    if(slist[i] == pc){
                        slist.splice[i,1];
                        break;
                    }
                }                
            } else { // drop selection
                D3MSA.select[pc].remove(); // drop rectangle
                delete D3MSA.select[pc];  // drop from map   
            }
        }
        
        for( i = 0 ; i < slist.length; i++){
            pcl = slist[i].split(":");
            D3MSA.select[ slist[i] ] =  D3MSA.addSelect( Number(pcl[0]), pcl[1] );            
        }
        
    },
    
    updateSelect:  function(){

        for( k in D3MSA.select ){
            kl = k.split(":");
            
            var mp = D3MSA.msaRMap[ Number( kl[0] ) ];
            var pos = mp * D3MSA.aaStep - D3MSA.aaOffset;
            
            D3MSA.select[k]
                .attr( "x", pos)
                .attr( "width", D3MSA.aaStep );                        
        }
    },
    
    addSelect: function( pos, color ){

        var mp = D3MSA.msaRMap[pos];
        var x = mp * D3MSA.aaStep - D3MSA.aaOffset;
                
        var rect =  d3.select( "#seqMSA_select" )
            .append( "rect" )
            .style( "fill", color )
            .style( "fill-opacity", 0.25)
            .style( "stroke", color )
            .attr( "x", x )
            .attr( "y", -2 )
            .attr( "width", D3MSA.aaStep )
            .attr( "height", 14*(D3MSA.msaSeq.length + 0.5) )
            .attr( "class", "msa-select");

        return rect;
    },
    
    slogoView: function(){
        
    },
    
    getUniqueID: function(left, right) {
        left = left || 1e5;
        right = right || 1e6 - 1;
        return Math.floor(Math.random() * (right - left) + left);
    }
}
