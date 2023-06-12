console.log("bkd-node-search-jq: common");
    
BKDnodeSearch = {
    siteurl: "",
    nodeAnchor: null,
    srcAnchor: null,
    query: "",
    qmode: "",
    qtotal: 0,
    srcFirstNode: 0,
    srcMaxNode: 10,
    flist: null,
    fldet: null,
    flport: null,
    igvbrowse:null,
    flview: "#swmod",
    paneon: null,
    data: null,
    cpos37: "",
    cpos38: "",
    init: function( data, srcAnchor, nodeAnchor, flist, mode){
        BKDnodeSearch.view( data, srcAnchor, nodeAnchor, flist, mode);
    },

    view: function(data, srcAnchor, srcViewAnchor, nodeAnchor, flist, mode){
        
        this.srcAnchor=srcAnchor;
        this.srcViewAnchor=srcViewAnchor;
        this.nodeAnchor=nodeAnchor;
        
        if(data == null ){
            $( nodeAnchor ).hide();            
            BKDnodeSearch.search( data, node.srcAnchor );
            $( srcAnchor ).show();            
        }else{
            BKDnode.data = data;
            $( srcAnchor ).hide();            
            $( srcViewAnchor ).hide();            
            BKDnodeView.nodeView( data, this.srcAnchor, this.srcViewAnchor,
                                  this.nodeAnchor, flist, mode );
            $( nodeAnchor ).show();
        }
    },
    
    doSearch: function( qmode, squery ){     
        
        if( qmode == undefined ){
            BKDnodeSearch.qmode = $("#bkd-qmode").val();  
        } else {
            BKDnodeSearch.qmode = qmode;
        }
        
        if( squery == undefined ){
            BKDnodeSearch.query = $("#bkd-squery").val();  
        } else {
            BKDnodeSearch.query = squery;
        }
        
        console.log( $("#bkd-qmode").val(), BKDnodeSearch.qmode );
        console.log( $("#bkd-squery").val(), BKDnodeSearch.query );
        
        BKDnodeSearch.srcFirstNode = 0; // reset page
        
        console.log( qmode + ":" + squery
                     + "\nfirst:" + BKDnodeSearch.srcFirstNode
                     + "\nmax: " + BKDnodeSearch.srcMaxNode);
        
        myurl ="search?qmode=" + BKDnodeSearch.qmode
            + "&first=" + BKDnodeSearch.srcFirstNode
            + "&max=" + BKDnodeSearch.srcMaxNode
            + "&query=" + BKDnodeSearch.query;

        console.log(myurl);

        
        $("#bkd-search-table").hide();   
        $("#bkd-node-spinner").show();
        $.ajax( { url: myurl} )
            .done( function(data, textStatus, jqXHR){
                console.log( JSON.stringify(textStatus)
                             + " || data.length: "  + JSON.stringify(data).length); 
                $("#bkd-node-spinner").hide();
                $("#bkd-search-table").show();
                BKDnodeSearch.searchView( data.rdata,
                                          data.rstats,
                                          "#bkd-search", "#bkd-search-view", 
                                          "#bkd-node-view",
                                          BKDconf["node"], qmode) } );
    },
    
    doHeadSearch: function( qmode, squery ){
        
        if( qmode == undefined ){
            BKDnodeSearch.qmode = $("#bkd-head-qmode").val();  
        } else {
            BKDnodeSearch.qmode = qmode;
        }
        
        if( squery == undefined ){
            BKDnodeSearch.query = $("#bkd-head-squery").val();  
        } else {
            BKDnodeSearch.query = squery;
        }
        
        console.log( "HeadSearch: " + BKDnodeSearch.qmode + ":" + BKDnodeSearch.query);
      
        myurl ="search?qmode=" + BKDnodeSearch.qmode
            + "&first=" + BKDnodeSearch.srcFirstNode
            + "&max=" + BKDnodeSearch.srcMaxNode
            + "&query="+BKDnodeSearch.query;

        console.log(myurl);

        $("#bkd-search-table").hide();   
        $("#bkd-node-spinner").show();
        
        $.ajax( { url: myurl} )
            .done( function(data, textStatus, jqXHR){
                console.log( JSON.stringify(textStatus)
                             + " || data.length: "  + JSON.stringify(data).length); 

                console.log(data.rdata);
                $("#bkd-node-spinner").hide();
                BKDnodeSearch.searchView( data.rdata,
                                          data.rstats,  
                                          "#bkd-search", "#bkd-search-view",
                                          "#bkd-node-view",
                                          BKDconf["node"], qmode) } );
    },
    
    search: function( data, srcAnchor ){

        $(srcAnchor + " form").submit(
            function (event) {
                var radioValue = $("input[name='smode']:checked").val();
                if(radioValue){
                    //alert("Your are a - " + radioValue);
                } else {
                    radioValue = 'protein';
                }
                
                var q = $("#bkdQuery").val();
                var ns = "";
                var ac = "";
                var formData = {};
                if(q.startsWith("upr:") ){
                    ns="upr";
                    ac=q.replace("upr:","");
                    
                    formData = {
                        query: q,
                        ns: ns,
                        ac: ac,
                        qmode: radioValue,
                        ret: "data"
                    };
                }else{
                    formData = {
                        query: q,
                        ns: ns,
                        ac: ac,
                        qmode: radioValue,
                        ret: "data"
                    };
                }
          
                $.ajax({
                    type: "POST",            
                    url: "search",
                    data: formData,
                    dataType: "json",
                    encode: true,}).done(
                        function (data) {
                            if( data.rdata != null && data.rdata.length > 0){
                                BKDnodeSearch.searchView( data.rdata,
                                                          data.rstats,
                                                          BKDrep.srcAnchor,
                                                          "view" );  
                            }else if(data.record !== null){
                                BKDrep.nodeView( data.record,
                                                 BKDrep.nodeAnchor,
                                                 "view" );               
                            }
                        });
                
                event.preventDefault();
            });
    },
    
    searchPage: function(){
        // run query      
        myurl = "search?qmode=" + BKDnodeSearch.qmode
            + "&first=" + BKDnodeSearch.srcFirstNode
            + "&max=" + BKDnodeSearch.srcMaxNode
            + "&query=" + BKDnodeSearch.query;
        
        $("#bkd-search-table").hide();   
        $("#bkd-node-spinner").show();
        $.ajax( { url: myurl} )
            .done( function(data, textStatus, jqXHR){
                console.log( JSON.stringify(textStatus)
                             + " || data.length: "  + JSON.stringify(data).length); 
                $("#bkd-node-spinner").hide();
                $("#bkd-search-table").show();
                BKDnodeSearch.searchView( data.rdata,
                                          data.rstats,
                                          "#bkd-search", "#bkd-search-view", 
                                          "#bkd-node-view",
                                          BKDconf["node"], BKDnodeSearch.qmode) } );
        
    },
    
    bkdTablePager: function( anchor ){   // data == BKDnode
        
        $( anchor ).empty();
        $( anchor ).append( "<tr>" +
                            "<td>Total Records: " + String(BKDnodeSearch.qtotal) + " | </td>" +
                            "<td><input id='bkd-page-first' type='button' value='&lt;&lt;first' /></td>"+
                            "<td><input id='bkd-page-prev' type='button' value='&lt;prev' /></td>" +
                            "<td id='bkd-page-current'></td>" +
                            "<td><input id='bkd-page-next' type='button' value='next&gt;' /></td>" +
                            "<td><input id='bkd-page-last' type='button' value='last&gt;&gt;' /></td>"+
                            "<td> | Page size: <select id='bkd-page-size'>"+
                            "<option value='5'>5</option>"+
                            "<option value='10'>10</option>"+
                            "<option value='25'>25</option>"+
                            "</select></td>"+
                            "</tr>" );
        
        $( "#bkd-page-size" ).val(BKDnodeSearch.srcMaxNode);
        
        $('#bkd-page-size').on( 'change', function(event){     
            BKDnodeSearch.srcMaxNode = $( "#bkd-page-size" ).val();
            var fpos = (BKDnodeSearch.srcFirstNode+1)/BKDnodeSearch.srcMaxNode;
            BKDnodeSearch.srcFirstNode = Math.floor( fpos ) * BKDnodeSearch.srcMaxNode;
            BKDnodeSearch.searchPage();
        });
        
        
        $('#bkd-page-first').on( 'click', function(event){                        
            BKDnodeSearch.srcFirstNode = 0;
            BKDnodeSearch.searchPage();
        });
        
        $('#bkd-page-prev').on( 'click', function(event){                       
            BKDnodeSearch.srcFirstNode -= BKDnodeSearch.srcMaxNode;
            if( BKDnodeSearch.srcFirstNode < 0){
                BKDnodeSearch.srcFirstNode = 0;                           
            }
            BKDnodeSearch.searchPage();                        
        });
        
        var cpg = Math.floor( (BKDnodeSearch.srcFirstNode+1)/BKDnodeSearch.srcMaxNode) +1;  // current page
        var mpg = Math.floor( (BKDnodeSearch.qtotal+1)/BKDnodeSearch.srcMaxNode ) +1; // max page
        
        var spgr = (cpg - 2) < 1 ? 1 : cpg - 2; // start pager
        var epgr = (spgr + 5) < mpg ? (spgr + 5) : mpg;  // end pager
        spgr = epgr - 5 < 1 ? 1 : epgr - 5;  
        
        for(var p = spgr; p < epgr; p++ ){
            if( p == cpg ){
                $('#bkd-page-current').append( " <b>" + p + "</b> ");
            } else {
                $('#bkd-page-current')
                    .append( " <a href='' class='bkd-pager-"+p+" bkd-pager-current'> " + p + "</a> ");
                $('#bkd-page-current .bkd-pager-'+p).on( 'click', p, function(event){
                    BKDnodeSearch.srcFirstNode = BKDnodeSearch.srcMaxNode*(event.data - 1);               
                    BKDnodeSearch.searchPage();
                    return false;
                });
                
            }
        }
        
        
        $('#bkd-page-next').on( 'click', function(event){                                             
            if( BKDnodeSearch.srcFirstNode + BKDnodeSearch.srcMaxNode < BKDnodeSearch.qtotal){
                BKDnodeSearch.srcFirstNode += BKDnodeSearch.srcMaxNode;
            }
            BKDnodeSearch.searchPage();
        });
        
        $('#bkd-page-last').on( 'click', function(event){
            BKDnodeSearch.srcFirstNode = BKDnodeSearch.qtotal - BKDnodeSearch.qtotal % BKDnodeSearch.srcMaxNode; 
            BKDnodeSearch.searchPage();
        });
        
    },
    
    searchView: function(data, stats, srcAnchor, srcViewAnchor, nodeViewAnchor, mode ){
        
        var tid="bkd-search-table";
        var pid="bkd-search-pager";
        
        $(srcViewAnchor).hide();
        $(nodeViewAnchor).hide();
        
        BKDnodeSearch.qtotal = stats.total;
        
        $(srcViewAnchor).empty();    
        $(srcViewAnchor).append( "<hr/>"
                                 + "<table id='" + pid + "'></table>"
                                 + "<table id='" + tid
                                 + "' border='0' cellspacing='0' cellpadding='0' class='bkd-search-table'>"
                                 + "</table>");
        
        BKDnodeSearch.bkdTablePager( '#' + pid );   
        
        $('#' + tid).append("<tr class='bkd-rep-fld bkd-search-table-header'>"+
                            "<th align='center' width='5%'>ID</th>"+                                  
                            "<th align='center' width='10%'>Short Name</th>"+
                            "<th align='center'>Full Name</th>"+
                            //"<th align='center' width='10%'>Species</th>"+
                            "<th align='center' width='10%'>UniprotKB</th>"+
                            //"<th align='center' width='10%'>Type</th>"+
                            "<th align='center' width='5%' colspan='2'>&nbsp;</th>"+
                            "</tr>");
        for(var i=0; i<data.length; i++){
            var cdata = data[i];
            var rid = cdata.ac;
            
            var modalDivID = cdata.ac + "-modal"; 
            var modalAct = cdata.ac + "-act"; 
            
            var crow = "<td>" + cdata.ac + "</td>" +
                "<td align='center'>" + cdata.label + "</td>" +
                "<td>" + cdata.name + "</td>" +
                //"<td align='center'>" + cdata.taxon.sciName + "</td>" +
                "<td align='center' id='" + modalAct+ "'>" +
                " <a href='https://www.uniprot.org/uniprot/"+cdata.upr + "' target='_bkd'>"+cdata.upr+"</a>" +
                "</td>" + 
                //"<td align='center'>" + cdata.cvType.name + "</td>" + 
                "<td align='center'>" +
                "<input type='button' id='"+rid+"_view' value='Details'/>"+
                "</td>" +                          
                "<td align='center'>" +
                "<input type='button' id='"+rid+"_report_view' value='CVUS Reports'/>"+
                "</td>";
            
            $('#' + tid).append("<tr> class='bkd-rep-fld'>"+crow+"</tr>");
            
            //var modalDiv = "<div id='" + modalDivID + "' class='bkd-mode-anchor'></div>";
            //$('#modals').append(modalDiv);
            //BKDmodal.init("#" + modalDivID, "#" + modalAct, 'https://beta.uniprot.org/uniprot/' + cdata.upr);
            
            $( "#" + rid +"_view").on( 'click', function(event){
                var prefix= event.currentTarget.id.replace('_view','');
                var elink="node?ns=" + BKDsite.prefix + "&ac="+prefix+"&mode=view";
                location.href = elink;                    
            });
            
            $( "#" + rid +"_report_view").on( 'click', function(event){
                var prefix= event.currentTarget.id.replace('_report_view','');
                
                var elink="report?query=" + prefix + "&qmode=report";
                console.log('prefix', prefix);
                location.href = elink;                    
            });
        }
        $(srcAnchor).show();
        $(srcViewAnchor).show();
    }
};
