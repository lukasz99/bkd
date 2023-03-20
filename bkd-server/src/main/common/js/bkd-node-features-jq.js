console.log("bkd-node-features-jq: common");
        
BKDnodeFeatures = {
    myurl: "",
    siteurl: "./",
    dsurl: "https://www.ncbi.nlm.nih.gov/snp/",
    cvurl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/",
    gnurl: "https://gnomad.broadinstitute.org/variant/",
    cgurl: "https://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/by_canonicalid?canonicalid=",
    vclass: [ { "id":"flist-select-1","name":"select-1",
                "label":"Benign", "value":"benign",
                "color":"blue" },
              { "id":"flist-select-2","name":"select-2",
                "label":"Likely Benign", "value":"likely benign",
                "color":"cyan" },
              { "id":"flist-select-3","name":"select-3",
                "label":"Conflicting Evidence", "value":"conflicting evidence",
                "color":"#cc79de" },
              { "id":"flist-select-4","name":"select-4",
                "label":"Likely Pathogenic", "value":"likely pathogenic",
                "color":"pink" },
              { "id":"flist-select-5","name":"select-5",
                "label":"Pathogenic", "value":"pathogenic",
                "color":"red" } ],
    fcolor:   { "pathogenic":"red",
                "likely pathogenic":"pink",
                "uncertain":"#beaed4",
                "conflicting evidence":"#cc79de",
                "unspecified":"#c0c0c0",
                "likely benign":"cyan",
                "benign":"blue"                              
              },
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
    config: {"lollipanel":{ "detailtable":null } },
    state: { fsel:{ topo:{}, swm:{}, str:{} }, seqvar: null },
    
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
                "  <td id='flist' width='1024' colspan='1' rowspan='1' valign='top' align='center'>"+
                "   <div id='flist-source' class='bkd-select-panel'></div>"+ 
                "   <div id='flist-lollipop-1' class='bkd-select-panel'></div>"+ 
                "  </td>"+                                            
                "  <td valign='top' align='center'>"+
                "   <table style='border-spacing: 0px;' width='100%'>"+
                "    <tr>"+
                "     <td id='track-tab' class='bkd-feat-tab-on track-tab'>Genome&nbsp;Viewer</td>"+
                "     <td id='homo-tab-panther' class='bkd-feat-tab-off homo-tab' title='Source: UCSC Genome Browser' >Homology&nbsp;(G)</td>"+
                "     <td id='homo-tab-ucsc' class='bkd-feat-tab-off homo-tab' title='Source: PantherDB'>Homology&nbsp;(P)</td>"+
                "     <td id='topo-tab' class='bkd-feat-tab-off topo-tab'>Membrane&nbsp;Topology</td>"+
                "     <td id='swm-tab' class='bkd-feat-tab-off swm-tab'>SwissModel</td>"+
                "     <td id='str-tab' class='bkd-feat-tab-off str-tab'>Structure</td>"+
                "    </tr>"+
                "    <tr>"+
                "     <td id='flist-view' align='center' valign='top' colspan='6'></td>"+
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
            "<div id='homo-port-panther' style='width:600px; height:625px;' class='tab-port'></div>");
        $( '#homo-port-panther').hide();
        $( '#homo-tab-panther').on('click',BKDnodeFeatures.flviewToggle);
        
        $( '#flist-view' ).append(
            "<div id='homo-port-ucsc' style='width:600px; height:625px;' class='tab-port'></div>");
        $( '#homo-port-ucsc').hide();
        $( '#homo-tab-ucsc').on('click',BKDnodeFeatures.flviewToggle);
        
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
        
        // features: sequence to map
        //--------------------------

        var utags = {};

        $('#flist-source')
            .append( "<table width='100%'>"
                     + " <tr><td></td><td valign='right'></td></tr>"
                     + "</table>");

        $('#flist-source table tr td:first-of-type').append('Sequence: &nbsp;&nbsp;'
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
                         new BkdLollipop( { anchor: "flist-lollipop-1",
                                            id: "lpanel-1",
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
                                            detailtable: parent.config.lollipanel.detailtable,
                                            detailcbl: [ BKDnodeFeatures.detailCallback ]
                                          } );

                     parent.lollipanels[ 'loli1' ] = nloli;
                     
                     var vseq = {};
                     for( var ci in BKDnodeFeatures.iseq ){
                         vseq[ BKDnodeFeatures.iseq[ci].upr ] = BKDnodeFeatures.iseq[ci].seq;
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
            .append('<input type="checkbox" id="cvflag" name="cvflag" value="true">')
            .append('<label for="cvflag">ClinVar</label>&nbsp;&nbsp;&nbsp;&nbsp;');
        
        $("#cvflag").prop( "checked", true );
        $("#cvflag").click( function(){
            
            // reset selections
            //-----------------
            /*    
            
            BKDnodeFeatures.fstate = {};
            var ftslist = BKDnodeFeatures.getfselist( BKDnodeFeatures.ftypesel );

            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                             BKDnodeFeatures.fstate, ftslist );
            BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
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
            .append('<input type="checkbox" id="snflag" name="snflag" value="true">')
            .append(`<label for="snflag">dbSNP</label>&nbsp;&nbsp;&nbsp;&nbsp;`);
        $( "#snflag" ).prop( "checked", false );
        
        $('#snflag').click(function(){
            /*
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
            .append('<input type="checkbox" id="bkflag" name="bkflag" value="true">')
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
            .append("<a href='page?id=help-lollipop'>Help</a>" );
        
        // lollipop panel 
        //---------------

        // turn on lollipop spinner
        
        $('#bkd-lollipop-spinner').show();

        // lollipop panel-1
        //-----------------

        console.log("BKDnodeFeatures.init(tgt): ", tgt );
        console.log("BKDnodeFeatures.init(format): ", format );
        console.log("BKDnodeFeatures.init(myurl): ",  BKDnodeView.myurl);
        console.log("BKDnodeFeatures.init(seq): ",  BKDnodeFeatures.data.sequence);
        console.log("BKDnodeFeatures.init(detailtable): ",   this.config.lollipanel.detailtable);
        
        var flurl = BKDnodeView.myurl + "&detail=FEATL";
        var fdurl = BKDnodeView.myurl + "&fpos=";

        var vseq = {};
        for( var ci in BKDnodeFeatures.iseq ){
            vseq[ BKDnodeFeatures.iseq[ci].upr ] = BKDnodeFeatures.iseq[ci].seq;
        }
        
        var loli1 = new BkdLollipop( { anchor: "flist-lollipop-1",
                                       id: "lpanel-1",
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
        
        loli1.initialize ( { vsel: $('#iseq').val(),
                             vseq: vseq ,
                             sequence: BKDnodeFeatures.data.sequence });
        this.lollipanels['loli1'] = loli1;
        
        // genome viewer panel
        //--------------------

        BKDnodeFeatures.genomepane( '#track-port', data );

        // homology panel(s)
        //------------------

        BKDnodeFeatures.homologpane1( '#homo-port-panther', data );

        BKDnodeFeatures.homologpane2( '#homo-port-ucsc', data );
        
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
                   + '<div id="swm-view" class="swm-view"></div>' )
        
        BKDnodeFeatures.fselcontrol( "swm-select-controls",
                                     BKDnodeFeatures.vclass,                                    
                                     "swm",
                                     BKDnodeFeatures.state.fsel.swm,
                                     BKDnodeFeatures.lollipanels['loli1'],
                                     BKDnodeFeatures.lollipanels['loli1'].flistSelEventAction );
        
        var ph = $('#swm-port').height();
        var ch = $('#swm-controls').height();
        $('#swm-view').height( ph-ch);
        
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
                   + '<div id="str-view" class="str-view"></div>' )
        
        BKDnodeFeatures.fselcontrol( "str-select-controls",
                                     BKDnodeFeatures.vclass,
                                     "str",
                                     BKDnodeFeatures.state.fsel.str,
                                     BKDnodeFeatures.lollipanels['loli1'],
                                     BKDnodeFeatures.lollipanels['loli1'].flistSelEventAction );
                
        var ph = $('#str-port').height();
        var ch = $('#str-controls').height();
        $('#str-view').height( ph-ch);
        
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
                                         "topo",
                                         BKDnodeFeatures.state.fsel.topo,
                                         BKDnodeFeatures.lollipanels['loli1'],
                                         BKDnodeFeatures.lollipanels['loli1'].flistSelEventAction
                                       );

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
            if( data.alias[a]["type-name"] == "gene-name" ){
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
       
    fselcontrol: function( anchor, clist, fselname, fselstate, lpanel, action){
        
        //"swm-select-controls",
        //BKDnodeFeatures.vclass,                                    
        //"swm",
        //BKDnodeFeatures.state.fsel.swm,
        //BKDnodeFeatures.lollipanels['loli1'],
        //BKDnodeFeatures.lollipanels['loli1'].flistSelEventAction );
            
        console.log( "BKDnodeFeatures.fselcontrol:", lpanel,action);
        if( ! d3.select( "#" + anchor  ).empty() ){                    
            d3.select( "#" + anchor + " *" ).remove();
        }

        d3.select( "#" + anchor )
            .html('&nbsp;&nbsp;&nbsp;&nbsp;');
        
        for( var s in clist ){
            d3.select( "#" + anchor )
                .append("input")
                .attr( "type", "checkbox")
                .attr( "id", anchor + "-" + s )
                .attr( "name", anchor + "-" + s )
                .attr( "value", clist[s]["value"])
                .attr( "style", "accent-color: " + clist[s]["color"]+ ";");
            
            d3.select( "#" + anchor )
                .append( "label" )
                .attr( "for" , anchor + "-" + s )
                .html( clist[s]["label"] + " &nbsp;&nbsp;" );
                
            BKDnodeFeatures.ftypesel[clist[s]["value"]]=false;

            $( "#" + anchor + "-" + s )
                .on( 'click', {lpanel: lpanel,
                               fselname: fselname,
                               fselstate: fselstate },
                     (event) => { console.log( 'click: data->', event.data );
                                  event.data.lpanel.flistSelEventAction( event );
                                } );
                        
        }
        console.log( "BKDnodeFeatures.fselcontrol action: ", "#" + anchor + " input");
        console.log( "BKDnodeFeatures.fselcontrol action: ", lpanel.flistSelEventAction );
        console.log( $( "#" + anchor + " input") );        
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

    getfselist: function( ftypesel, plist ){

        console.log( "BKDnodeFeatures.getfselist", BKDnodeFeatures.plist );
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
                for( var i in plist ){
                    if( plist[i].significance == t ){
                        if( tcnt == 1 && ccol == "#808080" ){            
                            for( var k in BKDnodeFeatures.vclass){
                                if( BKDnodeFeatures.vclass[k].value == t ){
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
                console.log("FSTATE ON:", i);
                if( $('#aa' + (i-1).toString() + '_symbol').length > 0){
                    $('#aa' + (i-1).toString() + '_symbol')[0].setAttribute('fill', "orange")
                }
            }
        }        
    },

    setHomolSelScheme: function( comp, fstate, ftslist ){
        
        // set ftslist: cyan

        var smap = {};

        D3MSA1.dropAllSelect();
        D3MSA2.dropAllSelect();
        
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
        
        D3MSA1.setSelectList( Object.keys(smap) );
        D3MSA2.setSelectList( Object.keys(smap) );

        //D3MSA.setSelectMap( smap );
        
        D3MSA1.setNavView(D3MSA1._msaW/2,D3MSA1._msaW);
        D3MSA2.setNavView(D3MSA2._msaW/2,D3MSA2._msaW);
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

                   if( BKDnodeFeatures.plist[x].loaded == undefined){
                       console.log("read fetures: pos#",BKDnodeFeatures.plist[x].pos);
                       BKDnodeFeatures.plist[x].loaded = true;
                   }
                   
                   rows[pos].push( BKDnodeFeatures.plist[x] );
                   console.log( "plist:" + x + " :: " +JSON.stringify(BKDnodeFeatures.plist[x] ));
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
                   
                   //console.log( "row:: " + rr + " :: "+JSON.stringify(rows[r][rr]) );
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
                       //console.log( "row:: " + c +
                       //             " ::" +JSON.stringify(options.cols[c]));
                       
                       var vlst = rows[r][rr].dtval[options.cols[c]['cid']];
                       var cclass = options.cols[c]['class'];
                       if( vlst.length > 0) {
                           hrow += "<td class='"+ cclass +"'>" + vlst[0] + "</td>";
                       } else {
                           hrow += "<td class='"+ cclass +"'>&nbsp;</td>";
                       }
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


    
    detailCallback: function( plist, state, slist ){
        console.log( "detailCallback: called");
        console.log( "state:", state );
        console.log( "slist:", slist );

        BKDnodeFeatures.setTopoSelScheme( "topo-port",
                                          //BKDnodeFeatures.fstate,
                                          state,
                                          slist
                                        );

        BKDnodeFeatures.setHomolSelScheme( BKDnodeFeatures.strComp,
                                           //BKDnodeFeatures.fstate,
                                           state,
                                           slist );
       
        BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.swmComp,
                                         //BKDnodeFeatures.fstate,
                                         state,
                                         slist
                                      );
       
        BKDnodeFeatures.setNGLSelScheme( BKDnodeFeatures.strComp,
                                         //BKDnodeFeatures.fstate,
                                         state,
                                         slist );

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
        
        BKDnodeView.mymsa.dropAllSelect(); 

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
        
        BKDnodeView.mymsa.setSelectList( Object.keys(smap), rseq );
        BKDnodeView.mymsa.setNavView( BKDnodeView.mymsa._view.navWidth/2,
                                      BKDnodeView.mymsa._view.navWidth);        
    },
    
    // tab panel toggle
    //-----------------

    flviewToggle: function(event){
        var nview = "#" + event.currentTarget.id.replace('-tab','');
        var tabid = "#" + event.currentTarget.id;
        
        console.log( "Toggle: "+ BKDnodeFeatures.flview +" -> " + nview );

        /*
        
        $( BKDnodeFeatures.flview + "-port" ).hide();
        $( BKDnodeFeatures.flview + "-tab" ).addClass('bkd-feat-tab-off');
        $( BKDnodeFeatures.flview + "-tab" ).removeClass('bkd-feat-tab-on');
        
        BKDnodeFeatures.flview = nview;
        $( BKDnodeFeatures.flview + "-tab" ).addClass('bkd-feat-tab-on');
        $( BKDnodeFeatures.flview + "-tab" ).removeClass('bkd-feat-tab-off');      
        $( BKDnodeFeatures.flview + "-port" ).show();
      
        //console.log( "Toggle: BKDnodeFeatures.igvbrowse " +
        //             BKDnodeFeatures.igvbrowse );
                  
        */

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
        msaid = anchor.replace("#","") + "-msa";
        d3.select( anchor )
            .html( '<div id="' + msaid +'" class="bkd-msa" style="background-color: black;">'
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

        var msa = D3MSA1.initialize( '#'+msaid, "msa/" + BKDnodeFeatures.data.ac + ".fasta",
                                     msaConfig);
        
    },  

    homologpane2: function( anchor, data ){
        msaid = anchor.replace("#","") + "-msa";
        console.log("hpane2: " + msaid );
        d3.select( anchor )
            .html( '<div id="' + msaid +'" class="bkd-msa" style="background-color: black;">'
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

        var msa = D3MSA2.initialize( '#'+msaid, "msa2/" + BKDnodeFeatures.data.ac + ".fasta",
                                     msaConfig);
        
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
};
