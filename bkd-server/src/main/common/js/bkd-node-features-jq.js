 console.log("bkd-node-features-jq: common");
        
BKDnodeFeatures = {
    myurl: "",
    siteurl: "./",
    dsurl: "https://www.ncbi.nlm.nih.gov/snp/",
    cvurl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/",
    gnurl: "https://gnomad.broadinstitute.org/variant/",
    cgurl: "https://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/by_canonicalid?canonicalid=",
    ucscPosUrl: "https://genome.ucsc.edu/cgi-bin/hgTracks?db=%BID%&position=%CID%%3A%SID%-%EID%",
    ucscSrcUrl: "https://genome.ucsc.edu/cgi-bin/hgSearch?db=%BID%&search=%SRC%",
    /*
    fcolor:   { "pathogenic":"#d04030",
                "likely pathogenic":"#e0B0B0",
                "uncertain":"#b0b0b0",
                "conflicting evidence":"#d2b4de",
                "unspecified":"#ffffff",
                "likely benign":"#30a0e0",
                "benign":"#2161b0"                              
              },
    */
    fcolor:   { "pathogenic":"#f02020",
                "likely pathogenic":"#ffa0a0",
                "uncertain":"#b0b0b0",
                "conflicting evidence":"#ffcf40",
                "unspecified":"#ffffff",
                "likely benign":"#30a0e0",
                "benign":"#80ff80"                              
              },
    
    sigtag: { ben: "benign", lben: "likely benign",
              pat: "pathogenic", lpat: "likely pathogenic",
              cevd: "conflicting evidence"}, 
    
    vclass: [ { "id":"flist-color-1","name":"color-1",
                "label":"Benign", "value":"ben",
                //"color":"#3171c0" },
                //"color":"#80d0ff" },
                "color":"#80ff80" },
              
              { "id":"flist-color-2","name":"color-2",
                "label":"Likely Benign", "value":"lben",
                //"color":"#50c0ff" },
                //"color":"#3171c0" },
                //"color":"#80d0ff" },
                "color":"#30a0e0" },
              
              { "id":"flist-color-3","name":"color-3",
                "label":"Conflicting Evidence", "value":"cevd",
                //"color":"#d2b4de" },
                //"color":"#b284be" },
                //"color":"#ffcf40" },
                "color":"#ffcf40" },
              
              { "id":"flist-color-4","name":"color-4",
                "label":"Likely Pathogenic", "value":"lpat",
                //"color":"#e0B0B0" ,
                //"color":"#ffB0B0" ,

                //"color":"#d01008" ,  // red
                //"color":"#ffb0b0"   // pink]
                "color":"#ffa0a0"   // pink
              } , 
              
              
              { "id":"flist-color-5","name":"color-5",
                "label":"Pathogenic", "value":"pat",
                //"color":"#d04030" },
                //"color":"#c02010" },
                
                "color":"#f02020"   // red
                //"color":"#ffB0B0"   // pink
              }
            ],

    predlst:[{ id:"flist-select-p-0",name:"select-p-0",
                 label:"SwissModel", value:"hiqc",                
                 labelOn: "SwissModel", labelOff: "SwissModel",
                 mode: "bcut" , bval: 0.5, 
                 color:"#aaaaaa",
                 callback: "struct",
                 opt:{
                     style: "cbox", default: "off",
                     mode: "chn",
                     states: { on: { mode: "step", val: "bfact", vcut: 0.5,
                                     colLo: "green", opaqLo: 1.0, 
                                     colHi: "gray", opaqHi: 0.6   },
                               off: { mode: "solid", color: "green", opaq: 1.0 }
                             }
                 }
             }],
    
    exptlst:[{ id:"flist-select-e-0",name:"select-e-0",
                 label:"PDB", value:"hiqc",                
                 labelOn: "PDB", labelOff: "PDB",
                 mode: "bcut" , bval: 0.5, 
                 color:"#aaaaaa",
                 callback: "struct",
                 opt:{
                     style: "cbox", default: "off",
                     mode: "chn",
                     states: { on: { mode: "step", val: "bfact", vcut: 0.5,
                                     colLo: "green", opaqLo: 1.0, 
                                     colHi: "gray", opaqHi: 0.6   },
                               off: { mode: "solid", color: "green", opaq: 1.0 }
                             }
                 }
               }],
    
    swmsels: [ { id:"flist-select-1",name:"select-1",
                 label:"HiQC", value:"hiqc",                
                 labelOn: "HiQC", labelOff: "All",
                 mode: "bcut" , bval: 0.5, 
                 color:"#aaaaaa",
                 callback: "select",
                 opt:{
                     style: "cbox", default: "off",
                     mode: "chn",
                     states: { on: { mode: "step", val: "bfact", vcut: 0.5,
                                     colLo: "green", opaqLo: 1.0, 
                                     colHi: "gray", opaqHi: 0.6   },
                               off: { mode: "solid", color: "green", opaq: 1.0 }
                             }
                 }
               },
               { id: "flist-select-2","name":"select-2",
                 label: "Current Sequence", "value":"smsa",
                 labelOn: "Canonical", labelOff: "Current Sequence",
                 color: "#aaaaaa",
                 callback: "select",
                 style: "cbox", default: "off",
                 mode: "chn",
                 opt: {
                     style: "cbox", default: "off",
                     mode: "smsa",
                     states: { on: { mode: "msa", msa: 2, sref: 0, ssel: 1 },
                               off: { mode: "msa", msa: 2, sref: 0, ssel: 0 }
                             }
                 }
               },
               
               { id: "flist-select-3","name":"select-2",
                 label: "Monomer", "value":"chain",
                 labelOn: "Monomer", labelOff: "All",
                 color: "#aaaaaa",
                 callback: "select",
                 style: "rbox", default: "A",
                 mode: "chn",
                 opt: {} } ],
    
    swmcols: [ { id:"flist-select-0",name:"select-0",
                 label:"Position",
                 callback: "color",
                 value:"rain",
                 mode: "rainbow",
                 "color":"#aaaaaa" },
               { "id":"flist-select-1","name":"select-1",
                 "label":"Chain",
                 callback: "color",
                 "value":"cchn",
                 "color":"#aaaaaa" },
               { "id":"flist-select-2","name":"select-2",
                 "label":"Conservation(MSA)",
                 callback: "color",
                 "value":"cmsa",
                 "color":"#aaaaaa" },
               { "id":"flist-select-3","name":"select-3",
                 "label":"Conservation(SNP)",
                 callback: "color",
                 "value":"csnp",
                 "color":"#aaaaaa" },
               { "id":"flist-select-4","name":"select-4",
                 "label":"Prediction QScr",
                 callback: "color",
                 "value":"cbfc",
                 "color":"#aaaaaa" },
               { "id":"flist-select-5","name":"select-5",
                 "label":"Topology", "value":"ctpo",
                 calback: "color",
                 "color":"#aaaaaa" },
               { "id":"flist-select-6","name":"select-6",
                 "label":"SecStruc",
                 callback: "color",
                 "value":"sstr",
                 "color":"#aaaaaa" }
             ],
    
    strsels: [ { id:"flist-select-1",name:"select-1",
                 label:"HiQC", value:"hiqc",                
                 labelOn: "HiQC", labelOff: "All",
                 mode: "bcut" , bval: 0.5, 
                 color:"#aaaaaa",
                 callback: "select",
                 opt:{
                     style: "cbox", default: "off",
                     mode: "chn",
                     states: { on: { mode: "step", val: "bfact", vcut: 0.5,
                                     colLo: "green", opaqLo: 1.0, 
                                     colHi: "gray", opaqHi: 0.6   },
                               off: { mode: "solid", color: "green", opaq: 1.0 }
                             }
                 }
               },
               { id: "flist-select-2","name":"select-2",
                 label: "Current Sequence", "value":"smsa",
                 labelOn: "Canonical", labelOff: "Current Sequence",
                 color: "#aaaaaa",
                 callback: "select",
                 style: "cbox", default: "off",
                 mode: "chn",
                 opt: {
                     style: "cbox", default: "off",
                     mode: "smsa",
                     states: { on: { mode: "msa", msa: 2, sref: 0, ssel: 1 },
                               off: { mode: "msa", msa: 2, sref: 0, ssel: 0 }
                             }
                 }
               },
               
               { id: "flist-select-3","name":"select-2",
                 label: "Monomer", "value":"chain",
                 labelOn: "Monomer", labelOff: "All",
                 color: "#aaaaaa",
                 callback: "select",
                 style: "rbox", default: "A",
                 mode: "chn",
                 opt: {} } ],
    
    strcols: [ { id:"flist-select-0",name:"select-0",
                 label:"Position",
                 callback: "color",
                 value:"rain",
                 mode: "rainbow",
                 "color":"#aaaaaa" },
               { "id":"flist-select-1","name":"select-1",
                 "label":"Chain",
                 callback: "color",
                 "value":"cchn",
                 "color":"#aaaaaa" },
               { "id":"flist-select-2","name":"select-2",
                 "label":"Conservation(MSA)",
                 callback: "color",
                 "value":"cmsa",
                 "color":"#aaaaaa" },
               { "id":"flist-select-3","name":"select-3",
                 "label":"Conservation(SNP)",
                 callback: "color",
                 "value":"csnp",
                 "color":"#aaaaaa" },
               { "id":"flist-select-4","name":"select-4",
                 "label":"Prediction QScr",
                 callback: "color",
                 "value":"cbfc",
                 "color":"#aaaaaa" },
               { "id":"flist-select-5","name":"select-5",
                 "label":"Topology", "value":"ctpo",
                 calback: "color",
                 "color":"#aaaaaa" },
               { "id":"flist-select-6","name":"select-6",
                 "label":"SecStruc",
                 callback: "color",
                 "value":"sstr",
                 "color":"#aaaaaa" }
             ],

    nglexport: [
        { "id":"ngl-export-1","name":"ngl-export-1",
          "label":"PDB File", "value":"ngl-export-pdb" },

        { "id":"ngl-export-2","name":"ngl-export-2",
          "label":"Image", "value":"ngl-export-img" }
    ],
    
    nglhelp: [
        { "id":"ngl-help-1","name":"ngl-help-1",
          "label":"View Control", "value":"help-ngl-viewcontrol" },

        { "id":"ngl-help-2","name":"ngl-help-2",
          "label":"Color Contorl", "value":"help-ngl-colorcontrol" },

        { "id":"ngl-help-3","name":"ngl-help-3",
          "label":"Detail View", "value":"help-ngl-detailview" },

        { "id":"ngl-help-4","name":"ngl-help-4",
          "label":"Export", "value":"help-ngl-export" }          
    ],
    
    /*      
    fcolor:   { "pathogenic":"#d04030",
                "likely pathogenic":"#e0B0B0",
                "uncertain":"#b0b0b0",
                "conflicting evidence":"#d2b4de",
                "unspecified":"#ffffff",
                "likely benign":"#30a0e0",
                "benign":"#2161b0"                              
              },
    */
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
    flview: "#track-tab",
    paneon: null,
    data: null,
    format: null,
    cpos37: "",
    cpos38: "",
    lollipop: null,
    nglSWM: null,
    nglSTR: null,
    bkdtopo: null,
    config: {"lollipanel":{ "detailtable":null } },
    state: { fsel:{ topo:{}, swm:{}, str:{} },
             seqvar: null,
             swm: {},
             str:{}
           },
    
    lollipanels:{},

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
        this.flview="#track-tab";  // default on
        
        $.ajax( { url: this.myurl} )
            .done( function(data, textStatus, jqXHR){
                BKDnodeFeatures.view(tgt, format, data ) });               
    },
    
    init: function( tgt, format, data, myurl ){

        this.format = format;
        this.data_base = data;
        this.myurl = BKDnodeView.myurl + "&detail=FULL";
        this.flview="#track-tab";  // default on

        console.log("Features: format:" + JSON.stringify(this.format));
        this.config  = this.format['config'];
        console.log( "Features -> detailtable: "
                     + JSON.stringify( this.config.lollipanel.detailtable ) );
        console.log( "Features: format: DONE");
        BKDnodeFeatures.format = format;
        BKDnodeFeatures.data = data;       
        BKDnodeFeatures.flview="#track-tab";  // default on
        BKDnodeFeatures.flist = data.feats;

        // isoforms
        //---------
        
        var iseq = [];   // {seq:"", upr:'', canon: false, mane: false, xref:[] }
        var seqVarList = [ 'mane-sequence',
                           'canonical-sequence',
                           'alternate-sequence' ];

        console.log("Features DATA:",data);
        
        for( var i =0; i < data.attr.length;i++ ){
            var catt = data.attr[i];            
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
                if( cseq.mane && BKDnodeFeatures.maneseq == undefined ){
                    BKDnodeFeatures.maneseq=cseq.upr;
                }
                if( cseq.canon && BKDnodeFeatures.canonseq == undefined ){
                    BKDnodeFeatures.canonseq=cseq.upr;
                }
            }
        }
        
        BKDnodeFeatures.iseq = iseq;
        
        // panel layout
        //-------------
        
        $( tgt ).append(
            "<table border='1' width='100%'>" +
                " <tr>"+
                "  <td id='flist' width='900' colspan='1' rowspan='1' valign='top' align='center'>"+
                "   <div id='flist-source' class='bkd-select-panel'></div>"+
                "   <div id='flist-lollipop-1-help' class='bkd-select-help'>"+
                "    Click on a lollipop to see variants at that position. Click Help for more details."+
                "   </div>"+ 
                "   <div id='flist-lollipop-1' class='bkd-select-panel'></div>"+ 
                "  </td>"+                                            
                "  <td valign='top' align='center'>"+
                "   <table id='flist-tabs' style='border-spacing: 0px;' width='100%'>"+
                "    <tr>"+
                "     <td id='track-tab' class='bkd-feat-tab-on track-tab'>Genome&nbsp;Viewer</td>"+
                "     <td id='homo-tab-panther' class='bkd-feat-tab-off homo-tab' title='Source: UCSC Genome Browser' >Homology&nbsp;(G)</td>"+
                "     <td id='homo-tab-ucsc' class='bkd-feat-tab-off homo-tab' title='Source: PantherDB'>Homology&nbsp;(P)</td>"+
                "     <td id='topo-tab' class='bkd-feat-tab-off topo-tab'>Membrane&nbsp;Topology</td>"+
                "     <td id='swm-tab' class='bkd-feat-tab-off swm-tab'>Structure(pred)</td>"+
                "     <td id='str-tab' class='bkd-feat-tab-off str-tab'>Structure(expt)</td>"+
                "    </tr>"+
                "    <tr>"+
                "     <td id='flist-view' align='center' valign='top' colspan='6'></td>"+
                "    </tr>"+
                "   </table>"+
                "  </td>"+
                " </tr>"+
                "</table>" );

        tconf = this.config.tabs;
            
        for( var i = 0; i< tconf.tablist.length; i++ ){
        tid = tconf.tablist[i]["tab-id"];
            vid = tconf.tablist[i]["view-id"];

            console.log( "TAB:", tconf['view-anchor'], tid, vid );            
            $( tconf['view-anchor'] ).append( 
                "<div id='" + vid
                    + "' class='" + tconf['view-class'] + "'></div>" )
            $( '#' + vid ).hide();           
            $( '#' + tid ).on( 'click', BKDnodeFeatures.flviewToggle );
        }
        
        // features: sequence to map
        //--------------------------

        var utags = {};

        $('#flist-source')
            .append( "<table width='100%'>"
                     + " <tr><td></td><td valign='right'></td></tr>"
                     + "</table>");

        $('#flist-source table tr td:first-of-type')
            .append('Transcript: &nbsp;&nbsp;'
                    + '<select id="iseq" name="iseq"></select>');
        
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
                var tag = BKDnodeFeatures.xref2inametag( iseq[cs].xref );
                $('#flist-source #iseq')
                    .append('<option value="' + iseq[cs].upr + '">'
                            + tag
                            +' (MANE-Select)</option>');
                selseq = iseq[cs].upr;
            } else {
                aseq.push( BKDnodeFeatures.iseq[cs] );
            }
        }

        console.log("aseq.length:", aseq.length);
        
        // Add canonical (if present)
        //---------------------------
        
        for( var cs in aseq ){
            if( aseq[cs].canon ){
                var tag = BKDnodeFeatures.xref2inametag( aseq[cs].xref );
                $('#flist-source #iseq')
                    .append( '<option value="' + aseq[cs].upr + '">'
                             + tag
                             +' (UniProtKB Canonical)</option>' );
                if( selseq == null)  selseq = aseq[cs].upr;                
            } else {
                if( aseq[cs].upr != BKDnodeFeatures.maneseq
                    && aseq[cs].upr != BKDnodeFeatures.canonseq ){
                    sseq[ aseq[cs].upr ] = aseq[cs];
                }
            }
        }
        
        // Sorted leftovers
        //-----------------
        
        var skeys = Object.keys( sseq ).sort();

        for( var k = 0; k < skeys.length; k++ ){
            var tag = BKDnodeFeatures.xref2inametag( sseq[ skeys[k] ].xref );
            $( '#flist-source #iseq')
                .append( '<option value="' + sseq[skeys[k]].upr + '">'
                         + tag
                         + '</option>');

            if( selseq == null) selseq = sseq[skeys[k]].upr;            
        }

        console.log("sseq:", sseq);        

        BKDnodeFeatures.state.seqvar = selseq;
        
        $('#flist-source #iseq')
            .on( 'change',
                 { parent: BKDnodeFeatures,
                   panel: "loli1"
                 },
                 function( event ){
                     var parent = event.data.parent;
                     console.log( event.data );
                     console.log( $('#flist-source #iseq').val() );
                     var sqsel = $('#flist-source #iseq').val();  
                     var cseq = null;

                     BKDnodeFeatures.state.seqvar
                         = $('#flist-source #iseq').val();

                     for(var i = 0; i < parent.iseq.length; i ++ ){
                         if( sqsel == parent.iseq[i].upr ){
                             cseq = parent.iseq[i].seq;
                         }
                     }
                     
                     console.log("cseq.length: ", cseq.length);
                     
                     $( parent.lollipanels['loli1'].conf.anchor + " *"  )
                         .remove();                                          

                     var flurl = parent.myurl.replace("FULL","FEATL");
                     var fdurl = parent.myurl.replace("detail=FULL","fpos=");

                     var nloli =
                         new BkdLollipop(
                             { anchor: "flist-lollipop-1",
                               id: "lpanel-1",
                               seqname: "my prot mame",
                               dset:{ default:"clinvar",
                                      conf:{
                                          clinvar:{
                                              url: flurl+"&dts=clinvar" },
                                          dbsnp: {
                                              url:flurl+"&dts=dbsnp"
                                          },
                                          bkdrep:{
                                              url:flurl+"&dts=bkdrep" }
                                      }
                                    },
                               fdet:{ url: fdurl }, 
                               url: flurl,
                               uprv: $('#flist-source #iseq').val(),
                               format: format,
                               fcolor: parent.fcolor,
                               vclass: parent.vclass,
                               uprotname: '',
                               detailtable: parent.config.lollipanel.detailtable,
                               detailcbl: [ BKDnodeFeatures.detailCallback ]
                             } );

                     parent.lollipanels[ 'loli1' ] = nloli;
                     
                     var vseq = {};
                     for( var ci in BKDnodeFeatures.iseq ){
                         vseq[ BKDnodeFeatures.iseq[ci].upr ]
                             = BKDnodeFeatures.iseq[ci].seq;
                     }
                                          
                     nloli.initialize ( {
                         vsel: $('#iseq').val(),
                         vseq: vseq ,
                         sequence: cseq } );
                     
                     
                     //loli1.initialize ( { vsel: $('#iseq').val(),
                     //        vseq: vseq ,
                     //        sequence: BKDnodeFeatures.data.sequence });
                     
                 });

        // features: source selection
        //---------------------------
        
        // ClinVar checkbox
        //-----------------

        $('#flist-source table tr td:first-of-type')
            .append('&nbsp;&nbsp;|&nbsp;&nbsp;Feature Source:&nbsp;&nbsp;')
            .append('<input type="checkbox" id="cvflag" '
                    + 'name="cvflag" value="true">')
            .append('<label for="cvflag">ClinVar</label>'
                    +' &nbsp;&nbsp;&nbsp;&nbsp;');
        
        $("#cvflag").prop( "checked", true );
        $("#cvflag").click( function(){
            
            // reset selections
            //-----------------
            /*    
            
            BKDnodeFeatures.fstate = {};
            var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );

            BKDnodeFeatures.setNGLColScheme( BKDnodeFeatures.swmComp,
                                             BKDnodeFeatures.fstate, ftslist );
            BKDnodeFeatures.setNGLColScheme( BKDnodeFeatures.strComp,
                                             BKDnodeFeatures.fstate, ftslist );
            BKDnodeFeatures.setTopoSelScheme( BKDnodeFeatures.strComp,
                                              BKDnodeFeatures.fstate, ftslist );
            $( '#fdet-table' ).remove();
            BKDnodeFeatures.lolipanel( null );
            */
            
            
            BKDnodeFeatures.lollipanels['loli1']
                .state.datasrc.cvflag = $('#cvflag').is(':checked');

            BKDnodeFeatures.lollipanels['loli1']
                .state.dsel.clinvar = $('#cvflag').is(':checked');

            console.log( "CVFlag toggle: state",
                         BKDnodeFeatures.lollipanels['loli1'].state);
            
            // reset selections state
            //-----------------------

            BKDnodeFeatures.lollipanels['loli1'].selReset();
            
            // redisplay lolipops
            //-------------------
            
            BKDnodeFeatures.lollipanels['loli1'].rebuildView();

        });


        // dbSNP flag
        //-----------
        
        $('#flist-source table tr td:first-of-type')
            .append('<input type="checkbox" id="snflag"'
                    + 'name="snflag" value="true">')
            .append('<label for="snflag">dbSNP</label>' 
                    + '&nbsp;&nbsp;&nbsp;&nbsp;');
        $( "#snflag" ).prop( "checked", false );
        
        $('#snflag').click(function(){
            /*
            // reset selections
            //-----------------
            
            BKDnodeFeatures.fstate = {};
            var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );
            
            BKDnodeFeatures.setNGLColScheme( BKDnodeFeatures.swmComp,
                                             BKDnodeFeatures.fstate,
                                             ftslist );
            BKDnodeFeatures.setNGLColScheme( BKDnodeFeatures.strComp,
                                             BKDnodeFeatures.fstate,
                                             ftslist );
            BKDnodeFeatures.setTopoSelScheme( BKDnodeFeatures.strComp,
                                              BKDnodeFeatures.fstate, ftslist );

            $( '#fdet-table' ).remove();
            BKDnodeFeatures.lolipanel( null );
            */

            var lpan1 = BKDnodeFeatures.lollipanels['loli1'];
            
            lpan1.state.datasrc.snflag = $('#snflag').is(':checked');
            lpan1.state.dsel.dbsnp = $('#snflag').is(':checked');

            console.log( "SNFlag toggle: state", lpan1.state);

            // reset selections state
            //-----------------------
            
            lpan1.selReset();

            if( $('#snflag').is(':checked') && lpan1.data.dset.dbsnp == null ){
                
                // fetch feature dataset
                //----------------------
                
                var dsconf = lpan1.conf.dset;
                var dsurl = dsconf.conf.dbsnp.url;
                
                $.ajax( { url: dsurl} )
                    .done( function(target){ return function( data,
                                                              textStatus,
                                                              jqXHR ){
                        
                        lpan1.data.dset.dbsnp = data.node.feature;
                        lpan1.buildView(); } }( this ) );
                
            } else {
                        
                // redisplay lolipops
                //-------------------
            
                lpan1.rebuildView();
            }
        });
           
        $('#flist-source table tr td:first-of-type')
            .append('<input type="checkbox" id="bkflag"'
                    + ' name="bkflag" value="true">')
            .append('<label for="bkflag">CVDB Reports</label>');
        
        $('#bkflag').click(function(){
            console.log( $('#cvflag').is(':checked') + ":" +
                         $('#snflag').is(':checked') + ":" +
                         $('#bkflag').is(':checked') );
            
            // update sources

            BKDnodeFeatures.lollipanels['loli1']
                .state.datasrc.bkflag = $('#bkflag').is(':checked');

            BKDnodeFeatures.lollipanels['loli1']
                .state.dsel.bkrep = $('#bkflag').is(':checked');
            
            console.log( "BKFlag toggle: state",
                         BKDnodeFeatures.lollipanels['loli1'].state);
            
            // reset selections state
            //-----------------------

            BKDnodeFeatures.lollipanels['loli1'].selReset();
            
            // redisplay lolipops
            //-------------------
            
            BKDnodeFeatures.lollipanels['loli1'].rebuildView();            
            
        });

        $('#flist-source table tr td:last-of-type')
            .append("<a id='bkd-lollipop-help' "
                    + "href='page?id=help-lollipop'>Help</a>" );
        
        BKDmodal.init( '#bkd-modal-div',
                       '#bkd-lollipop-help',
                       'page?id=help-lollipop&ret=body' ); 
        
        // lollipop panel 
        //---------------

        // turn on lollipop spinner
        
        $('#bkd-lollipop-spinner').show();

        // lollipop panel-1
        //-----------------

        console.log("BKDnodeFeatures.init(tgt): ", tgt );
        console.log("BKDnodeFeatures.init(format): ", format );
        console.log("BKDnodeFeatures.init(myurl): ",  BKDnodeView.myurl);
        console.log("BKDnodeFeatures.init(seq): ",
                    BKDnodeFeatures.data.sequence);
        console.log("BKDnodeFeatures.init(detailtable): ",
                    this.config.lollipanel.detailtable);

        console.log("BKDnodeFeatures.init(data): ",
                    BKDnodeFeatures.data);


        var flurl = BKDnodeView.myurl + "&detail=FEATL";
        var fdurl = BKDnodeView.myurl + "&fpos=";

        var vseq = {};
        for( var ci in BKDnodeFeatures.iseq ){
            vseq[ BKDnodeFeatures.iseq[ci].upr ] = BKDnodeFeatures.iseq[ci].seq;
        }
        
        var loli1 = new BkdLollipop(
            { anchor: "flist-lollipop-1",
              id: "lpanel-1",
              seqname: BKDnodeFeatures.data.label+"/(transcript)",
              dset:{ default:"clinvar",
                     conf:{
                         clinvar:{
                             url: flurl+"&dts=clinvar" },
                         dbsnp: {
                             url:flurl+"&dts=dbsnp"
                         },
                         bkdrep:{
                             url:flurl+"&dts=bkdrep" }
                     }
                   },
              fdet:{ url:fdurl },                                      
              url: this.myurl.replace("FULL","FEATL"),
              uprv: selseq,
              format: format,
              fcolor: BKDnodeFeatures.fcolor,
              vclass: BKDnodeFeatures.vclass,
              detailtable: this.config.lollipanel.detailtable,
              detailcbl: [ BKDnodeFeatures.detailCallback ]
            } );
        
        var sqsel = $('#iseq').val(); 
        var cseq ='';
        
        for(var i = 0; i < BKDnodeFeatures.iseq.length; i ++ ){
            if( sqsel == BKDnodeFeatures.iseq[i].upr ){
                cseq = BKDnodeFeatures.iseq[i].seq;
            }
        }

        console.log("loli1 init:", sqsel, cseq.length);        
        
        loli1.initialize ( { vsel: $('#iseq').val(),
                             vseq: vseq ,
                             sequence: cseq });
        this.lollipanels['loli1'] = loli1;
        
        // genome viewer panel
        //--------------------

        try{
            BKDnodeFeatures.genomepane( '#track-port', data );
        }catch( err ){
            console.log(err);
        }
        
        // homology panel(s)
        //------------------

        try{
            BKDnodeFeatures.homologpane1( '#homo-port-panther', data );
        } catch( err){
            console.log(err);
        }
        
        try{
            BKDnodeFeatures.homologpane2( '#homo-port-ucsc', data );
        } catch( err){
            console.log(err);
        }
        
        // topology panel
        //---------------

        try{
            this.bkdtopo = BKDnodeFeatures.topopane( '#topo-port', data );
        } catch( err){
            console.log(err);
        }
        
        // swissmodel pane
        //----------------

        var swmUrl = BKDnodeFeatures.siteurl + "swissmodel/"
            + BKDnodeFeatures.data.ac  + "-1_swm.pdb"; 
        
        BKDnodeFeatures.nglSWM = BKDnodeFeatures.nglpane(
            { anchor: "#swm-port",
              name: "swm",
              url: swmUrl,
              controls:{
                  vcls: { name: "vcls",
                          label: "Variant", 
                          type: "checkbox",

                          // variant classes
                          getvcls: BKDnodeFeatures.buildvclist,

                          // lolipop selects
                          getsels: BKDnodeFeatures.buildlslist,

                          // poi selects
                          getpois: BKDnodeFeatures.buildpoilist, 
                          options: BKDnodeFeatures.vclass },
                  menu:[
                      { name: "str",
                        label: "Structure",
                        type: "radio",                            
                        options: BKDnodeFeatures.predlst },

                      { name: "sel",
                        label: "Select",
                        type: "cbox",                            
                        options: BKDnodeFeatures.swmsels },
                  
                      { name: "col",
                        label: "Color By",
                        type: "radio-off",
                        options: BKDnodeFeatures.swmcols },
                      
                      { name: "exp",
                        label: "Export",
                        type: "list",
                        options: BKDnodeFeatures.nglexport },
                      
                      { name: "help",
                        label: "Help",
                        type: "list",
                        options: BKDnodeFeatures.nglhelp }
                      
                  ] },
              poiColor: "#B71DDE"   // "#B7A4BD"
            },
            BKDnodeFeatures,
            [ {base:BKDnodeView, key:"mymsa2a"},
              {base:BKDnodeView, key:"mymsa2b"},
              {base:BKDnodeView, key:"mymsa"}],

            { base: BKDnodeFeatures.lollipanels,
              key: "loli1" }
        );

        console.log( "TOPO:", BKDnodeView.mymsa2a,
                     BKDnodeView.mymsa2b,
                     BKDnodeView.mymsa);
        
        
        // structure pane
        //---------------
       
        var strUrl = BKDnodeFeatures.siteurl + "str-pdb/"
            + BKDnodeFeatures.data.ac  + ".pdb"; 
        
        BKDnodeFeatures.nglSTR = BKDnodeFeatures.nglpane(
            {  anchor: "#str-port",
               name: "str",
               url: strUrl,               
               controls: {
                   vcls: { name: "vcls",
                           label: "Variant", 
                           type: "checkbox",
                           
                           // variant classes
                           getvcls: BKDnodeFeatures.buildvclist,
                           
                           // lolipop selects
                           getsels: BKDnodeFeatures.buildlslist,

                           // poi selects
                           getpois: BKDnodeFeatures.buildpoilist, 
                           options: BKDnodeFeatures.vclass },
                   menu:[
                      { name: "str",
                        label: "Structure",
                        type: "radio",                            
                        options: BKDnodeFeatures.exptlst },                       
                      { name: "sel",
                        label: "Select",
                        type: "cbox",                            
                        options: BKDnodeFeatures.strsels },
                  
                      { name: "col",
                        label: "Color By",
                        type: "radio-off",
                        options: BKDnodeFeatures.strcols },
                      
                      { name: "exp",
                        label: "Export",
                        type: "list",
                        options: BKDnodeFeatures.nglexport },
                      
                      { name: "help",
                        label: "Help",
                        type: "list",
                        options: BKDnodeFeatures.nglhelp }
                       
                   ] },
               poiColor: "#B71DDE"   // "#B7A4BD"
            },
            BKDnodeFeatures,
            [ {base:BKDnodeView, key:"mymsa2a"},
              {base:BKDnodeView, key:"mymsa2b"},
              {base:BKDnodeView, key:"mymsa"}],
            
            { base: BKDnodeFeatures.lollipanels,
              key: "loli1" }
            
        );       
    },

    nglpane: function( config, data, msa, lollipop){
        var ngl  = new BkdNGL( config, data, msa, lollipop );
        return ngl;
    },
    
    topopane: function( anchor, data ){
        
        var config = { anchor: anchor,
                       vclass: BKDnodeFeatures.vclass,            
                       siteurl: BKDnodeFeatures.siteurl};
        
        return topo  = new BkdTopo( config, data );
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
                   + '<input type="button" id="zoom-reset" '
                   + ' name="zreset" value="Zoom reset">'
                   + '&nbsp;'       
                   + '<input type="button" id="zoom-minus" '
                   + ' name="minus" value="-">');
        
        d3.select( "#" + pananchor )
            .html( '<input type="button" id="pan-left" name="plus" value="<">'
                   + '&nbsp;'
                   + '<input type="button" id="pan-reset" '
                   + ' name="preset" value="Pan reset">'
                   + '&nbsp;'       
                   + '<input type="button" id="pan-right" '
                   + ' name="minus" value=">">');                        
        
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
            d3.select('#topo-port svg').transition()
                .call(BKDnodeFeatures.zoom.transform, d3.zoomIdentity);
        } else if( this.id == 'zoom-plus') {
            d3.select('#topo-port svg').transition()
                .call(BKDnodeFeatures.zoom.scaleBy, 1.1);
        } else if (this.id == 'zoom-minus') {
            d3.select('#topo-port svg').transition()
                .call(BKDnodeFeatures.zoom.scaleBy, 0.9);
        }                        
    },

    handleButtonPan: function( e ){        
        if( this.id == 'pan-reset'){
            d3.select( '#topo-port svg').transition()
                .call( BKDnodeFeatures.zoom.transform, d3.zoomIdentity );
        } else if( this.id == 'pan-left') {
            d3.select( '#topo-port svg').transition()
                .call( BKDnodeFeatures.zoom.translateBy, -50, 0 );
        } else if (this.id == 'pan-right') {
            d3.select( '#topo-port svg').transition()
                .call( BKDnodeFeatures.zoom.translateBy, 50, 0 );
        }  
    },

    genomepane: function( anchor, data ){
        
        $( anchor ).show();
        $( anchor )
            .append( "<div id='bkd-genome-build' "
                     + " class='bkd-select-panel' ></div>");
        $( '#bkd-genome-build' )
            .append( 'Genome Build:&nbsp;&nbsp;'
                     + '<input type="radio" id="build37flag" name="buildflag"'
                     + ' value="build37">')
            .append('<label for="build37flag">GRCh37/hg19</label>'
                    +'&nbsp;&nbsp;&nbsp;&nbsp;');
        $( "#build37flag" ).prop( "checked", true );
        $( '#build37flag' ).click(function(){           
            BKDnodeFeatures.igvinit("hg19");
        });
        $( '#bkd-genome-build' )
            .append('<input type="radio" id="build38flag" '
                    + ' name="buildflag" value="build38">')
            .append('<label for="build38flag">GRCh38/hg38</label>'
                    + '&nbsp;&nbsp;&nbsp;&nbsp;');
        $( "#build38flag" ).prop( "checked", false );
        $('#build38flag').click(function(){           
            BKDnodeFeatures.igvinit("hg38");
        });
        
        this.gname = data["label"];
        for( a in data.alias){
            //console.log("A: "+ JSON.stringify( data.alias[a]) );
            if( data.alias[a]["type-name"] == "gene-name" ){
                this.gname = data.alias[a]["alias"]
            }
        }         

        // build
        
        var gburl = BKDnodeFeatures.ucscSrcUrl.replace('%BID%','hg19');  
        gburl = gburl.replace('%CID%','');  // chromosome
        gburl = gburl.replace('%SID%','');  // start
        gburl = gburl.replace('%EID%','');  // stop
        gburl = gburl.replace('%SRC%',this.gname);    // gene name
        
        $( '#bkd-genome-build' )
            .append("&nbsp;&nbsp;|| &nbsp;&nbsp; UCSC Genome Browser: "
                    + "<a href='" + gburl + "' target='_bkd'>Go</a>");
        
        $( anchor )
            .append( "<div id='bkd-genome-viewer' "
                     + " class='bkd-genome-viewer' ></div>");
        
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
    
    setTopoSelScheme: function( comp, fstate, ftslist ){
        BKDnodeFeatures.bkdtopo.setColor( BKDnodeFeatures.fstate );
    },

    setHomolSelScheme: function( comp, fstate, ftslist ){
        
        // set ftslist: cyan

        var smap = {};
        
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
    },
    
    // selection action: structure viewer(s) color
    //--------------------------------------------

    setNGLColScheme: function( bkdngl ){
        
        if( bkdngl !== undefined && bkdngl != null ){
            //bkdngl.rerender();
            bkdngl.setHamStyle( 'poi', this.poi, null );
        }

    },
    
    // selection action: structure viewer(s) selection
    //------------------------------------------------
    
    //setNGLSelScheme: function( comp, fstate, ftslist ){
    
    setNGLSelScheme: function( event ){
        console.log( "setNGLSelScheme:", event);       
        console.log( "BKDnodeFeatures.swmStage:", BKDnodeFeatures.swmStage);
        console.log( "   ", BKDnodeFeatures.swmQCSel);

        var sel = "";

        // ############
        
        console.log( "setNGLSelScheme -> tgt:", event.target.name,
                     event.target.value, event.target.checked  );
        if( event.target.checked && event.target.value == 'hiqc' ) {
            sel = BKDnodeFeatures.swmQCSel;
        } else {
            sel = "all";
        }
        
        BKDnodeFeatures.swmComp.setSelection( sel );
        
        return;
        
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
   
    setIGVSelScheme: function(pos37,pos38 ){
        console.log("setIGVSelScheme",pos37,pos38);
        rpos ="";
        for( p in pos37 ){
            rpos += p +":-1;"
        }
        //console.log("setIGVSelScheme: rpos: " + rpos );
        
       if( rpos != '' ){
           //console.log("setIGVSelScheme:ON");
           BKDnodeFeatures.igvbrowse.clearROIs();
           BKDnodeFeatures.igvbrowse.loadROI([{
               name: 'Feature',
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

    // selection: feature table viewer (as lollipop callback)
    //-------------------------------------------------------
    
    detailCallback: function( plist, state, slist ){
        console.log( "detailCallback: called");
        console.log( "state:", state );
        console.log( "slist:", slist );

        BKDnodeFeatures.fstate = state;
        
        BKDnodeFeatures.setTopoSelScheme( "topo-port",
                                          //BKDnodeFeatures.fstate,
                                          state,
                                          slist
                                        );
        
        if( BKDnodeFeatures.nglSWM !== null){
            
            BKDnodeFeatures.setNGLColScheme( BKDnodeFeatures.nglSWM );
        }
        
        if( BKDnodeFeatures.nglSTR !== null){
            BKDnodeFeatures.setNGLColScheme( BKDnodeFeatures.nglSTR );
        }
        
        var rows = {};
       
        for( var x in plist ){
            var pos = plist[x].pos.toString(); 
            if(  pos in state ){
                if( state[pos].on){                   
                    if( ! (pos in rows) ){
                        rows[pos]= [];
                    }
                    rows[pos].push( plist[x] );
                    console.log( "plist:" + x + " :: "
                                 + JSON.stringify( plist[x] ) );
                }
            }
        }
        var html = "";
        
        var pos37map = {};
        var pos38map = {};

        if( Object.keys(rows).length > 0 ){
            console.log("RR:", rows);
            
            for( var r in rows){
                console.log( " row:", r );
                
                for( var rr in rows[r]){                    
                    pos37map[rows[r][rr]['pos37']] = rows[r][rr]['pos37'];
                    pos38map[rows[r][rr]['pos38']] = rows[r][rr]['pos38'];
                }
            }
        }
        
        BKDnodeFeatures.setIGVSelScheme( pos37map, pos38map );

        // isoform sequence MSA
        //---------------------
        
        var smap = {};
        var ftslist = slist;
        var fstate = state;
        
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
        console.log("smap.keys ->", Object.keys(smap) );

        var rseq = $('#flist-source #iseq').val(); 

        console.log("\n\nBKDnodeView.mymsa callback");
        
        BKDnodeView.mymsa.dropAllSelect(); 

        // Note: remaps smap positions to equivalent in 'canonical'
        
        var canLst = BKDnodeView.mymsa
            .setSelectList( Object.keys(smap),
                            rseq, 1,
                            'canonical', 0,
                            BKDnodeView.poi );
        
        //console.log("canLst:",canLst);
        BKDnodeView.mymsa.setSelectView();  // set view window
        
        console.log("BKDnodeView.mymsa callback:DONE\n\n\n");
                
        // NOTE: test alternates
        //BKDnodeView.mymsa.setNavView( BKDnodeView.mymsa._view.navWidth/2,
        //                              BKDnodeView.mymsa._view.navWidth);

        console.log("BKDnodeView.mymsa2a callback");
        
        BKDnodeView.mymsa2a.dropAllSelect();
        //BKDnodeView.mymsa2a.setSelectList( Object.keys(smap), rseq, 1);
        BKDnodeView.mymsa2a.setSelectList( canLst,
                                           'Homo sapiens', 1,
                                           null, null,
                                           BKDnodeView.poi );
        BKDnodeView.mymsa2a.setSelectView();

        console.log("BKDnodeView.mymsa2b callback");

        BKDnodeView.mymsa2b.dropAllSelect();
        //BKDnodeView.mymsa2b.setSelectList( Object.keys(smap), rseq, 1);
        BKDnodeView.mymsa2b.setSelectList( canLst,
                                           'Homo sapiens', 1,
                                           null, null,
                                           BKDnodeView.poi );
        BKDnodeView.mymsa2b.setSelectView();
    },
    
    // tab panel toggle
    //-----------------

    flviewToggle: function(event){
        var nview = "#" + event.currentTarget.id.replace('-tab','');
        var tabid = "#" + event.currentTarget.id;
        
        console.log( "Toggle: "+ BKDnodeFeatures.flview +" -> " + nview );
        console.log( "OFF: " +  BKDnodeFeatures.flview + " .tab-port");
        
        $( BKDnodeFeatures.flview.replace('-tab','-port') ).hide();
        $( BKDnodeFeatures.flview + "" ).addClass('bkd-feat-tab-off');
        $( BKDnodeFeatures.flview + "" ).removeClass('bkd-feat-tab-on');
        
        BKDnodeFeatures.flview = tabid;

        console.log( "ON: " +  BKDnodeFeatures.flview + " .tab-port");
        
        $( BKDnodeFeatures.flview  ).addClass('bkd-feat-tab-on');
        $( BKDnodeFeatures.flview  ).removeClass('bkd-feat-tab-off');      
        $( BKDnodeFeatures.flview.replace('-tab','-port') ).show();
        
        if( BKDnodeFeatures.igvbrowse !== null ){
            BKDnodeFeatures.igvbrowse.visibilityChange();
        } 
    },

    homologpane1: function( anchor, data ){
        //msaid = anchor.replace("#","") + "-msa";
        msaid = "seq-viewer-2a";
        msaurl = "msa-ucscgb/" + BKDnodeFeatures.data.ac + ".fasta";

        var msaConfig = {
            "width": 650,
            "height":625,
            "header":{
                "label":[1],
                "popup":[]
            },
            
            "taxname": {'9606': 'Human',
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

        BKDnodeView.mymsa2a = new BkdMSA( msaConfig );
        
        d3.select( anchor )
            .html( '<div id="' + msaid
                   + '" class="bkd-msa" style="background-color: black;">'
                   +'</div>' );
        
        BKDnodeView.mymsa2a.initialize( { "anchor": '#' + msaid,
                                          "url": msaurl });     
       
    },
                
    homologpane2: function( anchor, data ){
        //msaid = anchor.replace("#","") + "-msa";
        msaid = "seq-viewer-2b";
        msaurl = "msa-panther/" + BKDnodeFeatures.data.ac + ".fasta";

        var msaConfig = {
            "width": 650,
            "height":625,
            "header":{
                "label":[1],
                "popup":[]
            },
            
            "taxname": {'9606': 'Human',
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

        BKDnodeView.mymsa2b = new BkdMSA( msaConfig );
        
        d3.select( anchor )
            .html( '<div id="' + msaid
                   + '" class="bkd-msa" style="background-color: black;">'
                   + '</div>' );
        
        BKDnodeView.mymsa2b.initialize( { "anchor": '#' + msaid,
                                          "url": msaurl });
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
    },

    // POI set/reset
    //--------------
    
    setPOI: function( poi ){
        console.log("POI: BKDnodeFeatures.setPOI:", poi);
        if( BKDnodeFeatures.lollipanels[ 'loli1' ] != null ){
            BKDnodeFeatures.lollipanels[ 'loli1' ].setPOI( poi );            
        }

        if( BKDnodeFeatures.nglSWM != null ){
            BKDnodeFeatures.nglSWM.setPOI( poi );            
        }

        if( BKDnodeFeatures.nglSTR != null ){
            BKDnodeFeatures.nglSTR.setPOI( poi );            
        } 
    },
    
    // lolipop selects
    //----------------
    
    buildlslist: function( args ){
        return BKDnodeFeatures.fstate;
    },



    // poi selects
    //------------
    
    buildpoilist: function( args ){
        return BKDnodeView.poi;
    },


    
    // variant classes
    //----------------
    
    buildvclist: function( ftypesel ){

        var plist = BKDnodeFeatures.lollipanels['loli1'].data.plist;
        
        var tcnt = 0;
        for( var t in ftypesel.vcls ){            
            if( ftypesel.vcls[t] == true ){
                tcnt +=1;
            }
        }
        
        var ccol = "#808080";
        
        var pdict = {}
        for( var t in ftypesel.vcls ){
            if( ftypesel.vcls[t] == true ){
                var sigtag = BKDnodeFeatures.sigtag[t];

                for(var s in BKDnodeFeatures.vclass){
                    if( BKDnodeFeatures.vclass[s].value  == t ){
                        ccol = BKDnodeFeatures.vclass[s].color;
                        break;
                    }
                }
                
                if( sigtag != undefined ){
                    for( var i in plist ){  
                        if( plist[i].significance == sigtag ){
                            if( tcnt == 1 && ccol == "#808080" ){            
                                for( var k in BKDnodeFeatures.vclass){
                                    if( BKDnodeFeatures
                                        .vclass[k].value == sigtag ){
                                        ccol = BKDnodeFeatures.vclass[k].color;
                                    }
                                }
                            }
                            pdict[plist[i].pos] = {
                                "pos": plist[i].pos,
                                "col": ccol,
                                "name": plist[i].pos
                            }
                        }
                    }
                }
            }
        }
        return pdict;        
    }
};
