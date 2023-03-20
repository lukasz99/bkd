console.log("bkd-d3msa: common");
 
class BkdMSA {
    
    constructor( config ){
        this._conf = {   // defaults
            navig: true,
            dtrac: true,
            tlist: [ 'slogo', 'msa','dtrac'],
            brushLimit: 15,
            aaMaxStep: 20,
            aaMinStep:  5,
            taxname: {'9606': 'Human' },
            className: "MyMsaClass",
            viewId: "bkd_msa",
            width: 800,
            height: 300,
            background: "white",            
            _palette1: { "A":"green", "C":"orange", "D":"red",   "E":"red",
                         "F":"green", "G":"green",  "H":"blue",  "I":"green",
                         "K":"blue",  "L":"green",  "M":"green", "N":"grey",
                         "P":"green", "Q":"grey",   "R":"blue",  "S":"grey",
                         "T":"grey",  "V":"green",  "W":"green", "Y":"grey",
                         "-":"white", "~": "white",  ".":"white" },            
        };

        if( config !== undefined ){
            for( var ckey of  Object.keys(config) ){
                this._conf[ckey] = config[ckey];            
            };
        }        
        this._data = {dtrac:[{name:"InterPro",
                              link: "https://www.ebi.ac.uk/interpro/protein/UniProt/P60010/",
                              dpos:[{beg:10,end:15,name:"DOM1", link:null, color:"#FF8080"},
                                    {beg:67,end:500,name:"DOM2", link: null,color:"#80FF00"}]
                             },
                             {name:"Pfam",
                              link: "https://www.ebi.ac.uk/interpro/protein/UniProt/P60010/entry/pfam/",
                              dpos:[{beg:3,end:12,name:"DOM21", link:null,color:"#00FF80"},
                                    {beg:250,end:780, link:null, color:"#0080FF"} ]
                             }
                            ]};
        this._view = { target: null,
                       anchor: null,
                       select: {},
                       rngOn: false,
                       sindex: 0 };
        
        this._data.iid = this.getUniqueID();  // generate iid
        
    }

    get conf(){
        return this._conf;
    }

    get data(){
        return this._data;
    }

    get iid(){
        return this._data.iid;
    }
    
    get view(){
        return this._view;
    }

    getUniqueID( left, right ){
        var left = left || 1e5;
        var right = right || 1e6 - 1;
        return Math.floor(Math.random() * (right - left) + left);
    }

    initialize( init ){
        
        this._view.anchor = init.anchor;
        this._data.url = init.url;
        if( init.dtrak != undefined){
            this._data.dtrac = init.dtrak;
        }
        
        var callback = function( msa ){
            return function( data, textStatus, jqXHR) {
                
                var msaHead = [];
                var msaSeq = [];
                
                var lines = data.split('\n');
                
                for( var i=0; i < lines.length; i++ ){
                    if( lines[i].startsWith('>') ){
                        var hcols = lines[i].replace(">","").split(";")
                        msaHead.push( hcols );
                        msaSeq.push("");
                    } else {
                        msaSeq[msaSeq.length-1]+= lines[i];
                    }
                }
                msa._data.msaHead = msaHead;
                msa._data.msaSeq = msaSeq;
                                
                msa._view._brl = msa._conf.brushLimit;    // shortest brush range
                
               // brush range corresponding to longest aa step (aaMaxStep)
                
                var brlimit = msa._conf._msaW/msa._conf.aaMaxStep;
                brlimit = brlimit / msa._data.msaSeq[0].length * msa._conf._msaW; 
                
                if( brlimit >msa._conf.brushLimit){  // no slope modification                  
                    msa._view._brl = Math.floor( brlimit ); 
                }

                msa._initViz();                
                msa._render();                
            }
        };
    
        // load remote msa fasta       
        
        $.ajax( { url: this._data.url,
                  beforeSend: function( xhr ) {
                      xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
                  }
                } ).done( callback( this ) );

    }

    _initViz(){

        // calculate positions/sizes

        this._view.svgWidth = this._conf.width;
        this._view.navWidth = this._conf.width-50-100;
        
        this._view.svgHeight = this._conf.height - 0;

        var target = null;
        
        if( !this._view.target ){
            
            target = this._conf.viewId + "_" + this.iid;            
            d3.select( this._view.anchor ).append( "div" ).attr( "id", target );            
        }

        var svg = d3.select( "#" + target ).append("svg");
        svg.attr( "width", this._view.svgWidth )
            .attr( "height", this._view.svgHeight )
            .attr( "xmlns", "http://www.w3.org/2000/svg" )
            .attr( "xmlns:xlink", "http://www.w3.org/1999/xlink" );
        
        svg.classed( this._conf.className, true)        
            .attr("id", target + "_svg"  )
            .style("background-color", this._conf.background||"transparent");
        
        this._view.target = target;
        this._view.svg = svg;
        
    }

    _render(){

        // map sequences to MSA position
        //  msaSeq  - msa sequences (with gaps) as strings 
        
        this._data.msaMap = [];
        this._data.seqRng = [];
        this._data.msaRMap = [];  // seq -> msa pos (one for each seqence) 
        
        
        for( var i=0; i <  this._data.msaSeq.length; i++ ){
            this._data.msaRMap.push( {} );
            this._data.msaMap.push( [] );
            this._data.seqRng.push( {"min":-1,"max":-1} );
            var cp = 0;
            for( var j=0; j < this._data.msaSeq[i].length; j ++ ){
                if( "ACDEFGHIKLMNPQRSTVWY".includes( this._data.msaSeq[i][j] ) ){
                    cp +=1;
                    this._data.msaRMap[i][cp] = j;
                    
                    if(this._data.seqRng[this._data.seqRng.length-1]["min"]<0){
                        this._data.seqRng[this._data.seqRng.length-1]["min"]=j;
                    }
                    this._data.seqRng[this._data.seqRng.length-1]["max"]=j;
                }
                
                if( cp >0 ){
                    this._data.msaMap[i].push( cp );
                } else {
                    this._data.msaMap[i].push( "" );
                }
            }
        }

        // offsets
        
        this._view.offsetY = 10;
        if( this._conf.navig ) this._view.offsetY += 30;
        if( this._conf.slogo ) this._view.offsetY += 50;
        this._view.offsetDtrY = this._view.offsetY
            + 14*(this._data.msaHead.length + 0.25);

        // brushLimit         
        // assumes msa already loaded

        this._data.msaRange = [0, this._data.msaSeq[0].length];

        this._view.msaScale = d3.scaleLinear()  //  1 -> 1
            .domain( this._data.msaRange )
            .range([0, this._data.msaSeq[0].length-1]);
        
        this._view.navScale = d3.scaleLinear()  //  100 ->  pixelWidth
            .domain([0, 100])
            .range([0, this._view.navWidth]);
        
        this._view.nav2msaScale = d3.scaleLinear()  // 100 -> maxAA
            .domain([0, 100])
            .range( this._data.msaRange );        
        
        if( this._conf.navig ){
            this._navGUI();
        }
        
        for( var t in this._conf.tlist ){
            if( this._conf.tlist[t] == 'slogo' ){
                this.slogoView();
            } else if( this._conf.tlist[t] == 'msa' ){
                this.renderMSA();
            } else if (this._conf.tlist[t] == 'dtrac' ){
                if( 'dtrac' in this.data){
                    this.renderDtrac();
                }
            }
        }                
    }

    _navGUI(){

        this._view.displaystart = 0;
        this._view.displayend =  100;

        var _leftCB = function( msa ){
            return function( event ){
                console.log("leftCB!!!");
                var V = msa._view;
                
                msa.setNavBrush( 2*V.brushLeft-V.brushRight,
                                 V.brushLeft);                
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight]);
                
                msa._view.displaystart = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend = msa._view.brushRight / msa._view.navWidth*100;
                
                msa.updatePolygon();
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log("leftCB: DONE");                               
            }
        }
        
        var _left = this.navButton(this._view.svg,
                                   this._view.target + "_left", 5, 13, "<")
            .on( "click", _leftCB(this) );
        
            //.on( "click", (event) => {                
            //    D3MSA3.setNavBrush( 2*D3MSA3.brushLeft-D3MSA3.brushRight,
            //                       D3MSA3.brushLeft);                
            //    D3MSA3.navBrushG.call( D3MSA3.viewport.move,
            //                          [D3MSA3.brushLeft, D3MSA3.brushRight]);
            //});

        var _plusCB = function( msa ){
            return function( event ){
                console.log("plusCB!!!");

                var V = msa._view;
                
                var center = (V.brushLeft + V.brushRight)/2;
                var delta = 0.75 * (V.brushRight - V.brushLeft)/2;
                msa.setNavBrush( center-delta, center+delta);                
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight]);
                
                msa._view.displaystart = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend = msa._view.brushRight / msa._view.navWidth*100;
                
                msa.updatePolygon();
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log("plusCB: DONE");
            }
        }

        var _plus = this.navButton(this._view.svg,
                                   this._view.target + "_plus", 27, 13, "+")
            .on( "click", _plusCB(this) );
        
            //.on( "click", (event) => {
            //    var center = (D3MSA3.brushLeft + D3MSA3.brushRight)/2;
            //    var delta = 0.75 * (D3MSA3.brushRight - D3MSA3.brushLeft)/2;
            //    D3MSA3.setNavBrush( center-delta, center+delta);                
            //    D3MSA3.navBrushG.call( D3MSA3.viewport.move,
            //                          [D3MSA3.brushLeft, D3MSA3.brushRight]);
            //});

        var _minusCB = function( msa ){
            return function( event ){
                console.log("minusCB!!!");

                var V = msa._view;
                
                var center = (V.brushLeft + V.brushRight)/2;
                var delta = 1.5 * (V.brushRight - V.brushLeft)/2;
                msa.setNavBrush( center-delta, center+delta);                
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight]);
                
                msa._view.displaystart = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend = msa._view.brushRight / msa._view.navWidth*100;
                
                msa.updatePolygon();
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log("minusCB: DONE");
            }
        }
        
        var _minus = this.navButton(this._view.svg,
                                    this._view.target + "_minus", 50, 13, "-", -1 )
            .on( "click", _minusCB(this) );
        
            //.on( "click", (event) => {
            //    var center = (D3MSA3.brushLeft + D3MSA3.brushRight)/2;
            //    var delta = 1.5 * (D3MSA3.brushRight - D3MSA3.brushLeft)/2;
            //    D3MSA3.setNavBrush( center-delta, center+delta);                
            //    D3MSA3.navBrushG.call( D3MSA3.viewport.move,
            //                          [D3MSA3.brushLeft, D3MSA3.brushRight]);
            //});

        var _rightCB = function( msa ){
            return function( event ){
                console.log("rightCB!!!");    
                var V = msa._view;
                msa.setNavBrush( V.brushRight,
                                 2*V.brushRight-V.brushLeft);                
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight]);

                msa._view.displaystart = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend = msa._view.brushRight / msa._view.navWidth*100;

                msa.updatePolygon();
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log( "rightCB: DONE" ); 
            }
        }
        
        var _right = this.navButton(this._view.svg,
                                    this._view.target + "_right", 73, 13, ">")
            .on( "click", _rightCB( this ) );
        
        var _fullCB = function( msa ){
            return function( event ){
                console.log("fullCB!!!");
                
                var V = msa._view;
                
                msa.setNavBrush( 0, V.navWidth);         
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight])                
                
                msa._view.displaystart = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend = msa._view.brushRight / msa._view.navWidth*100;

                msa.updatePolygon();
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log("fullCB: done");
            }            
        }
        
        var _full =  this.navButton(this._view.svg,
                                    this._view.target + "_full",
                                    this._view.svgWidth-40, 13, "Full")
            .on( "click", _fullCB( this ) );
        
            //.on( "click", (event) => {
            //    D3MSA3.setNavBrush( 0, D3MSA3._msaW);                
            //    D3MSA3.navBrushG.call( D3MSA3.viewport.move,
            //                           [D3MSA3.brushLeft, D3MSA3.brushRight])
        //});
        
        _full.select("rect").attr("width",32);
        _full.select("text").style("font-size","14px")
            .attr("x",15).attr("y",15);        
        
        var _navG = this._view.svg.append("g")
            .attr( "id", this._view.target + "_nav" )
            .attr( "transform", "translate(100, 10)" );
        
        var _msaAxis = d3.axisBottom( this._view.navScale );
        _msaAxis.ticks( 10 ).tickFormat('');
        
        this._view.navAxis = _navG.append('g')
            .attr('class', 'x axis')
            .call(_msaAxis);

        this._view.brushLeft = 0;
        this._view.displaystart = this._view.navScale.invert( 0 );
        
        this._view.brushRight = this._view._brl;       
        this._view.displayend = this._view.navScale.invert( this._view._brl );
        
        var _brushCB = function(msa){
            return function( event ){
                msa.setNavBrush( event.selection[0], event.selection[1]);
                
                msa._view.displaystart = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend = msa._view.brushRight / msa._view.navWidth*100;

                msa.updatePolygon();
                msa.updateMSA();
                msa.updateDtracDoms();
                msa.updateSelect();                
                msa.getViewportParams();
            }
        }
        
        this._view.viewport = d3.brushX()
            .handleSize(6)
            .extent([ [0, 0], [this._view.svgWidth, 10] ])
            .on( "brush", _brushCB(this) );
        
        this._view.navBrushG = _navG.append("g")
            .attr( "class", "brush")
            .call( this._view.viewport);
        
        this._view.navBrushG.call( this._view.viewport.move, [ 0, this._view._brl ] );
        
        this._view.polygon = _navG.append("polygon")
            .attr('class', 'zoom-polygon')
            .attr('fill', '#777')
            .attr('fill-opacity','0.3');

        this.updatePolygon();
    }

    renderMSA(){

        this.getViewportParams();

        this._view.msaVon = [];        
        this._view.msaMin = [];  // one per sequence
        this._view.msaMax = [];
        
        this._view.msaPos = [];  // common to all seqs
        this._view.rectPos = [];

        for( var i = 0; i < this._view.rectPos.length; i++ ){
            this._view.msaVon.push(false);
        }
        
        for( var i = 0; i < this._data.msaSeq.length; i++){
            this._view.msaMin.push(1);
            this._view.msaMax.push(this._data.msaMap[i][this._data.msaSeq[i].length-1]);
        }
        
        
        var _seqMSA = this._view.svg.append("g").attr( "id", this._view.target + "_seq" )
            .attr("transform", "translate(0, " + ( this._view.offsetY) + ")");        
        _seqMSA.append("clipPath")
            .attr("id", this._view.target + "_seq_clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -6)
            .attr("width", this._view.navWidth) // TODO
            .attr("height", 14*(this._data.msaHead.length+1));
        
        var _seqMSA_head = _seqMSA.append("g").attr( "id", this._view.target + "_seq_head" );
        
        var _seqMSA_port = _seqMSA.append("g").attr( "id", this._view.target + "_seq_port" )
            .attr("clip-path", "url(#"+ this._view.target + "_seq_clip)" )
            .attr("transform", "translate(100, 0)");
        
        var _seqMSA_view
            = _seqMSA_port.append("g").attr( "id", this._view.target + "_seq_view" );
                this.renderHeadMSA();
        
        if( this._view.aaStep >= this._conf.aaMinStep ){
            //this.updateAA();
            this.renderAA();
        }
        
        if( this._view.aaStep < this._conf.aaMinStep*5 ){            
            this.renderRange();
            //this._view.rngOn = true;
        }
        
        this.setSelectList( [], null );  // set to empty selection 
    }

    renderHeadMSA(){

        var V = this._view;
        var D = this._data;
        V.msaPos = [];     // one per aa
        V.msaPosOld = [];  
        V.rectPos = [];
        V.rectPosOld = [];
        
        for( var j = 0; j < D.msaSeq[0].length; j++ ){   // j - seq pos
            var pos = 0.5 * V.aaStep + j * V.aaStep - V.aaOffset;

            V.msaPos[j] = pos;
            V.rectPos[j] = pos - 0.5 * V.aaStep;
            V.msaPosOld[j] = pos;
            V.rectPosOld[j] = pos - 0.5 * V.aaStep;
        }
              
        var sid = V.target + "_seq_";
        var ssid = V.target + "_seq_seq_";
        var shid = V.target + "_seq_head_";
        
        for( var i = 0; i < D.msaHead.length; i++ ){         
            var _seqG = d3.select("g[id='" + V.target + "_seq_head']")
                .append("g")
                .attr( "id", sid + i.toString() )
                .attr("transform", "translate(5, " + (i+1)*14 + ")");

            var _seqHG = _seqG
                .append("g")
                .attr( "id", V.target + "_seq_head_" + i.toString() );
            
            var label = D.msaHead[i][0];
            var popup = D.msaHead[i][1]
                + " (" + D.msaHead[i][2] +")";
            
            if( label != 'canonical' && label != 'mane' ){
                if( D.msaHead[i][0].length > 3){
                    label = D.msaHead[i][3];
                    //popup = D.msaHead[i][0];

                    popup = D.msaHead[i][1]
                        + " (" + D.msaHead[i][2] +")";                    
                } else {
                    label = D.msaHead[i][0];
                    //popup = D.msaHead[i][2]

                    popup = D.msaHead[i][1]
                        + " (" + D.msaHead[i][2] +")";
                }
            }
            
            var _seqHGAT = _seqHG.append("text")    // HGA for link
                .style( "font", "normal 12px Arial")               
                //.style( "fill", "blue")
                //.attr("text-decoration","underline")
                //.text( D.msaHead[i][0] );
                .text( label );
            
            //_seqHGAT
            //    .append("title").text( D.msaHead[i][1]
            //                           + " (" + D.msaHead[i][2] +")");
            
            _seqHGAT
                .append("title").text( popup );
            
            if( i > 0 ){
                //_seqHGAT.style( "fill", "blue")
                //    .attr("text-decoration","underline");
            } else {
                _seqHGAT.style( "font", "bold 12px Arial")
            }
            
            var _seqSG = d3.select("g[id='"+ V.target + "_seq_view']").append("g")
                .attr( "id", ssid + i.toString() )
                .attr( "transform", "translate( 0, "+ (i+1)*14 + ")" );

            d3.select( "#" + ssid + i.toString() )
                .append("g")
                .attr( "id", ssid + i.toString() + "bk");
            d3.select( "#"+ ssid + i.toString() )
                .append("g")
                .attr(  "id", ssid + i.toString() + "aa");
            d3.select("#"+ ssid + i.toString() )
                .append("g")
                .attr( "id", ssid + i.toString() + "rn");

            d3.select( "#" + shid + i.toString() )
                .append("text")
                .attr( "class", "msa-min")
                .attr( "x", 93)
                .attr( "y", 0 )
                .style( "font", "bold 12px Arial")
                .style( "fill", "grey")
                .attr( "text-anchor", "end")
                .text( V.msaMin[i] );
            
            d3.select( "#" + shid + i.toString() )
                .append("text")
                .attr( "class", "msa-max")
                .attr( "x", 105 + V.navWidth)
                .attr( "y", 0 )
                .style( "font", "bold 12px Arial")
                .style( "fill", "grey")
                .attr( "text-anchor", "start")
                .text( V.msaMax[i] );       
        }                
    }   

    updateHeadMSA(){

        this._view.msaPosOld = this._view.msaPos;
        this._view.rectPosOld = this._view.rectPos;
        this._view.aaStepOld = this._view.aaStep;
                
        this._view.msaMin = new Array(this._data.msaHead.length);   // one per sequence
        this._view.msaMax = new Array(this._data.msaHead.length);  

        this._view.msaPos = new Array(this._data.msaSeq[0].length);     // one per aa
        this._view.rectPos = new Array(this._data.msaSeq[0].length);

        var jmin= parseInt(this._view.aaOffset/this._view.aaStep + 1/2);
        var jmax= parseInt((this._view.navWidth+this._view.aaOffset)/this._view.aaStep - 1/2);
        if( jmin < 0 ) jmin = 0;
        if( jmax >= this._data.msaSeq[0].length ) jmax = this._data.msaMap[i].length-1;

        var frMsaPos = new Array( jmax-jmin+1 );
        var frRectPos = new Array( jmax-jmin+1 );
         
        this._view.msaNewFrame = {"min":jmin,
                                  "max":jmax,
                                  "msaMin": this._view.msaMin,
                                  "msaMax": this._view.msaMax,
                                  "msaPos": frMsaPos,
                                  "rectPos": frRectPos
                                 };
        
        for( var i=0; i <this._data.msaHead.length; i++ ){                
            this._view.msaMin[i] = this._data.msaMap[i][jmin];
            this._view.msaMax[i] = this._data.msaMap[i][jmax];
        }

        for( var j = 0; j <this._view.msaPos.length; j++ ){   // j - sequence position
            this._view.msaPos[j] = -100;
            this._view.rectPos[j] = -100;
        }
        
        for( var j = jmin; j <=jmax; j++ ){   // j - sequence position
            var pos = 0.5 * this._view.aaStep + j * this._view.aaStep - this._view.aaOffset;
            this._view.msaPos[j] = pos;
            this._view.rectPos[j] = pos - 0.5 * this._view.aaStep;

            frMsaPos[j-jmin]= this._view.msaPos[j];
            frRectPos[j-jmin]= this._view.rectPos[j];            
        }

        for( var i = 0; i <this._data.msaHead.length; i++ ){                     
            if(this._view.msaMin){                
                d3.select( "#" + this._view.target + "_seq_head_" + i.toString() + " .msa-min")
                    .text( this._view.msaMin[i] );
                }
            
            if(this._view.msaMax){
                d3.select( "#" +this._view.target + "_seq_head_" + i.toString() + " .msa-max")
                    .text( this._view.msaMax[i] );
            }                       
        }
    }

    renderAA(){

        var V = this._view;
        var D = this._data;
        V.msaVon = [];
        
        for( var i = 0; i < V.rectPos.length; i++ ){
            V.msaVon.push( V.rectPos[i] < - V.aaStep ||
                           V.rectPos[i] > V.navWidth  ? false : true);
        }
                
        for( var i = 0; i < V.msaPos.length; i++ ){
            if( V.msaVon[i] ){  // add AAs
                for( var j = 0; j < D.msaHead.length; j++ ){
                    if( V.rectPosOld[i] <=-10
                        || V.rectPosOld[i] > V.navWidth) continue;
                    // box
                    
                    var aa =  D.msaSeq[j][i];                    
                    d3.select( "#" + V.target + "_seq_seq_" + j.toString() +"bk")
                        .append( "rect" )               
                        .attr( "i", i )
                        .attr( "x", V.rectPosOld[i] )
                        .attr( "y", -10 )
                        .attr( "width", V.aaStepOld )
                        .attr( "height", 10 )
                        .attr( "class", "msa-rect")
                        .style( "fill", this._conf._palette1[ aa ] )
                        .attr( "fill-opacity", V.aaStep > 16 ? 0.5 : 1 )                        
                        .append("title").text(aa + (D.msaMap[j][i]));
                    
                    // letter 
                    
                    d3.select( "#" + V.target + "_seq_seq_" + j.toString() +"aa")
                        .append( "text" )
                        .attr( "class", "msa-aa" )
                        .style( "font", "bold 12px Arial")  
                        .style( "fill", this._conf._palette1[ aa ] )
                        .attr( "text-anchor", "middle") 
                        .attr( "x", V.msaPosOld[i] )
                        .attr( "y", 0 )
                        .attr( "i", i )
                        .attr( "fill-opacity", V.aaStep > 16 ? 1 : 0 )
                        .text( aa )
                        .append("title").text(aa + (D.msaMap[j][i]));
                }                        
            } 
        }
        
        for( var i = 0; i < D.msaHead.length; i++ ){
            for( var j = 0; j < D.msaSeq[i].length; j++){
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"bk rect[i='"+j+"']")
                    .attr( "fill-opacity", V.msaOpa)
                    .attr( "x", V.rectPos[j] )
                    .attr( "width", V.aaStep );
            }
        }
        
        for( var i = 0; i < D.msaHead.length; i++ ){
            for( var j = 0; j < D.msaSeq[i].length; j++){            
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"aa text[i='"+j+"']")
                    .attr( "x", V.msaPos[j])
                    .attr( "fill-opacity", function (d) {
                        if( V.aaStep > 16 ){
                            return 1;
                        } else {
                            var op = -1 + 2*V.aaStep/16;
                            if(op < 0){
                                return 0;
                            } else {
                                return op;
                            }                      
                        }
                    });
            }
        }
    }
    
    updateAA(){
        
        var V = this._view;
        var D = this._data;
        
        //V.msaNewFrame = {"min":jmin,
        //                     "max":jmax,
        //                     "msaMin": D3MSA3.msaMin,
        //                     "msaMax": D3MSA3.msaMax,
        //                     "msaPos": frMsaPos,
        //                     "rectPos": frRectPos
        //                    };

        var msaVonCurrent = [];

        var oonmin = -1;
        var oonmax = -1;
        
        for( var i = 0; i < V.rectPos.length; i++ ){
            msaVonCurrent.push( V.rectPos[i] < -V.aaStep  ||
                                V.rectPos[i] > V.navWidth  ? false:true);        
        }

        // remove old elements outside new viewport

        if( "msaVon" in V ){
            for( var i = 0; i < V.rectPos.length; i++ ){
                if( oonmin < 0 &&  V.msaVon[i] ) oonmin = i;
                if(  V.msaVon[i] ) oonmax = i;
            }

            var smin = V.msaNewFrame.min;
            var joff = V.msaNewFrame.min;
        
            if( oonmin < smin){
                smin = oonmin;
                joff = oonmin;
            }
            var smax = V.msaNewFrame.max;
            if( oonmax >smax)  smax = oonmax;
            
            for( j = smin; j <= smax; j++ ){
                
                // over positions
                
                cur = (j >= V.msaNewFrame.min &&
                       j <= V.msaNewFrame.max) ? true : false;
                old = (j >= oonmin && j <= oonmax) ? true : false;
                
                if( cur != old ){ 
                    if( cur ){ // add AA/box
                        for( var i = 0; i < D.msaHead.length; i++ ){
                            // over sequences
                            
                            var aa =  D.msaSeq[i][j];
                            
                            d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"bk")  // box
                                .append( "rect" )                
                                .attr( "i", j )
                                .attr( "x", V.rectPosOld[j] )
                            //.attr( "x", D3MSA3.msaNewFrame.rectPos[j] )
                                .attr( "y", -10 )
                                .attr( "width", V.aaStepOld )
                                .attr( "height", 10 )
                                .attr( "class", "msa-rect")
                                .style( "fill", this._conf._palette1[ aa ] )
                                .attr( "fill-opacity", V.aaStep > 16 ? 0.5:1 )
                                .append("title").text(aa+(D.msaMap[i][j+joff]));
                            
                            d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"aa") // letter 
                                .append( "text" )
                                .attr( "class", "msa-aa" )
                                .style( "font", "bold 12px Arial")  
                                .style( "fill", this._conf._palette1[ aa ] )
                                .attr( "text-anchor", "middle") 
                                .attr( "x", V.msaPosOld[j] )
                                .attr( "y", 0 )
                                .attr( "i", j )
                                .attr( "fill-opacity", V.aaStep > 16 ? 1 : 0 )
                                .text( aa )
                                .append("title").text(aa + (D.msaMap[i][j]));
                        }                        
                        
                    } else { // drop AA/box                    
                        d3.selectAll( "#" + V.target + "_seq_view text[i='"+j+"']").remove();
                        d3.selectAll( "#" + V.target + "_seq_view rect[i='"+j+"']").remove();                    
                    }
                }
            }
        }
        
        // update position/width/opacity....
        
        V.msaVon = msaVonCurrent;
        
        for( var i = 0; i <D.msaHead.length; i++ ){
            for( var j = 0; j < V.msaNewFrame.msaPos.length; j++){
                
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"bk " +
                           "rect[i='"+(j+V.msaNewFrame.min)+"']")
                //.attr( "fill-opacity", V.msaOpa)
                    .attr( "fill-opacity",  function (d) {
                        var copa = V.msaOpa;
                        if( copa > 0.5){
                            copa = copa/(0.5+copa);
                        }
                        return copa;
                    })
                    .attr( "x", V.msaNewFrame.rectPos[j] )
                    .attr( "width", V.aaStep );                    
            }
        }

        for( var i = 0; i <D.msaHead.length; i++ ){
            for( var j = 0; j < V.msaNewFrame.msaPos.length; j++){            
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"aa " +
                           " text[i='"+(j+V.msaNewFrame.min) + "']")
                    .attr( "x", V.msaNewFrame.msaPos[j])
                    .attr( "fill-opacity", function (d) {
                        if( V.aaStep > 16 ){
                            return 1;
                        } else {
                            var op = -1 + 2*V.aaStep/16;
                            if(op < 0){
                                return 0;
                            } else {
                                return op;
                            }                      
                        }
                    });
            }
        }        
    }

    removeAA(){
    }
    
    renderRange(){
        
        var V = this._view;
        var D = this._data;
        
        d3.selectAll( ".bkd-msa-range" ).remove();
        
        var opq = Math.min( 1, 1 - V.aaStep**1.5
                            / (this._conf.aaMaxStep - V.aaStep*0.99)**2);

        for( var i = 0; i <D.msaHead.length; i++ ){
            
            var pos =  D.seqRng[i]["min"] * V.aaStep - V.aaOffset;            
            var r = d3.select( "#" + V.target +"_seq_seq_" + i.toString() +"rn")
                .append( "rect" )
                .attr( "class", "bkd-msa-range")
                .style( "fill", "#D3D3D3" )
                .attr( "x", pos )
                .attr( "y", -10 )
                .attr( "width", (D.seqRng[i]["max"]
                                 + V.aaStep
                                 - D.seqRng[i]["min"])*V.aaStep)
                .attr( "height", 10 );

            if( opq > 0 ){
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"rn")
                    .attr( "fill-opacity", opq )
                    .style("visibility", "visible");
            } else {
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn  .bkd-msa-range")
                    .attr( "fill-opacity", 0)
                    .style("visibility", "hidden");
            }
        }         
    }

    updateRange(){

        var V = this._view;
        var D = this._data;
        
        var opq = Math.min( 1, 1 - V.aaStep**1.5
                            / (this._conf.aaMaxStep - V.aaStep*0.99)**2);
        
        for( var i = 0; i <D.msaHead.length; i++ ){

            var pos = D.seqRng[i]["min"] * V.aaStep - V.aaOffset;

            d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn  .bkd-msa-range")
                .attr( "x", pos )
                .attr( "y", -10 )
                .attr( "width",(D.seqRng[i]["max"]
                                + V.aaStep
                                - D.seqRng[i]["min"]) * V.aaStep);

            if( opq > 0 ){
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn  .bkd-msa-range")
                    .attr( "fill-opacity", opq)
                    .style("visibility", "visible");                
            } else {
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn  .bkd-msa-range")
                    .attr( "fill-opacity", 0)
                    .style("visibility", "hidden");
            }                
        }         
    }
    
    renderDtrac(){
        
        var _dtrMSA = this._view.svg.append("g").attr( "id", this._view.target + "_dtr" )
            .attr("transform", "translate(0, " + ( this._view.offsetDtrY) + ")");        
        _dtrMSA.append( "clipPath" )
            .attr("id", this._view.target + "_dtr_clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -6)
            .attr("width", this._view.navWidth) // TODO
            .attr("height", 14*(this._data.dtrac.length+1));
        
        var _dtrMSA_head = _dtrMSA.append("g").attr( "id", this._view.target + "_dtr_head" );
        
        var _dtrMSA_port = _dtrMSA.append("g").attr( "id", this._view.target + "_dtr_port" )
            .attr("clip-path", "url(#"+ this._view.target + "_dtr_clip)" )
            .attr("transform", "translate(100, 0)");
        
        var _dtrMSA_view
            = _dtrMSA_port.append("g").attr( "id", this._view.target + "_dtr_view" );
        
        this.renderDtracHead();
        this.renderDtracDoms();
    }
    
    renderDtracHead(){ 
        
        var V = this._view;
        var D = this._data;

        for( var t of D.dtrac ){
            console.log(t);
            var name = t.name;
            
        }
        
        var sid = V.target + "_dtr_";
        var ssid = V.target + "_dtr_dom_";
        var shid = V.target + "_dtr_head_";
        
        for( var i = 0; i < D.dtrac.length; i++ ){         
            var _seqG = d3.select("g[id='" + V.target + "_dtr_head']")
                .append("g")
                .attr( "id", sid + i.toString() )
                .attr("transform", "translate(95, " + (i+1)*14 + ")");

            var _seqHG = _seqG
                .append("g")
                .attr( "id", V.target + shid + i.toString() );
            
            if( D.dtrac[i].link != undefined ){
                if( D.dtrac[i].link.length >0 ){
                    _seqHG = _seqHG.append("a")
                        .attr('href', D.dtrac[i].link)
                        .attr('target','_cvdb_target');
                }
            }
               
            var _seqHGT = _seqHG.append("text")    // HGA for link
                .style( "font", "normal 12px Arial")               
                .text( D.dtrac[i].name )                
                .attr( "text-anchor", "end");            

            if( D.dtrac[i].link != undefined ){
                if( D.dtrac[i].link.length >0 ){
                    _seqHGT.style( "fill", "blue")
                        .attr("text-decoration","underline");
                }
            }
            
            var _seqSG = d3.select("g[id='"+ V.target + "_dtr_view']").append("g")
                .attr( "id", ssid + i.toString() )
                .attr( "transform", "translate( 0, "+ (i+1)*14 + ")" );

            d3.select("#"+ ssid + i.toString() )
                .append("g")
                .attr( "id", ssid + i.toString() );

        }
    }
    
    renderDtracDoms(){

        var V = this._view;
        var D = this._data;

        d3.selectAll( ".msa-dtrac" ).remove();
        
        for( var t=0; t < D.dtrac.length; t++ ){
            console.log(t);

            var ctrac = D.dtrac[t]; 
            var name = ctrac.name;
            var dpos = ctrac.dpos;
            
            for( var d=0; d < dpos.length; d++ ){
                
                var pbeg = (dpos[d].beg - 1) * V.aaStep - V.aaOffset;
                var pend = (dpos[d].end - 1) * V.aaStep - V.aaOffset;
                var dcol = dpos[d].color;
                console.log("col",dcol);
                
                var r = d3.select( "#" + V.target +"_dtr_dom_" + t.toString() )
                    .append( "rect" )
                    .attr( "d", d )
                    .attr( "class", "dtr-range")
                    .style( "fill", dcol )
                    .attr( "x", pbeg )
                    .attr( "y", -10 )
                    .attr( "width", ( (pend - pbeg) + V.aaStep ) )
                    .attr( "height", 10 );

                if( dpos[d].name != undefined){
                    if( dpos[d].name.length >0 ){
                        r.append("title").text(dpos[d].name);                     
                    }
                }
            }
        }
    }

    updateDtracDoms(){

        console.log("DtracDoms: UPDATE");
        
        var V = this._view;
        var D = this._data;

        if( D.dtrac == undefined) return;
        
        for( var t=0; t < D.dtrac.length; t++ ){
            console.log(t);

            var ctrac = D.dtrac[t]; 
            var name = ctrac.name;
            var dpos = ctrac.dpos;
            
            for( var d=0; d < dpos.length; d++ ){
                
                var pbeg = (dpos[d].beg - 1) * V.aaStep - V.aaOffset;
                var pend = (dpos[d].end - 1) * V.aaStep - V.aaOffset;
                
                console.log("#" + V.target +"_dtr_dom_" + t.toString(), pbeg,pend);

                d3.select( "#" + V.target + "_dtr_dom_" + t.toString() +" " +
                           "rect[d='"+(d)+"']" )
                    .attr( "x", pbeg )
                    .attr( "width", (pend-pbeg) + V.aaStep );                    
            } 
        }
    }
    
    getViewportParams(){

        var view = this._view;
        var msaW = view.navWidth;
        
        var windowWidth = ( view.displayend - view.displaystart)
            / 100 * (this._data.msaRange[1]);   // [AA]
        
        var windowCenter = 0.005 * ( view.displayend + view.displaystart )
            * (this._data.msaRange[1]) ;        
        
        view.aaStep   =  ( msaW ) / windowWidth;  // [pixel/aa]
        view.aaOffset =  (windowCenter) * view.aaStep - msaW/2;

        view.windowWidth = windowWidth;
        view.windowCenter = windowCenter;

        if( view.displayend - view.displaystart <50 ){        
            view.alpha=(this._data.msaRange[1]/2- msaW/this._conf.aaMaxStep)
                / 100 / (1 - view._brl/ msaW - 0.5);
            
            view.beta = this._data.msaRange[1]/2 - 50 * view.alpha;

            view.ww = view.alpha * ( view.displayend - view.displaystart)
                + view.beta;

            view.aaStep =  msaW /view.ww ;
            view.aaOffset =  (windowCenter) * view.aaStep - msaW/2;
        }

        view.msaOpa = 0.5;
        if( view.aaStep <= 16 ){
            view.msaOpa = 0.5 + 0.5* (16-view.aaStep)/16;
        }

        if( view.displaystart < 100 - view.displayend ) {
            view.aaOffset = + view.aaStep * view.displaystart/100
                *this._data.msaRange[1];
        } else {
            view.aaOffset = - msaW + view.aaStep * view.displayend/100
                *this._data.msaRange[1];            
        }
        
    }
    
    dropAllSelect(){
        console.log("dropAllSelect:", "#" + this._view.target + "_seq_view_select");
        d3.select( "#" + this._view.target + "_seq_view_select").remove();
        //d3.select("#seqMSA_select").remove();
        d3.select( "#" + this._view.target + "_seq_view" )
        //d3.select("#seqMSA_view")
            .append( "g" )
            .attr("id", this._view.target + "_seq_view_select");
        this._view.select = {};
    }

    setSelectMap( smap, rseq ){
        //console.log(smap);
        for( var pc of this._view.select ){ // go over existing elements
            //console.log("sel:",pc);
            if( pc in Object.keys(smap) ){ // no selection change, remove from smap                
                smap.delete( pc );                 
            } else { // drop selection
                this._view.select[pc].remove(); // drop rectangle
                delete this._view.select[pc];  // drop from map   
            }
        }
        
        //console.log(smap);
        for( var pc of Object.keys(smap) ){
            //console.log("smap:",pc);
            //console.log(pc, smap[pc]);
            var pcl = pc.split(":");
            this._view.select[pc] =
                this.addSelect( Number(pcl[0]), pcl[1], smap[pc].name, rseq);            
        }
    }

    setSelectList( slist, rseq  ){

        var sindex = 0;

        if( this._data.msaHead  == undefined) return;
        
        for( var i =0; i < this._data.msaHead.length; i++){
            if( this._data.msaHead[i][1] == rseq ){
                sindex = i;
                break;
            }
        }
        this._view.sindex = sindex;
        
        var smap = this._data.msaMap[ sindex ];
        
        for( var pc in this._view.select ){ // go over existing elements
            if( pc in slist ){ // no selection change, remove from slist
                for(var i=0; i < slist.length; i++){
                    if( slist[i] == pc ){
                        slist.splice[i,1];
                        break;
                    }
                }                
            } else { // drop selection
                this._view.select[pc].remove(); // drop rectangle
                delete this._view.select[pc];  // drop from map   
            }
        }
        
        for( var i = 0 ; i < slist.length; i++){
            var pcl = slist[i].split(":");
            this._view.select[ slist[i] ]
                = this.addSelect( Number(pcl[0]), pcl[1], pcl[0], sindex );            
        }        
    }
    
    updateSelect(){
        var sindex = this._view.sindex;
        for( var k in this._view.select ){
            var kl = k.split(":");
            
            var mp = this._data.msaRMap[sindex][ Number( kl[0] ) ];
            var pos = mp * this._view.aaStep - this._view.aaOffset;
            
            this._view.select[k]
                .attr( "x", pos)
                .attr( "width", this._view.aaStep );                        
        }
    }
    
    addSelect( pos, color, name, sindex ){
                
        var mp = this._data.msaRMap[sindex][pos];
        var x = mp * this._view.aaStep - this._view.aaOffset;
                
        var rect =  d3.select( "#" + this._view.target + "_seq_view_select" )
            .append( "rect" )
            .style( "fill", color )
            .style( "fill-opacity", 0.25)
            .style( "stroke", color )
            .attr( "x", x )
            .attr( "y", -2 )
            .attr( "width", this._view.aaStep )
            .attr( "height", 14*(this._data.msaSeq.length + 0.5) )
            .attr( "class", "msa-select");
        
            rect.append("title").text( name );       
        return rect;
    }

    setNavView( center, width ){
        console.log("setNavView: call")
        this.setNavBrush( center-width/2, center+width/2 );
        console.log("setNavView -> setNavBrush: DONE")
        console.log(this._view);
        console.log("this._view.brushLeft", this._view.brushLeft);
        console.log("this._view.brushRight",this._view.brushRight);

        if( this._view.navBrushG == undefined) return;
        
        this._view.navBrushG.call( this._view.viewport.move,
                                   [ this._view.brushLeft,
                                     this._view.brushRight ] );
        console.log("setNavView: done");
    }
    
    slogoView(){

    }
    
    setNavBrush( left, right ){
        console.log( "setNavBrush:", left, right );
        var brushLeft = left;
        var brushRight = right;
        var reset = false;

        if( brushLeft < 0 ){
            brushLeft  = 0;
            left = brushLeft;
            reset = true;
        }

        if( brushRight >  this._view.navWidth ){
            brushRight = this._view.navWidth;
            right = brushRight;
            reset = true;
        }

        if( brushLeft > brushRight ){
            var tmp = brushLeft;
            brushLeft = brushRight;
            left = brushRight;
            brushRight = tmp;
            right = brushRight;
            reset = true;
        }
        
        if( right - left <  this._view._brl ){           
            var brushCenter = 0.5 * (left + right);
            brushLeft = brushCenter - this._view._brl/2;
            brushRight = brushCenter + this._view._brl/2;
            
            if( brushLeft < 1 ){
                brushLeft  = 0;
                brushRight = this._view._brl;  // /D3MSA3._brRatio;
            }
            
            if( brushRight >  this._view.navWidth ){ 
                brushLeft = this._view.navWidth - this._view._brl - 1; // /D3MSA3._brRatio - 1;
                brushRight = this._view.navWidth ;                      
            }
            reset = true;                       
        }
        
        if(reset){
            this._view.navBrushG.call( this._view.viewport.move,
                                       [brushLeft, brushRight] );                
            
        }
        this._view.brushLeft = brushLeft;
        this._view.brushRight = brushRight;     
    }
    
    updateNavRuler(){

    }

    updatePolygon(){
        //var max = D3MSA3._msaW;

        var max = this._view.nawWidth;
        
        if (this._view.polygon)
            this._view.polygon.attr(
                "points",
                `${this._view.navScale(this._view.displaystart)},10
                 ${this._view.navScale(this._view.displayend)},10
                 ${this._view.navWidth},25
                 0,25`
            );        
    }
    
    updateMSA(){
        this.getViewportParams();
        this.updateHeadMSA();
        
        if( this._view.aaStep > this._conf.aaMinStep ){
            if( this._view.aasOn ){
                this.updateAA();
                this._view.aasOn = true
            } else {
                this.updateAA();
                this._view.aasOn = true;
            }
        } else {
            this.removeAA();
            this._view.aasOn = false;
        }
        
        if( this._view.aaStep < this._conf.aaMinStep*5 ){
            if( this._view.rngOn ){
                this.updateRange();
            } else {
                this.renderRange();
                //this._view.rngOn = true;
                this._view.rngOn = false;
                
            }
        } else {
            d3.selectAll( ".msa-range" ).remove();
            this._view.rngOn = false;
        }
        
    }

    navButton( parent, id, x, y, char, choffset ){
        
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
    }
}
