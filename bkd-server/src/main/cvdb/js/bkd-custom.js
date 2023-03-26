BKDcustom = {
    handler:{

        report_tgt_edit: function( args ){
            console.log("report_tgt_edit: args ->", args);
            var cid = args.conf.id;
            $(args.anchor)
                .append("<div class='" + args.conf['css-class'] + "'></div>");

            $( args.anchor +" ." + args.conf['css-class'] )
                .append( args.conf.name + ':&nbsp;&nbsp;'
                         + '<select id="'+ cid +'" name="' + cid + '"></select>');

            var tgtns = args.report.target.ns;
            var tgtac = args.report.target.ac;
            
            var myurl ="node?ns="+tgtns+"&ac="+tgtac+"&ret=data&format=json";          
            console.log("myurl", myurl);
            $.ajax( { url: myurl} )
                .done( function(data, textStatus, jqXHR){                  
                    BKDcustom.isoselect( data.node, args.report.target.feature, args) } );
        },
        
        report_tgt_view: function( args ){
            console.log("report_tgt_view: args ->", args);
            var cid = args.conf.id;
            $(args.anchor)
                .append("<div class='" + args.conf['css-class'] + "'></div>");

            $( args.anchor +" ." + args.conf['css-class'] )
                .append( args.conf.name + ':&nbsp;&nbsp;'
                         + '<div id="'+cid+'" style="display: inline-block"></div>');

            var tgtns = args.report.target.ns;
            var tgtac = args.report.target.ac;
            
            var myurl ="node?ns="+tgtns+"&ac="+tgtac+"&ret=data&format=json";          
            console.log("myurl", myurl);
            $.ajax( { url: myurl} )
                .done( function(data, textStatus, jqXHR){                  
                    BKDcustom.isoview( data.node, args.report.target.feature, args) } );
        },

        report_presubmit: function( args ){
            console.log("report_presubmit: args", args);
            //argsreport_target_feature_xrefs_0
            var lastXref = 0;
            for( const  k in args.data ){
                if( k.startsWith('report_target_feature_xrefs_')
                    && k.endsWith('_ac') ){
                    var cur = parseInt( k.replace('report_target_feature_xrefs_','')
                                        .replace('_ac','') );
                    if( cur > lastXref ) lastXref = cur;
                }
            } 
            console.log( "last xref index:", lastXref);

            var nextXref = 'report_target_feature_xrefs_' + (lastXref+1);
            console.log( "next xref:", nextXref);

            var cseq = $( '#report_target_feature_seqid' ).val();
            console.log( 'value:', cseq);

            if( cseq != 'N/A' ){
                BKDrep.postData[nextXref + "_ns"]="upr";
                BKDrep.postData[nextXref + "_ac"]=cseq;
                BKDrep.postData[nextXref + "_tns"]="dxf";
                BKDrep.postData[nextXref + "_tac"]="dxf:0024";
                BKDrep.postData[nextXref + "_tname"]="describes";
            }

        }
    },

    isoview: function( node, feature, args ){

        var cid = '#' + args.conf.id;
        
        // feature: reference sequence
        //----------------------------

        var cval = null;
        
        for( var i=0; i < feature.xref.length; i++){ 
            console.log( "xref:", feature.xref[i] );
            if( feature.xref[i]["type-name"] == "describes"){
                cval = feature.xref[i].ac;
            }
        }


        // node: isoforms
        //---------------
        
        var iseq = [];   // {seq:"", upr:'', canon: false, mane: false, xref:[] }
        var seqVarList = [ 'mane-sequence',
                           'canonical-sequence',
                           'alternate-sequence' ];
        
        for( var i =0; i < node.attr.length;i++ ){
            var catt = node.attr[i];            
            if( seqVarList.includes(catt["type-name"]) ){                 
                var cseq = { upr: '', seq: catt.value, xref:[] };
                    
                cseq.mane = (catt["type-name"] == 'mane-sequence');
                cseq.canon = (catt["type-name"] == 'canonical-sequence');
                if( catt.xref != undefined ){
                    for( var j=0; j< catt.xref.length; j++){
                        cseq.xref.push( catt.xref[j] );
                        if( catt.xref[j].ns =='upr')
                            cseq.upr = catt.xref[j].ac;
                    }
                }
                if( cseq.upr == cval ) break;                
            }
        }
        
        var tag = BKDcustom.xref2inametag( cseq.xref );
        $( cid ).append( tag );
               
    },
    
    isoselect: function( node, feature, args ){

        console.log( "isoselect: args", args ); 
        console.log( "isoselect: node", node ); 
        console.log( "isoselect: feature.xref", feature.xref ); 

        var cid = '#' + args.conf.id;
        
        // feature: reference sequence
        //----------------------------

        var cval = null;
        
        for( var i=0; i < feature.xref.length; i++){ 
            console.log( "xref:", feature.xref[i] );
            if( feature.xref[i]["type-name"] == "describes"){
                cval = feature.xref[i].ac;
            }
        }
        
        // isoforms
        //---------
        
        var iseq = [];   // {seq:"", upr:'', canon: false, mane: false, xref:[] }
        var seqVarList = [ 'mane-sequence',
                           'canonical-sequence',
                           'alternate-sequence' ];
        var maneseq;
        var canonseq;
        
        for( var i =0; i < node.attr.length;i++ ){
            var catt = node.attr[i];            
            if( seqVarList.includes(catt["type-name"]) ){                 
                var cseq = { upr: '', seq: catt.value, xref:[] };
                    
                cseq.mane = (catt["type-name"] == 'mane-sequence');
                cseq.canon = (catt["type-name"] == 'canonical-sequence');
                if( catt.xref != undefined ){
                    for( var j=0; j< catt.xref.length; j++){
                        cseq.xref.push( catt.xref[j] );
                        if( catt.xref[j].ns =='upr')
                            cseq.upr = catt.xref[j].ac;
                    }
                }
                iseq.push( cseq );
                if( cseq.mane && maneseq == undefined ){
                    maneseq=cseq.upr;
                }
                if( cseq.canon && canonseq == undefined ){
                    canonseq=cseq.upr;
                }
            }
        }
        
        // determine order: mane -> canon -> alphabetical 
        //-----------------------------------------------

        var aseq = [];
        var sseq = {};
        var selseq = null;
        
        // Add MANE select (if present)
        //-----------------------------

        console.log("iseq.length:", iseq.length);
        
        for( var cs in iseq){
            if( iseq[cs].mane ){
                var tag = BKDcustom.xref2inametag( iseq[cs].xref );
                $( cid )
                    .append('<option value="' + iseq[cs].upr + '">'
                            + tag
                            +' (MANE-Select)</option>');
                selseq = iseq[cs].upr;
            } else {
                aseq.push( iseq[cs] );
            }
        }
        
        console.log("aseq.length:", aseq.length);
        
        // Add canonical (if present)
        //---------------------------
        
        for( var cs in aseq ){
            if( aseq[cs].canon ){
                var tag = BKDcustom.xref2inametag( aseq[cs].xref );
                $( cid )
                    .append( '<option value="' + aseq[cs].upr + '">'
                             + tag
                             +' (UniProtKB Canonical)</option>' );
                if( selseq == null)  selseq = aseq[cs].upr;                
            } else {
                if( aseq[cs].upr != maneseq
                    && aseq[cs].upr != canonseq ){
                    sseq[ aseq[cs].upr ] = aseq[cs];
                }
            }
        }
        
        // Sorted leftovers
        //-----------------
        
        var skeys = Object.keys( sseq ).sort();
        
        for( var k = 0; k < skeys.length; k++ ){
            var tag = BKDcustom.xref2inametag( sseq[ skeys[k] ].xref );
            $( cid )
                .append( '<option value="' + sseq[skeys[k]].upr + '">'
                         + tag
                         + '</option>');
            
            if( selseq == null) selseq = sseq[skeys[k]].upr;            
        }
        
        console.log("sseq:", sseq);        

        $( cid ).val(cval);
        
        //BKDnodeFeatures.state.seqvar = selseq;
        
    },

    xref2inametag: function( xref ){
        var upr = "";
        var rsp = "";
        var rsm = "";
       
        for(var i = 0; i < xref.length; i++ ){
            if( xref[i].ns == "upr" ){
                upr = xref[i].ac;
            }
            if( xref[i].ns == "RefSeq"
                && xref[i].ac.includes("M_" ) ){
                rsm = xref[i].ac.replace( /\.\d*/, "");
            }
            if( xref[i].ns == "RefSeq"
                && xref[i].ac.includes("P_" ) ){
                rsp = xref[i].ac.replace( /\.\d*/, "");
            }    
        }

        var tag = upr;
        if( rsp.length > 0){
            tag+= "/" + rsp;
        }
        
        if( rsm.length > 0){
            tag+= "/" + rsm;
        }
        
        return tag;
    }

}
