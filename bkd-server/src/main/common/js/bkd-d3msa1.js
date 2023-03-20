console.log("bkd-d3msa: common");

D3MSA1 = {

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
                 "-":"white", "~": "white",  ".":"white" },                    
    
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
        taxname: {'9606': 'Human' }
    },    

    options: {
        className: "d3msaClass",
        viewID: "d3msaID",
        background: "white"
    },
    
    initialize: function( anchor, url, config ){
        this.anchor = anchor;
        this.msaurl = url;

        console.log("D3MSA: config",config);

        if(config !== undefined ){
            for( ckey of  Object.keys(config) ){
                console.log(ckey);
                this.config[ckey] = config[ckey];            
            };
        }
        

        // load remote msa fasta       
        
        $.ajax( { url: this.msaurl,
                  beforeSend: function( xhr ) {
                      xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
                  }
                } )
            .done( function( data, textStatus, jqXHR ){
                // parse msa fasta                
                var lines = data.split('\n');
                
                D3MSA1.msaHead = [];
                D3MSA1.msaSeq = [];
                for( var i=0; i < lines.length; i++ ){
                    if( lines[i].startsWith('>') ){
                        hcols = lines[i].replace(">","").split(";")
                        D3MSA1.msaHead.push( hcols );
                        D3MSA1.msaSeq.push("");
                    } else {
                        D3MSA1.msaSeq[D3MSA1.msaSeq.length-1]+= lines[i];
                    }
                }
                D3MSA1._brl = D3MSA1.config.brushLimit;    // shortest brush range
                
               // brush range corresponding to longest aa step (aaMaxStep)
                
                var brlimit = D3MSA1._msaW/D3MSA1.config.aaMaxStep;
                brlimit = brlimit/D3MSA1.msaSeq[0].length*D3MSA1._msaW; 
                
                if( brlimit >D3MSA1.config.brushLimit){  // no slope modification                  
                    D3MSA1._brl = Math.floor( brlimit );
                    
                } 
                                
                //render                
                setTimeout( D3MSA1.render(), 1000 );
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
            .style("background-color", this.options.background||"transparent");
        
        this.target = target;
        this.svg = svg;
        
    },
    
    render: function(){

        // map sequences

        D3MSA1.msaMap = [];
        D3MSA1.seqRng = [];
        D3MSA1.msaRMap = {};
        
        for( var i=0; i <  D3MSA1.msaSeq.length; i++ ){
            D3MSA1.msaMap.push([]);
            D3MSA1.seqRng.push({"min":-1,"max":-1});
            var cp = 0;
            for( var j=0; j < D3MSA1.msaSeq[i].length; j ++ ){
                if( "ACDEFGHIKLMNPQRSTVWY".includes( D3MSA1.msaSeq[i][j] ) ){
                    cp +=1;
                    if( i==0 ){
                        D3MSA1.msaRMap[cp] = j;
                    }
                    if(D3MSA1.seqRng[D3MSA1.seqRng.length-1]["min"]<0){
                        D3MSA1.seqRng[D3MSA1.seqRng.length-1]["min"]=j;
                    }
                    D3MSA1.seqRng[D3MSA1.seqRng.length-1]["max"]=j;
                }
                
                if( cp >0 ){
                    D3MSA1.msaMap[i].push( cp );
                } else {
                    D3MSA1.msaMap[i].push( "" );
                }
            }
        }

        // brushLimit         
        // assumes msa already loaded

        D3MSA1.msaRange = [0, D3MSA1.msaSeq[0].length];

        D3MSA1.msaScale = d3.scaleLinear()  //  1 -> 1
            .domain(D3MSA1.msaRange)
            .range([0, D3MSA1.msaSeq[0].length-1]);
        
        D3MSA1.navScale = d3.scaleLinear()  //  100 ->  pixelWidth
            .domain([0, 100])
            .range([0, D3MSA1._msaW]);
        
        D3MSA1.nav2msaScale = d3.scaleLinear()  // 100 -> maxAA
            .domain([0, 100])
            .range(D3MSA1.msaRange);        
        
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
        
        D3MSA1.displaystart = 0;
        D3MSA1.displayend =  100;

        _left = D3MSA1.navButton(D3MSA1.svg, "msaleft", 5, 13, "<")
            .on( "click", (event) => {                
                D3MSA1.setNavBrush( 2*D3MSA1.brushLeft-D3MSA1.brushRight,
                                   D3MSA1.brushLeft);                
                D3MSA1.navBrushG.call( D3MSA1.viewport.move,
                                      [D3MSA1.brushLeft, D3MSA1.brushRight]);
            });

        _plus = D3MSA1.navButton(D3MSA1.svg, "msaplus", 27, 13, "+")
            .on( "click", (event) => {
                var center = (D3MSA1.brushLeft + D3MSA1.brushRight)/2;
                var delta = 0.75 * (D3MSA1.brushRight - D3MSA1.brushLeft)/2;
                D3MSA1.setNavBrush( center-delta, center+delta);                
                D3MSA1.navBrushG.call( D3MSA1.viewport.move,
                                      [D3MSA1.brushLeft, D3MSA1.brushRight]);
            });

        _minus = D3MSA1.navButton(D3MSA1.svg, "msaminus", 50, 13, "-", -1 )
            .on( "click", (event) => {
                var center = (D3MSA1.brushLeft + D3MSA1.brushRight)/2;
                var delta = 1.5 * (D3MSA1.brushRight - D3MSA1.brushLeft)/2;
                D3MSA1.setNavBrush( center-delta, center+delta);                
                D3MSA1.navBrushG.call( D3MSA1.viewport.move,
                                      [D3MSA1.brushLeft, D3MSA1.brushRight]);
            });
        
        _right = D3MSA1.navButton(D3MSA1.svg, "msaright", 73, 13, ">")
            .on( "click", (event) => {
                D3MSA1.setNavBrush( D3MSA1.brushRight,
                                   2*D3MSA1.brushRight-D3MSA1.brushLeft);                
                D3MSA1.navBrushG.call( D3MSA1.viewport.move,
                                      [D3MSA1.brushLeft, D3MSA1.brushRight]);
            });        


        _full =  D3MSA1.navButton(D3MSA1.svg, "msafull", 560, 13, "Full")
            .on( "click", (event) => {
                D3MSA1.setNavBrush( 0, D3MSA1._msaW);                
                D3MSA1.navBrushG.call( D3MSA1.viewport.move,
                                      [D3MSA1.brushLeft, D3MSA1.brushRight])
            });
        
        _full.select("rect").attr("width",32);
        _full.select("text").style("font-size","14px")
            .attr("x",15).attr("y",15);        
               
        _navG = D3MSA1.svg.append("g").attr( "id", "msanav" )
            .attr("transform", "translate(100, 10)");

        _msaAxis = d3.axisBottom( D3MSA1.navScale );
        _msaAxis.ticks( 10 ).tickFormat('');
                
        D3MSA1.navAxis = _navG.append('g')
            .attr('class', 'x axis')
            .call(_msaAxis);

        
        D3MSA1.brushLeft = 0;
        D3MSA1.displaystart = D3MSA1.navScale.invert( 0 );
        
        D3MSA1.brushRight = D3MSA1._brl;       
        D3MSA1.displayend = D3MSA1.navScale.invert( D3MSA1._brl );
        
        D3MSA1.viewport = d3.brushX()
            .handleSize(6)
            .extent([ [0, 0], [D3MSA1._msaW, 10] ])            
            .on( "brush", (event) => {
                
                D3MSA1.setNavBrush( event.selection[0], event.selection[1]);

                D3MSA1.displaystart = D3MSA1.brushLeft/D3MSA1._msaW*100;
                D3MSA1.displayend = D3MSA1.brushRight/D3MSA1._msaW*100;
                                                
                D3MSA1.updatePolygon();
                D3MSA1.updateMSA();              
                D3MSA1.updateSelect();                
            });
                
        D3MSA1.navBrushG = _navG.append("g")
            .attr("class", "brush")
            .call(D3MSA1.viewport);
        
        D3MSA1.navBrushG .call( D3MSA1.viewport.move, [ 0, D3MSA1._brl ] );
        
        D3MSA1.polygon = _navG.append("polygon")
            .attr('class', 'zoom-polygon')
            .attr('fill', '#777')
            .attr('fill-opacity','0.3');
        
        D3MSA1.updateNavRuler();   
    },
    
    setNavView: function( center, width ){
        try{
            D3MSA1.setNavBrush( center-width/2, center+width/2 );                
            D3MSA1.navBrushG.call( D3MSA1.viewport.move,
                                   [D3MSA1.brushLeft, D3MSA1.brushRight] );
        } catch(err){}
    },

    updateNavRuler: function(){
        D3MSA1.updatePolygon();        
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
        
        if( right - left <  D3MSA1._brl ){           
            brushCenter = 0.5 * (left + right);
            brushLeft = brushCenter - D3MSA1._brl/2;
            brushRight = brushCenter + D3MSA1._brl/2;
            
            if( brushLeft < 1 ){
                brushLeft  = 0;
                brushRight = D3MSA1._brl;  // /D3MSA1._brRatio;
            }

            if( brushRight >  D3MSA1._msaW ){ 
                brushLeft = D3MSA1._msaW - D3MSA1._brl - 1; // /D3MSA1._brRatio - 1;
                brushRight = D3MSA1._msaW ;                      
            }

            D3MSA1.navBrushG.call( D3MSA1.viewport.move,
                                  [brushLeft, brushRight] );
            
        } else {
            if( brushLeft < 1 ){
                brushLeft  = 0;                
            }
            if( brushRight >  D3MSA1._msaW ){
                brushRight = D3MSA1._msaW ;                
            }
        } 

        D3MSA1.brushLeft = brushLeft;
        D3MSA1.brushRight = brushRight;        
    },


    getViewportParams(){

        var windowWidth = ( D3MSA1.displayend - D3MSA1.displaystart)
            / 100 * (D3MSA1.msaRange[1]);   // [AA]
        
        var windowCenter = 0.005 * ( D3MSA1.displayend + D3MSA1.displaystart )
            * (D3MSA1.msaRange[1]) ;        
        
        D3MSA1.aaStep   =  ( D3MSA1._msaW ) / windowWidth;  // [pixel/aa]
        D3MSA1.aaOffset =  (windowCenter) * D3MSA1.aaStep - D3MSA1._msaW/2;

        D3MSA1.windowWidth = windowWidth;
        D3MSA1.windowCenter = windowCenter;

        if( D3MSA1.displayend - D3MSA1.displaystart <50 ){        
            D3MSA1.alpha=(D3MSA1.msaRange[1]/2-D3MSA1._msaW/D3MSA1.config.aaMaxStep)
                / 100 / (1 - D3MSA1._brl/D3MSA1._msaW - 0.5);
            
            D3MSA1.beta = D3MSA1.msaRange[1]/2 - 50 * D3MSA1.alpha;

            D3MSA1.ww = D3MSA1.alpha * ( D3MSA1.displayend - D3MSA1.displaystart)
                + D3MSA1.beta;

            D3MSA1.aaStep =  D3MSA1._msaW /D3MSA1.ww ;
            D3MSA1.aaOffset =  (windowCenter) * D3MSA1.aaStep - D3MSA1._msaW/2;
        }

        D3MSA1.msaOpa = 0.5;
        if( D3MSA1.aaStep <= 16 ){
            D3MSA1.msaOpa = 0.5 + 0.5* (16-D3MSA1.aaStep)/16;
        }

        if( D3MSA1.displaystart < 100 - D3MSA1.displayend ) {
            D3MSA1.aaOffset = + D3MSA1.aaStep * D3MSA1.displaystart/100
                *D3MSA1.msaRange[1];
        } else {
            D3MSA1.aaOffset = - D3MSA1._msaW + D3MSA1.aaStep * D3MSA1.displayend/100
                *D3MSA1.msaRange[1];            
        }
        
    },

    updatePolygon() {
        var max = D3MSA1._msaW;
        if (D3MSA1.polygon)
            D3MSA1.polygon.attr(
                "points",
                `${D3MSA1.navScale(D3MSA1.displaystart)},10
        ${D3MSA1.navScale(D3MSA1.displayend)},10
        ${D3MSA1._msaW},25
        0,25`
            );
    },
    
    renderMSA: function(){
        D3MSA1.getViewportParams();

        D3MSA1.msaVon = [];        
        D3MSA1.msaMin = [];  // one per sequence
        D3MSA1.msaMax = [];
        
        D3MSA1.msaPos = [];  // common to all seqs
        D3MSA1.rectPos = [];

        for( var i = 0; i < D3MSA1.rectPos.length; i++ ){
            D3MSA1.msaVon.push(false);
        }
        
        for( var i = 0; i < D3MSA1.msaSeq.length; i++){
            D3MSA1.msaMin.push(1);
            D3MSA1.msaMax.push(D3MSA1.msaMap[i][D3MSA1.msaSeq[i].length-1]);
        }
        
        D3MSA1.offsetY = 10;
        if( D3MSA1.config.navig ) D3MSA1.offsetY += 30;
        if( D3MSA1.config.slogo ) D3MSA1.offsetY += 50;
        
        var _seqMSA = D3MSA1.svg.append("g").attr( "id", "seqMSA" )
            .attr("transform", "translate(0, " + ( D3MSA1.offsetY) + ")");        
        _seqMSA.append("clipPath")
            .attr("id", "seqMSA_clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -6)
            .attr("width", D3MSA1._msaW) // TODO
            .attr("height", 14*(D3MSA1.msaHead.length+1));
        
        var _seqMSA_head = _seqMSA.append("g").attr( "id", "seqMSA_head" );
        
        var _seqMSA_port = _seqMSA.append("g").attr( "id", "seqMSA_port" )
            .attr("clip-path", "url(#seqMSA_clip)")
            .attr("transform", "translate(100, 0)");

        var _seqMSA_view
            = _seqMSA_port.append("g").attr( "id", "seqMSA_view" );

        D3MSA1.renderHeadMSA();
        
        if( D3MSA1.aaStep >= D3MSA1.config.aaMinStep ){
            //D3MSA1.updateAA();
            D3MSA1.renderAA();
        }
        
        if( D3MSA1.aaStep < D3MSA1.config.aaMinStep*5 ){            
            D3MSA1.renderRange();
            D3MSA1.rngOn = true;
        }
        
        D3MSA1.setSelectList( [] );  // set to empty selection        
    },

    updateMSA() {      // called on bush move
        D3MSA1.getViewportParams();
        D3MSA1.updateHeadMSA();

        if( D3MSA1.aaStep > D3MSA1.config.aaMinStep ){
            if( D3MSA1.aasOn ){
                D3MSA1.updateAA();
                D3MSA1.aasOn = true
            } else {
                D3MSA1.updateAA();
                D3MSA1.aasOn = true;
            }
        } else {
            D3MSA1.removeAA();
            D3MSA1.aasOn = false;
        }
        
        if( D3MSA1.aaStep < D3MSA1.config.aaMinStep*5 ){
            if( D3MSA1.rngOn ){
                D3MSA1.updateRange();
            } else {
                D3MSA1.renderRange();
                D3MSA1.rngOn = true;
            }
        } else {
            d3.selectAll( ".msa-range" ).remove();
            D3MSA1.rngOn = false;
        }
    },
    
    renderRange() {        
        d3.selectAll( ".msa-range" ).remove();
        
        var opq = Math.min( 1, 1 - D3MSA1.aaStep**1.5
                            / (D3MSA1.config.aaMaxStep - D3MSA1.aaStep*0.99)**2);

        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){
            
            var pos =  D3MSA1.seqRng[i]["min"] * D3MSA1.aaStep - D3MSA1.aaOffset;
            d3.select( "#seqSeq" + i.toString() +"rn")
                .append( "rect" )
                .attr( "class", "msa-range")
                .style( "fill", "#D3D3D3" )
                .attr( "x", pos )
                .attr( "y", -10 )
                .attr( "width", (D3MSA1.seqRng[i]["max"]
                                 + D3MSA1.aaStep
                                 - D3MSA1.seqRng[i]["min"])*D3MSA1.aaStep)
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

        var opq = Math.min( 1, 1 - D3MSA1.aaStep**1.5
                            / (D3MSA1.config.aaMaxStep - D3MSA1.aaStep*0.99)**2);
        
        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){

            var pos = D3MSA1.seqRng[i]["min"] * D3MSA1.aaStep - D3MSA1.aaOffset;

            d3.select( "#seqSeq" + i.toString() + "rn  .msa-range")
                .attr( "x", pos )
                .attr( "y", -10 )
                .attr( "width",(D3MSA1.seqRng[i]["max"]
                                + D3MSA1.aaStep
                                - D3MSA1.seqRng[i]["min"]) * D3MSA1.aaStep);

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

        D3MSA1.msaPosOld = D3MSA1.msaPos;
        D3MSA1.rectPosOld = D3MSA1.rectPos;
        D3MSA1.aaStepOld = D3MSA1.aaStep;
                
        D3MSA1.msaMin = new Array(D3MSA1.msaHead.length);   // one per sequence
        D3MSA1.msaMax = new Array(D3MSA1.msaHead.length);  

        D3MSA1.msaPos = new Array(D3MSA1.msaSeq[0].length);     // one per aa
        D3MSA1.rectPos = new Array(D3MSA1.msaSeq[0].length);

        var jmin= parseInt(D3MSA1.aaOffset/D3MSA1.aaStep + 1/2);
        var jmax= parseInt((D3MSA1._msaW+D3MSA1.aaOffset)/D3MSA1.aaStep - 1/2);
        if( jmin < 0 ) jmin = 0;
        if( jmax >= D3MSA1.msaSeq[0].length ) jmax = D3MSA1.msaMap[i].length-1;

        var frMsaPos = new Array(jmax-jmin+1);
        var frRectPos = new Array(jmax-jmin+1);
        
        D3MSA1.msaNewFrame = {"min":jmin,
                             "max":jmax,
                             "msaMin": D3MSA1.msaMin,
                             "msaMax": D3MSA1.msaMax,
                             "msaPos": frMsaPos,
                             "rectPos": frRectPos
                            };
        
        for( var i=0; i <D3MSA1.msaHead.length; i++ ){                
            D3MSA1.msaMin[i] = D3MSA1.msaMap[i][jmin];
            D3MSA1.msaMax[i] = D3MSA1.msaMap[i][jmax];
        }

        for( var j = 0; j <D3MSA1.msaPos.length; j++ ){   // j - sequence position
            D3MSA1.msaPos[j] = -100;
            D3MSA1.rectPos[j] = -100;
        }
        
        for( var j = jmin; j <=jmax; j++ ){   // j - sequence position
            var pos = 0.5 * D3MSA1.aaStep + j * D3MSA1.aaStep - D3MSA1.aaOffset;
            D3MSA1.msaPos[j] = pos;
            D3MSA1.rectPos[j] = pos - 0.5 * D3MSA1.aaStep;

            frMsaPos[j-jmin]= D3MSA1.msaPos[j];
            frRectPos[j-jmin]= D3MSA1.rectPos[j];            
        }

        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){                     
            if(D3MSA1.msaMin){                
                d3.select( "#seqHead" + i.toString() + " .msa-min")
                    .text( D3MSA1.msaMin[i] );
                }
            
            if(D3MSA1.msaMax){
                d3.select( "#seqHead" + i.toString() + " .msa-max")
                    .text( D3MSA1.msaMax[i] );
            }                       
        }
    },

    renderHeadMSA: function(){
        
        D3MSA1.msaMin = [];     // one per sequence
        D3MSA1.msaMax = [];  
        D3MSA1.msaPos = [];     // one per aa
        D3MSA1.rectPos = [];

        for( var j = 0; j < D3MSA1.msaSeq[0].length; j++ ){   // j - seq pos
            var pos = 0.5 * D3MSA1.aaStep + j * D3MSA1.aaStep - D3MSA1.aaOffset;
            
            try{
                if( pos > 0 && pos < D3MSA1.aaStep){   // first AA visible
                    for( var i=0; i <D3MSA1.msaHead.length; i++ ){                
                        D3MSA1.msaMin.push(D3MSA1.msaMap[i][j]);
                    }
                }
            
                if( pos > D3MSA1._msaW-D3MSA1.aaStep && pos < D3MSA1._msaW ){

                    // last AA visible

                    for( var i=0; i <D3MSA1.msaHead.length; i++ ){
                        D3MSA1.msaMax.push( D3MSA1.msaMap[i][j] );
                        if( j >= D3MSA1.msaMap[i].length ){
                            D3MSA1.msaMax[ i ]
                                = D3MSA1.msaMap[i][ D3MSA1.msaMap[i].length-1 ];
                        } else {
                            D3MSA1.msaMax[ i ]
                                = D3MSA1.msaMap[i][j];
                        }
                    }
                }
            } catch(e){
                console.log(e);
            }
            
            D3MSA1.msaPos[j] = pos;
            D3MSA1.rectPos[j] = pos - 0.5 * D3MSA1.aaStep;
        }
        
        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){         
            _seqG = d3.select("g[id='seqMSA_head']")
                .append("g")
                .attr( "id", "seq"+i.toString() )
                .attr("transform", "translate(0, " + (i+1)*14 + ")");
 
            _seqHG = _seqG
                .append("g")
                .attr( "id", "seqHead"+i.toString() );
            //_seqHGA = _seqHG.append("a")
            //    .attr('href', 'https://www.uniprot.org/uniprotkb/'
            //          + D3MSA1.msaHead[i][0])
            //    .attr('target','_cvdb_target');
            _seqHGAT= _seqHG.append("text")    // HGA for link                
                .style( "font", "normal 12px Arial")               
                //.style( "fill", "blue")
                //.attr("text-decoration","underline")
                .text( D3MSA1.config.taxname[D3MSA1.msaHead[i][2]] );
            _seqHGAT
                .append("title").text("Ensembl: "
                                      + D3MSA1.msaHead[i][0]
                                      + " (" + D3MSA1.msaHead[i][1] +")");
            
            if( i > 0 ){
                //_seqHGAT.style( "fill", "blue")
                //    .attr("text-decoration","underline");
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
                .text( D3MSA1.msaMin[i] );
            
            d3.select( "#seqHead" + i.toString() )
                .append("text")
                .attr( "class", "msa-max")
                .attr( "x", 105 + D3MSA1._msaW)
                .attr( "y", 0 )
                .style( "font", "bold 12px Arial")
                .style( "fill", "grey")
                .attr( "text-anchor", "start")
                .text( D3MSA1.msaMax[i] );            
        }        
    },

    removeAA: function(){
        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){
            d3.select("#seqSeq" + i.toString() + "bk").selectAll(".msa-rect")
                .remove();
            d3.select("#seqSeq" + i.toString() + "aa").selectAll(".msa-aa")
                .remove();
        }

        D3MSA1.msaVon = [];
        for( var i = 0; i < D3MSA1.rectPos.length; i++ ){
            D3MSA1.msaVon.push(false);
        }
    },
    
    renderAA() {
               
        D3MSA1.msaVon = [];
        
        for( var i = 0; i < D3MSA1.rectPos.length; i++ ){
            D3MSA1.msaVon.push( D3MSA1.rectPos[i] < -D3MSA1.aaStep ||
                               D3MSA1.rectPos[i] > D3MSA1._msaW  ? false : true);
        }

        for( var i = 0; i < D3MSA1.msaPos.length; i++ ){
            if( D3MSA1.msaVon[i] ){  // add AAs
                for( var j = 0; j < D3MSA1.msaHead.length; j++ ){
                    if( D3MSA1.rectPosOld[i] <=-10
                        || D3MSA1.rectPosOld[i] > D3MSA1._msaW) continue;
                    // box
                    
                    var aa =  D3MSA1.msaSeq[j][i];
                    
                    d3.select( "#seqSeq" + j.toString() +"bk")
                        .append( "rect" )                
                        .attr( "i", i )
                        .attr( "x", D3MSA1.rectPosOld[i] )
                        .attr( "y", -10 )
                        .attr( "width", D3MSA1.aaStepOld )
                        .attr( "height", 10 )
                        .attr( "class", "msa-rect")
                        .style( "fill", D3MSA1._palette1[ aa ] )
                        .attr( "fill-opacity", D3MSA1.aaStep > 16 ? 0.5 : 1 )                        
                        .append("title").text(aa + (D3MSA1.msaMap[j][i]));
                    
                    // letter 
                    
                    d3.select( "#seqSeq" + j.toString() +"aa")
                        .append( "text" )
                        .attr( "class", "msa-aa" )
                        .style( "font", "bold 12px Arial")  
                        .style( "fill", D3MSA1._palette1[ aa ] )
                        .attr( "text-anchor", "middle") 
                        .attr( "x", D3MSA1.msaPosOld[i] )
                        .attr( "y", 0 )
                        .attr( "i", i )
                        .attr( "fill-opacity", D3MSA1.aaStep > 16 ? 1 : 0 )
                        .text( aa )
                        .append("title").text(aa + (D3MSA1.msaMap[j][i]));                   
                }                        
            } 
        }
        
        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA1.msaSeq[i].length; j++){
                d3.select( "#seqSeq" + i.toString() +"bk rect[i='"+j+"']")
                    .attr( "fill-opacity", D3MSA1.msaOpa)
                    .attr( "x", D3MSA1.rectPos[j] )
                    .attr( "width", D3MSA1.aaStep );
            }
        }
        
        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA1.msaSeq[i].length; j++){            
                d3.select( "#seqSeq" + i.toString() +"aa text[i='"+j+"']")
                    .attr( "x", D3MSA1.msaPos[j])
                    .attr( "fill-opacity", function (d) {
                        if( D3MSA1.aaStep > 16 ){
                            return 1;
                        } else {
                            var op = -1 + 2*D3MSA1.aaStep/16;
                            if(op < 0){
                                return 0;
                            } else {
                                return op;
                            }                      
                        }
                    });
            }
        }
    },
    
    updateAA() {
        
        //D3MSA1.msaNewFrame = {"min":jmin,
        //                     "max":jmax,
        //                     "msaMin": D3MSA1.msaMin,
        //                     "msaMax": D3MSA1.msaMax,
        //                     "msaPos": frMsaPos,
        //                     "rectPos": frRectPos
        //                    };

        var msaVonCurrent = [];

        oonmin = -1;
        oonmax = -1;

        //console.log(D3MSA1.msaNewFrame);
        //console.log(":"+D3MSA1.aaStep+":"+D3MSA1.aaOffset+":");
        
        for( var i = 0; i < D3MSA1.rectPos.length; i++ ){
            msaVonCurrent.push( D3MSA1.rectPos[i] < -D3MSA1.aaStep  ||
                                D3MSA1.rectPos[i] > D3MSA1._msaW  ? false:true);        
        }

        for( var i = 0; i < D3MSA1.rectPos.length; i++ ){
            if( oonmin < 0 &&  D3MSA1.msaVon[i]) oonmin = i;
            if(  D3MSA1.msaVon[i] ) oonmax = i;
        }

        var smin = D3MSA1.msaNewFrame.min;
        var joff = D3MSA1.msaNewFrame.min;
        
        if( oonmin < smin){
            smin = oonmin;
            joff = oonmin;
        }
        var smax = D3MSA1.msaNewFrame.max;
        if( oonmax >smax)  smax = oonmax;

        for( j = smin; j <= smax; j++ ){

            // over positions
            
            cur = (j >= D3MSA1.msaNewFrame.min &&
                   j <= D3MSA1.msaNewFrame.max) ? true : false;
            old = (j >= oonmin && j <= oonmax) ? true : false;

            //console.log(j+"::"+joff+"::"+cur+":"+old+":");
            if( cur != old ){ 
                if( cur ){ // add AA/box
                    for( var i = 0; i < D3MSA1.msaHead.length; i++ ){
                        // over sequences
                        
                        var aa =  D3MSA1.msaSeq[i][j];
                        
                        d3.select( "#seqSeq" + i.toString() +"bk")  // box
                            .append( "rect" )                
                            .attr( "i", j )
                            .attr( "x", D3MSA1.rectPosOld[j] )
                            //.attr( "x", D3MSA1.msaNewFrame.rectPos[j] )
                            .attr( "y", -10 )
                            .attr( "width", D3MSA1.aaStepOld )
                            .attr( "height", 10 )
                            .attr( "class", "msa-rect")
                            .style( "fill", D3MSA1._palette1[ aa ] )
                            .attr( "fill-opacity", D3MSA1.aaStep > 16 ? 0.5:1 )
                            .append("title").text(aa+(D3MSA1.msaMap[i][j+joff]));

                        d3.select( "#seqSeq" + i.toString() +"aa") // letter 
                            .append( "text" )
                            .attr( "class", "msa-aa" )
                            .style( "font", "bold 12px Arial")  
                            .style( "fill", D3MSA1._palette1[ aa ] )
                            .attr( "text-anchor", "middle") 
                            .attr( "x", D3MSA1.msaPosOld[j] )
                            .attr( "y", 0 )
                            .attr( "i", j )
                            .attr( "fill-opacity", D3MSA1.aaStep > 16 ? 1 : 0 )
                            .text( aa )
                            .append("title").text(aa + (D3MSA1.msaMap[i][j]));
                    }                        
                    
                } else { // drop AA/box                    
                    d3.selectAll( "#seqMSA_view text[i='"+j+"']").remove();
                    d3.selectAll( "#seqMSA_view rect[i='"+j+"']").remove();                    
                }
            }
        }
                
        // update position/width/opacity....
        
        D3MSA1.msaVon = msaVonCurrent;
        
        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA1.msaNewFrame.msaPos.length; j++){
                
                d3.select( "#seqSeq" + i.toString() +"bk " +
                           "rect[i='"+(j+D3MSA1.msaNewFrame.min)+"']")
                    .attr( "fill-opacity", D3MSA1.msaOpa)
                    .attr( "x", D3MSA1.msaNewFrame.rectPos[j] )
                    .attr( "width", D3MSA1.aaStep );                    
            }
        }

        for( var i = 0; i <D3MSA1.msaHead.length; i++ ){
            for( var j = 0; j < D3MSA1.msaNewFrame.msaPos.length; j++){            
                d3.select( "#seqSeq" + i.toString() +"aa " +
                           " text[i='"+(j+D3MSA1.msaNewFrame.min) + "']")
                    .attr( "x", D3MSA1.msaNewFrame.msaPos[j])
                    .attr( "fill-opacity", function (d) {
                        if( D3MSA1.aaStep > 16 ){
                            return 1;
                        } else {
                            var op = -1 + 2*D3MSA1.aaStep/16;
                            if(op < 0){
                                return 0;
                            } else {
                                return op;
                            }                      
                        }
                    });
            }
        }
    },

    dropAllSelect: function(){
        d3.select("#seqMSA_select").remove();
        d3.select("#seqMSA_view")
            .append( "g" )
            .attr("id","seqMSA_select");
        D3MSA1.select = {};
    },

    setSelectMap: function( smap ){
        //console.log(smap);
        for( pc of D3MSA1.select ){ // go over existing elements
            //console.log("sel:",pc);
            if( pc in Object.keys(smap) ){ // no selection change, remove from smap                
                smap.delete(pc);                 
            } else { // drop selection
                D3MSA1.select[pc].remove(); // drop rectangle
                delete D3MSA1.select[pc];  // drop from map   
            }
        }

        //console.log(smap);
        for( pc of Object.keys(smap) ){
            //console.log("smap:",pc);
            //console.log(pc, smap[pc]);
            pcl =pc.split(":");
            D3MSA1.select[pc] =  D3MSA1.addSelect( Number(pcl[0]),
                                                 pcl[1],
                                                 smap[pc].name);            
        }
    },

    setSelectList: function( slist ){
        
        for( pc in D3MSA1.select ){ // go over existing elements
            if( pc in slist ){ // no selection change, remove from slist
                for(i=0; i < slist.length; i++){
                    if(slist[i] == pc){
                        slist.splice[i,1];
                        break;
                    }
                }                
            } else { // drop selection
                D3MSA1.select[pc].remove(); // drop rectangle
                delete D3MSA1.select[pc];  // drop from map   
            }
        }
        
        for( i = 0 ; i < slist.length; i++){
            pcl = slist[i].split(":");
            D3MSA1.select[ slist[i] ] =  D3MSA1.addSelect(Number(pcl[0]),pcl[1],pcl[0]);            
        }

    },
    
    updateSelect:  function(){

        for( k in D3MSA1.select ){
            kl = k.split(":");
            
            var mp = D3MSA1.msaRMap[ Number( kl[0] ) ];
            var pos = mp * D3MSA1.aaStep - D3MSA1.aaOffset;
            
            D3MSA1.select[k]
                .attr( "x", pos)
                .attr( "width", D3MSA1.aaStep );                        
        }
    },
    
    addSelect: function( pos, color, name ){
        try{
            var mp = D3MSA1.msaRMap[pos];
            var x = mp * D3MSA1.aaStep - D3MSA1.aaOffset;
                
            var rect =  d3.select( "#seqMSA_select" )
                .append( "rect" )
                .style( "fill", color )
                .style( "fill-opacity", 0.25)
                .style( "stroke", color )
                .attr( "x", x )
                .attr( "y", -2 )
                .attr( "width", D3MSA1.aaStep )
                .attr( "height", 14*(D3MSA1.msaSeq.length + 0.5) )
                .attr( "class", "msa-select");
            
            rect.append("title").text( name );       
            return rect;
        } catch(err){
            //skip for now
        }
    },
    
    slogoView: function(){ },
    
    getUniqueID: function(left, right) {
        left = left || 1e5;
        right = right || 1e6 - 1;
        return Math.floor(Math.random() * (right - left) + left);
    }
};
