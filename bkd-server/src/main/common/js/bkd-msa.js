console.log("bkd-msa: common");
  
class BkdMSA {
    
    constructor( init ){      
        this.myurl = init.myurl;
        this.dtrac = init.dtrac;
        this.data = {};
        this.data.dtrac = init.dtrac;
        this.loaded = false;
        
        // load remote msa fasta       
        
        $.ajax({ url: this.myurl,
                 beforeSend: function( xhr ){
                     xhr.overrideMimeType("text/plain; charset=x-user-defined");
                 },
                 error: function( xhr, textStatus, errorThrown ){
                     console.log( "ajax error: ", xhr, textStatus, errorThrown );
                 }
                 
               } ).done( this.loadCallback(this) );
    }
    
    loadCallback( self ) {
        return function( data, textStatus, jqXHR ){
            
            var msaHead = [];
            var msaSeq = [];
            console.log( "loadCallback: this -> ", this);
            console.log( "loadCallback: self -> ", self);
            console.debug( "BkdMSA(loadCallback): data -> ", data);
            var lines = data.split('\n');
            
            for( var i=0; i < lines.length; i++ ){
                if( lines[i].startsWith('>') ){
                    var hcols = lines[i].replace(">","").split(";");
                    if(hcols[0]=='pdb') hcols[1]=hcols[4].split(':')[0];  
                    msaHead.push( hcols );
                    msaSeq.push("");
                } else {
                    msaSeq[msaSeq.length-1]+= lines[i];
                }
            }
            self.data.msaHead = msaHead;
            self.data.msaSeq = msaSeq;
            self.data.msaRange = [0, self.data.msaSeq[0].length];
            self.loaded = true;
            self.initMSA();
        }
    }
    
    initMSA(){

        if(  this.loaded == false ){
            console.log( "MSA not loaded", this.myurl );
            return;
        }

       
        // MSA<->seq pos mapping
        //----------------------

        // map sequences to MSA position
        // msaSeq  - msa sequences (with gaps) as strings 
        
        var D = this.data;
        
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
                    D.msaRMap[i][cp] = j;
                    
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

        console.log( "initMSA:",D.msaMap );
        
        // domain/feature position remapping
        //----------------------------------

        // Note: Assumes domain positions correspond
        //       to the position in the first (msaSeq[0]) sequence   
        //       if needed, add seq selection parameter   


        if( this.dtrac !== undefined ){ 
            for( var t=0; t < this.dtrac.length; t++ ){
                console.log("INITMSA:", t, ctrac);

                var ctrac = this.dtrac[t]; 
                var name = ctrac.name;
                var dpos = ctrac.dpos;
                
                for( var d=0; d < dpos.length; d++ ){
                    
                    var cbeg = dpos[d].beg;  // in msaSeq[0]
                    var cend = dpos[d].end;  // in msaSeq[0]
                    
                    console.log("INITMSA: beg,end", cbeg, cend); 
                    dpos[d].beg = this.getMsaPos2( cbeg, 0 );
                    dpos[d].end = this.getMsaPos2( cend, 0 );
                }
            }
        }

        // variability statistics/scores
        //------------------------------
        
        var AA= '-ACDEFGHIKLMNPQRSTVWY';
        
        var dms = D.msaSeq;
        
        D.msaCnt = [];  // AA counts at each position
        D.msaEnt = [];  // entropy at each position

        var tcnt = {};
        
        for( var p = 0; p < dms[0].length; p ++){
            var pcnt = {};

            for( var s in dms ){  // go over sequences
                //console.log("initMSA", s, p, dms[s][p]);
                if( pcnt[ dms[s][p] ] == undefined  ){
                    pcnt[ dms[s][p] ] = 1;
                } else {
                    pcnt[ dms[s][p] ] += 1;
                }
                
                if( tcnt[ dms[s][p] ] == undefined  ){
                    tcnt[ dms[s][p] ] = 1;
                } else {
                    tcnt[ dms[s][p] ] += 1;
                }                
            }
            
            D.msaCnt.push( pcnt );
            
            var ent = 0;
            for( var aa in AA){
                if( pcnt[AA[aa]] != undefined ){ 
                    ent -= pcnt[ AA[aa] ]*Math.log2( pcnt[ AA[aa] ]/dms.length);
                }
            }
            ent = ent/dms.length;            
            D.msaEnt.push(ent);
        }

        // normalize (Gerstein&Altman 1995; PMID: 7643385) ?
        /*
        var rent = 0;
        for(var k in tcnt){
            var rf = tcnt[k]/(dms[0].length*dms.length); 
            rent +=  rf * Math.log(rf);
        }
        
        for(var i=0; i < D.msaEnt.length; i++ ){
            //  D.msaEnt[i] += rent;
        }
        */        
    }

    getIdxByID( id, idType=''){
        var head = this.data.msaHead;
        var idx =0;
        if( idType=='' ){
            for( var h in head ){
                if( head[h][1] == id){
                    idx = h;
                    break;
                }
            }
            return idx;            
        }

        for( var h in head ){
            if( head[h][0] == idType && head[h][1] == id ){
                idx = h;
                break;
            }
        }
        return idx;        
    }

    
    getMsaPos2( pos, ref ){
                
        var msaMap = this.data.msaMap;
        var msal = msaMap[0].length;

        console.log("getMsaPos2:msaMap:", msaMap);
        console.log("getMsaPos2: pos, ref", pos,ref);

        var slimit = 32;
        
        // MSA  position corresponding to pos in ref sequence 

        if( ref == undefined ){  // ref -> pos in MSA
            return pos;
        }
        
        if( pos < msaMap[ref][0]
            || pos > msaMap[ref][msal] ){

            return null;
        }
       
        var pmin = 0;
        var pmax = msaMap[ref].length - 1;

        var pcur = Math.trunc( (pmax - pmin)/2 );
        
        if( pos == msaMap[ref][msal] ) {  // last pos

            var cpos = 0;
            while( pmax - pmin > 1){
                cpos = Math.trunc( (pmin + pmax )/2 );
                
                if( msaMap[ref][cpos] < pos ){
                    pmin = cpos;
                }else{
                    pmax = cpos;
                }
                slimit-=1;
                if( slimit < 0 ){
                    console.log( "(1) pos, ref :: pmin,pmax,cpos: ",
                                 "msaMap[ref][cpos]",
                                 pos, ref, "::", pmin, pmax, cpos,
                                 msaMap[ref][cpos] );
                    break;
                }                
            }            
            cpos +=1;
        } else {
            
            while( pmin < pmax ){
                cpos = Math.trunc( ( pmin + pmax )/2 );

                if( msaMap[ref][cpos] > pos){
                    pmax = cpos;                    
                }else{
                    pmin = cpos;
                }
                
                if( pmax-pmin == 1 && msaMap[ref][cpos] == pos ){
                    break;
                }

                slimit-=1;
                if( slimit < 0 ){
                    console.log( "(2) pos, ref :: pmin,pmax,cpos:",
                                 "msaMap[ref][cpos]",
                                 pos, ref, "::", pmin, pmax, cpos,
                                 msaMap[ref][cpos] );
                    break;
                }
            }
        }
        return cpos;        
    }

    getTgtSeqSelStr( nseq, ntgt=0 ){ 
        var selStr = "";

        var msaMap = this.data.msaMap[ntgt];
        
        // get MSA segments
        
        var segl = this.getMsaSeqSel( nseq );

        // convert msa pos -> nref pos 

        for( var i = 0; i < segl.length; i++){
            var cbeg = msaMap[segl[i][0]]; 
            var cend = msaMap[segl[i][1]]; 
            selStr += " " + cbeg.toString() + "-" + cend.toString() + " or";
        }
        return selStr.substring(0,selStr.length-3);
    }

    getTgtSeqSelStrByID( selID, tgtID ){
        var head = this.data.msaHead;

        var spos = null;
        var tpos = null;
        
        for( var h in head ){
            if( head[h][1] == selID && spos == null) spos = h;
            if( head[h][1] == tgtID && tpos == null) tpos = h;
            if( spos != null && tpos != null) break;
        }

        if( spos == null) spos = 0;
        if( tpos == null) tpos = 0;
        
        return this.getTgtSeqSelStr(spos,tpos);
    }
    
    getMsaSeqSel( nseq=0 ){  // MSA ranges with non-empty nseq
        var segl = [];
        var msaSeq = this.data.msaSeq;
        var msaMap = this.data.msaMap;
        var msal = msaMap[0].length;

        var cbeg = -10;
        var cend = -10;
        var match = false;
        
        for( var p = 0; p < msal; p++){ 
            if( msaSeq[nseq][p] == '-' ){  // gap
                match = false;                    
                if( p == cend + 1){ // end of segment
                    console.debug("segment:", cbeg, "<->", cend );
                    segl.push([cbeg,cend]);
                }
            } else {     // match
                if( match ){    // extend match
                    cend = p;
                } else {        // start new match
                    cbeg = p;
                    cend = p;
                    match = true;
                }                                    
            }
        }
        if( match ){  // finish last segment
            console.debug("segment(last):", cbeg, "<->", cend );
            segl.push([cbeg,cend]);
        }
        return segl;        
    }
    
    getSeqPos( pos, ref ){   
        // sequence positions corresponding to pos in ref sequence 

        console.log("getSeqPos: pos",pos);
        
        var plst = [];
        var msaSeq = this.data.msaSeq;
        var msaMap = this.data.msaMap;
        var msal = msaMap[0].length;
            
        if( ref == undefined ){  // ref -> pos in MSA
            for(var i = 0; i < msaMap.length; i ++){
                if( msaSeq[i][pos] == '-' ){
                    plst.push(0);
                } else {
                    plst.push(msaMap[i][pos]);
                }                             
            }
            return plst;
        }
        
        if( pos < msaMap[ref][0]
            || pos > msaMap[ref][msal] ){

            return null;
        }
       
        var pmin = 0;
        var pmax = msaMap[ref].length - 1;
        var pcur = Math.trunc( (pmax - pmin)/2 );
        
        if( pos == msaMap[ref][msal] ) {  // last pos
            var cnt = 40;
            
            var cpos = 0;
            while( pmax - pmin > 1 && cnt > 0){
                cnt = cnt -1;
                cpos = Math.trunc( (pmin + pmax )/2 );
                console.log(cnt, pos, pmin,pmax,cpos); 
                if( msaMap[ref][cpos] < pos ){
                    pmin = cpos;
                }else{
                    pmax = cpos;
                }
            }            
            cpos +=1;
        } else {
            var cnt = 40;
            while( pmin < pmax && cnt > 0){
                cnt=cnt-1;
                cpos = Math.trunc( ( pmin + pmax )/2 );
                //console.log(cnt, pos, pmin,pmax,cpos);
                if( msaMap[ref][cpos] > pos){
                    pmax = cpos;                    
                }else{
                    pmin = cpos;
                }
                
                if( pmax-pmin == 1 && msaMap[ref][cpos] == pos ){
                    break;
                }                       
            }
        }

        for(var i = 0; i < msaMap.length; i ++){
            if( msaSeq[i][cpos] == '-' ){
                plst.push(0);
            } else {
                plst.push(msaMap[i][cpos]);
            }                             
        }
        return plst;
    }
    
    getEnt(){
        return this.data.msaEnt;
    }
    getVCnt(){
        return this.data.msaCnt;
    }

    getMSA(){
        return this.data.msaSeq;
    }   
}
