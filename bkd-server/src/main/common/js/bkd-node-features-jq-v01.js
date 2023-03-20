console.log("bkd-node-features-jq: common");
      
BKDnodeFeatures = {
    myurl: "",
    siteurl: "./",
    dsurl: "https://www.ncbi.nlm.nih.gov/snp/",
    cvurl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/",
    vclass: [ {"id":"flist-select-1","name":"select-1","label":"Benign", "value":"benign", "color":"blue" },
              {"id":"flist-select-2","name":"select-2","label":"Likely Benign", "value":"likely benign", "color":"cyan" },
              {"id":"flist-select-3","name":"select-3","label":"Conflicting Evidence", "value":"conflicting evidence", "color":"gray" },
              {"id":"flist-select-4","name":"select-4","label":"Likely Pathogenic", "value":"likely pathogenic", "color":"pink" },
              {"id":"flist-select-5","name":"select-5","label":"Pathogenic", "value":"pathogenic", "color":"red" } ],
    nodeAnchor: null,
    srcAnchor: null,
    fdata: [],
    fdict: {},
    fstate: {},
    flast: null,
    flist: null,
    ftypesel: {},
    fldet: null,
    flport: null,
    igvbrowse:null,
    flview: "#swmod",
    paneon: null,
    data: null,
    format: null,
    cpos37: "",
    cpos38: "",
    lollipop: null,
    
    // data value finder
   
    getVal: function( data, path ){ 
        var cval = data;
        //console.log(JSON.stringify(Object.keys(cval)));
        for(var j=0; j<path.length; j++){
            //console.log( "CVAL: " + path[j] + " :: " +
            //              JSON.stringify(cval[ path[j] ]) );
            cval = cval[ path[j] ];
        }
        return cval;            
    },

    init2: function( tgt, format, data, myurl ){
        
        this.format = format;
        this.data_base = data;
        this.myurl = BKDnodeView.myurl + "&detail=FULL";
        this.flview="#track";  // default on
        
        $.ajax( { url: this.myurl} )
            .done( function(data, textStatus, jqXHR){
                BKDnodeFeatures.view(tgt, format, data ) });               
    },
    
    init: function( tgt, format, data, myurl ){

        this.format = format;
        this.data_base = data;
        this.myurl = BKDnodeView.myurl + "&detail=FULL";
        this.flview="#track";  // default on
                       
        BKDnodeFeatures.format = format;
        BKDnodeFeatures.data = data;       
        BKDnodeFeatures.flview="#track";  // default on
        BKDnodeFeatures.flist = data.feats;

        // panel layout
        //-------------
        
        $( tgt ).append(
            "<table border='1' width='100%'>" +
                " <tr>"+
                "  <td id='flist' width='1024' colspan='1' rowspan='1' valign='top' align='center'>"+
                "   <div id='flist-source' class='bkd-select-panel'></div>"+
                "   <div id='flist-lolipop'> "+
                "     <div id='bkd-lolipop-spinner' style='display: none;'>"+
                "      <img src='img/spinner.gif' class='bkd-spinner'>"+
                "     </div>"+
                "   </div>"+
                //"   <div id='flist-select'></div>"+
                "   <div id='flist-details'></div>"+
                "  </td>"+                                            
                "  <td valign='top' align='center'>"+
                "   <table style='border-spacing: 0px;' width='100%'>"+
                "    <tr>"+
                "     <td id='track-tab' class='bkd-feat-tab-on'>Genome&nbsp;Viewer</td>"+
                "     <td id='homo-tab' class='bkd-feat-tab-off'>Homology</td>"+
                "     <td id='topo-tab' class='bkd-feat-tab-off'>Membrane&nbsp;Topology</td>"+
                "     <td id='swm-tab' class='bkd-feat-tab-off'>SwissModel</td>"+
                "     <td id='str-tab' class='bkd-feat-tab-off'>Structure</td>"+
                "    </tr>"+
                "    <tr>"+
                "     <td id='flist-view' align='center' valign='top' colspan='5'></td>"+
                "    </tr>"+
                "   </table>"+
                "  </td>"+
                " </tr>"+
                "</table>" );

        $( '#flist-view' ).append(
            "<div id='track-port' style='width:600px; height:625px;'></div>");
        $( '#track-port').hide();
        $( '#track-tab').on('click',BKDnodeFeatures.flviewToggle);
        
        $( '#flist-view' ).append(
            "<div id='homo-port' style='width:600px; height:625px;'></div>");
        $( '#homo-port').hide();
        $( '#homo-tab').on('click',BKDnodeFeatures.flviewToggle);
        
        $( '#flist-view' ).append(
            " <div id='topo-port' style='width:600px; height:625px;'></div>" );
        $( '#topo-port').hide();
        $( '#topo-tab').on('click',BKDnodeFeatures.flviewToggle);
        
        $( '#flist-view' ).append(
            "<div id='swm-port' style='width:600px; height:625px;'></div>");
        //$( '#swm-port').hide();
        $( '#swm-tab').on('click',BKDnodeFeatures.flviewToggle);
        
        $( '#flist-view' ).append(
            "<div id='str-port' style='width:600px; height:625px;'></div>");
        //$( '#str-port').hide();
        $( '#str-tab').on('click',BKDnodeFeatures.flviewToggle);
        
        // feature sources setup
        //----------------------
        
        $('#flist-source').append('Feature Source:&nbsp;&nbsp;'
                                  + '<input type="checkbox" id="cvflag" name="cvflag" value="true">'
                                  + '<label for="cvflag">ClinVar</label>&nbsp;&nbsp;&nbsp;&nbsp;');
        $( "#cvflag" ).prop( "checked", true );
        $('#cvflag').click( function(){

            // reset selections
            //-----------------
            
            BKDnodeFeatures.fstate = {};
            var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );
            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                             BKDnodeFeatures.fstate, ftslist );
       
            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
                                             BKDnodeFeatures.fstate, ftslist );

            BKDnodeFeatures.setTopoSelScheme( BKDnodeFeatures.strComp,
                                              BKDnodeFeatures.fstate, ftslist );

            
            $( '#fdet-table' ).remove();
            
            // redisplay lolipops
            //-------------------
            
            BKDnodeFeatures.lolipanel( null );
        });
        
        $('#flist-source').append('<input type="checkbox" id="dsflag" name="dsflag" value="true">')
            .append(`<label for="dsflag">dbSNP</label>&nbsp;&nbsp;&nbsp;&nbsp;`);
        $( "#dsflag" ).prop( "checked", false );

        $('#dsflag').click(function(){

            // reset selections
            //-----------------
            
            BKDnodeFeatures.fstate = {};
            var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );
            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                             BKDnodeFeatures.fstate,
                                             ftslist );
       
            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
                                             BKDnodeFeatures.fstate,
                                             ftslist );

            $( '#fdet-table' ).remove();
            
            // redisplay lolipops
            //-------------------
            
            BKDnodeFeatures.lolipanel( null );
            
        });
           
        $('#flist-source').append('<input type="checkbox" id="rpflag" name="rpflag" value="true">')
            .append('<label for="rpflag">CVDB Reports</label>');
   
        $('#rpflag').click(function(){
            alert( $('#cvflag').is(':checked') + ":" +
                   $('#dsflag').is(':checked') + ":" +
                   $('#rpflag').is(':checked'));  
        });
        
        
        // lollipop panel 
        //---------------

        // turn on lollipop spinner
        
        $('#bkd-lolipop-spinner').show();

        console.log("LOLL", this.myurl);
        
        $.ajax( { url: this.myurl.replace("FULL","FEATL")} )
            .done( function(data, textStatus, jqXHR){
                $('#bkd-lolipop-spinner').hide();
                BKDnodeFeatures.lolipanel( data );
            });               
        
        // genome viewer panel
        //--------------------

        BKDnodeFeatures.genomepane( '#track-port', data );

        // homology panel
        //---------------

        BKDnodeFeatures.homologpane( '#homo-port', data );
        
        // topology panel
        //---------------

        BKDnodeFeatures.topopane( '#topo-port', data );
                        
        // swissmodel panel
        //-----------------
        
        d3.select( "#swm-port" )
            .html( '<div id="swm-controls" class="bkd-select-controls" style="background-color: black; color: white;">'
                   + '<table class="swm-controls-table" width="100%" align="center">'
                   + '<tr><td id="swm-select-controls" colspan="2"></td></tr>'
                   + '</table>'
                   + '</div>'
                   + '<div id="swm-view" class="swm-view" style="height:100%;"></div>' )
        
        BKDnodeFeatures.fselcontrol( "swm-select-controls",
                                     BKDnodeFeatures.vclass,
                                     BKDnodeFeatures.flistsel);

        
        $( '#swm-port').show();   
        BKDnodeFeatures.swmStage = new NGL.Stage("swm-view");   
        $( '#swm-port').hide();
        url = BKDnodeFeatures.siteurl;
        id = BKDnodeFeatures.data.ac;
        
        console.log("PDB:" + url+"swissmodel/"+id+"-1_swm.pdb");
        
        BKDnodeFeatures.swmStage.loadFile( url+"swissmodel/"+id+"-1_swm.pdb")
            .then( function( o ){      
                BKDnodeFeatures.swmComp = o;
                o.setSelection("all");
                
                var swmColorScheme = NGL.ColormakerRegistry
                    .addSelectionScheme( [["atomindex", "*"]] );
                
                BKDnodeFeatures.swmNglrep =
                    o.addRepresentation( "cartoon",
                                         {color: swmColorScheme} );  
                o.autoView( "all" );
                console.log( "swmNgl: loaded");
            });
        
        // structure panel
        //----------------

        d3.select( "#str-port" )
            .html( '<div id="str-controls" class="bkd-select-controls" style="background-color: black; color: white;">'
                   + '<table class="str-controls-table" width="100%" align="center">'
                   + '<tr><td id="str-select-controls" colspan="2"></td></tr>'
                   + '</table>'
                   + '</div>'
                   + '<div id="str-view" class="str-view" style="height:100%;"></div>' )
        
        BKDnodeFeatures.fselcontrol( "str-select-controls",
                                     BKDnodeFeatures.vclass,
                                     BKDnodeFeatures.flistsel);
        
        $( '#str-port').show();
        BKDnodeFeatures.strStage = new NGL.Stage("str-view");
        $( '#str-port').hide();  
        
        url = BKDnodeFeatures.siteurl;
        id = BKDnodeFeatures.data.ac;
        
        console.log("PDB:" + url+"swissmodel/"+id+"-1_swm.pdb");
        
        BKDnodeFeatures.strStage.loadFile(url+"swissmodel/"+id+"-1_swm.pdb")
            .then( function( o ){      
                BKDnodeFeatures.strComp = o;
                o.setSelection("all");
                
                var strColorScheme = NGL.ColormakerRegistry
                    .addSelectionScheme([["atomindex", "*"]]);
                
                BKDnodeFeatures.strNglrep =
                    o.addRepresentation( "cartoon",
                                         {color: strColorScheme} );  
                o.autoView("all");
                console.log( "strNgl: loaded");
                
            });        
    },

    topopane: function( anchor, data ){

        // topology panel
        //---------------
     
        purl = BKDnodeFeatures.siteurl+"protter/"+ data.ac +".svg";
        console.log("PROTTER:" + purl);      

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
        
        $( "#topo-view" ).load( purl, function(){
            
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

            BKDnodeFeatures.zoom = d3.zoom().on( 'zoom', BKDnodeFeatures.handleMouseZoom );
            d3.select( anchor + ' svg' ).call( BKDnodeFeatures.zoom ); 
           
            
            BKDnodeFeatures.fselcontrol( "topo-select-controls",
                                         BKDnodeFeatures.vclass,
                                         BKDnodeFeatures.flistsel);

            BKDnodeFeatures.svgcontrol( "topo-zoom-controls",
                                        "topo-pan-controls",
                                        BKDnodeFeatures.handleButtonZoom,
                                        BKDnodeFeatures.handleButtonPan);
        });
    },

    svgcontrol: function( zoomanchor, pananchor, zoomaction, panaction ){
        
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
        
    },
    
    handleMouseZoom: function( e ){
        d3.select('#topo-port svg g').attr('transform',e.transform); 
    },

    handleButtonZoom: function( e ){
        
        if( this.id == 'zoom-reset'){
            d3.select('#topo-port svg').transition().call(BKDnodeFeatures.zoom.transform, d3.zoomIdentity);           
        } else if( this.id == 'zoom-plus') {
            d3.select('#topo-port svg').transition().call(BKDnodeFeatures.zoom.scaleBy, 1.1);
        } else if (this.id == 'zoom-minus') {
            d3.select('#topo-port svg').transition().call(BKDnodeFeatures.zoom.scaleBy, 0.9);
        }
        
                        
    },

    handleButtonPan: function( e ){        
        if( this.id == 'pan-reset'){
            d3.select('#topo-port svg').transition().call(BKDnodeFeatures.zoom.transform, d3.zoomIdentity);           
        } else if( this.id == 'pan-left') {
            d3.select('#topo-port svg').transition().call(BKDnodeFeatures.zoom.translateBy, -50, 0);
        } else if (this.id == 'pan-right') {
            d3.select('#topo-port svg').transition().call(BKDnodeFeatures.zoom.translateBy, 50, 0);
        }
        

        
    },

    genomepane: function( anchor, data ){
        
        $( anchor ).show();
        $( anchor ).append( "<div id='bkd-genome-build' class='bkd-select-panel' ></div>");
        $( '#bkd-genome-build' ).append('Genome Build:&nbsp;&nbsp;<input type="radio" id="build37flag" name="buildflag" value="build37">')
            .append(`<label for="build37flag">GRCh37/hg19</label>&nbsp;&nbsp;&nbsp;&nbsp;`);
        $( "#build37flag" ).prop( "checked", true );
        $('#build37flag').click(function(){           
            BKDnodeFeatures.igvinit("hg19");
        });
        $( '#bkd-genome-build' ).append('<input type="radio" id="build38flag" name="buildflag" value="build38">')
            .append(`<label for="build38flag">GRCh38/hg38</label>&nbsp;&nbsp;&nbsp;&nbsp;`);
        $( "#build38flag" ).prop( "checked", false );
        $('#build38flag').click(function(){           
            BKDnodeFeatures.igvinit("hg38");
        });

        $( anchor ).append( "<div id='bkd-genome-viewer' class='bkd-genome-viewer' ></div>");
        
        this.gname = data["label"];
        for( a in data.alias){
            //console.log("A: "+ JSON.stringify( data.alias[a]) );
            if( data.alias[a]["cvType"]["name"] == "gene-name" ){
                this.gname = data.alias[a]["alias"]
            }
        }         
        
        //console.log( "Gene Name: ", this.gname );

        this.igvinit("hg19");
    },
    
    igvinit: function( build ){

        if( BKDnodeFeatures.igvbrowse != null ){           
            igv.removeBrowser(BKDnodeFeatures.igvbrowse);
        }
        
        var igvDiv = document.getElementById( 'bkd-genome-viewer' );
        var options = {
            genome: build,
            locus: this.gname,
            tracks: [
                //{
                //    "name": "HG00103",
                //    "url": "https://s3.amazonaws.com/1000genomes/data/
                //      HG00103/alignment/HG00103.
                //      alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram",
                //    "indexURL": "https://s3.amazonaws.com/1000genomes/data/
                //      HG00103/alignment/HG00103.
                //      alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai",
                //    "format": "cram"
                //}
            ]
        };
        console.log(options);
        igv.createBrowser(igvDiv, options)
            .then( function (browser) {
                console.log("Created IGV browser");
                BKDnodeFeatures.igvbrowse = browser;
                console.log(BKDnodeFeatures.igvbrowse);                               
            });
    },
    
    
    // lolipop panel
    //--------------

    lolipanel: function( data ){

        if( data != null ){
            BKDnodeFeatures.fdata = data.node.feature;
        }
        
        $("#flist-lolipop svg").remove(); 
        
        // lollipop panel setup
        //---------------------
        
        var value = this.getVal( BKDnodeFeatures.data, BKDnodeFeatures.format.vpath );
        this.flist = this.getVal( BKDnodeFeatures.data, BKDnodeFeatures.format.vpath );
       
        var seq = BKDnodeFeatures.data.sequence;

        var cvflag = $('#cvflag').is(':checked');    // from checkbox
        var dsflag = $('#dsflag').is(':checked');    // from checkbox
        var rpflag = $('#rpflag').is(':checked');    // from checkbox
        
        var cvDict = {};
        var dsDict = {};
        
        var cvCntr  = 0;
        var dsCntr  = 0;
        
        for( var i = 0; i < BKDnodeFeatures.flist.length; i ++){ // go over features
            
            var cvStat = false;
            var dsStat = false;
            var rpStat = false;
            
            var feat = BKDnodeFeatures.flist[i];
            var range = feat.ranges[0];
            
            if( range.start == range.stop ){  // point features
                
                //console.log(i," value: ",JSON.stringify(feat));
                
                var posaa = seq[ parseInt(range.start) - 1 ] +
                    range.start +
                    range.sequence;
                
                var shrt = 'p.' + seq[ parseInt(range.start) - 1 ] 
                    + range.start 
                    + range.sequence;
                
                var dsref = {};
                var pos37 = "";
                var pos38 = "";
                var clinsig = [];
                var cvref = {};
                var mimref = [];
                
                //console.log("********************>");
                
                for( var j = 0; j < feat.xrefs.length; j ++){
                    //console.log( "NS: " + feat.xrefs[j].ns );
                    
                    if( "dbSNP" == value[i].xrefs[j].ns ){
                        var dslink = BKDnodeFeatures.dsurl+value[i].xrefs[j].ac;
                        dslink = "<a href='"+dslink+"' target='_bkdlink'>"+value[i].xrefs[j].ac+"</a>";
                        dsref[dslink] = dslink;
                        dsStat = true;
                    }
                    if( "GRCh37" == value[i].xrefs[j].ns ){
                        pos37 = value[i].xrefs[j].ac;                 
                    }
                    if( "GRCh37.p13" == value[i].xrefs[j].ns ){
                        pos37 = value[i].xrefs[j].ac;                 
                    }
                    if( "GRCh38" == value[i].xrefs[j].ns ){
                        pos38 = value[i].xrefs[j].ac;
                    }              
                    if( "GRCh38.p13" == value[i].xrefs[j].ns ){
                        pos38 = value[i].xrefs[j].ac;
                    }
                    if( "clinvar" == value[i].xrefs[j].ns.toLowerCase() ){
                        var cvlink=this.cvurl+value[i].xrefs[j].ac
                        cvlink = "<a href='"+cvlink+"' target='_bkdlink'>"+value[i].xrefs[j].ac+"</a>";
                        cvref[cvlink] = cvlink;
                        cvStat = true;
                    }
                    if( "MIM" == value[i].xrefs[j].ns ){
                        mimref.push(value[i].xrefs[j].ac);             
                    }
                    
                }
                 
                //console.log('ds: ' + JSON.stringify(dsref) );
                //console.log('cv: ' + JSON.stringify(cvref) );
                
                // phenotype:
                //    Benign, likely Benign,
                //    Unknown, Uncertain,
                //    likely Pathogenic, Pathogeniv, 
                
                if( value[i].jval.length >0 ){
                    //console.log("JVAL: " + value[i].jval);
                    
                    var jval = JSON.parse(value[i].jval);
                    if( 'clinical-significance' in jval){
                        //console.log(jval['clinical-significance']['value'])
                        clinsig.push(jval['clinical-significance']['value']);            
                    }
                }
                
                clinsig.push('unknown');  // default clinsig  

                var mdta =
                    { "Hugo_Symbol": "PIK3CA",
                      "cvStat" : cvStat,
                      "dsStat" : dsStat,
                      "Clinical Significance": clinsig[0],   // LS: single value (for now)
                      "Variant": shrt,
                      "PosAA": posaa,
                      "Pos37": pos37,
                      "Pos38": pos38,
                      "Mutation_Class": value[i].ranges[0].sequence,
                      "AA_Position": parseInt(value[i].ranges[0].start),
                      "dbSNP":  Object.keys(dsref),            
                      "ClinVar": Object.keys(cvref),
                      "OMIM":mimref
                    };
                

                if( !( shrt in this.fdict ) ){
                    BKDnodeFeatures.fdict[shrt] = [];
                }
                BKDnodeFeatures.fdict[shrt].push( mdta );
                //console.log("MDTA: " + JSON.stringify(mdta));        
                BKDnodeFeatures.fstate[ value[i].ranges[0].start ] = { "on":false, "rep":{} };
                //console.log( cvStat + ":" + dsStat );
                if( cvStat ){
                    if( !(shrt in cvDict ) ){
                        cvDict[shrt] = [];
                    }
                    cvDict[shrt].push( mdta );
                }
                
                if( dsStat ){
                    if( !(shrt in dsDict) ){
                        dsDict[shrt]= [];
                    }
                    dsDict[shrt].push( mdta );
                }
                //console.log("<********************");
                
                //console.log( "#---");
                //console.log( "feature:", i, JSON.stringify( feat ) );
                //console.log( "mdta:", i, JSON.stringify( mdta ) );
                //console.log( "##--" );
            }
            
        }

        //console.log("cvDict:: " + JSON.stringify(cvDict) );
        //console.log("dsDict:: " + JSON.stringify(dsDict) );
        
        var mutList = [];
        
        var fDict = {};
        
        // merge cvDict & sbDict acording to flags
        
        if( cvflag ){
            for( cmut in cvDict ){
                //console.log("cvDict:" + cmut);
                if( !(cmut in fDict) ){ 
                    fDict[cmut] = [];
                }
                for( f in cvDict[cmut]){
                    fDict[cmut].push( cvDict[cmut][f] );
                }
                //console.log("fDict(cv) " + cmut + " : " + JSON.stringify(fDict[cmut] ));
            }
        } 
        
        if( dsflag ){    
            for( cmut in dsDict ){
                //console.log("dsDict:" + cmut);
                if( !(cmut in fDict) ){ 
                    fDict[cmut] = [];
                }
                for( f in dsDict[cmut]){
                    fDict[cmut].push( dsDict[cmut][f] );
                }
                //console.log("fDict(ds) " + cmut + " : " + JSON.stringify(fDict[cmut]));
            }
        }
                
        // convert fDict to list
        //----------------------

        BKDnodeFeatures.plist = [];
     
        for( cent in fDict ){

            var cfeat = {"snlink":[],"cvlink":[]};
            
            var sndict = {};
            var cvdict = {};
            
            cfeat['name'] = cent;
            cfeat['pos'] = parseInt(fDict[cent][0]['AA_Position']);
            cfeat['res'] = fDict[cent][0]['PosAA'];
            cfeat['pos37'] = fDict[cent][0]['Pos37'];
            cfeat['pos38'] = fDict[cent][0]['Pos38'];
           
            //console.log("CENT:" + cent );
            for( f in fDict[cent] ){
                // list of cv/sn features
                //console.log(" sig:" +  fDict[cent][f]['Clinical Significance']);    
                // significance
                cfeat['significance'] = fDict[cent][f]['Clinical Significance'];  
                
                if( fDict[cent][f]['dbSNP'] !== null ){
                    for( var r in fDict[cent][f]['dbSNP']){
                        sndict[ fDict[cent][f]['dbSNP'][r] ] = fDict[cent][f]['dbSNP'][r];
                    }
                    cfeat['snlink'] = Object.keys( sndict );                           
                }
                
                if( fDict[cent][f]['ClinVar'] !== null ){
                    for( var r in fDict[cent][f]['ClinVar']){
                        cvdict[fDict[cent][f]['ClinVar'][r]]=fDict[cent][f]['ClinVar'][r];
                    }
                    cfeat['cvlink'] = Object.keys( cvdict );             
                }
            }            
            BKDnodeFeatures.plist.push(cfeat);            
        }
        
        var mutation_data = BKDnodeFeatures.plist;
        //console.log("---");
        
        //console.log("fDict: " + JSON.stringify(fDict));
        //console.log("---");
        
        //console.log("plist: " + JSON.stringify(BKDnodeFeatures.plist));
        //console.log("^^^");
                
        var mutation_data_default_settings = {
            x: "pos", // mutation position
            y: "name", // amino-acid changes
            factor: "significance", // classify mutations by a factor (optional)
        };
                        
        var pfam_data = {  
            "hgnc_symbol":"TP53",
            "protein_name":"tumor protein p53",
            "uniprot_id":"P04637",
            "length":seq.length+1,
            "pfam":[  
                {  
                    "pfam_ac":"PF08563",
                    "pfam_start":1,
                    "pfam_end":seq.length,
                    "pfam_id":"my protein"
                }
            ]
        }; 
        
        var pfam_data_default_settings = {
            domainType: "pfam",       // key to the domain annotation entries
            length: "length",         // protein length
            details: {
                start: "pfam_start",  // protein domain start position
                end: "pfam_end",      // protein domain end position
                name: "pfam_id",      // protein domain name
            }
        };
        
        var lollipop = g3.Lollipop('flist-lolipop');
        BKDnodeFeatures.lollipop = lollipop;
        lollipop.options.chartMargin = {
            "left": 40, "right": 40, "top": 30, "bottom": 25
        };
        lollipop.options.titleFont = "normal 20px Sans";
        lollipop.options.yAxisLabel = "# of variants";
        lollipop.options.titleColor = "steelblue";
        lollipop.options.titleAlignment = "middle";
        lollipop.options.titleDy = "0.3em";
        lollipop.options.legendTitle = "Clinical Significance";
        lollipop.options.chartWidth = 1024;
        lollipop.options.chartHeight = 200;
        lollipop.options.chartType = "pie";
        lollipop.options.tooltip = false;

        lollipop.options.seq = true;

        lollipop.options.lollipopPopInfoColor="#000";
        lollipop.options.lollipopPopMinSize = 8;
        lollipop.options.lollipopHook =
            { action: BKDnodeFeatures.buildFDets,
              options: { anchor: "#flist-details",
                         cols:[{'name':"Variant",'value':'name'}
                               ,{'name':"Clinical Significance",'value':'significance'}
                               ,{'name':"dbSNP",'value':'snlink'}
                               ,{'name':"ClinVar", 'value':'cvlink'}
                               //,{'name':"OMIM", 'value':'name'}
                              ]
                       }
            };
        //lollipop.options.legendHook =
        //    { action: BKDnodeFeatures.loliLegend,
        //      options: {}
        //    };
        
        // add mutation list
        //lollipop.data.snvData = mutList;
        lollipop.data.snvData = mutation_data;

        sd = [];
        for( var i=0; i < seq.length; i++){
            sd.push({pos:i+1, aa: seq[i]});
        }
        lollipop.data.seqData = sd;             
                
        // mutation data format settings
        lollipop.format.snvData = mutation_data_default_settings;
        
        // Pfam domain data
        lollipop.data.domainData = pfam_data;
        
        // Pfam data format settings
        lollipop.format.domainData = pfam_data_default_settings;
        
        lollipop.draw();

        var selst = BKDnodeFeatures.vclass;

        //BKDnodeFeatures.fselcontrol( "flist-select",
        //                             BKDnodeFeatures.vclass,
        //                             BKDnodeFeatures.flistsel);
    },

    loliFactorSelect: function( _g ){
        //console.log(_g);
        //alert("factor select!!!");
    },
    
    loliLegend: function( key, selected, options){

        for( var p in  BKDnodeFeatures.fstate ){
            BKDnodeFeatures.fstate[p].on = false;
        }
        
        var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );
        BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                         BKDnodeFeatures.fstate, ftslist );
       
        BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
                                         BKDnodeFeatures.fstate, ftslist );

        BKDnodeFeatures.setTopoSelScheme( BKDnodeFeatures.strComp,
                                          BKDnodeFeatures.fstate, ftslist );

        // remove table        
        $( '#fdet-table' ).remove();
        BKDnodeFeatures.lollipop.options.legendItems.forEach(d => console.log(d.key +":"+d._status) );
        
        
        
               
    },

    fselcontrol: function( anchor, clist, action){
        
        if( ! d3.select( "#" + anchor  ).empty() ){                    
            d3.select( "#" + anchor + " *" ).remove();
        }

        d3.select( "#" + anchor )
            .html('&nbsp;&nbsp;&nbsp;&nbsp;');
        
        for( var s in clist ){
            d3.select( "#" + anchor )
                .append("input")
                .attr("type" , "checkbox")
                .attr("id" , clist[s]['id'])
                .attr("name" , clist[s]["name"])
                .attr("value" , clist[s]["value"])
                .attr("style" , "accent-color: " + clist[s]["color"]+ ";");
            
            d3.select( "#" + anchor )
                .append( "label" )
                .attr( "for" , clist[s]["name"] )
                .html( clist[s]["label"] + " &nbsp;&nbsp;" );
                
            BKDnodeFeatures.ftypesel[clist[s]["value"]]=false;            
        }        
        d3.selectAll("#" + anchor + " input").on('click', action );        
    },

    
    flistsel: function(event){
        BKDnodeFeatures.ftypesel[event.target.value] = event.target.checked;
        var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );

        BKDnodeFeatures.setTopoSelScheme( BKDnodeFeatures.swmComp,
                                          BKDnodeFeatures.fstate,
                                          ftslist );

        BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                         BKDnodeFeatures.fstate,
                                         ftslist );
        
        BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
                                         BKDnodeFeatures.fstate,
                                         ftslist );


        BKDnodeFeatures.lollipop.options.legendItems.forEach((d) => {
            //console.log(d.key +":"+d._status);
            d._status = BKDnodeFeatures.ftypesel[d.key];
        } );

        //console.log(BKDnodeFeatures.lollipop.options.legendItems);             
        //console.log(BKDnodeFeatures.ftypesel);
             
    },

    getfselist: function( ftypesel ){

        var tcnt = 0;
        for( var t in ftypesel ){
            if( ftypesel[t] == true ){
                tcnt +=1;
            }
        }

        var ccol = "#808080";
        
        var pdict = {}
        for( var t in ftypesel ){
            if( ftypesel[t] == true ){
                for( var i in BKDnodeFeatures.plist ){
                    if( BKDnodeFeatures.plist[i].significance == t ){
                        if( tcnt == 1 && ccol == "#808080" ){            
                            for( var k in BKDnodeFeatures.vclass){
                                if( BKDnodeFeatures.vclass[k].value == t ){
                                    ccol = BKDnodeFeatures.vclass[k].color;
                                }
                            }
                        }
                        pdict[BKDnodeFeatures.plist[i].pos] = {
                            "pos":BKDnodeFeatures.plist[i].pos,
                            "col":ccol,
                            "name":BKDnodeFeatures.plist[i].pos
                        }
                    }
                }
            }
        }        
        return pdict;        
    },

    setTopoSelScheme: function( comp, fstate, ftslist ){
        
        // reset all: white
        
        $( "svg circle[id$='_symbol']" ).attr('fill','#ffffff');

        // set ftslist: cyan
        
        for( var i in ftslist ){
            var pos = ftslist[i].pos;
            var col = ftslist[i].col;
            $('#aa' + (pos-1).toString() + '_symbol')[0].setAttribute('fill', col );
        }

        // set fstate: orange

        for( var i in fstate ){
            if( fstate[i].on){
                $('#aa' + (i-1).toString() + '_symbol')[0].setAttribute('fill', "orange")
            }
        }        
    },

    setHomolSelScheme: function( comp, fstate, ftslist ){
        
        // set ftslist: cyan

        var smap = {};

        D3MSA.dropAllSelect();
        
        for( var i in ftslist ){
            var pos = ftslist[i].pos;
            var col = ftslist[i].col;
            smap[ (pos) + ":" + col ]
                = { "name": BKDnodeFeatures.data.sequence[pos-1]+ pos }; 
        }

        // set fstate: orange

        for( var pos in fstate ){
            if( fstate[pos].on){
                smap[ (pos) + ":" + "orange" ]
                    = { "name": BKDnodeFeatures.data.sequence[pos-1] + pos };                             
            }
        }

        //console.log(smap);
        //console.log(Object.keys(smap));
        
        D3MSA.setSelectList( Object.keys(smap) );
        //D3MSA.setSelectMap( smap );
        D3MSA.setNavView(D3MSA._msaW/2,D3MSA._msaW);
    },
    
    // selection action: structure viewer(s)
    //--------------------------------------
   
    setNGLSelScheme: function( comp, fstate, ftslist ){
   
        if( comp !== undefined){

            //console.log("fstate: " + JSON.stringify(fstate));
            //console.log("ftslist: " + JSON.stringify(ftslist));
            
            var rlist = [];
            
            for( var i in ftslist ){
                var pos = ftslist[i].pos;
                var col = ftslist[i].col;                
                rlist.push([col,String(pos)]);
            }
            
            for( var k in fstate ){
                if( fstate[k].on ){
                    rlist.push(["orange",k]);
                }            
            }
            
            if( rlist.length > 0 ){
                rlist.push( ["green","*"]);
            } else {
                rlist.push(["atomindex", "*"]);
            }
            var colorScheme = NGL.ColormakerRegistry
                .addSelectionScheme( rlist,"features" );
            
            var newrep = comp.addRepresentation(
                "cartoon",{color: colorScheme});
           
            comp.removeRepresentation(BKDnodeFeatures.swmNglrep);
            BKDnodeFeatures.swmNglrep = newrep;          
            comp.autoView("all");            
       }
   },

   // selection: genome viewer
   //-------------------------
   
   setIGVSelScheme: function(pos37,pos38, show ){
       //console.log("setIGVSelScheme",pos37,pos38, show);
       rpos ="";
       for( p in pos37 ){
           rpos += p +":-1;"
       }
       //console.log("setIGVSelScheme: rpos: " + rpos );
       
       if( rpos != '' ){
           //console.log("setIGVSelScheme:ON");
           BKDnodeFeatures.igvbrowse.clearROIs();
           BKDnodeFeatures.igvbrowse.loadROI([{
               name: 'Feature xxx',
               url: BKDnodeFeatures.siteurl+"roi?pos="+rpos,
               indexed: false,
               color: "rgba(68, 134, 247, 0.25)"
           }]);
           
       }
       if( rpos == '' ){       
           //console.log("setIGVSelScheme: OFF");
           BKDnodeFeatures.igvbrowse.clearROIs();
           //BKDnodeFeatures.igvbrowse.removeROI();
           //console.log("setIGVSelScheme: OFF done...");
       }
              
   },

   // selection: feature table viewer
   //--------------------------------

   buildFDets: function( show, data, options ){

       //console.log("FD(data):" + JSON.stringify(data));
       //console.log("FD(options):" + JSON.stringify(options) + " :: " + show);

       BKDnodeFeatures.fstate[data.position].on=show;

       for( var k in BKDnodeFeatures.fstate ){
           //console.log(k + " :: " + BKDnodeFeatures.fstate[k]);
       }
       //BKDnodeFeatures.plist - list of feaures
       //BKDnodeFeatures.fstate - map of states

       var rows = {};
       
       for( var x in BKDnodeFeatures.plist ){
           var pos = BKDnodeFeatures.plist[x].pos.toString(); 
           if(  pos in BKDnodeFeatures.fstate ){
               if(BKDnodeFeatures.fstate[pos].on){                   
                   if( ! (pos in rows) ){
                       rows[pos]= [];
                   }
                   rows[pos].push( BKDnodeFeatures.plist[x] );                   
               }
           }
       }
       //console.log("X: rows");
       //console.log( rows );
       //console.log("X: done");
       var html = "";

       var pos37map = {};
       var pos38map = {};
       
       if( Object.keys(rows).length > 0 ){
           $(options.anchor).hide();
           $(options.anchor + " #fdet-table").remove();
           $(options.anchor).append(
               "<table id='fdet-table' width='100%' border='1'></table>" );
           var head ="<th>AA&nbsp;Position</th>";
           for(var h = 0; h < options.cols.length; h++){
               head += "<th>"+options.cols[h]['name']+"</th>";
           }
           $("#fdet-table").append("<tr>"+head+"</tr>");

           //console.log("RR: rows");

           for( var r in rows){
               //console.log(r-1);
               //console.log("AA: " + '#aa'+(r-1).toString() + '_symbol');
               //console.log( $('#aa'+r+'_symbol') );
               $('#aa' + (r-1).toString() + '_symbol')[0].setAttribute('fill','#ff0000');
               
               for( var rr in rows[r]){
                   
                   //console.log( rows[r][rr] );
                   pos37map[rows[r][rr]['pos37']] = rows[r][rr]['pos37'];
                   pos38map[rows[r][rr]['pos38']] = rows[r][rr]['pos38'];
                   var hrow =""
                   if(rr == 0){
                       hrow = "<tr>"
                           + "<td align='center' rowspan='"+rows[r].length+"'>"
                           + r
                           + "</td>";
                   } else {
                       hrow = "<tr>";
                   }
                   for(var c =0; c < options.cols.length; c++ ){
                       hrow += "<td>" 
                           + rows[r][rr][options.cols[c]['value']]
                           + "</td>";
                   }
                   hrow += "</tr>";
                   //console.log('hrow:' + hrow);
                   $("#fdet-table").append(hrow);
               }
           }
           //console.log("RR: done");
           $(options.anchor).show();
       } else {
           $(options.anchor).hide();
           $(options.anchor + " #fdet-table").remove();
       }
       
       var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );
       //console.log("ftslist");
       //console.log(BKDnodeFeatures.fstate);
       
       BKDnodeFeatures.setTopoSelScheme( "topo-port",
                                         BKDnodeFeatures.fstate,
                                         ftslist
                                       );

       BKDnodeFeatures.setHomolSelScheme( BKDnodeFeatures.strComp,
                                          BKDnodeFeatures.fstate, 
                                          ftslist );
       
       BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                        BKDnodeFeatures.fstate,
                                        ftslist
                                      );
       
       BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
                                        BKDnodeFeatures.fstate, 
                                        ftslist );

       BKDnodeFeatures.setIGVSelScheme(pos37map,pos38map,show);
       
       
    },

    // tab panel toggle
    //-----------------

    flviewToggle: function(event){
        var nview = "#" + event.currentTarget.id.replace('-tab','');
        //console.log("Toggle: "+ BKDnodeFeatures.flview +"->" + nview);
        
        $( BKDnodeFeatures.flview + "-port" ).hide();
        $( BKDnodeFeatures.flview + "-tab" ).addClass('bkd-feat-tab-off');
        $( BKDnodeFeatures.flview + "-tab" ).removeClass('bkd-feat-tab-on');
        
        BKDnodeFeatures.flview = nview;
        $( BKDnodeFeatures.flview + "-tab" ).addClass('bkd-feat-tab-on');
        $( BKDnodeFeatures.flview + "-tab" ).removeClass('bkd-feat-tab-off');      
        $( BKDnodeFeatures.flview + "-port" ).show();
      
        //console.log( "Toggle: BKDnodeFeatures.igvbrowse " +
        //             BKDnodeFeatures.igvbrowse );
                   
        if( BKDnodeFeatures.igvbrowse !== null ){
            BKDnodeFeatures.igvbrowse.visibilityChange();
        } 
    },

    homologpane: function( anchor, data ){
        d3.select( anchor )
            .html( '<div id="bkd-msa" class="bkd-msa" style="background-color: black;">'
                   +'</div>' );


        var msaConfig = { "taxname": {'9606': 'Human',
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
                                     }
                        };

        var msa = D3MSA.initialize( '#bkd-msa', "msa/" + BKDnodeFeatures.data.ac + ".fasta",
                                    msaConfig);
        
    }  
};
