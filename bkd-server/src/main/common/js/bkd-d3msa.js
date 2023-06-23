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
            
            _palette2: { "A":"green", "C":"orange", "D":"white", "E":"white",
                         "F":"green", "G":"green",  "H":"white", "I":"green",
                         "K":"white", "L":"green",  "M":"green", "N":"grey",
                         "P":"green", "Q":"grey",   "R":"white",  "S":"grey",
                         "T":"grey",  "V":"green",  "W":"green", "Y":"grey",
                         "-":"white", "~": "white", ".":"white" },
            msaDY: 20,
            msaBoxY: 16,
            msaBoxYOff: -12,
            
            msaFont: "bold 14px Arial",
            headFont: "normal 12px Arial",

            dtracBoxY: 16,
            dtracBoxYOff: -12            
        };

        if( config !== undefined ){
            for( var ckey of  Object.keys(config) ){
                this._conf[ckey] = config[ckey];            
            };
        }

        this._data = { dtrac:[] };
        
        this._view = { target: null,
                       anchor: null,
                       select: {},
                       poi: {elem: null, pos: [] },
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
                msa._initMSA();
                msa._initViz();                
                msa._render();                
            }
        };
    
        // load remote msa fasta       
        
        $.ajax({ url: this._data.url,
                 beforeSend: function( xhr ) {
                     xhr.overrideMimeType("text/plain; charset=x-user-defined");
                 }
               }).done( callback( this ) );

    }


    _initMSA(){

        var AA= '-ACDEFGHIKLMNPQRSTVWY';
        
        var dms = this._data.msaSeq;
        
        var msaCnt = [];  // AA counts at each position
        var msaEnt = [];  // entropy at each position

        for( var p = 0; p < dms[0].length; p ++){
            var frq = {};

            for( var s in dms ){  // go over sequences
                //console.log("initMSA", s, p, dms[s][p]);
                if( frq[ dms[s][p] ] == undefined  ) frq[ dms[s][p] ] = 0;
                frq[ dms[s][p] ] += 1;
            }
            msaCnt.push(frq);
            //console.log("initMSA -> frq",frq);
            var ent = 0;
            for( var aa in AA){
                if( frq[AA[aa]] != undefined ){ 
                    ent -= frq[ AA[aa] ] * Math.log2( frq[AA[aa]]/dms.length );
                }
            }
            ent = ent/dms.length;
            msaEnt.push(ent);
        }

        //console.log( "initMSA -> msaCnt:", msaCnt);
        //console.log( "initMSA -> masEnt:", msaEnt);
        this._data.msaCnt = msaCnt;
        this._data.msaEnt = msaEnt;
    }
    
    _initViz(){

        // calculate positions/sizes

        this._view.svgWidth = this._conf.width;
        this._view.navWidth = this._conf.width-50-172;
        
        this._view.svgHeight = this._conf.height - 0;

        var target = null;
        
        if( !this._view.target ){
            
            target = this._conf.viewId + "_" + this.iid;            
            d3.select( this._view.anchor )
                .append( "div" )
                .attr( "id", target );            
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

        var C = this._conf;
        var V = this._view;
        var D = this._data;
        
        D.msaMap = [];
        D.seqRng = [];
        D.msaRMap = [];  // seq -> msa pos (one for each seqence) 

        D.rngSeg = [];
                        
        for( var i=0; i <  D.msaSeq.length; i++ ){
            D.msaRMap.push( {} );
            D.msaMap.push( [] );

            var cbe = { beg:[], end:[] };
            D.rngSeg.push( cbe );

            for( var j=0; j < D.msaSeq[i].length; j ++ ){
                var seq = D.msaSeq[i];
                if( seq[j] != '-' ){
                    if( j == 0){
                        cbe.beg.push( j );
                        continue;
                    }
                    if( seq[j-1] == '-'){
                        cbe.beg.push( j );
                        continue;
                    }
                    if( j == seq.length-1 ){
                        cbe.end.push(j);
                        continue;
                    }
                    if( seq[j+1] == '-'){
                        cbe.end.push(j);
                        continue;
                    }
                    continue;
                }
            }
               
            D.seqRng.push( {"min":-1,"max":-1} );
            
            var cp = 0;
            for( var j=0; j < D.msaSeq[i].length; j ++ ){
                if( "ACDEFGHIKLMNPQRSTVWY".includes(D.msaSeq[i][j])){
                    cp +=1;
                    this._data.msaRMap[i][cp] = j;

                    if(D.seqRng[D.seqRng.length-1]["min"]<0){
                        D.seqRng[D.seqRng.length-1]["min"]=j;
                    }
                    D.seqRng[D.seqRng.length-1]["max"]=j;
                }
                
                if( cp >0 ){
                    D.msaMap[i].push( cp );
                } else {
                    D.msaMap[i].push( "" );
                }
            }
        }

        // offsets
        
        V.offsetY = 10;
        if( C.navig ) V.offsetY += 30;
        if( C.slogo ) V.offsetY += 50;
        V.offsetDtrY = V.offsetY
            + C.msaDY*(this._data.msaHead.length + 0.25);

        // brushLimit         
        // assumes msa already loaded

        this._data.msaRange = [0, this._data.msaSeq[0].length];

        V.msaScale = d3.scaleLinear()  //  1 -> 1
            .domain( this._data.msaRange )
            .range([0, this._data.msaSeq[0].length-1]);
        
        V.navScale = d3.scaleLinear()  //  100 ->  pixelWidth
            .domain([0, 100])
            .range([0, V.navWidth]);
        
        V.nav2msaScale = d3.scaleLinear()  // 100 -> maxAA
            .domain([0, 100])
            .range( this._data.msaRange );        
        
        if( C.navig ){
            this._navGUI();
        }
        
        for( var t in C.tlist ){
            if( C.tlist[t] == 'slogo' ){
                this.slogoView();
            } else if( C.tlist[t] == 'msa' ){
                this.renderMSA();
            } else if (C.tlist[t] == 'dtrac' ){
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
                
                msa._view.displaystart
                    = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend
                    = msa._view.brushRight / msa._view.navWidth*100;
                
                msa.updatePolygon( msa._view.brushLeft / msa._view.navWidth*100,
                                   msa._view.brushRight / msa._view.navWidth*100);
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log("leftCB: DONE");                               
            }
        }
        
        var _left = this.navButton(this._view.svg,
                                   this._view.target + "_left",
                                   5, 13, 20, 20, "<", "16px")
            .on( "click", _leftCB(this) );
        
        var _plusCB = function( msa ){
            return function( event ){
                console.log("plusCB!!!");

                var V = msa._view;
                
                var center = (V.brushLeft + V.brushRight)/2;
                var delta = 0.75 * (V.brushRight - V.brushLeft)/2;
                msa.setNavBrush( center-delta, center+delta);                
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight]);
                
                msa._view.displaystart
                    = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend
                    = msa._view.brushRight / msa._view.navWidth*100;
                
                msa.updatePolygon( msa._view.brushLeft / msa._view.navWidth*100,
                                   msa._view.brushRight / msa._view.navWidth*100);
                                   
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log("plusCB: DONE");
            }
        }

        var _plus = this.navButton(this._view.svg,
                                   this._view.target + "_plus",
                                   27, 13, 20, 20, "+", "16px")
            .on( "click", _plusCB(this) );
        
        var _minusCB = function( msa ){
            return function( event ){
                console.log("minusCB!!!");

                var V = msa._view;
                
                var center = (V.brushLeft + V.brushRight)/2;
                var delta = 1.5 * (V.brushRight - V.brushLeft)/2;
                msa.setNavBrush( center-delta, center+delta);                
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight]);
                
                msa._view.displaystart
                    = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend
                    = msa._view.brushRight / msa._view.navWidth*100;
                
                msa.updatePolygon(msa._view.brushLeft / msa._view.navWidth*100,
                                  msa._view.brushRight / msa._view.navWidth*100);
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log("minusCB: DONE");
            }
        }
        
        var _minus = this.navButton(this._view.svg,
                                    this._view.target + "_minus",
                                    50, 13, 20, 20, "-", "16px", -1 )
            .on( "click", _minusCB(this) );

        var _rightCB = function( msa ){
            return function( event ){
                console.log("rightCB!!!");    
                var V = msa._view;
                msa.setNavBrush( V.brushRight,
                                 2*V.brushRight-V.brushLeft);                
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight]);

                msa._view.displaystart
                    = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend
                    = msa._view.brushRight / msa._view.navWidth*100;

                msa.updatePolygon(msa._view.brushLeft / msa._view.navWidth*100,
                                  msa._view.brushRight / msa._view.navWidth*100);
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                console.log( "rightCB: DONE" ); 
            }
        }
        
        var _right = this.navButton(this._view.svg,
                                    this._view.target + "_right",
                                    73, 13, 20, 20, ">", "16px")
            .on( "click", _rightCB( this ) );
         
        var _selectedCB = function( msa ){ 
            return function( event ){

                msa.setSelectView();
                console.log("selectedCB: done");
            }            
        }
        
        var _selected =  this.navButton(this._view.svg,
                                      this._view.target + "_selected",
                                        98, 13, 64, 20,"Selected", "14px")
            .on( "click", _selectedCB( this ) );

        var _fullCB = function( msa ){
            return function( event ){
                console.log("fullCB!!!");
                
                var V = msa._view;
                
                msa.setNavBrush( 0, V.navWidth);         
                V.navBrushG.call( V.viewport.move,
                                  [V.brushLeft, V.brushRight])                
                
                msa._view.displaystart
                    = msa._view.brushLeft / msa._view.navWidth*100;
                msa._view.displayend
                    = msa._view.brushRight / msa._view.navWidth*100;

                msa.updatePolygon(msa._view.brushLeft / msa._view.navWidth*100,
                                  msa._view.brushRight / msa._view.navWidth*100);
                msa.updateMSA();              
                msa.updateSelect();                
                msa.getViewportParams();
                msa.updateRange();
                console.log("fullCB: done");
            }            
        }
        
        var _full =  this.navButton(this._view.svg,
                                    this._view.target + "_full",
                                    this._view.svgWidth-40, 13, 32, 20, "Full", "14px")
            .on( "click", _fullCB( this ) );
        
        var _navG = this._view.svg.append("g")
            .attr( "id", this._view.target + "_nav" )
            .attr( "transform", "translate(172, 10)" );
        
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

                console.log("_brushCB called:", event.selection);

                //var dstart = event.selection[0];
                //if(dstart < 0) dstart = 0;
                //if(dstart > 100) dstart = 100;

                //var dend= event.selection[0];
                //if(dend < 0) dend = 0;
                //if(dend > 100) dend = 100;
                                
                // set V.brushLeft/V.brushRight 
                msa.setNavBrush( event.selection[0],event.selection[1] ); 

                // get aaStep
                //-----------
                
                var V = msa._view;
                var C = msa._conf;
                var D = msa._data;
                
                var brLeft = V.brushLeft;   // not modified, msaW units
                var brRight = V.brushRight; 
                var brWdth = brRight-brLeft;
                
                // max coverage (fract)

                var fr_cover_max = 1;  

                // min coverage (fract)
                var fr_cover_min = V.navWidth/C.aaMaxStep/D.msaSeq[0].length;                            
                              
                var fr_aaa = (fr_cover_max -fr_cover_min)/(V.navWidth-C.brushLimit);
                var fr_bbb = fr_cover_max - fr_aaa * V.navWidth;

                V.fr_alpha= fr_aaa;
                V.fr_beta = fr_bbb;
        
                V.fr_cover = fr_bbb + fr_aaa * brWdth;
                V.aaStep = V.navWidth/V.fr_cover/D.msaSeq[0].length;

                console.debug( "V.fr_alpha",V.fr_alpha,"V.fr_beta",V.fr_beta,
                             "V.navWidth/V.aaStep=",V.navWidth/V.aaStep,
                             "brwdth=", brWdth,"V.fr_cover=",V.fr_cover, "fr_cover_min=",fr_cover_min );
                
                var brCntr_raw = (brLeft+brRight)/2;
                var fr_brCntr_raw = (brLeft+brRight)/2/V.navWidth; //*D.msaSeq[0].length;
                var aa_brCntr_raw = (brLeft+brRight)/2/V.navWidth*D.msaSeq[0].length;

                var brCntr_alpha = 1/( V.navWidth - C.brushLimit );
                var brCntr_beta = -0.5 * C.brushLimit * brCntr_alpha; 

                var fr_brCntr = (brCntr_alpha * brCntr_raw + brCntr_beta);
                var aa_brCntr = (brCntr_alpha * brCntr_raw + brCntr_beta)*D.msaSeq[0].length;

                console.debug("fr_brCntr_raw=",fr_brCntr_raw,"fr_brCntr=",fr_brCntr);
                
                V.displaystart = (aa_brCntr - 0.5 *  V.navWidth/V.aaStep)/D.msaSeq[0].length * 100;
                V.displayend = (aa_brCntr + 0.5 *  V.navWidth/V.aaStep)/D.msaSeq[0].length * 100;
                
                if( V.displaystart < 0 ){
                    V.displayend = V.displayend - V.displaystart;                    
                    V.displaystart = 0;
                }
                if( V.displayend > 100 ){
                    V.displaystart = V.displaystart - ( V.displayend - 100);
                    V.displayend = 100;
                }
                    
                console.debug("V.displaystart=",V.displaystart,"V.displayend=",V.displayend,"delta=",V.displayend-V.displaystart);
                
                console.debug("brush disp(for poly):", msa._view.displaystart, msa._view.displayend);
                msa.updatePolygon( msa._view.brushLeft / msa._view.navWidth*100,
                                   msa._view.brushRight / msa._view.navWidth*100);
                msa.updateMSA();  // calls msa.getViewportParams();
                msa.updateDtracDoms();
                msa.updateSelect();                
                // msa.getViewportParams();
                msa.updateRange();
            }
        }
        
        this._view.viewport = d3.brushX()
            .handleSize(6)
            .extent([ [0, 0], [this._view.svgWidth, 10] ])
            .on( "brush", _brushCB(this) );
        
        this._view.navBrushG = _navG.append("g")
            .attr( "class", "brush")
            .call( this._view.viewport);
        
        this._view.navBrushG.call( this._view.viewport.move,
                                   [ 0, this._view._brl ] );
        
        this._view.polygon = _navG.append("polygon")
            .attr('class', 'zoom-polygon')
            .attr('fill', '#777')
            .attr('fill-opacity','0.3');
        
        this.updatePolygon( this._view.brushLeft / this._view.navWidth*100,
                            this._view.brushRight / this._view.navWidth*100);
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
            this._view.msaMin
                .push(1);
            this._view.msaMax
                .push(this._data.msaMap[i][this._data.msaSeq[i].length-1]);
        }
        
        var _seqMSA = this._view.svg.append("g")
            .attr( "id", this._view.target + "_seq" )
            .attr("transform", "translate(0, " + ( this._view.offsetY) + ")");        

        _seqMSA.append("clipPath")
            .attr("id", this._view.target + "_seq_clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -6)
            .attr("width", this._view.navWidth) // TODO
            .attr("height", this._conf.msaDY*(this._data.msaHead.length+1));
        
        var _seqMSA_head = _seqMSA.append("g")
            .attr( "id", this._view.target + "_seq_head" );
        
        var _seqMSA_port = _seqMSA.append("g")
            .attr( "id", this._view.target + "_seq_port" )
            .attr("clip-path", "url(#"+ this._view.target + "_seq_clip)" )
            .attr("transform", "translate( 172, 0)");
        
        var _seqMSA_view = _seqMSA_port.append("g")
            .attr( "id", this._view.target + "_seq_view" );
        
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

        var C = this._conf;
        var V = this._view;
        var D = this._data;
        V.msaPos = [];     // one per aa
        V.msaPosOld = [];  
        V.rectPos = [];
        V.rectPosOld = [];

        var dy = 20; 
        
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
                .attr("transform", "translate(5, " + (i+1)*C.msaDY + ")");

            var _seqHG = _seqG
                .append("g")
                .attr( "id", V.target + "_seq_head_" + i.toString() );

            var label = D.msaHead[i][1];
            var popup = "";

            if( C.header == undefined ){  
            
                if( D.msaHead[i][0] != label ){
                    label += "(" + D.msaHead[i][0] + ")";
                }

                if( D.msaHead[i].length > 2 ){ 
                    for( var l = 2; l < D.msaHead[i].length; l ++ ){
                        popup += D.msaHead[i][l] + "/";
                    }
                }
                
                if( popup.length > 2 ){
                    popup = popup.substring(0,popup.length-1);
                } else {
                    popup = "";
                }
            } else {
                label = D.msaHead[i][ C.header.label[0] ];
                if( C.header.label.length > 1 ){
                    for( var l= 1; l < C.header.label.length; l++ ){
                        label += "/" + D.msaHead[i][ C.header.label[l] ];
                    }
                }
                if( C.header.popup.length > 0 ){
                    popup = D.msaHead[i][ C.header.popup[0] ];
                    if( C.header.popup.length > 1 ){
                        for( var l= 1; l < C.header.label.length; l++ ){
                            label += "/" + C.header.label[l];
                        }
                        label =+ ")";
                    }
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

            var _seqSG = d3.select("g[id='"+ V.target + "_seq_view']")
                .append("g")
                .attr( "id", ssid + i.toString() )
                .attr( "transform", "translate( 0, "+ (i+1)*C.msaDY + ")" );

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
                .attr( "x", 165)
                .attr( "y", 0 )
                .style( "font", C.headFont)
                .style( "fill", "grey")
                .attr( "text-anchor", "end")
                .text( V.msaMin[i] );
            
            d3.select( "#" + shid + i.toString() )
                .append("text")
                .attr( "class", "msa-max")
                .attr( "x", 177 + V.navWidth)
                .attr( "y", 0 )
                .style( "font", C.headFont)
                .style( "fill", "grey")
                .attr( "text-anchor", "start")
                .text( V.msaMax[i] );       
        }                
    }   

    updateHeadMSA(){

        this._view.msaPosOld = this._view.msaPos;
        this._view.rectPosOld = this._view.rectPos;
        this._view.aaStepOld = this._view.aaStep;

        // one per sequence
        this._view.msaMin = new Array(this._data.msaHead.length);  
        this._view.msaMax = new Array(this._data.msaHead.length);  

        // one per aa
        this._view.msaPos = new Array(this._data.msaSeq[0].length);     
        this._view.rectPos = new Array(this._data.msaSeq[0].length);

        var jmin= parseInt(this._view.aaOffset/this._view.aaStep + 1/2);
        var jmax= parseInt((this._view.navWidth+this._view.aaOffset)/this._view.aaStep - 1/2);

        if( jmin < 0 ) jmin = 0;
        //if( jmax >= this._data.msaSeq[0].length ) jmax = this._data.msaMap[i].length-1;
        if( jmax >= this._data.msaSeq[0].length ) jmax = this._data.msaSeq[0].length-1;

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

        var C = this._conf;
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
                        .attr( "y", C.msaBoxYOff )
                        .attr( "width", V.aaStepOld )
                        .attr( "height", C.msaBoxY )
                        .attr( "class", "msa-rect")
                        .style( "fill", C._palette1[ aa ] )
                        .attr( "fill-opacity", V.aaStep > 16 ? 0.5 : 1 )                        
                        .append("title").text(aa + (D.msaMap[j][i]));
                    
                    // letter 
                    
                    d3.select( "#" + V.target + "_seq_seq_" + j.toString() +"aa")
                        .append( "text" )
                        .attr( "class", "msa-aa" )
                        .style( "font", C.msaFont)  
                        .style( "fill", C._palette2[ aa ] )
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
        
        var C = this._conf;
        var V = this._view;
        var D = this._data;

        console.log( "updateAA" );
        
        //V.msaNewFrame = {"min":jmin,
        //                     "max":jmax,
        //                     "msaMin": D3MSA3.msaMin,
        //                     "msaMax": D3MSA3.msaMax,
        //                     "msaPos": frMsaPos,
        //                     "rectPos": frRectPos
        //                    };

        for( var i = 0; i < D.msaHead.length; i++ ){        
            d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"bk ")  // box
                .attr( "style", "visibility: visible;" );
            d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"aa ") // letter 
                .attr( "style", "visibility: visible;" ); 
        }
        
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
                
                var cur = (j >= V.msaNewFrame.min &&
                           j <= V.msaNewFrame.max) ? true : false;
                var old = (j >= oonmin && j <= oonmax) ? true : false;
                
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
                                .attr( "y", C.msaBoxYOff )
                                .attr( "width", V.aaStepOld )
                                .attr( "height", C.msaBoxY )
                                .attr( "class", "msa-rect")
                                .style( "fill", C._palette1[ aa ] )
                                .attr( "fill-opacity", V.aaStep > 16 ? 0.5:1 )
                                .append("title").text(aa+(D.msaMap[i][j+joff]));
                            
                            d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"aa") // letter 
                                .append( "text" )
                                .attr( "class", "msa-aa" )
                                .style( "font", C.msaFont)  
                                .style( "fill", C._palette2[ aa ] )
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

    hideAA(){
        console.log( "hideAA" );
        
        var C = this._conf;
        var V = this._view;
        var D = this._data;
        
        for( var i = 0; i < D.msaHead.length; i++ ){
            // over sequences
            
            d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"bk")  // box
                .attr( "style", "visibility: hidden;" );
            d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"aa") // letter 
                .attr( "style", "visibility: hidden;" ); 
        }
    }
        
    renderRange(){
        
        var C = this._conf;
        var V = this._view;
        var D = this._data;

        var range = D.rngSeg;

        var opq = Math.min( 1, 1 - V.aaStep**1.5
                            / (C.aaMaxStep - V.aaStep*0.99)**2);
        
        for( var i = 0; i <range.length; i++ ){
            var s = "#" + V.target +"_seq_seq_" + i.toString() +"rn";
            d3.selectAll( s + " .bkd-msa-range" ).remove();
            
            for( var j = 0; j <range[i].beg.length; j++ ){
                var bPos =  range[i].beg[j] * V.aaStep - V.aaOffset;
                var ePos =  range[i].end[j] * V.aaStep - V.aaOffset;
                
                var r = d3.select( s )
                    .append( "rect" )
                    .attr( "class", "bkd-msa-range")
                    .style( "fill", "#D3D3D3" )
                    .attr( "x", bPos )
                    .attr( "y", C.msaBoxYOff )
                    .attr( "width", ePos - bPos + V.aaStep)
                    .attr( "height", C.msaBoxY );
            }
            if( opq > 0 ){
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() +"rn")
                    .attr( "fill-opacity", opq )
                    .style("visibility", "visible");
            } else {
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn") //  .bkd-msa-range")
                    .attr( "fill-opacity", 0)
                    .style("visibility", "hidden");
            }
        }        
    }
    
    updateRange(){

        var V = this._view;
        var D = this._data;
        var C = this._conf;

        var range = D.rngSeg;
        
        var opq = Math.min( 1, 1 - V.aaStep**1.5
                            / (C.aaMaxStep - V.aaStep*0.99)**2);

        for( var i = 0; i <range.length; i++ ){
            for( var j = 0; j <range[i].beg.length; j++ ){
                var bPos =  range[i].beg[j] * V.aaStep - V.aaOffset;
                var ePos =  range[i].end[j] * V.aaStep - V.aaOffset;
                
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn")
                    .attr( "x", bPos )                   
                    .attr( "width", ePos - bPos + V.aaStep );
            }
            
            if( opq > 0 ){
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn")
                    .attr( "fill-opacity", opq)
                    .style("visibility", "visible");                
            } else {
                d3.select( "#" + V.target + "_seq_seq_" + i.toString() + "rn")
                    .attr( "fill-opacity", 0)
                    .style("visibility", "hidden");
            }                
        }
    }
    
    renderDtrac(){

        var C = this._conf;
        var V = this._view;
        
        var _dtrMSA = this._view.svg.append("g").attr( "id", V.target + "_dtr" )
            .attr("transform", "translate(0, " + ( V.offsetDtrY) + ")");        
        _dtrMSA.append( "clipPath" )
            .attr("id", V.target + "_dtr_clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -6)
            .attr("width", V.navWidth) // TODO
            .attr("height", C.msaDY*(this._data.dtrac.length+1));
        
        var _dtrMSA_head = _dtrMSA.append("g").attr( "id", V.target + "_dtr_head" );
        
        var _dtrMSA_port = _dtrMSA.append("g").attr( "id", V.target + "_dtr_port" )
            .attr("clip-path", "url(#"+ V.target + "_dtr_clip)" )
            .attr("transform", "translate(100, 0)");
        
        var _dtrMSA_view
            = _dtrMSA_port.append("g").attr( "id", V.target + "_dtr_view" );
        
        this.renderDtracHead();
        this.renderDtracDoms();
    }
    
    renderDtracHead(){ 
        
        var C = this._conf;
        var V = this._view;
        var D = this._data;

        for( var t of D.dtrac ){           
            var name = t.name;
        }
        
        var sid = V.target + "_dtr_";
        var ssid = V.target + "_dtr_dom_";
        var shid = V.target + "_dtr_head_";
        
        for( var i = 0; i < D.dtrac.length; i++ ){         
            var _seqG = d3.select("g[id='" + V.target + "_dtr_head']")
                .append("g")
                .attr( "id", sid + i.toString() )
                .attr("transform", "translate(95, " + (i+1)*C.msaDY + ")");

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
                .attr( "transform", "translate( 0, "+ (i+1)*C.msaDY + ")" );

            d3.select("#"+ ssid + i.toString() )
                .append("g")
                .attr( "id", ssid + i.toString() );

        }
    }
    
    renderDtracDoms(){

        var C = this._conf;
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
                    .attr( "y", C.dtracBoxYOff)
                    .attr( "width", ( (pend - pbeg) + V.aaStep ) )
                    .attr( "height", C.dtracBoxY );

                if( dpos[d].name != undefined){
                    if( dpos[d].name.length >0 ){
                        r.append("title").text(dpos[d].name);                     
                    }
                }
            }
        }
    }

    updateDtracDoms(){
        var C = this._conf;
        var V = this._view;
        var D = this._data;

        if( D.dtrac == undefined) return;
        
        for( var t=0; t < D.dtrac.length; t++ ){
            var ctrac = D.dtrac[t]; 
            var name = ctrac.name;
            var dpos = ctrac.dpos;
            
            for( var d=0; d < dpos.length; d++ ){
                
                var pbeg = (dpos[d].beg - 1) * V.aaStep - V.aaOffset;
                var pend = (dpos[d].end - 1) * V.aaStep - V.aaOffset;
                
                d3.select( "#" + V.target + "_dtr_dom_" + t.toString() +" " +
                           "rect[d='"+(d)+"']" )
                    .attr( "x", pbeg )
                    .attr( "width", (pend-pbeg) + V.aaStep );                    
            } 
        }
    }
    
    getViewportParams(){ 
        var V = this._view;
        var D = this._data;
        var C = this._conf;

        var msaMap = D.msaMap[0];  

        var msaW = V.navWidth;

        var brLeft = V.brushLeft;   // not modified, msaW units
        var brRight = V.brushRight; 

        var brCntr = (brLeft+brRight)/2;   
        var brWdth = brRight-brLeft;

        var aaMax = msaW/D.msaSeq[0].length;
        var aaMin = C.aaMaxStep;

        var brMax = msaW;
        //var brMin = C.brushLimit;
        var brMin = V._brl;

        // max coverage (fract)
        var fr_cover_max = 1;

        //var fr_cover_min = V.navWidth/C.aaMaxStep/D.msaSeq[0].length;  // min coverage (fract)

        // min coverage (fract)
        var fr_cover_min = V.navWidth/C.aaMaxStep/D.msaSeq[0].length;
                                            
        var fr_aaa = (fr_cover_max -fr_cover_min)/(V.navWidth-C.brushLimit);
        var fr_bbb = fr_cover_max - fr_aaa * V.navWidth;

        V.fr_alpha= fr_aaa;
        V.fr_beta = fr_bbb;
        
        V.fr_cover = fr_bbb + fr_aaa * brWdth;
        V.aaStep = V.navWidth/V.fr_cover/D.msaSeq[0].length;
        
        console.debug( "V.fr_alpha",V.fr_alpha,"V.fr_beta",V.fr_beta,"brwdth=", brWdth,"V.fr_cover=",V.fr_cover, "fr_cover_min=",fr_cover_min );
        console.debug( "V.displaystart=", V.displaystart, "V.displayend=",V.displayend);
        
        console.debug("br_center[fr]:", (V.displaystart + V.displayend)/2);
        console.debug("br_center[aa]:", (V.displaystart + V.displayend)/200*D.msaSeq[0].length);

        var aa_ctr=  (V.displaystart + V.displayend)/2*D.msaSeq[0].length/100;

        V.aaOffset =  V.aaStep * aa_ctr - msaW/2;

        console.debug( "V.fr_alpha=",V.fr_alpha," V.fr_beta=",V.fr_beta, "brWdth=",brWdth,"aaStep=",V.aaStep);
        console.debug( "V.aaOffset=",aa_ctr, V.aaStep*aa_ctr, V.aaOffset, V.aaStep*aa_ctr-V.aaOffset );
        
        V.msaOpa = 0.5;
        if( V.aaStep <= 16 ){
            V.msaOpa = 0.5 + 0.5* (16-V.aaStep)/16;
        }        
    }
    
    dropAllSelect(){
        console.log("dropAllSelect:", "#" + this._view.target + "_seq_view_select");
        d3.select( "#" + this._view.target + "_seq_view_select").remove();
        d3.select( "#" + this._view.target + "_seq_view" )
            .append( "g" )
            .attr("id", this._view.target + "_seq_view_select");
        this._view.select = {};
    }

    setSelectMap( smap, rseq ){
        for( var pc of this._view.select ){ // go over existing elements
            if( pc in Object.keys(smap) ){ // no selection change, remove from smap                
                smap.delete( pc );                 
            } else { // drop selection
                this._view.select[pc].remove(); // drop rectangle
                delete this._view.select[pc];  // drop from map   
            }
        }
        
        for( var pc of Object.keys(smap) ){
            var pcl = pc.split(":");
            this._view.select[pc] =
                this.addSelect( Number(pcl[0]), pcl[1], smap[pc].name, rseq);            
        }
    }

    setSelectList( slist, rseq, rcol, cseq, ccol, poi ){
        // slist = [pos:color,pos:color,...]
        // rseq = sequence name
        // rcol = name column (in msaHeader)

        // cseq = canonocal sequence name
        // ccol = canonical name column (in msaHeader)

        // position of interest (or null)
        
        console.debug("setSelectList:",slist, rseq, rcol,  );
        var sindex = 0;
        var cindex = 0;

        if( this._data.msaHead  == undefined) return;

        console.debug("setSelectList: msaHead", this._data.msaHead);

        if( cseq !== undefined && ccol !== undefined ){
            for( var i =0; i < this._data.msaHead.length; i++){
                if(this._data.msaHead[i][ccol] == cseq){
                    cindex = i;
                    break;
                }
            }
        }
        
        for( var i =0; i < this._data.msaHead.length; i++){
            if( this._data.msaHead[i][rcol] == rseq ){
                sindex = i;
                break;
            }
        }
        
        this._view.sindex = sindex;
        console.debug("setSelectList:",sindex, this._data.msaHead[sindex][rcol]);
        
        var smap = this._data.msaMap[ sindex ]; //         
        
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

        var clist = [];
        
        for( var i = 0 ; i < slist.length; i++){
            var pcl = slist[i].split(":");
            this._view.select[ slist[i] ]
                = this.addSelect( Number(pcl[0]), pcl[1], pcl[0], sindex );

            if( cseq !== undefined && ccol != undefined ){
            
                var msapos =  this._data.msaRMap[sindex][Number(pcl[0])];
                var canpos = this._data.msaMap[0][msapos];

                console.debug("msapos",msapos,"canpos",canpos);
                clist.push(canpos+":"+pcl[1]);
            }
        }

        console.debug("this.updateRange called");
        this.renderRange();
        console.debug("this.updateRange done");
        
        return clist;
        
    }
    
    updateSelect(){
        var sindex = this._view.sindex;
        for( var k in this._view.select ){
            var kl = k.split(":");
            console.log(kl);
            var mp = this._data.msaRMap[sindex][ Number( kl[0] ) ];
            var pos = mp * this._view.aaStep - this._view.aaOffset;
            
            this._view.select[k]
                .attr( "x", pos)
                .attr( "width", this._view.aaStep );                        
        }

        this.updatePOI();
        
    }
    
    addSelect( pos, color, name, sindex ){

        var C = this._conf;
        var D = this._data;
        var V = this._view;
        
        var mp = D.msaRMap[sindex][pos];
        var x = mp * V.aaStep - V.aaOffset;
        console.log( "#" + this._view.target + "_seq_view_select" )
        var rect =  d3.select( "#" + this._view.target + "_seq_view_select" )
            .append( "rect" )
            .style( "fill", color )
            .style( "fill-opacity", 0.25)
            .style( "stroke", color )
            .attr( "x", x )
            .attr( "y", 0 )
            .attr( "width", V.aaStep )
            .attr( "height", C.msaDY*(D.msaSeq.length + 0.5) )
            .attr( "class", "msa-select");
        
            rect.append("title").text( name );       
        return rect;
    }


    updatePOI(){
        var sindex = this._view.sindex;
        for( var k in this._view.poi.pos ){
            var p = this._view.poi.pos[k];
            var rpoi = p.rect;
            var ppoi = p.sqpos;
            var spoi = p.spoi;
            
            var mp = this._data.msaRMap[spoi][ Number( ppoi ) ];
            var pos = mp * this._view.aaStep - this._view.aaOffset;
            
            //this._view.select[k]
            rpoi.attr( "x", pos)
                .attr( "width", this._view.aaStep );                        
        }
    }

    setPOI( poi ){

        console.log( "setPOI", poi );

        var C = this._conf;
        var D = this._data;
        var V = this._view;

        var sindex = 0;

        var poi_view = d3.select( "#" + this._view.target + "_seq_view_poi");
        
        if(  poi_view.node() == null ){
            console.log("POI: null")
            poi_view = d3.select( "#" + this._view.target + "_seq_view" )
                .append( "g" )
                .attr("id", this._view.target + "_seq_view_poi");
            this._view.poi.elem  = poi_view;
        } else {
            console.log("POI:", poi_view.node());
        }
        
        // drop current poi
        
        d3.select( "#" + this._view.target + "_seq_view_poi .msa-poi").remove();
        V.poi.pos= [];
        
        for( var i =0; i < poi.pos.length; i++){
            
            var mp = D.msaRMap[ sindex ][ poi.pos[i] ];  
            
            var x = mp * V.aaStep - V.aaOffset;

            console.log( "poi.pos:", i, poi.pos[i], mp, x,
                         "#" + this._view.target + "_seq_view_poi" );
            
            var rect =  d3.select( "#" + this._view.target + "_seq_view_poi" )
                .append( "rect" )
                .style( "fill", poi.color )
                .style( "fill-opacity", 0.25)
                .style( "stroke", poi.color )
                .attr( "x", x )
                .attr( "y", 0 )
                .attr( "width", V.aaStep )
                .attr( "height", C.msaDY*(D.msaSeq.length + 0.5) )
                .attr( "class", "msa-poi");
            console.log(rect);

            V.poi.pos.push({ rect:rect, sqpos: poi.pos[i], spoi: sindex } );
            rect.append("title").text( poi.pos[i] );       
        }
    }


    getMsaPos(sindex,pos){
        var msaMap = this._data.msaMap[sindex];  // msaMap[msa]=seq
        var lb = 0;
        var ub = msaMap.length-1;
        var ls = msaMap[0];
        var us = msaMap[msaMap.length-1];
        var tp = 0;
        var ts = 0;
        console.log("start:",lb,ls,":",tp,ts,":",ub,us);
        var n = 12;
        while( us  - ls > 2 && n > 0 ){
            n -= 1;
            tp = Math.floor((lb+ub)/2);
            ts = msaMap[tp];
            
            if( ts < pos){
                lb = tp
                ls = ts;
            } 
            if(ts > pos){
                ub = tp;
                us = ts;
            }
            if( us == ls ){
                console.log("==",lb,ls,":",tp,ts,":",ub,us,"::",tp);
                return tp;
            }
        }
        console.log("--",lb,ls,":",tp,ts,":",ub,us,"::",Math.floor((ub+lb)/2) );
        return Math.floor((ub+lb)/2);
    }
    
    setSelectView(){
        var C = this._conf;
        var D = this._data;
        var V = this._view;
        
        console.log("setSelectView");
        console.log( V.select);

        console.log("setSelectView:msaMap[V.sindex]->",D.msaMap[V.sindex]);

        var sel = Object.keys( V.select );

        if( sel.length > 0 ){
        
            var minSel = D.msaSeq[0].length;
            var maxSel = 0;
            for( var k= 0; k < sel.length; k++ ){
                var spos = parseInt(sel[k].split(":")[0]);
                var mpos = this.getMsaPos(0,spos);
                console.log("S->M:", spos,mpos);
                if( mpos < minSel) minSel = mpos;
                if( mpos > maxSel) maxSel = mpos;                    
            }
            console.debug("minSel=",minSel,"maxSel=",maxSel);

            // fractional AA port center (+1/2AA) 

            var aaCntr = (maxSel+minSel + 1)/2/D.msaSeq[0].length;   
            
            var port_pixel_width = V.navWidth;
                        
            var aa_pixel_width = V.navWidth/Math.max( 1, 1.05 *Math.abs(10 + maxSel-minSel) );
            var aaWdth = port_pixel_width/aa_pixel_width/D.msaSeq[0].length;            
            
            if( aa_pixel_width > this._conf.aaMaxStep ){ //if too wide
                aa_pixel_width = this._conf.aaMaxStep;
                aaWdth = port_pixel_width/aa_pixel_width/D.msaSeq[0].length; // corrected fractional AA port width 
            }

            console.debug("port_pixel_width=",port_pixel_width,"aa_pixel_width=",aa_pixel_width,"aaWdth=",aaWdth);
            
            var port_pixel_center = aaCntr*D.msaSeq[0].length*aa_pixel_width;  

            var port_left_aa = aaCntr - aaWdth/2;    // fractional AA pos of left port
            var port_right_aa = aaCntr + aaWdth/2;   // fractional AA pos of right port

            console.debug("port[fr]", port_left_aa, '<->', port_right_aa,
                        aaCntr);
            console.debug("port[px]", port_left_aa*V.navWidth,"<->",port_right_aa*V.navWidth,
                        aaCntr*V.navWidth);
            console.debug("port[aa]", port_left_aa*D.msaSeq[0].length,"<->",port_right_aa*D.msaSeq[0].length,
                        aaCntr*D.msaSeq[0].length);
            
            // get brush position for port edges : FIX ME !!!
            //-----------------------------------------------
            
            var br_pixel_width = (aaWdth-V.fr_beta)/V.fr_alpha;
             
            //var br_left_pixel  = aaCntr*port_pixel_width - br_pixel_width/2; 
            //var br_right_pixel = aaCntr*port_pixel_width + br_pixel_width/2;


            var brCntr_alpha = 1/( V.navWidth - C.brushLimit );
            var brCntr_beta = -0.5 * C.brushLimit * brCntr_alpha; 


            var br_left_pixel  = ( port_left_aa - brCntr_beta )/brCntr_alpha; 
            var br_right_pixel  = ( port_right_aa - brCntr_beta )/brCntr_alpha; 


            
            console.debug( "brush[px]", aa_pixel_width, br_pixel_width, ":", br_left_pixel,"<->",br_right_pixel);           
            console.debug( "SSS(+):",minSel, maxSel, ":",
                           aaCntr,aaWdth,this._view._brl,":",V.brushLeft,V.brushRight);

            if( (maxSel-minSel) < V.navWidth/this._conf.aaMaxStep ){  // AAs too wide
                aaWdth = V.navWidth/this._conf.aaMaxStep;                                 
                console.debug("SSS(adjust aaWdth): aa=", aaWdth);
            }
            
            console.debug("SSS(+):",minSel, maxSel, aaCntr,aaWdth, V.brushLeft,V.brushRight);            
            this.setNavBrush( br_left_pixel,br_right_pixel);                        
            console.debug("SSS(+):",minSel, maxSel, aaCntr,aaWdth, V.brushLeft,V.brushRight);
            
        } else {
            console.debug("SSS(-):",V.brushLeft,V.brushRight);
            this.setNavBrush( 0, V.navWidth);
            console.debug("SSS(-):",V.brushLeft,V.brushRight);
        }

        //alert("**");
        
        V.navBrushG.call( V.viewport.move,
                          [V.brushLeft, V.brushRight])                

        //alert("***");
        
        console.debug("dips start/stop",V.displaystart, V.displayend);        
        console.debug( "setSelectView: done" );
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

        // 
        
        if( right - left <  this._view._brl ){
            console.log("@@@", left, right, right - left,  this._view._brl);
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
            console.log("@@@", brushLeft,brushRight);
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

    updatePolygon(dstart,dend){
        var max = this._view.nawWidth;

        if(dstart < 0) dstart = 0;
        if(dstart > 100) dstart = 100;
        if(dend < 0) dend = 0;
        if(dend > 100) dend = 100;
        
        if (this._view.polygon)
            this._view.polygon.attr(
                "points",
                `${this._view.navScale(dstart)},10
                 ${this._view.navScale(dend)},10
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
            this.hideAA();
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
            this.updateRange();
            this._view.rngOn = false;
        }        
    }

    navButton( parent, id, x, y, dx, dy, char, csize, choffset ){
        
        if( choffset == undefined) choffset = 0;          
        
        var _button = parent.append("g").attr( "id", id )
            .attr( "transform", "translate(" + (x) +"," + (y) + ")" );
        _button.append("rect")
            .attr("width",dx)
            .attr("height",dy)
            .style( "stroke", "black")
            .style( "stroke-width", "0.5px")
            .attr("fill","#ccc");
        _button.append("text")
            .style( "font-size", csize )
            .style( "font-family", "Arial")
            .attr( "text-anchor", "middle")
            .attr("x", dx/2 ).attr("y", 16 + choffset)
            .attr("fill","#000").text(char);
        return _button;
    }
}
